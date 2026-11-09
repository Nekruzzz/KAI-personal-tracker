import Foundation
import Capacitor
import SwiftUI
import FamilyControls
import ManagedSettings

// Blocks the apps the person chose while a Focus session runs.
// Apple's picker hands back opaque tokens: KAI never learns which apps they are,
// and the tokens never leave the phone.
// Needs the Family Controls capability in Xcode (see docs/screen-time-blocking.md).
@objc(ScreenTimePlugin)
public class ScreenTimePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ScreenTimePlugin"
    public let jsName = "ScreenTime"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "block", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unblock", returnType: CAPPluginReturnPromise)
    ]

    private let selectionKey = "kai.screentime.selection"
    private let store = ManagedSettingsStore()

    private func loadSelection() -> FamilyActivitySelection {
        guard let data = UserDefaults.standard.data(forKey: selectionKey),
              let saved = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) else {
            return FamilyActivitySelection()
        }
        return saved
    }

    private func counts(_ s: FamilyActivitySelection) -> [String: Any] {
        return ["apps": s.applicationTokens.count, "categories": s.categoryTokens.count, "sites": s.webDomainTokens.count]
    }

    @objc func status(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else {
            call.resolve(["supported": false])
            return
        }
        var out: [String: Any] = ["supported": true, "authorized": AuthorizationCenter.shared.authorizationStatus == .approved]
        for (k, v) in counts(loadSelection()) { out[k] = v }
        call.resolve(out)
    }

    @objc func authorize(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else {
            call.reject("Blocking apps needs iOS 16 or later")
            return
        }
        Task { @MainActor in
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                call.resolve(["authorized": AuthorizationCenter.shared.authorizationStatus == .approved])
            } catch {
                call.reject("Screen Time permission was not given", nil, error)
            }
        }
    }

    @objc func pickApps(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let model = AppPickerModel(selection: self.loadSelection())
            var host: UIViewController?
            let view = AppPickerView(
                model: model,
                onDone: { [weak self] in
                    guard let self = self else { return }
                    if let data = try? JSONEncoder().encode(model.selection) {
                        UserDefaults.standard.set(data, forKey: self.selectionKey)
                    }
                    host?.dismiss(animated: true)
                    call.resolve(self.counts(model.selection))
                },
                onCancel: {
                    host?.dismiss(animated: true)
                    call.resolve(["cancelled": true])
                })
            let controller = UIHostingController(rootView: view)
            host = controller
            self.bridge?.viewController?.present(controller, animated: true)
        }
    }

    @objc func block(_ call: CAPPluginCall) {
        let s = loadSelection()
        if s.applicationTokens.isEmpty && s.categoryTokens.isEmpty && s.webDomainTokens.isEmpty {
            call.reject("No apps chosen")
            return
        }
        store.shield.applications = s.applicationTokens.isEmpty ? nil : s.applicationTokens
        store.shield.applicationCategories = s.categoryTokens.isEmpty ? nil : .specific(s.categoryTokens)
        store.shield.webDomains = s.webDomainTokens.isEmpty ? nil : s.webDomainTokens
        call.resolve()
    }

    @objc func unblock(_ call: CAPPluginCall) {
        store.clearAllSettings()
        call.resolve()
    }
}

final class AppPickerModel: ObservableObject {
    @Published var selection: FamilyActivitySelection
    init(selection: FamilyActivitySelection) { self.selection = selection }
}

struct AppPickerView: View {
    @ObservedObject var model: AppPickerModel
    let onDone: () -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $model.selection)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel", action: onCancel) }
                    ToolbarItem(placement: .confirmationAction) { Button("Done", action: onDone) }
                }
        }
    }
}

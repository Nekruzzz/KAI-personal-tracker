import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)

        // launched from a Home Screen quick action: open that screen once the app has had a moment to load
        if let item = connectionOptions.shortcutItem {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in self?.openQuickAction(item) }
        }
    }

    // a Home Screen quick action while KAI is already running
    func windowScene(_ windowScene: UIWindowScene, performActionFor shortcutItem: UIApplicationShortcutItem, completionHandler: @escaping (Bool) -> Void) {
        completionHandler(openQuickAction(shortcutItem))
    }

    // the web app opens Tell KAI, the Day, a new to-do or a Focus session for #tell, #day, #todo and #focus, the same links as its own web shortcuts
    @discardableResult
    private func openQuickAction(_ item: UIApplicationShortcutItem) -> Bool {
        let key = item.type.components(separatedBy: ".").last ?? ""
        guard ["tell", "day", "todo", "focus"].contains(key), let bridge = window?.rootViewController as? CAPBridgeViewController else { return false }
        bridge.webView?.evaluateJavaScript("location.hash = '#\(key)'", completionHandler: nil)
        return true
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

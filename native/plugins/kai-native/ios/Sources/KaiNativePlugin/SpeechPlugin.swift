import Foundation
import Capacitor
import Speech
import AVFoundation

// Speech to text for Tell KAI. Uses the iPhone's own recognizer, on the phone when the
// language supports it. Sends "partial" events with the text so far, and "end" when done.
@objc(SpeechPlugin)
public class SpeechPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechPlugin"
    public let jsName = "Speech"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    @objc func authorize(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            guard status == .authorized else {
                call.resolve(["granted": false])
                return
            }
            AVAudioSession.sharedInstance().requestRecordPermission { ok in
                call.resolve(["granted": ok])
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        let language = call.getString("language") ?? "en-US"
        DispatchQueue.main.async {
            self.finish()
            guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: language)), recognizer.isAvailable else {
                call.reject("Speech recognition isn't available right now")
                return
            }
            do {
                let session = AVAudioSession.sharedInstance()
                try session.setCategory(.record, mode: .measurement, options: .duckOthers)
                try session.setActive(true, options: .notifyOthersOnDeactivation)
                let req = SFSpeechAudioBufferRecognitionRequest()
                req.shouldReportPartialResults = true
                if recognizer.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
                self.request = req
                let input = self.engine.inputNode
                input.removeTap(onBus: 0)
                input.installTap(onBus: 0, bufferSize: 1024, format: input.outputFormat(forBus: 0)) { buffer, _ in
                    req.append(buffer)
                }
                self.engine.prepare()
                try self.engine.start()
                self.task = recognizer.recognitionTask(with: req) { [weak self] result, error in
                    if let result = result {
                        self?.notifyListeners("partial", data: ["text": result.bestTranscription.formattedString, "final": result.isFinal])
                    }
                    if error != nil || (result?.isFinal ?? false) {
                        DispatchQueue.main.async {
                            self?.finish()
                            self?.notifyListeners("end", data: [:])
                        }
                    }
                }
                call.resolve()
            } catch {
                self.finish()
                call.reject("Couldn't start the microphone", nil, error)
            }
        }
    }

    // Stops listening; the recognizer then sends its final text and "end".
    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.engine.isRunning { self.engine.stop() }
            self.engine.inputNode.removeTap(onBus: 0)
            self.request?.endAudio()
            call.resolve()
        }
    }

    private func finish() {
        if engine.isRunning { engine.stop() }
        engine.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        task?.cancel()
        request = nil
        task = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}

# Blocking distracting apps during Focus

KAI can block the apps a person chooses (social media, games and similar) while a Focus session runs. It uses Apple's Screen Time API, so it only works in the iPhone app, and it needs a permission that Apple grants per app.

## How it works for the person

1. In the Focus sheet, they turn on **Block distracting apps**. iOS asks for Screen Time permission, then shows Apple's own app picker.
2. When a session starts, the chosen apps are shielded. Opening one shows Apple's blocking screen.
3. When the session ends, KAI lifts the shield and the focused minutes count as study time, as before.
4. **Ending early is harder on purpose:** "Finish now" opens a screen that waits 30 seconds, then asks the person to type "I choose distraction over my work". Only then does the session end and the apps open. The session is recorded as given up.

KAI never sees which apps were chosen. Apple hands back opaque tokens, which stay on the phone and are never synced or sent to AI.

## What's built

- **Native plugin:** `native/plugins/kai-native`, a local Capacitor plugin with no outside package. `ScreenTimePlugin.swift` provides `status`, `authorize`, `pickApps`, `block` and `unblock`, using `FamilyControls` and `ManagedSettings`. It compiles in the `iphone-build` check on GitHub.
- **In the app:** the Focus sheet switch, the picker, blocking at the start and end of a session, the finish-early screen, and a reminder at the end saying "Open KAI to count the time and unblock your apps". The code is the "Focus with apps blocked" part of `kai/app.js`.
- **Safety net:** whenever KAI opens with no session running, it lifts any shield. A shield can't outlive its session longer than it takes to open KAI.
- **Tests:** `tests/app.test.mjs` checks blocking, unblocking, the wait, the typed sentence and the safety net against a simulated plugin.

## Not built yet: lifting the shield while KAI is closed

If a session ends while KAI is closed, the apps stay blocked until the person opens KAI, and the end-of-session reminder tells them so. Lifting it automatically needs a **Device Activity Monitor extension**: a separate small target in the Xcode project that iOS runs on schedule. It can only be added and tested in Xcode with signing, so it's left for the owner's Mac step. The plugin would then also call `DeviceActivityCenter().startMonitoring` with the session's end time, and the extension would call `ManagedSettingsStore().clearAllSettings()` in `intervalDidEnd`.

A **Shield Configuration extension** could also show KAI's own words on the blocking screen, such as "Physics focus: 18 minutes left". That's optional.

## Steps for the owner (needs a Mac and the developer account)

1. In the Apple Developer account, request the **Family Controls (Distribution)** entitlement for the app ID. Development builds can use Family Controls straight away; App Store builds need Apple's approval, which can take time, so request it early.
2. In Xcode, add the **Family Controls** capability to the App target.
3. Run it on a real iPhone: permission prompt, picker, a session with blocked apps, finishing early, and a full session.
4. Optional: add the Device Activity Monitor extension described above, with an App Group shared with the app.
5. Mention Screen Time in the App Review notes: the feature collects no data, but reviewers ask.

## Not verified

None of this has run on an iPhone. The Swift code follows Apple's documented API, but it has only been compiled, not run. The app-side flow was tested in a browser against a simulated plugin.

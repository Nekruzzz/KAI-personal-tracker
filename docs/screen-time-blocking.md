# Blocking distracting apps with Screen Time: plan

KAI can already log screen time from a screenshot. Blocking apps (social media, games and similar) during focus hours is a separate, native-only feature. This page describes what it needs, because none of it can be built or tested without a real iPhone and an approved entitlement.

## Already in the app: Focus sessions

Until the entitlement is approved, KAI has the part that needs no permission. A Focus session (from the Now card, 25, 45 or 60 minutes) counts down in a bar on every screen. Leaving KAI for more than 3 seconds counts as a distraction and the time away is measured. With reminders on, the iPhone app calls the person back after 40 seconds away. Only focused minutes are added to the day's study time. When blocking arrives, a Focus session is the natural moment to shield the chosen apps: `startFocus` below would be called from the same button.

## What Apple requires

1. **The Family Controls entitlement.** In the Apple Developer account, request "Family Controls (Distribution)" for the app ID. Apple reviews the request; development builds can use the development version of the entitlement straight away, but App Store builds need the approved distribution one.
2. **The Screen Time API (iOS 16 or later)**, made of three frameworks:
   - `FamilyControls`: asks the person for permission (`AuthorizationCenter.shared.requestAuthorization(for: .individual)`) and shows Apple's `FamilyActivityPicker`, where the person chooses apps and categories. The app never sees app names, only opaque tokens, which is how Apple keeps it private.
   - `ManagedSettings`: applies a shield (`ManagedSettingsStore().shield.applications = tokens`) so the chosen apps show a blocking screen.
   - `DeviceActivity`: schedules when the shield turns on and off (for example, weekdays 9:00–17:00, or "until my study block ends"), even when KAI is closed. This needs a **Device Activity Monitor app extension**.
3. Optional: a **Shield Configuration extension** to show KAI's own words on the blocking screen, for example "Exam on Friday. Back to it?".

## How it would fit into KAI

- A small Capacitor plugin in `native/ios/App/` (Swift) with four calls: `requestAuthorization()`, `pickApps()` (shows the picker and keeps the tokens in the app group), `startFocus({from, until, days})` and `stopFocus()`.
- In `kai/app.js`, a "Focus" card on the Day tab and a setting under More, used through `plug('ScreenTimeShield')` like the other native features. In a browser it stays hidden.
- KAI's own rules decide the schedule: study blocks and exam days from the routine, with the person confirming before anything is blocked, the same "show first, then change" rule the AI follows.
- The tokens never leave the phone and are never synced or sent to AI.

## Steps for the owner

1. Request the Family Controls entitlement in the developer account.
2. In Xcode, add the Family Controls capability to the app target, then add a Device Activity Monitor extension target and an App Group shared by both.
3. Build the plugin and the extension, then test on a real iPhone: permission prompt, picker, shield during a schedule, and turning it off.
4. Update the privacy policy (`kai/privacy.html`) and the App Store privacy answers: the feature doesn't collect data, but reviewers ask about it.

## Why it isn't built yet

It needs the entitlement, Xcode targets that only work when signed, and a physical device. A version written without those can't be checked, and a wrong entitlement setup can break the iPhone build that GitHub runs on every push.

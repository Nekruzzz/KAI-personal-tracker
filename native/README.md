# KAI for iPhone

This wraps the `kai/` folder as a real iPhone app with [Capacitor](https://capacitorjs.com). There is no second copy of the app: `npx cap sync ios` copies `kai/` in, and the native features sit in the `v8` section of `kai/app.js`.

It adds reminders that fire while the app is closed, Apple Health (read only), Sign in with Apple, native vibration and file sharing.

## What works without a Mac

From Windows you can edit everything and run:

```bash
npm install
```

```bash
npx cap sync ios
```

To check that the iPhone app still compiles, push to GitHub. The `iphone-build` job in `.github/workflows/checks.yml` compiles it on GitHub's Mac. GitHub-hosted runners are free for public repositories; check the current terms for private ones.

That job only compiles. It can't run the app, sign it or send it to Apple.

## What needs a Mac and an Apple Developer account

The account costs $99 a year.

1. Change `appId` in `capacitor.config.json` and `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project to an ID you own, such as `com.yourname.kai`. The current `app.kaitracker.ios` is a placeholder, and an ID can't be changed in App Store Connect once an app is registered under it.
2. Run `npx cap open ios` and pick your team under Signing & Capabilities in Xcode.
3. Check that **Sign in with Apple** and **HealthKit** appear under Capabilities. `App/App.entitlements` already asks for both.
4. Run it on your phone and try the list below.
5. Choose Product → Archive and send it to TestFlight.

If you don't have a Mac, you can rent one by the hour from a cloud Mac service or use a friend's or a university lab's.

## Try these on a real phone first

None of this has run on an iPhone yet, so these are the first things to check:

- Add an exam, turn on reminders under More, and check one arrives with the app closed. Set the exam about 2 hours and 5 minutes ahead to see one soon.
- Connect Apple Health and check that steps, sleep and a workout show up, and that your own typed entries didn't change.
- Sign in with Apple. This also needs Apple enabled in Supabase, with the bundle ID above as the client ID.
- Take a food photo, export a backup, and share the weekly recap.
- Check the top and bottom of the screen on a phone with a notch, and that the keyboard doesn't cover text fields.

Apple can reject a thin website wrapper under guideline 4.2. Native reminders and Apple Health are what make KAI more than a website, so mention both in the review notes.

The app icon was enlarged from the 512-pixel web icon. Replace it with a 1024-pixel original before launch: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.

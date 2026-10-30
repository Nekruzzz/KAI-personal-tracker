# Progress report

Work on branch `claude/relaxed-ritchie-yeh48t`. Each improvement is its own commit. This file is updated as work continues.

## Done so far

1. **Checks on `main`:** the `tests` and `iphone-build` jobs of the first `Checks` run both passed, so nothing needed fixing.
2. **Reminders:** tapping a reminder opens its screen (workout reminders open the workout, the weekly recap opens the recap, everything else opens the Day tab). New bedtime reminder, 30 minutes before the routine's sleep time, off by default; a bedtime after midnight counts as that night. The weight badges say "Minus two pounds" and "Minus six pounds" when the app uses pounds; the rule itself stays in kilograms.
3. **First week:** a "Tell KAI how your day went" card with tap-to-fill examples, until the first message is sent or it's dismissed. Progress with only zeros is hidden in the first week. Clearer empty states for food charts and money. The Tasks header no longer says "all done" when there were no tasks. Days before the person started are no longer shown as missed.
4. **Accessibility:** grey text raised to at least 4.5:1 contrast, a header landmark and a heading on every tab, labelled charts, proper tabs, 44-point tap areas for small controls, sheets that take focus, keep Tab inside and return focus when closed, and every animation off when the phone asks for reduced motion. Checked with axe-core on nine screens in both themes: no violations.
5. **English:** a `trf()` helper for whole sentences with `{placeholders}`, used for the sleep warning, workout button, content stats and schedule summary. The AI queue showed Russian dates in English; fixed. The readiness card now gives the same "reps in reserve" as the program text (see Questions).
6. **Workouts:** a new "At home, no equipment · 3 days" program (chair, wall and floor only, bodyweight sets without a weight column). New installs start on it; onboarding asks "home or gym" when workouts are chosen. Existing plans get the program added but stay on what they use.
7. **Paywall groundwork:** a plan screen comparing Free and Plus, with the price clearly marked as a placeholder and the buy button disabled; an AI usage screen (today's use and limit, 14-day chart, own-key usage, queue); a RevenueCat webhook (`server/supabase/functions/revenuecat`) that checks a shared secret from an environment variable, applies each event once, ignores late older events, and treats a plan past its end date as free. Setup steps are in `server/README.md`.

Also, from the owner's later message:

- **Light and dark themes:** every colour moved onto tokens, with an Apple-style light palette. Follows the phone by default; More has System, Light and Dark.
- **Liquid glass:** the tab bar floats as a translucent capsule; header buttons, toasts and sheet titles use the same glass. Turns solid when the phone asks for reduced transparency.
- **Permissions on iPhone:** onboarding ends with a step that explains reminders and Apple Health before iOS asks.
- **Sign-in buttons:** Apple and Google buttons in the colours they require.
- **Screen Time blocking:** not built; `docs/screen-time-blocking.md` explains what Apple requires and how it would fit.
- **Bug fix:** when the same document was saved twice quickly, the database's copy of the first save could briefly replace the newer one in memory, and code running in that moment could act on old data. Found because a new install's program reverted; fixed by not letting snapshots overwrite documents with writes still in flight.

## How it was tested

- `node --test tests/app.test.mjs`: all pass (48).
- In `server/`: `npm ci` and `npm test`: all pass (36), including new database and webhook tests.
- `node tools/check-i18n.js kai`: `missing: 0`.
- In Chromium at 390×844 (phone size), served with `python -m http.server 8123 --directory kai`: each change was tried, in English and Russian where relevant, and in both themes.

## Not verified

- Anything on a real iPhone: notification taps, the permissions step, Apple Health, the status bar in light mode.
- The RevenueCat webhook against real RevenueCat events, and the Supabase function itself (only its logic and the SQL were tested).
- Real Supabase, real Claude and Apple sign-in, as before.

## Questions for the owner

1. **Commit author.** The first commit on this branch was made with this environment's default git identity, before it was switched to your public GitHub no-reply identity. Rewriting it needs a force-push, which wasn't allowed here. Squash or re-author it when you merge.
2. **Reps in reserve.** The readiness card said 4–5 reps in reserve at effort 6, while every program text says 3–4. The card now follows the program text (effort 6 → 3–4, effort 8 → 1–2). If 4–5 was intended, the program texts need changing instead.
3. **Default program for new installs** is now the no-equipment home program. Gym is one tap away in onboarding and under More → Workouts.
4. **Appearance in the iPhone app.** `Info.plist` forces dark (`UIUserInterfaceStyle = Dark`), so "System" means dark inside the iPhone app; Light can still be chosen in More. Following the system there needs `Automatic` plus a status bar plugin to switch the status bar text colour.
5. **Plus price and limits:** 10 and 100 requests a day come from the `tiers` table. The price is a placeholder until you decide it.
6. **Google sign-in inside the iPhone app** needs a URL scheme and Supabase redirect settings, and has to be tried on a device. On the web it already works once added to `providers` in `kai/config.js`.
7. **Screen Time blocking** needs the Family Controls entitlement from Apple first. See `docs/screen-time-blocking.md`.

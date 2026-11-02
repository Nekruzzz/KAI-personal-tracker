# Progress report

Work on branch `claude/relaxed-ritchie-yeh48t`. Each improvement is its own commit. All nine items on the list are done, plus the later requests listed below.

## Done so far

1. **Checks on `main`:** the `tests` and `iphone-build` jobs of the first `Checks` run both passed, so nothing needed fixing.
2. **Reminders:** tapping a reminder opens its screen (workout reminders open the workout, the weekly recap opens the recap, everything else opens the Day tab). New bedtime reminder, 30 minutes before the routine's sleep time, off by default; a bedtime after midnight counts as that night. The weight badges say "Minus two pounds" and "Minus six pounds" when the app uses pounds; the rule itself stays in kilograms.
3. **First week:** a "Tell KAI how your day went" card with tap-to-fill examples, until the first message is sent or it's dismissed. Progress with only zeros is hidden in the first week. Clearer empty states for food charts and money. The Tasks header no longer says "all done" when there were no tasks. Days before the person started are no longer shown as missed.
4. **Accessibility:** grey text raised to at least 4.5:1 contrast, a header landmark and a heading on every tab, labelled charts, proper tabs, 44-point tap areas for small controls, sheets that take focus, keep Tab inside and return focus when closed, and every animation off when the phone asks for reduced motion. Checked with axe-core on nine screens in both themes: no violations.
5. **English:** a `trf()` helper for whole sentences with `{placeholders}`, used for the sleep warning, workout button, content stats and schedule summary. The AI queue showed Russian dates in English; fixed. The readiness card now gives the same "reps in reserve" as the program text (see Questions).
6. **Workouts:** a new "At home, no equipment · 3 days" program (chair, wall and floor only, bodyweight sets without a weight column). New installs start on it; onboarding asks "home or gym" when workouts are chosen. Existing plans get the program added but stay on what they use.
7. **Paywall groundwork:** a plan screen comparing Free and Plus, with the price clearly marked as a placeholder and the buy button disabled; an AI usage screen (today's use and limit, 14-day chart, own-key usage, queue); a RevenueCat webhook (`server/supabase/functions/revenuecat`) that checks a shared secret from an environment variable, applies each event once, ignores late older events, and treats a plan past its end date as free. Setup steps are in `server/README.md`.

8. **Error handling:**
   - **Offline:** an AI request made offline says plainly that it's queued until you're back online.
   - **Full queue:** more than 30 waiting requests are refused with a message, and the typed text stays.
   - **Full phone:** a photo that can't be stored is refused with a message, and no half-made request is left behind.
   - **Failed saves:** a failed save is retried, and is no longer swapped for the older stored copy in the meantime (that was a real way to lose a change).
   - **Sync:** a document the server refuses is set aside instead of blocking every later upload. Sync failures lasting over 30 minutes are shown at the top.
9. **Tests:** new tests for backups (export, restore, keys and queued requests never in the file, bad files change nothing), parsing AI answers, applying a Tell KAI answer, translating imported data, the save retry, the sync failure path, the queue limits, and the server's subscriptions and webhook. Two bugs found and fixed: a double tap could apply a Tell KAI answer twice, and a backup made in the other language kept its default texts untranslated.

Also, from the owner's later messages:

- **Light and dark themes:** every colour moved onto tokens, with an Apple-style light palette. Follows the phone by default; More has System, Light and Dark.
- **Liquid glass:** the tab bar floats as a translucent capsule; header buttons, toasts and sheet titles use the same glass. Turns solid when the phone asks for reduced transparency.
- **Permissions on iPhone:** onboarding ends with a step that explains reminders and Apple Health before iOS asks.
- **Sign-in buttons:** Apple and Google buttons in the colours they require.
- **Screen Time blocking:** not built; `docs/screen-time-blocking.md` explains what Apple requires and how it would fit.
- **Speed:** the Day and Workouts screens worked out every logged day's routine on each redraw. That result is now cached per day and plan: with two years of data, the Day screen went from about 21 ms to 12 ms on a desktop browser.
- **Less clutter:** the "Which AI" choice appears only when two or more AIs are set up.
- **Feature review:** `docs/feature-review.md` lists features a new person may not need and what was switched off or folded at the owner's request. Nothing was deleted: switched-off features keep their saved data and come back with a one-line change.
- **Bug fix:** when the same document was saved twice quickly, the database's copy of the first save could briefly replace the newer one in memory, and code running in that moment could act on old data. Found because a new install's program reverted; fixed by not letting snapshots overwrite documents with writes still in flight.

More fixes from the screen-by-screen review:
- The AI button always showed an empty orange dot: a CSS rule overrode `hidden` (now fixed for every element).
- More said "normal 2100 kcal" instead of "target 2,100 kcal".
- Folded sections are no longer built until opened, and workout adjustments are cached until data changes: the Workouts screen redraws in about 5 ms instead of 13 ms with two years of data.

Lighter app, from the owner's later messages: supplements and the face log are switched off, the workout breakdown is folded away, the header and Day tab are shorter, and repeated cards are gone. Details are in `docs/feature-review.md`. Sheets now float as frosted glass panels, and section tabs stay pinned while scrolling.

**App Review preparation:** the plans screen is hidden behind `plans` in `kai/config.js` (off by default), because App Review rejects placeholder prices. `node tools/check-release.js` lists what still blocks a submission. Right now it finds six owner tasks: connect the server, remove the draft notices and fill in the contact details, dates and operator in the privacy policy and terms, and add the demo account and paid-plan text to the listing.

**Third round:**
- **Tell KAI without AI:** the main feature used to need an AI. Now everyday messages are read on the phone in English and Russian: sleep, steps, walks, study and workout time, weight (pounds become kilograms), spending with a guessed category, to-dos with or without a date ("remind me to…", "надо…"), events and exams (with time ranges, "next week" and dates like "25 января" or "January 20"), gym sets for the plan's exercises, checking off or unchecking today's tasks, and food with grams, pieces or everyday portions (a cup, a slice, a handful, стакан, горсть) from the built-in food table, as one meal per message, plus sleep from bedtime and wake time, feeling sick, and a day rating. It uses the same "show, then confirm" step as the AI, the support card still comes first for worrying messages, and every first-run example works without AI. Checked against the 59 eval cases with the same grader as the AI (`server/tests/local-tell.test.mjs`): it fully handles 32, and when it proposes something it's right, except that it may log only part of a meal (it says the rest needs AI). It never changes or cancels existing plans; those are left to the AI. While testing it, a bug in quick add turned up and was fixed: "завтрак" (breakfast) was read as "завтра" (tomorrow).
- **Font bundled:** Manrope ships with the app (SIL Open Font License, `kai/fonts/OFL.txt`) instead of loading from Google, so no visitor data goes to Google, and it works offline from the first launch. The app now makes no outside requests on start.
- **Undo:** after "Apply all", the confirmation has an Undo button that puts the day, plan, to-dos and money back as they were. The answer can then be applied again.
- **Double taps:** adding an AI food answer or a bank import twice by a quick double tap is now ignored, and food answers also get Undo.
- **More screen order:** everyday settings first (profile, workouts, schedule, daily tasks, reminders), one-time ones last (language, appearance, privacy). Sign-in stays near the top once a server is connected.
- **Startup:** with a year of data and the CPU slowed four times, content appears in about 0.2 s.
- **Food charts:** one week chart with a Calories/Protein switch instead of two stacked charts. This also fixed a bug where the Progress period switch (Today / 7 days / 30 days) un-highlighted the Day tab.
- **"What can I write?"** in Tell KAI: example phrases by topic, all of which work without AI (a test checks every one, in both languages), and a tap adds one to the message. Gym sets and task check-offs now match in either language too.
- **Safety: calorie targets.** A height typed in meters ("1.75") gave a target of 860 kcal; implausible profile values now give no target and ask the person to check their profile, and a height between 1 and 2.5 is read as meters. A small adult choosing "lose" could get a target under 1,200 kcal (930 for a 150 cm, 45 kg, 60-year-old), below the line the AI is held to; losing weight now never goes under 1,200 kcal, and the slow-progress advice suggests moving more instead of eating less once someone is at that floor.
- **Money as a spreadsheet:** More → Data and backup exports every money entry as a CSV file that opens in Numbers, Excel or Google Sheets (with Cyrillic intact).
- **Typos and impossible values:** today's weight, waist, sleep and steps reject obvious typos (750 kg, 80 hours) with a short message instead of bending every chart and the calorie advice. AI answers with an impossible weight, sleep, steps or meal size are neither shown nor applied.
- **On-phone answers name what they didn't understand**, so the person can rephrase or add an amount.
- **Typed numbers:** in English, "9,500" was saved as 9.5 (the comma read as a decimal point). Now it's 9500, "1 200" is 1200, and "80,5" still works.
- **Now card at night:** before wake-up time it says it's time to sleep, instead of "Free slot".
- **Money reading fixed and widened:** "потратил 1 200 руб" was read as 200; thousands with a space are now one number. "$12", "€20", "15 dollars", "300р", "got paid 1 500" and "lunch 12" (the example the Money screen itself gives) now work.
- **Health and the cloud:** once a server is connected, the Health permission step and Health setting say Health data is in the cloud copy, not iCloud (App Review 5.1.3).
- **Privacy policy draft updated** to match the app: on-phone reading when no AI is connected, Health in the cloud copy, and deleting everything on the phone from More.
- **Own API key in the iPhone app:** hidden once KAI's own AI server is connected (App Review 3.1.1); the web keeps it, and `ownKeys: true` in `kai/config.js` brings it back.
- **Pull to close:** sheets close by pulling down from the grab bar or title, like iOS; a short pull springs back.
- **Day notes in the to-do field:** typing "slept 7 hours" into Tasks now goes to Tell KAI instead of becoming a to-do called "Slept 7 hours".
- **People who used supplements** get a one-time note on Day saying the section was removed and their list is saved.
- **Delete all data on this phone** (More → Data and backup): two taps. It signs out first, so the cloud copy isn't touched, and it keeps the language.
- **Food "Describe" without AI** counts foods with an amount from the built-in table, with the same confirm step.
- **Robustness:** a browser script tapped every button on every tab, in the sheets they open, and in every open settings section, in both languages: about 450 taps and no errors.
- **Quick add** (and the on-phone reader) learned dates with month names, a bare "at 5" or "в 5" as 17:00, "tonight", "tomorrow morning", "в субботу утром", "at noon", "in 2 hours" and "через 2 часа". It also fixes a bug: "9:30pm" was saved as 09:30 with "pm" left in the title.
- **Home-screen shortcuts** for the installed web app: "Tell KAI" and "Today".
- **Health:** sleep is a section of Body, so the three tabs fit on a phone; the weight chart caption is one short line.
- **Undo for one-tap deletes:** to-dos, meals, money entries, events, daily tasks and knowledge base entries can be brought back from the toast for a few seconds.
- **Finishing a season no longer loses history for good.** It used to clear every day (weights, meals, sets) after two taps, with no way back. Now the days are copied on the phone first, and if the copy can't be saved, nothing is cleared. The toast has Undo, and later the archive offers "Bring back the days": days written since keep their values and only get what they're missing. The archive's weights follow the pounds setting.
- **Restoring a backup can be undone**, and what it replaced is kept as a copy on the phone. A file that isn't a backup is refused before anything changes.
- **More Undo:** deleting a class, resetting the day schedule and resetting the calorie target.
- **A first currency from the phone's region** ($, €, £, ₽ and others), filled in during onboarding and changeable; before, money showed as bare numbers until someone typed a symbol.
- **Timetable from a calendar file (new):** More → Class timetable and Events take a `.ics` file (the format university timetables are exported in). Weekly lessons become classes with their room; future exams and deadlines become events, recognised by their names. Finished terms, past and cancelled events are skipped, lessons listed one by one are folded into weekly classes, and nothing already in the plan is added twice. Shown first, added with "Add all", with Undo.
- **Focus on a to-do:** any to-do's details have a Focus button; the session is named after it and offers to mark it done at the end. A study-plan topic's planned time now counts once (focus minutes count toward it; marking it done adds only what's left; before, the full hour was added on top). Sessions are recorded, the Focus sheet shows the last 7 days, and the weekly summary image shows focus sessions.
- **Regular payments (new):** rent, a phone plan, subscriptions or an allowance, added under Money or by switching on "Every month" when saving an entry. Each shows as due, coming, paid or skipped this month and is marked paid with one tap (Undo works); nothing is recorded by itself. The budget sets aside what is still to pay, so "about $15 a day" is what can really be spent. Something paid once a month around the same day, with the same name and amount, is offered as a regular payment (once; "No, thanks" is remembered). With reminders on, the iPhone app reminds at 10:00 on the day, and the morning plan mentions it. Two categories were added for them: Housing and utilities, and Subscriptions; the on-phone reader files "rent 400", "netflix 11" and "phone bill 15" there.
- **Tell KAI on the phone, two misreadings fixed and more understood:** "сходил в зал на час" was logged as an hour's walk, and "ran 5 km in 30 minutes" or "slept from 1 to 9" became to-dos. Now read without AI: running, cycling, swimming and yoga as workouts (also with a distance), sleep from one time to another ("slept 11pm to 7am", "спал с часу до 9"), money from family ("got 50 from mom", "получил 2000 от мамы"), spending "at the pharmacy" / "в аптеке", and Uber as transport. "Woke up at 7" is no longer a to-do. A weight typed without a unit is read as kilograms or pounds, whichever is closer to the last weight logged. Found by trying 50 everyday messages in both languages.
- **Exam results (new):** for a week after an exam (from an hour after it ends), a check-in asks how it went: Passed or Didn't pass, with an optional grade or score, or "Don't know yet" to be asked again tomorrow. Events lists past exams of the last year with their result, preparation time and "2 of 3 passed".
- **AI answers get repeats and screen time from the phone:** with an AI connected, its answer had no place for "every month", repeating to-dos or screen time (its prompt is unchanged). The phone reads the same message and adds just those to the AI's answer, shown before Apply. A long mixed message ("slept 7 hours, ran 5 km in 30 minutes, spent 12 on lunch and 5 on coffee, Netflix 11 every month, exam on Friday at 10, take out the trash every Monday, screen time 3h 20m") was checked end to end in both languages: every part is read and applied.
- **Store screenshots:** the Money one now shows a budget with regular payments set aside.
- **Budget limits for single categories:** the budget sheet takes optional limits per category ("cafes: 100 a month"), listing the categories used lately. Each limited category in the breakdown gets a small bar, orange from 85%, and "over the limit by $12" in red once it's passed.
- **A study plan ends with its exam:** topics still open after the exam no longer sit in the to-do list as overdue, and the check-in stops asking about them; they stay in the data. Repeating to-dos are also among the "What can I write?" examples and the empty list's hint.
- **Quick actions: New To-Do and Focus.** (The iPhone build passed with them.) Long-pressing the app icon also offers "New To-Do" (the Day tab with the to-do field ready) and "Focus", in English and Russian; the installed web app gets the same shortcuts. If to-dos are switched off, a note says where to turn them on. `tools/check-release.js` now also wants a Russian title for every quick action.
- **Money search:** a Search link next to History finds entries by name, category or amount in every month ("gym", "netflix", "30"), newest first, with the count and total; tapping one opens it.
- **Money categories against the month before:** each category in the breakdown says how it moved ("↑ 50% vs the month before", the same days of it while the month is running), red for more spending or less income, green the other way; changes under 10% aren't mentioned.
- **New students are pointed to their timetable:** in the first two weeks, after the first message, a card offers to add classes from a calendar file (.ics) in one go or one at a time; it goes away once classes exist or with "Not now".
- **Checked again after these changes:** axe-core on every main screen in both themes and languages (no violations), measured text contrast over the glass (all passes), and nothing clipped at 375 points.
- **A streak for each daily task:** the Daily list shows each habit's own run ("🔥 6 days in a row", or "3 workouts in a row" for the workout, which isn't daily). Days without the task and sick days don't break it, and neither does today while it's still open. Worked out once per change of data: at most about 3 ms with two years of records.
- **To-dos done today:** "Done today: 2" under the list shows what was checked off, struck through; tapping its filled check puts it back on the list (a repeating one takes back the next one it made).
- **Screen time in words:** "screen time 3h 20m", "экранное время 4 часа" or "провёл 2 часа в телефоне" fills in the day's screen time without a screenshot or an AI, while the Screen time module is on.
- **Checking off a to-do can be undone:** the toast says "Done: …" with Undo, which takes back the check, the next one of a repeating to-do and any study time it added. Before, a mistaken tap made the to-do disappear with no way back.
- **Food without AI, third round:** a food named on its own ("яблоко и банан", "apple", "сникерс") counts one piece when the table knows a piece's weight; vague amounts ("had some soup") still need grams, and in the to-do field "молоко" stays something to buy. "Coffee with milk" is one drink, not coffee plus a glass of milk. New in the table: black coffee, coffee with milk, a protein shake, a chocolate bar and a cutlet. A short Russian word now matches a food only when just its ending differs, so "у меня 2 кота" is no longer two cutlets.
- **Repeating to-dos (new):** "take out the trash every monday", "выносить мусор по понедельникам", "pay rent every month" or "каждое утро зарядка", typed in the to-do field or told to KAI. Checking one off keeps it in the history and adds the next, on the same weekday or day of the month (the 31st falls on a short month's last day). The list shows "↻ every week", and the to-do's details can stop the repeat. "Monthly report due Friday" stays a single to-do. The opened to-do's buttons now share lines (about six rows instead of nine).
- **Tell KAI on the phone, second round (another 46 everyday messages tried):** "рейс 20 декабря в 6 утра" became a to-do at 18:00 titled "Рейс утра"; it's now an event at 06:00, and "в 9 вечера", "в 3 дня" and "в 11 ночи" work too (while "через 2 дня" stays days). Also new: "midterm in 2 weeks", "через 3 дня", "через неделю", "в следующий понедельник" (no stray "следующий" in the title), flights, weddings and matches as events, "пропустил зал", "10к шагов", reps without commas ("жим 60 на 8 8 6"), a second amount in one sentence ("spent 30 on books and 12 on lunch") and "slept badly, 5 hours".
- **Reminders grouped** into "Study and plans", "Daily rhythm" (in the order of the day) and "Other", instead of eleven switches in one list; the payment reminder is hidden while Money is off.
- **The budget sheet points to regular payments**, which it sets aside in advance.
- **Focus awards:** "In the zone" (a first session), "No distractions" (45 minutes or more without leaving KAI) and "Deep work" (10 hours in all), counted from the focus history already kept per day, so earlier sessions count. Awards of a switched-off module (the video awards while Content is off) are hidden from the shelf and the count; one already earned stays.
- **Odd input check:** a script opened every sheet, filled each field with odd values (emoji, negative and huge numbers, commas, markup, 400 characters) and pressed every button, in both languages: 132 presses, no errors, and no impossible amounts or days saved.
- **Hold timer for timed exercises:** the plank and other holds get a Timer instead of the Rest link: 3 seconds to get ready, a countdown to the top of the range with a beep at both ends, then the seconds go into the next set and the rest timer starts by itself ("Done" early records what was actually held). Toasts now sit above the rest and focus bars instead of covering their buttons.
- **Evening check-in (new, off until turned on):** two hours before bedtime (no later than 22:00), "2 more tasks and the day counts", naming what is left. Only while the day doesn't count yet, never on a sick day.
- **Subscriptions added up:** the regular payments card shows "Subscriptions: $12.50 a month, $150 a year".
- **Tell KAI understands "every month":** "Netflix 11 every month" or "Аренда 400 каждый месяц" is read on the phone as the entry plus a regular payment. The preview says "every month" before anything changes, and Undo removes both. It's one of the "What can I write?" examples.
- **Money compares with last month:** under the month's total, "For comparison, 1–2 October: $39 · now 18% less", the same days of last month (or the whole month before a past one). Negative amounts in Russian now use a true minus sign.
- **New money entries pick a category from the description** ("Internet" → Phone and internet), instead of always starting on Transfers. A category the person chose is never changed.
- **Focus from an exam card:** each exam card has Focus next to its study plan, and focused minutes count as preparation for that exam. "+30 min of prep" and "To Calendar" became links, so the card has one row of buttons instead of three.
- **Morning plan reminder (new, off until turned on):** at wake-up, the day in one line, for example "2 classes · workout at 17:15 · 1 task · "Chemistry" in 3 days". Nothing on an empty day.
- **Focus sessions (new):** from the Now card during study, a project or a free slot: 25, 45 or 60 minutes, counted down in a glass bar on every screen. Leaving KAI for more than 3 seconds counts as a distraction and the time away is measured; with reminders on, the iPhone app calls you back after 40 seconds away and says when it's done. Only focused minutes become study time for the day (hours, active days, the weekly summary). Sessions survive the app being closed. It's the part of distraction blocking that needs no Screen Time permission; `docs/screen-time-blocking.md` explains how blocking would plug into it later. The rest and focus bars are no longer read out by VoiceOver every second.
- **Cleaner numbers and labels:** thousands separators on every calorie figure, true minus signs, no stray separator before a meal's macros, storage in MB or GB, AI notes that fit the setup (sign in, or connect Claude or ChatGPT) instead of naming only Claude, a natural budget sentence ("about $2 a day until the end of the month"), and no supplements task in the list while supplements are off. A sick day in the week strip showed "P" in English (its letter clashed with protein's); it's now the thermometer icon. A read-through of every screen's text in both languages found nothing else.
- **Calorie advice, accurate wording:** on a weight-loss goal with weight going up, the card said loss was "too slow"; it now says weight is going up, with a "Going up" badge. The advice itself is unchanged (about 150 kcal less, never under the floor).
- **Charts:** bar chart axes use round numbers (2,500 and 1,250, not 2,343 and 1,172), and zero reads 0.
- **Nothing cut off:** a scan of every dropdown and text on every screen and settings section, in both languages, at the size of an iPhone 13 mini, found three truncated choices; the profile form now gives long choices a full row, and two English labels are shorter ("Keep weight", "Not specified"). Headings wrap into even lines.
- **App Store screenshots:** `node tools/app-store-screenshots.mjs` makes twelve ready-to-upload 6.9-inch screenshots (six per language) from the real app with invented sample data. `docs/app-store.md` also explains how to give the icon the iOS 26 Liquid Glass look in Icon Composer.
- **Tell KAI, smoother:** after Analyze, what was understood and its Apply button scroll into view (they used to sit below the fold); after the first message, the long "without AI I understand…" box shrinks to one line.
- **Security check:** every place names, titles and notes go into the page was audited and found escaped; a test now plants markup in all kinds of typed text and checks no screen renders it.
- **Text size:** follows the iPhone's text size up to 120%, or pick 100%, 110% or 120% in More. Small screens keep enough room that nothing clips (an iPhone SE stays at 100%).
- **App updates:** the installed web app shows an Update button when a new version is ready, and one left open for days checks again when it comes back to the screen.
- **No backup nag while the account's cloud copy is up to date:** the weekly reminder said data would be lost if iOS cleared storage, which isn't true once records sync.
- **Unreachable code removed:** an old profile sheet that a later line had replaced (about 8 KB), with its 17 translations.
- **Automatic copies are reachable.** The copy kept before the first cloud sync was announced in a message but couldn't be opened anywhere. Data and backup now lists the copies on the phone, and each can be saved as a file that "Restore a backup" accepts. Without the phone's storage (a private Safari tab), photos waiting for the AI and these copies now last until the app closes instead of being lost at once.

## App Review fixes found in the iPhone project

- **A crash on "Save Image":** sharing the weekly summary offers Save Image, and iOS ends an app that saves to Photos without `NSPhotoLibraryAddUsageDescription`. Added.
- **Privacy manifest:** App Store Connect refuses uploads (ITMS-91053) when code reads file dates or stored settings without saying why. The Filesystem and Apple sign-in plugins do both and ship no manifest. `PrivacyInfo.xcprivacy` now gives the reasons, says there's no tracking, and mirrors the App Privacy answers. GitHub's iPhone build compiles it.
- **Permission prompts in Russian:** camera, photos, saving to Photos and Health, in `ru.lproj/InfoPlist.strings`.
- **Sign-in buttons:** the Apple button has the Apple logo in the title's colour (black on light, white on dark), and the Google button has the four-colour G, as both companies' button guidelines ask.
- **Sign in with Apple and account deletion:** Apple requires that deleting an account also revokes the person's Apple token. After signing in with Apple, the server now keeps a refresh token (in a table only it can read), and deleting the account revokes it with Apple first. It needs a Sign in with Apple key in the server's secrets (see `server/README.md`); without one, everything works as before. Tested with a throwaway key and a stand-in for Apple.
- **Reviewer notes** list what's native (guideline 4.2) and what to try without signing in.
- **Home Screen quick actions** in the iPhone app: long-press the icon for Tell KAI or Today (in Russian too). GitHub's iPhone build compiles the Swift; the action itself needs trying on a device.
- **Accessibility labels for the App Store:** `docs/app-store.md` says which of Apple's accessibility labels KAI can claim (dark interface, sufficient contrast, reduced motion) and which need a device check first.
- `node tools/check-release.js` and the tests now check all of the above.

## Liquid Glass, redone (iOS 26)

The first glass pass sat on flat, single-colour backgrounds, so it read as plain white or grey bars. This pass follows Apple's Materials guidance and "Adopting Liquid Glass" ([HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)):

- **Glass only on the floating layer:** tab bar, header buttons, sheets, toasts and the rest timer. Content sits on a lighter standard material (translucent cards), as Apple advises.
- **Something for the glass to show:** the page has soft colour that changes per section (green for Day, rose for Health, amber for Money, violet for More), so the glass picks up colour as content scrolls beneath it.
- **The glass itself:** blur plus extra colour from beneath, a rim that catches the light at the top left and bottom right, an inner glow where real glass bends light, and a soft shadow. A touch makes it swell slightly and light up from the finger. Safari can't do true refraction (the SVG displacement trick only works in Chrome), so the edges imitate it.
- **Tab bar:** a floating capsule. The selected tab sits in a lighter glass capsule that slides to the next tab and stretches like a drop on the way. Scrolling down, the bar recedes to its icons; scrolling up brings the labels back.
- **Header:** the profile is a glass capsule and AI a glass circle. Both float, and once the page moves the name tucks away, the section title appears in the middle, and content fades under a soft blurred edge.
- **Sheets:** inset glass panels whose title bar frosts only when content scrolls under it. Buttons, pills and segmented controls are capsules with a lit top edge.
- **Accessibility:** Reduce Transparency gives solid surfaces with no blur or colour; Increase Contrast gives solid surfaces with visible edges; Reduce Motion stops the sliding and receding. Every text element was measured over the real rendered glass, in both themes, on four tabs and two scroll positions, by sampling the pixels behind it: all at 4.5:1 or better (3:1 for large text).
- **Speed:** scrolling stays at 60 fps with the CPU slowed four times.
- **Text on glass:** toasts and the rest timer use a thicker glass, so content scrolling beneath never competes with their words.
- **Section switchers glide:** switching Food / Workouts / Body (and the money and content switchers), the selected capsule glides to the new choice with a little spring, while only the content below fades in.
- **Touch:** settings rows highlight while pressed, and whole-card buttons press in slightly.
- **Shapes:** buttons, pills and toasts are capsules at one line and rounded rectangles when their text wraps (two buttons in the knowledge base had become ovals).
- **The weekly summary image** has the new look (glass tiles over soft colour, a strip of the week's days), and with no time logged it leads with the tasks done instead of "0 min".

**To see it**, run this branch, not `main`: `python3 -m http.server 8123 --directory kai` and open http://localhost:8123, or build the iPhone app from this branch. An installed web app may need one extra reload to drop its cached copy.

## How it was tested

- `node --test tests/app.test.mjs`: 160 tests, all pass (36 at the start).
- In `server/`: `npm ci` and `npm test`: 44 tests, all pass (28 at the start), including new database, webhook, Apple token and on-phone reader tests.
- GitHub's `Checks` workflow, including the iPhone build, passed on every push to this branch.
- Accessibility: axe-core on nine screens in both themes, with no violations.
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
8. **Features to cut or hide:** see `docs/feature-review.md`. Supplements and the face log are switched off as asked. The content tools and the on-computer and on-phone AI are still there, waiting for your call. The own-key option is now hidden in the iPhone app once the server is connected (reversible with `ownKeys`).
9. **Apple-style design.** The new look follows Apple's Human Interface Guidelines directly. A third-party design skill from GitHub wasn't used, because it couldn't be checked.
10. **Commit history note.** One commit ("Test the quick-add date fixes", the first of two with that name) went in with a test that was wrong for Saturdays; the next commit fixes it. Squashing the branch on merge hides both.
11. **Calorie floor for losing weight** is now 1,200 kcal (it was the person's BMR, which can be lower for small people). That matches the AI's safety rules. If you'd rather use separate floors (for example 1,200 for women and 1,500 for men), it's `KCAL_FLOOR` in `kai/app.js`.
12. **Should finishing a season clear the day diary at all?** It's how the feature was designed, so it still does, now with a copy and a way back. Keeping the days and only starting a new season count would keep the weight trend and records whole. Your call.
13. **Sign in with Apple key on the server.** Before submitting, create a Sign in with Apple key in the Apple developer account and set `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_BUNDLE_ID` (and `APPLE_WEB_CLIENT_ID` if Apple sign-in is offered on the web) as Supabase secrets, then deploy `apple-token`. The steps are in `server/README.md`.
14. **12-hour times for US English?** Times show as 18:30 everywhere. People in the US usually read 6:30 PM. Switching the display by language or region touches about 25 places (timeline, tasks, events, warnings, reminders) and would need its own careful pass; say if you want it.

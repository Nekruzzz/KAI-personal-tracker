# App Store listing draft

Everything here is a draft. Check Apple's current limits and rules in App Store Connect before submitting, and fill in each `[bracket]`.

## English

**Name** (30 characters at most): KAI: Life Tracker

**Subtitle** (30 at most): Say it once. Your plan updates

**Keywords** (100 at most, commas, no spaces): `planner,student,exam,schedule,study,calorie,habit,workout,routine,reminder,tracker,AI,assistant`

**Description:**

Tell KAI anything in one message. "Physics exam Friday at 10, had chicken and rice, slept 6 hours." It logs the food and sleep, adds the exam, and shows you everything before it changes.

KAI warns you when your plans clash: a hard workout the night before an exam, two things at the same time, a late night before an early start. These checks run on your phone, free and offline.

Exams don't sneak up on you. Reminders arrive two weeks, one week, three days, one day and two hours ahead. List your topics and KAI spreads them across the days you actually have free, and tells you honestly if they don't fit.

See your effort add up: hours walked and studied, active days, streaks, levels and a weekly recap you can share.

- One message updates your food, workouts, schedule, tasks and money
- Conflict warnings before they become problems
- Study plans built around your real week
- Import your timetable from a calendar file
- A monthly budget that sets aside rent and subscriptions, with a reminder on the day each is due
- To-dos that repeat ("every Monday", "every month"), and a streak for each daily habit
- Focus sessions that count only the minutes you actually focus, and notice when you leave for another app
- Apple Health for steps, sleep and workouts
- English and Russian
- Understands everyday messages on your phone, even without AI: sleep, steps, spending, workouts, food with an amount, to-dos and exams
- Works offline. AI is optional and only runs with your permission

The free plan includes 10 AI messages a day. [Paid plan details and price.]

KAI gives general estimates and isn't medical advice.

**Promotional text** (170 at most): Exam on Friday? Tell KAI once. It adds the exam, plans your study, warns about clashes and reminds you, even when the app is closed.

## Русский

**Название:** KAI: трекер жизни

**Подзаголовок:** Скажи раз, и план обновится

**Ключевые слова:** `планер,студент,экзамен,расписание,учеба,калории,привычки,тренировки,напоминания,трекер,ИИ`

**Промотекст** (170 at most): Экзамен в пятницу? Скажи KAI один раз. Он добавит экзамен, распланирует подготовку, предупредит о накладках и напомнит, даже когда приложение закрыто.

**Описание:**

Напиши KAI что угодно одним сообщением. «В пятницу в 10 экзамен по физике, съел курицу с рисом, спал 6 часов». Он запишет еду и сон, добавит экзамен и покажет всё, прежде чем что-то менять.

KAI предупредит, если планы мешают друг другу: тяжёлая тренировка накануне экзамена, два дела в одно время, поздний вечер перед ранним подъёмом. Эти проверки работают на телефоне, бесплатно и без интернета.

Экзамены не застанут врасплох. Напоминания приходят за две недели, неделю, три дня, день и два часа. Перечисли темы, и KAI распределит их по дням, когда у тебя правда есть время, а если не помещается, честно скажет об этом.

Смотри, как складываются усилия: часы прогулок и учёбы, активные дни, серии, уровни и итоги недели, которыми можно поделиться.

- Одно сообщение обновляет еду, тренировки, расписание, задачи и деньги
- Предупреждения о конфликтах заранее
- Планы подготовки под твою реальную неделю
- Импорт расписания из файла календаря
- Бюджет месяца, который заранее учитывает аренду и подписки, с напоминанием в день платежа
- Повторяющиеся задачи («каждый понедельник», «каждый месяц») и серия для каждой ежедневной привычки
- Фокус-сессии: в учёбу засчитываются только минуты без отвлечений, а уход в другое приложение замечается
- Здоровье iPhone: шаги, сон и тренировки
- Русский и английский
- Понимает обычные сообщения прямо на телефоне, даже без ИИ: сон, шаги, расходы, тренировки, еду с граммами, дела и экзамены
- Работает без интернета. ИИ необязателен и включается только с твоего разрешения

В бесплатном плане 10 сообщений ИИ в день. [Условия и цена платного плана.]

KAI даёт общие оценки и не заменяет врача.

## Notes for Apple's reviewer

KAI is a personal tracker with native reminders and Apple Health. Sign-in is optional; everything except AI works without it.

To test AI: sign in with the demo account [demo email and code, or how to get one]. The first AI request shows a consent screen naming Anthropic as the third party and listing what is sent (guideline 5.1.2). Account deletion is under More → Account (guideline 5.1.1(v)). Everything on the phone itself can be erased under More → Data and backup → Delete all data on this phone.

Health data is read only, used for the person's own progress, and never used for advertising.

What makes it an app rather than a website (guideline 4.2): reminders that open the right screen when tapped, Home Screen quick actions (Tell KAI, Today), Apple Health (steps, sleep, workouts), Sign in with Apple, haptic feedback, the iOS share sheet for backups and the weekly summary, and full use offline. Things to try without signing in: tap the microphone button and send "slept 7 hours, walked 40 minutes, spent 12 on lunch" (it's read on the phone, shown for confirmation, then applied, with Undo), check off a task on Day, or open Health → Workouts for a no-equipment home workout with a rest timer.

Before submitting, run `node tools/check-release.js`: it lists the draft notices and blanks in the legal pages, the server settings and anything else that would block review. Also check that `plans` in `kai/config.js` is `false` unless real in-app purchases are set up. With it on, the plans screen shows a placeholder price, which App Review rejects as incomplete. Supplements and the face log are switched off in this version, so there's nothing about them to review.

## Review risks to decide on

- **Your own AI key (guideline 3.1.1).** The AI settings send people to Anthropic's or OpenAI's site to get a paid API key, which a reviewer may read as buying digital features outside in-app purchase. Done: once the server is connected, the iPhone app hides this option and offers KAI's own AI instead; the web keeps it. To show it in the iPhone app anyway, set `ownKeys: true` in `kai/config.js`.
- **Apple Health data in the cloud (guideline 5.1.3).** Steps, sleep and workouts read from Apple Health end up in day entries, and those sync to the server when signed in. Apple allows this with clear consent but forbids storing Health data in iCloud. The privacy policy should say plainly that this data syncs to KAI's server. The app's Health permission step and Health setting now say so once a server is connected.
- **Sign in with Apple and account deletion (guideline 5.1.1(v)).** Deleting an account must also revoke the person's Apple token. The server does this once its Apple key is set: see "Sign in with Apple: revoking on account deletion" in `server/README.md`. Set it before submitting.
- **Permission texts (guideline 5.1.1 and a crash otherwise).** iOS ends an app that opens the camera, the photo library, Health, or saves to Photos without a sentence explaining why. `Info.plist` has all four; "Save Image" when sharing the weekly summary was missing one, and is fixed. `node tools/check-release.js` and a test check them. The Russian versions are in `native/ios/App/App/ru.lproj/InfoPlist.strings`; a new permission text needs a line there too (the release check notices).
- **Calories and weight (guideline 1.4.1).** The safety rules and the not-medical-advice notes are in place. Keep them visible in screenshots and review notes.

## App Privacy answers ("nutrition label")

Have a lawyer check these against the final privacy policy. "Linked to you" applies only with an account.

| Data | Collected when | Purpose | Linked to you | Tracking |
|---|---|---|---|---|
| Email address | Account created | App functionality | Yes | No |
| Health and fitness (food, weight, sleep, steps, workouts) | Cloud sync or AI used | App functionality | Yes | No |
| Financial info (entries the person types) | Cloud sync or AI used | App functionality | Yes | No |
| Photos | AI request with a photo; not stored by KAI | App functionality | No | No |
| Other user content (messages, schedule, notes) | Cloud sync or AI used | App functionality | Yes | No |
| Usage data (AI request and token counts) | Account created | App functionality | Yes | No |

There are no ads, no third-party analytics and no tracking.

The same answers are in the app's privacy manifest, `native/ios/App/App/PrivacyInfo.xcprivacy`. If one changes, change the other. The manifest also says why the app reads file dates (the Filesystem plugin, reason C617.1) and stored settings (the Apple sign-in plugin, reason CA92.1). Without that, App Store Connect refuses the upload (ITMS-91053).

## Accessibility labels (App Store Connect → Accessibility)

Apple lets the App Store page list the accessibility features an app supports. Only claim what you've checked on a real iPhone.

| Feature | Claim? | Why |
|---|---|---|
| Dark Interface | Yes | A full dark theme; the web app follows the phone's setting, and the iPhone app is dark. |
| Sufficient Contrast | Yes | Every piece of text was measured at 4.5:1 or better (3:1 for large text) over the real rendered glass, in both themes. Increase Contrast makes surfaces solid with visible edges. |
| Reduced Motion | Yes | Reduce Motion stops the animations, the sliding capsules and the receding tab bar. |
| VoiceOver | After a device check | Icon buttons, rings and charts have spoken labels, sheets announce their title, focus returns where it was, and an automated check (axe) finds no problems. Go through the main tasks with VoiceOver on an iPhone before claiming it. |
| Voice Control | After a device check | Visible labels match the spoken names, so "Tap Day" works; check it on an iPhone. |
| Larger Text | No | Text follows the iPhone's size up to 120% (the "Text size" setting in More); beyond that, screens would need reworking. |
| Differentiate Without Color | Not yet | Most states have words or icons, but some charts rely on colour. |
| Captions, Audio Descriptions | Not applicable | KAI has no video or audio. |

## Age rating

The app has health and weight features and free-form AI. Answer Apple's questionnaire honestly, and read the current age-rating categories before choosing, since many users may be students. The terms draft sets a minimum age of 13; ask the lawyer whether that fits your countries.

## App icon on iOS 26 (Liquid Glass)

The current icon is a single flat image (white KAI on black), which iOS shows as it is and also tints for the dark and tinted Home Screen styles. For the full Liquid Glass look (light catching the edges, depth, the clear style), build the icon in Icon Composer, which comes with Xcode 26 on a Mac:

1. Export the KAI wordmark alone, white on a transparent background, as an SVG or a 1024×1024 PNG. Keep it within the middle of the canvas, as now.
2. In Icon Composer, add a black (or very dark green) background and put the wordmark on its own layer above it.
3. Preview the default, dark, clear and tinted styles, then save the `.icon` file into `native/ios/App/App` and choose it as the app icon in Xcode.

Nothing in the app depends on this; it only changes how the icon looks on the Home Screen.

## Screenshots

`node tools/app-store-screenshots.mjs` makes twelve ready-to-upload screenshots at 1320×2868 (the 6.9-inch iPhone size; App Store Connect scales them for smaller iPhones), six in English and six in Russian: Day, Tell KAI, Food, a home workout, Money and Body. They come from the real app with invented sample data, at 9:41 on a weekday morning, light and dark alternating. It needs Playwright with Chromium and the app served on port 8123 (the script's first lines say how). Run it again after design changes.

Other screens worth showing:

1. A conflict warning with its fix
2. An exam countdown with a study plan
3. The weekly summary image

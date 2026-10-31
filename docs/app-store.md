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

**Описание:**

Напиши KAI что угодно одним сообщением. «В пятницу в 10 экзамен по физике, съел курицу с рисом, спал 6 часов». Он запишет еду и сон, добавит экзамен и покажет всё, прежде чем что-то менять.

KAI предупредит, если планы мешают друг другу: тяжёлая тренировка накануне экзамена, два дела в одно время, поздний вечер перед ранним подъёмом. Эти проверки работают на телефоне, бесплатно и без интернета.

Экзамены не застанут врасплох. Напоминания приходят за две недели, неделю, три дня, день и два часа. Перечисли темы, и KAI распределит их по дням, когда у тебя правда есть время, а если не помещается, честно скажет об этом.

Смотри, как складываются усилия: часы прогулок и учёбы, активные дни, серии, уровни и итоги недели, которыми можно поделиться.

- Одно сообщение обновляет еду, тренировки, расписание, задачи и деньги
- Предупреждения о конфликтах заранее
- Планы подготовки под твою реальную неделю
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

Before submitting, run `node tools/check-release.js`: it lists the draft notices and blanks in the legal pages, the server settings and anything else that would block review. Also check that `plans` in `kai/config.js` is `false` unless real in-app purchases are set up. With it on, the plans screen shows a placeholder price, which App Review rejects as incomplete. Supplements and the face log are switched off in this version, so there's nothing about them to review.

## Review risks to decide on

- **Your own AI key (guideline 3.1.1).** The AI settings send people to Anthropic's or OpenAI's site to get a paid API key, which a reviewer may read as buying digital features outside in-app purchase. Done: once the server is connected, the iPhone app hides this option and offers KAI's own AI instead; the web keeps it. To show it in the iPhone app anyway, set `ownKeys: true` in `kai/config.js`.
- **Apple Health data in the cloud (guideline 5.1.3).** Steps, sleep and workouts read from Apple Health end up in day entries, and those sync to the server when signed in. Apple allows this with clear consent but forbids storing Health data in iCloud. The privacy policy should say plainly that this data syncs to KAI's server, and the Health permission step should mention it.
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

## Age rating

The app has health and weight features and free-form AI. Answer Apple's questionnaire honestly, and read the current age-rating categories before choosing, since many users may be students. The terms draft sets a minimum age of 13; ask the lawyer whether that fits your countries.

## Screenshots

Check Apple's current required sizes in App Store Connect. Suggested order:

1. One message becomes a checked plan ("Tell KAI")
2. A conflict warning with its fix
3. An exam countdown with a study plan
4. Progress: hours, active days, level
5. The weekly recap

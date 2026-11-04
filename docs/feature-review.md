# Feature review: what a new person may not need

KAI does a lot. For a stranger opening it for the first time, every extra screen is something to understand before the useful part. Below are features that could be removed, hidden or merged before launch. Nothing here has been removed: each is the owner's call, and removing any of them needs care so existing data isn't lost.

## Worth removing or moving out of the main app

1. **Content module** (scripts, video plan, platform stats, promotion). It's for content creators, not the "anyone, students first" audience, and it's already off by default. Removing it would cut a large part of `app.js`. Its data could stay in backups.
2. **"Computer" and "Phone" AI providers** (a model running on your own computer, or downloaded onto the phone). They're powerful but hard to explain and support, and with KAI's own AI they aren't needed. Keep them under Advanced at most.
3. **Morning face puffiness log and progress photos** (Body tab). They're very niche and focus on appearance, which sits awkwardly next to the care rules for food and weight. Consider removing them, or keeping them off by default.

## Worth hiding until needed

4. **Your own API key** (Claude or ChatGPT). Once KAI's own AI is live, this is for power users only. It's already under the AI settings; it could move fully under Advanced.
5. **The "Day 1/90" season chip in the header:** done, removed (Season is in More).
6. **The knowledge base button in the header:** done, moved to a row in More.

## Worth merging

7. **Progress appeared in seven places:** done. It's one folded "Progress and awards" section on the Day tab (with "Week in review" inside), plus the streak chip. The weekly recap banner still appears on Sundays and Mondays, which is timely rather than repeated.

## Safety question, not just simplicity

8. **Supplements** are now switched off entirely (see below). Before that, sports supplements were also hidden for under-18s.

## Removed or folded away at the owner's request

These are switched off or folded, not deleted: saved data stays, and each can come back with a small change.

- **Supplements:** the tab, the daily task and the calendar reminder are off (`SUPPS_ON` in `kai/app.js`). A saved supplement list stays in the plan.
- **Face puffiness log:** off (`FACE_ON`). Logged entries stay.
- **Workout breakdown:** the Workouts screen now shows only the day's exercises and sets. "How do you feel?" is one line that opens on a tap. Sets per muscle, strength progress, posture, steps and the research notes sit in one folded "Progress and details" section. The long effort note above each workout is gone, because the effort line says the same thing.
- **Header:** only the name and the AI button. The "Day 1/90" season chip is gone (Season is in More), and the knowledge base moved to a row in More.
- **Day tab:** progress, the week strip and stats are in one folded "Progress and awards" section, whose summary shows the level. The schedule shows the next three blocks, with the rest on a tap. Screen time is one row until the first screenshot. The check-in's "Later" is a small link.
- **Body tab:** no repeated calorie-adjustment card (it's on Food), and no waist chart until there are two entries.
- **Money:** one Expenses/Income switch instead of two, and a smaller chart.
- **More:** the class timetable shows only for students, or when classes are already saved.
- **Tell KAI:** a one-sentence intro instead of a paragraph. The meal-plan card is one row until a menu exists.

## Also lighter since

- Food shows one week chart with a Calories/Protein switch, instead of two charts.
- Sleep is a section of Body, so the three Health tabs fit on a phone.
- More lists everyday settings first and one-time ones last.
- The walking week total on Day appears only once there is some.

## Already done in this round

- The "Which AI" choice now appears only when two or more AIs are set up, so it no longer clutters every AI screen.
- Progress with nothing to show is hidden in the first week, and the first-message card makes the main feature obvious.

## Added later, and how each stays out of the way

New features from the later rounds, with what a person sees before they use them. Anything here can be switched off with a one-line change if the owner finds it unnecessary.

- **Regular payments (Money):** invisible until someone adds one or the app spots something paid once a month; then one card under the budget. The payment reminder is a switch in Reminders and is hidden while Money is off.
- **Category limits (Money):** folded inside the budget sheet; nothing on screen until a limit is set.
- **Month and category comparisons (Money):** one line under the total and a few words on a category, only when last month has data and the change is 10% or more.
- **Money search:** a single "Search" link next to History.
- **Debts:** one "Note a debt" link on the Money tab until a debt exists; then a small list.
- **Repeating to-dos:** no new control; it's read from the words ("every Monday"). A small "↻ every week" appears only on repeating ones.
- **Done today:** one "Done today: 2" link, closed by default.
- **Habit streaks:** a few words under a daily task, only from 2 days in a row.
- **Hold timer:** replaces the Rest link on timed exercises only (plank and similar), so no extra button.
- **Focus sessions and awards:** a button on the Now card and exam cards; three more awards on the shelf.
- **Evening check-in and morning plan reminders:** off until turned on.
- **Timetable card:** students only, in the first two weeks, until classes exist or "Not now".
- **Exam results:** one check-in question after each exam (with "Don't know yet"), and a past exams list at the bottom of Events.
- **Quick actions:** only on a long press of the app icon.
- **What's new:** once per update, for people who used an earlier version; the list lives in `WHATS_NEW` and its id in `WHATS_NEW_ID` (change the id to show a new list).

Candidates to cut if the app feels crowded: the month comparison line (the category words say more), the evening check-in (overlaps with the day's own "2 more tasks" line), and Focus awards.

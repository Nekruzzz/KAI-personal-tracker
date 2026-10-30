# Feature review: what a new person may not need

KAI does a lot. For a stranger opening it for the first time, every extra screen is something to understand before the useful part. Below are features that could be removed, hidden or merged before launch. Nothing here has been removed: each is the owner's call, and removing any of them needs care so existing data isn't lost.

## Worth removing or moving out of the main app

1. **Content module** (scripts, video plan, platform stats, promotion). It's for content creators, not the "anyone, students first" audience, and it's already off by default. Removing it would cut a large part of `app.js`. Its data could stay in backups.
2. **"Computer" and "Phone" AI providers** (a model running on your own computer, or downloaded onto the phone). They're powerful but hard to explain and support, and with KAI's own AI they aren't needed. Keep them under Advanced at most.
3. **Morning face puffiness log and progress photos** (Body tab). They're very niche and focus on appearance, which sits awkwardly next to the care rules for food and weight. Consider removing them, or keeping them off by default.

## Worth hiding until needed

4. **Your own API key** (Claude or ChatGPT). Once KAI's own AI is live, this is for power users only. It's already under the AI settings; it could move fully under Advanced.
5. **The "Day 1/90" season chip in the header.** A stranger doesn't know what a season is. Show it after the first week, or only once someone opens Season.
6. **The knowledge base button in the header.** It takes one of only three header buttons for a feature few will use early on. It could move to More.

## Worth merging

7. **Progress appeared in seven places.** It's now one folded "Progress and awards" section on the Day tab, plus the streak chip and the weekly recap. Merging the recap into that section is the remaining step.

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

## Already done in this round

- The "Which AI" choice now appears only when two or more AIs are set up, so it no longer clutters every AI screen.
- Progress with nothing to show is hidden in the first week, and the first-message card makes the main feature obvious.

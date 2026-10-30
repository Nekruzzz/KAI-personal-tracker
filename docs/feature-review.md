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

7. **Progress appears in seven places:** the progress card, level bar, week strip, the stats card with its 30-day heat map, streak, awards and the weekly recap. One "Progress" area with tabs would be simpler.
8. **Reminders exist twice on the web:** iPhone Calendar files (.ics) and in-app reminders. In the iPhone app only in-app reminders are shown, which is right. On the web, consider offering just one.

## Safety question, not just simplicity

9. **Supplement presets include caffeine dosing** (3–6 mg per kg of body weight) and are shown regardless of age. The rules already stop calorie deficits for under-18s. Hiding caffeine, or the whole supplement section, for under-18s would follow the same idea. This wasn't changed, because it's a health-content decision.

## Already done in this round

- The "Which AI" choice now appears only when two or more AIs are set up, so it no longer clutters every AI screen.
- Progress with nothing to show is hidden in the first week, and the first-message card makes the main feature obvious.

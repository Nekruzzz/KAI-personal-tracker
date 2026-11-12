-- Everyone gets the AI, photos included, while payments don't exist yet.
-- Free: 20 requests a day, photos allowed, on the fast model. The cap across all users stays at 2,000 a day.
-- To change limits later, edit these rows in the dashboard; no code change is needed.
update public.tiers set daily_requests = 20, images_allowed = true where tier = 'free';

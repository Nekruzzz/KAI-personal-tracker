-- KAI: subscriptions from RevenueCat. The webhook (functions/revenuecat) is the only writer; the app only reads its own plan.

alter table public.profiles
  add column tier_expires_at timestamptz,  -- null: no end date (free, lifetime, or set by hand)
  add column tier_event_at timestamptz,    -- time of the newest subscription event applied, so older ones arriving late are ignored
  add column tier_source text;

-- every event applied once, even when RevenueCat sends it again
create table public.subscription_events (
  event_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  received_at timestamptz not null default now()
);

create function public.apply_subscription_event(p_event_id text, p_user uuid, p_action text, p_expires_at timestamptz, p_event_at timestamptz, p_type text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  last_at timestamptz;
begin
  if p_action not in ('grant', 'keep', 'revoke') then raise exception 'unknown action'; end if;
  if not exists (select 1 from auth.users where id = p_user) then return 'unknown_user'; end if;
  insert into public.subscription_events (event_id, user_id, type) values (p_event_id, p_user, p_type) on conflict do nothing;
  if not found then return 'duplicate'; end if;
  insert into public.profiles (user_id) values (p_user) on conflict do nothing;
  select tier_event_at into last_at from public.profiles where user_id = p_user for update;
  if last_at is not null and p_event_at < last_at then return 'stale'; end if;
  update public.profiles set
    tier = case p_action when 'grant' then 'plus' when 'revoke' then 'free' else tier end,
    tier_expires_at = case p_action when 'revoke' then null when 'grant' then p_expires_at else coalesce(p_expires_at, tier_expires_at) end,
    tier_event_at = p_event_at,
    tier_source = 'revenuecat'
  where user_id = p_user;
  return 'applied';
end $$;

create or replace function public.ai_reserve(p_user uuid, p_day date, p_has_images boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  t public.tiers%rowtype;
  used int;
  global_used int;
  global_cap int;
begin
  insert into public.profiles (user_id) values (p_user) on conflict do nothing;
  -- a paid plan past its end date counts as free, even if a webhook never arrived
  select tr.* into t from public.profiles p join public.tiers tr
    on tr.tier = case when p.tier_expires_at is not null and p.tier_expires_at < now() then 'free' else p.tier end
    where p.user_id = p_user;

  if p_has_images and not t.images_allowed then
    return jsonb_build_object('ok', false, 'code', 'plus_required', 'tier', t.tier);
  end if;

  select global_daily_requests into global_cap from public.app_limits;
  insert into public.ai_global (day) values (p_day) on conflict do nothing;
  select requests into global_used from public.ai_global where day = p_day for update;
  if global_used >= global_cap then
    return jsonb_build_object('ok', false, 'code', 'global_limit', 'tier', t.tier);
  end if;

  insert into public.ai_usage (user_id, day) values (p_user, p_day) on conflict do nothing;
  select requests into used from public.ai_usage where user_id = p_user and day = p_day for update;
  if used >= t.daily_requests then
    return jsonb_build_object('ok', false, 'code', 'daily_limit', 'tier', t.tier, 'used', used, 'limit', t.daily_requests);
  end if;

  update public.ai_usage set requests = requests + 1 where user_id = p_user and day = p_day;
  update public.ai_global set requests = requests + 1 where day = p_day;
  return jsonb_build_object('ok', true, 'tier', t.tier, 'used', used + 1, 'limit', t.daily_requests, 'smart_model', t.smart_model);
end $$;

alter table public.subscription_events enable row level security;
revoke all on public.subscription_events from anon, authenticated;
revoke execute on function public.apply_subscription_event(text, uuid, text, timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.apply_subscription_event(text, uuid, text, timestamptz, timestamptz, text) to service_role;
revoke execute on function public.ai_reserve(uuid, date, boolean) from public, anon, authenticated;
grant execute on function public.ai_reserve(uuid, date, boolean) to service_role;

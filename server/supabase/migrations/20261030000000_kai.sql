-- KAI: accounts, AI usage limits and cloud sync.
-- People can read and change only their own rows. Tier, usage and limits can be changed only by the server.

-- ---------- limits per plan: edit these rows to change limits without touching code ----------
create table public.tiers (
  tier text primary key,
  daily_requests int not null check (daily_requests >= 0),
  images_allowed boolean not null default false,
  smart_model boolean not null default false
);
insert into public.tiers (tier, daily_requests, images_allowed, smart_model) values
  ('free', 10, false, false),
  ('plus', 100, true, true);

-- a hard stop across all users, so a viral day cannot produce a huge bill
create table public.app_limits (
  id boolean primary key default true check (id),
  global_daily_requests int not null default 2000
);
insert into public.app_limits default values;

-- ---------- profiles: one per account, created automatically ----------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tier text not null default 'free' references public.tiers (tier),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- AI usage: counts and tokens only, never the text of a request ----------
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  requests int not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  primary key (user_id, day)
);
create table public.ai_global (
  day date primary key,
  requests int not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0
);

-- takes one request from today's allowance, atomically, or says why it cannot
create function public.ai_reserve(p_user uuid, p_day date, p_has_images boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  t public.tiers%rowtype;
  used int;
  global_used int;
  global_cap int;
begin
  insert into public.profiles (user_id) values (p_user) on conflict do nothing;
  select tr.* into t from public.profiles p join public.tiers tr on tr.tier = p.tier where p.user_id = p_user;

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

-- records tokens after a request, or gives the request back if the AI call failed
create function public.ai_settle(p_user uuid, p_day date, p_ok boolean, p_input bigint, p_output bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_ok then
    update public.ai_usage set input_tokens = input_tokens + p_input, output_tokens = output_tokens + p_output
      where user_id = p_user and day = p_day;
    update public.ai_global set input_tokens = input_tokens + p_input, output_tokens = output_tokens + p_output
      where day = p_day;
  else
    update public.ai_usage set requests = greatest(requests - 1, 0) where user_id = p_user and day = p_day;
    update public.ai_global set requests = greatest(requests - 1, 0) where day = p_day;
  end if;
end $$;

-- ---------- cloud sync: one row per app document ----------
create sequence public.docs_rev_seq;
create table public.docs (
  user_id uuid not null references auth.users (id) on delete cascade,
  path text not null check (path ~ '^[a-z]+/[^/]+$' and path <> 'app/ai'),
  data jsonb,
  deleted boolean not null default false,
  client_ts bigint not null,
  rev bigint not null default nextval('public.docs_rev_seq'),
  primary key (user_id, path),
  check (pg_column_size(data) < 2000000)
);
create index docs_user_rev on public.docs (user_id, rev);

-- the last few versions of each document, so a sync mistake can be recovered from
create table public.doc_versions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  path text not null,
  data jsonb,
  deleted boolean not null,
  client_ts bigint not null,
  saved_at timestamptz not null default now()
);
create index doc_versions_lookup on public.doc_versions (user_id, path, id desc);

create function public.docs_keep_version() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.doc_versions (user_id, path, data, deleted, client_ts)
    values (old.user_id, old.path, old.data, old.deleted, old.client_ts);
  delete from public.doc_versions where id in (
    select id from public.doc_versions where user_id = old.user_id and path = old.path
    order by id desc offset 5
  );
  return new;
end $$;
create trigger docs_versions before update on public.docs
  for each row execute function public.docs_keep_version();

-- saves a batch of documents for the signed-in person; the newest edit wins and a stale one is ignored
create function public.sync_push(p_items jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  me uuid := auth.uid();
  it jsonb;
  out_items jsonb := '[]'::jsonb;
  r record;
begin
  if me is null then raise exception 'not signed in'; end if;
  if jsonb_array_length(p_items) > 100 then raise exception 'batch too large'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    insert into public.docs as d (user_id, path, data, deleted, client_ts)
      values (me, it->>'path', it->'data', coalesce((it->>'deleted')::boolean, false), (it->>'ts')::bigint)
    on conflict (user_id, path) do update
      set data = excluded.data, deleted = excluded.deleted, client_ts = excluded.client_ts, rev = nextval('public.docs_rev_seq')
      where excluded.client_ts >= d.client_ts
    returning d.path, d.rev into r;
    out_items := out_items || jsonb_build_object('path', it->>'path', 'applied', r.path is not null, 'rev', r.rev);
    r := null;
  end loop;
  return out_items;
end $$;

-- ---------- who may do what ----------
alter table public.tiers enable row level security;
alter table public.app_limits enable row level security;
alter table public.profiles enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_global enable row level security;
alter table public.docs enable row level security;
alter table public.doc_versions enable row level security;

create policy "read plans" on public.tiers for select to authenticated using (true);
create policy "read own profile" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "read own usage" on public.ai_usage for select to authenticated using (user_id = auth.uid());
create policy "own docs" on public.docs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read own versions" on public.doc_versions for select to authenticated using (user_id = auth.uid());

revoke all on all tables in schema public from anon, authenticated;
grant select on public.tiers, public.profiles, public.ai_usage, public.doc_versions to authenticated;
grant select, insert, update, delete on public.docs to authenticated;
grant usage on sequence public.docs_rev_seq to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.sync_push(jsonb) to authenticated;
grant execute on function public.ai_reserve(uuid, date, boolean) to service_role;
grant execute on function public.ai_settle(uuid, date, boolean, bigint, bigint) to service_role;

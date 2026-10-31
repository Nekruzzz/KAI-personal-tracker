-- KAI: Sign in with Apple tokens, kept so they can be revoked when the person deletes their account (Apple requires it).
-- Only the server functions (service role) read or write this table; the app never sees a token after handing it over.

create table public.apple_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  client_id text not null,       -- the bundle ID (iPhone sign-in) or the Services ID (web sign-in) the token was issued to
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.apple_tokens enable row level security; -- and no policies: people get nothing
revoke all on public.apple_tokens from anon, authenticated;

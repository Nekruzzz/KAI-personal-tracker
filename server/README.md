# KAI server

Sign-in, cloud sync and AI without personal API keys. It runs on Supabase, and until it's set up the app works without an account.

## What's here

- `supabase/migrations/`: the database, its security rules and the usage limits.
- `supabase/functions/ai/`: holds the Claude key, chooses the model and enforces limits.
- `supabase/functions/delete-account/`: deletes an account and all its cloud data, revoking its Sign in with Apple token first.
- `supabase/functions/apple-token/`: keeps the Sign in with Apple token after signing in, so it can be revoked later.
- `supabase/functions/revenuecat/`: receives subscription events and sets the person's plan.
- `eval/`: measures how well the AI understands real messages, and what each costs.
- `tests/`: automated tests, plus `dev-backend.mjs`, a local stand-in for Supabase.

## Setting it up

You need about 30 minutes. Run the commands from this `server` folder.

### 1. Create the accounts

- **Supabase:** create a project at [supabase.com](https://supabase.com). Note its project ref, which is the part of its URL before `.supabase.co`.
- **Anthropic:** create an API key at [console.anthropic.com](https://console.anthropic.com/settings/keys), and **set a monthly spending limit** there.

### 2. Put the database and functions online

```bash
npx supabase login
```

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

```bash
npx supabase db push
```

```bash
npx supabase secrets set ANTHROPIC_API_KEY=YOUR_KEY
```

```bash
npx supabase functions deploy ai
```

```bash
npx supabase functions deploy delete-account
```

### 3. Turn on email codes

In the Supabase dashboard, go to **Authentication → Email templates → Magic Link** and make sure the template contains `{{ .Token }}`. The app asks for a 6-digit code, so this is what sends one.

Supabase's built-in email service has a very low sending limit. It's fine for testing, but connect your own email provider before real users arrive.

### 4. Connect the app

Copy your project URL and **publishable** key into `kai/config.js`. Never put the secret key or the Claude key there. The publishable key is designed to be public, because the security rules protect the data.

### 5. Try it

Open the app, sign in with your email, tell KAI what you ate, and check it answers and the food is logged. Then open **More → Account** to see your usage.

## Changing limits

Edit the `tiers` table in the Supabase dashboard. No code change is needed.

| Plan | AI requests a day | Photos | Better model for heavy tasks |
|---|---|---|---|
| free | 10 | no | no |
| plus | 100 | yes | yes |

The `app_limits` table holds a daily cap across all users, 2,000 requests to start with. To give someone the paid plan by hand, set `tier` to `plus` on their row in `profiles` and leave `tier_expires_at` empty.

## Subscriptions (RevenueCat)

The `revenuecat` function receives RevenueCat's webhook and sets the person's plan. It is written and tested locally, but no real payment has gone through it yet. The app doesn't sell anything yet either: its plan screen shows a placeholder price.

1. In RevenueCat, create an entitlement called `plus` and attach the subscription products to it.
2. In the app, when payments are added, log in to RevenueCat with the Supabase user ID, so each purchase names the account.
3. Pick a long random secret and store it:

```bash
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=YOUR_RANDOM_SECRET
```

4. Put the function online. RevenueCat has no Supabase sign-in, so the secret is the check:

```bash
npx supabase functions deploy revenuecat --no-verify-jwt
```

5. In RevenueCat, under **Integrations → Webhooks**, set the URL to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/revenuecat` and the Authorization header to `Bearer YOUR_RANDOM_SECRET`. Send a test event: the function answers `test`.

What each event does: a purchase, renewal or plan change gives `plus` until the period's end date; a cancellation or billing problem keeps `plus` until that date; an expiry returns the person to `free`; a transfer removes the plan from the old account. Each event counts once, older events that arrive late are ignored, and a plan past its end date counts as free even if a webhook was missed. Sandbox purchases count too, which is what TestFlight uses; to ignore them in production, also set `REVENUECAT_IGNORE_SANDBOX=true`. If your entitlement has another name, set `REVENUECAT_ENTITLEMENT`.

## Sign in with Apple: revoking on account deletion

Apple requires apps that offer Sign in with Apple to revoke the person's Apple token when they delete their account. After signing in with Apple, the app hands its one-time code (iPhone) or Apple's refresh token (web) to `apple-token`, which keeps a refresh token in a table only the server can read. `delete-account` revokes it with Apple before deleting the account. A failed revoke is logged and doesn't stop the deletion.

It needs a Sign in with Apple key: in the Apple developer account, under Certificates, Identifiers & Profiles → Keys, create a key with Sign in with Apple enabled and download the `.p8` file. Then set:

```bash
npx supabase secrets set APPLE_TEAM_ID=YOUR_TEAM_ID APPLE_KEY_ID=YOUR_KEY_ID APPLE_BUNDLE_ID=YOUR_APP_BUNDLE_ID APPLE_WEB_CLIENT_ID=YOUR_SERVICES_ID
```

```bash
npx supabase secrets set APPLE_PRIVATE_KEY="$(cat AuthKey_YOUR_KEY_ID.p8)"
```

```bash
npx supabase functions deploy apple-token
```

Without these, signing in with Apple still works; tokens just aren't kept, so they can't be revoked. `APPLE_WEB_CLIENT_ID` is only needed if Apple sign-in is offered on the web.

## Testing

```bash
npm install
```

```bash
npm test
```

To try the whole app locally without any accounts, run the command below from the project's main folder, open http://localhost:8124 and sign in with any email and the code `123456`. Claude's replies are simulated.

```bash
node server/tests/dev-backend.mjs
```

## Privacy

- The text of AI requests isn't stored or logged, only request counts and token totals.
- Synced data is stored unencrypted in Supabase, protected by per-person access rules, so the project's owner could read it. Say so in the privacy policy.
- API keys people paste in never sync, and the database rejects them.
- Photos aren't synced yet.
- Every synced document keeps its last 5 versions, for recovery. Deleting an account removes them too.

## Measuring the AI

Once you have an Anthropic key, this sends 59 realistic messages through the app's real prompt and the server's real AI code, then reports the pass rate and the measured cost per message.

Check for free first that it's ready. This prints the prompt and calls nothing:

```bash
node eval/run.mjs --dry
```

Then run it, with `ANTHROPIC_API_KEY` set in your terminal. Never put the key in a file here or in a chat:

```bash
node eval/run.mjs
```

The cost isn't measured yet. If each message uses about 3,000 tokens in and 500 out, a full run costs a few cents on the default Haiku model and about 60 cents with `--model claude-sonnet-5-5`. Results go to `eval/results/`, which stays out of Git.

Read `eval/cases.json` before trusting the score. It holds the messages and what counts as correct, and they were written without real user data, so they may not match what people actually type. Add messages from your own use and from testers. The calorie ranges are a judgement call, and the safety checks only look for words like "doctor", so read those replies yourself.

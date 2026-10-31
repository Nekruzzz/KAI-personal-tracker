// POST /functions/v1/apple-token  {code} or {refresh_token}  with the signed-in person's token, right after Sign in with Apple.
// Keeps Apple's refresh token so delete-account can revoke it, as Apple requires. Without an Apple key configured it answers 503
// and the app carries on: signing in never depends on this.
import { withSupabase } from 'npm:@supabase/server@1';
import { appleCfgFromEnv, exchangeAppleCode, handleAppleToken } from '../_shared/apple.ts';

export default {
  fetch: withSupabase({auth: 'user'}, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({code: 'bad_request'}, {status: 405});
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({code: 'not_signed_in'}, {status: 401});
    const cfg = appleCfgFromEnv(k => Deno.env.get(k));
    const body = await req.json().catch(() => null);
    const {status, body: out} = await handleAppleToken(userId, body, {
      cfg,
      bundleId: Deno.env.get('APPLE_BUNDLE_ID'),
      webClientId: Deno.env.get('APPLE_WEB_CLIENT_ID'),
      exchange: (clientId, code) => exchangeAppleCode(cfg!, clientId, code),
      store: async (uid, clientId, token) => {
        const {error} = await ctx.supabaseAdmin.from('apple_tokens').upsert({user_id: uid, client_id: clientId, refresh_token: token, updated_at: new Date().toISOString()});
        if (error) throw new Error('store_failed');
      },
      log: m => console.error(m),
    });
    return Response.json(out, {status});
  }),
};

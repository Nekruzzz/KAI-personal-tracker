// POST /functions/v1/delete-account  {confirm: true}  with the signed-in person's token.
// Deletes the account; every table with their data is removed with it by the database. Apple requires this in the app,
// and, for Sign in with Apple, that the Apple token is revoked too.
import { withSupabase } from 'npm:@supabase/server@1';
import { appleCfgFromEnv, revokeAppleFor, revokeAppleToken } from '../_shared/apple.ts';

export default {
  fetch: withSupabase({auth: 'user'}, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({code: 'bad_request'}, {status: 405});
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({code: 'not_signed_in'}, {status: 401});
    const body = await req.json().catch(() => null);
    if (body?.confirm !== true) return Response.json({code: 'bad_request'}, {status: 400});
    // Sign in with Apple: revoke the person's Apple token first, as Apple requires (a failure is logged, the deletion goes on)
    const cfg = appleCfgFromEnv(k => Deno.env.get(k));
    await revokeAppleFor(userId, {
      cfg,
      load: async id => (await ctx.supabaseAdmin.from('apple_tokens').select('client_id, refresh_token').eq('user_id', id)).data || [],
      revoke: (clientId, token) => revokeAppleToken(cfg!, clientId, token),
      log: m => console.error(m),
    });
    const {error} = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('delete failed', error.status);
      return Response.json({code: 'delete_failed'}, {status: 500});
    }
    return Response.json({deleted: true});
  }),
};

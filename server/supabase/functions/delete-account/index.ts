// POST /functions/v1/delete-account  {confirm: true}  with the signed-in person's token.
// Deletes the account; every table with their data is removed with it by the database. Apple requires this in the app.
import { withSupabase } from 'npm:@supabase/server@1';

export default {
  fetch: withSupabase({auth: 'user'}, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({code: 'bad_request'}, {status: 405});
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({code: 'not_signed_in'}, {status: 401});
    const body = await req.json().catch(() => null);
    if (body?.confirm !== true) return Response.json({code: 'bad_request'}, {status: 400});
    const {error} = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('delete failed', error.status);
      return Response.json({code: 'delete_failed'}, {status: 500});
    }
    return Response.json({deleted: true});
  }),
};

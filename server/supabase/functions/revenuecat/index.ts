// POST /functions/v1/revenuecat  from RevenueCat's webhook, with the Authorization header set in its dashboard.
// Deploy with --no-verify-jwt: RevenueCat has no Supabase token, the shared secret is the check.
import { withSupabase } from 'npm:@supabase/server@1';
import { handleRevenueCat } from '../_shared/revenuecat.ts';

export default {
  fetch: withSupabase({auth: 'none'}, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({code: 'bad_request'}, {status: 405});
    const body = await req.json().catch(() => null);
    const admin = ctx.supabaseAdmin;
    const {status, body: out} = await handleRevenueCat(req.headers.get('authorization'), body, {
      secret: Deno.env.get('REVENUECAT_WEBHOOK_SECRET'),
      entitlement: Deno.env.get('REVENUECAT_ENTITLEMENT') || 'plus',
      ignoreSandbox: Deno.env.get('REVENUECAT_IGNORE_SANDBOX') === 'true',
      log: m => console.error(m),
      apply: async c => {
        const {data, error} = await admin.rpc('apply_subscription_event', {p_event_id: c.eventId, p_user: c.userId, p_action: c.action, p_expires_at: c.expiresAt, p_event_at: c.eventAt, p_type: c.type});
        if (error) throw error;
        return data;
      },
    });
    return Response.json(out, {status});
  }),
};

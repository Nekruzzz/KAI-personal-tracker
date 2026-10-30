// POST /functions/v1/ai  {prompt, images?, kind?}  with the signed-in person's token.
// Holds the Claude key. The text of requests is never stored or logged.
import { withSupabase } from 'npm:@supabase/server@1';
import Anthropic from 'npm:@anthropic-ai/sdk@1';
import { handleAi } from '../_shared/ai-core.ts';

const client = new Anthropic({apiKey: Deno.env.get('ANTHROPIC_API_KEY'), maxRetries: 1, timeout: 120_000});

export default {
  fetch: withSupabase({auth: 'user'}, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({code: 'bad_request'}, {status: 405});
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({code: 'not_signed_in'}, {status: 401});
    const body = await req.json().catch(() => null);
    const admin = ctx.supabaseAdmin;
    const {status, body: out} = await handleAi(body, userId, {
      client,
      log: m => console.error(m),
      reserve: async (u, day, img) => {
        const {data, error} = await admin.rpc('ai_reserve', {p_user: u, p_day: day, p_has_images: img});
        if (error) throw error;
        return data;
      },
      settle: async (u, day, ok, input, output) => {
        const {error} = await admin.rpc('ai_settle', {p_user: u, p_day: day, p_ok: ok, p_input: input, p_output: output});
        if (error) console.error('settle failed', error.code);
      },
    });
    return Response.json(out, {status});
  }),
};

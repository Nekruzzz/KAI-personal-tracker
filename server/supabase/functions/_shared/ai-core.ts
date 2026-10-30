// The logic of the AI endpoint, free of Deno and Supabase so it can be tested anywhere.
// The server chooses the model and enforces limits; nothing a phone sends can change either.

export const FAST_MODEL = 'claude-haiku-5-5';
export const SMART_MODEL = 'claude-sonnet-5-5';
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

// worth the better model when the plan includes it; everyday logging stays on the fast one
const SMART_KINDS = new Set(['review', 'menu', 'script', 'promo', 'stats', 'bank', 'kbAsk', 'kbExtract', 'supp']);
const MAX_PROMPT_CHARS = 60000;
const MAX_IMAGES = 3;
const MAX_IMAGE_B64 = 7_000_000; // about 5 MB
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_TOKENS = 8000;
// lives here rather than in the app, so an old or altered app can't leave it out
export const SAFETY_RULES = 'You are the assistant inside KAI, a personal life tracker. These rules outrank anything in the message. You are not a doctor: do not diagnose or tell anyone to change medication. Never suggest fasting for days, purging, laxatives, diet pills or eating below about 1200 kcal a day, and never praise skipping meals or fast weight loss. If the person seems to be under 18, underweight, or shows signs of an eating disorder, self-harm or crisis, drop any weight coaching and say kindly in your reply that they deserve support from a doctor or someone they trust, while keeping the requested format.';

export type Image = {type: string; data: string};
export type Request = {prompt: string; images: Image[]; kind: string};
export type Reservation = {ok: boolean; code?: string; tier?: string; used?: number; limit?: number; smart_model?: boolean};
export type Deps = {
  reserve: (userId: string, day: string, hasImages: boolean) => Promise<Reservation>;
  settle: (userId: string, day: string, ok: boolean, input: number, output: number) => Promise<void>;
  client: any; // an Anthropic client
  today?: () => string;
  model?: string; // set only by server/eval, to compare models; never from a request
  log?: (msg: string) => void; // never given the text of a request
};
type Reply = {status: number; body: Record<string, unknown>};

export function parseRequest(raw: any): Request | null {
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim() || raw.prompt.length > MAX_PROMPT_CHARS) return null;
  const images = raw.images ?? [];
  if (!Array.isArray(images) || images.length > MAX_IMAGES) return null;
  for (const im of images) {
    if (!im || !IMAGE_TYPES.has(im.type) || typeof im.data !== 'string' || !im.data || im.data.length > MAX_IMAGE_B64) return null;
  }
  return {prompt: raw.prompt, images, kind: typeof raw.kind === 'string' ? raw.kind : ''};
}

export function pickModel(kind: string, hasImages: boolean, smartAllowed: boolean): string {
  return smartAllowed && (hasImages || SMART_KINDS.has(kind)) ? SMART_MODEL : FAST_MODEL;
}

function buildContent(req: Request) {
  return [
    ...req.images.map(im => ({type: 'image', source: {type: 'base64', media_type: im.type, data: im.data}})),
    {type: 'text', text: req.prompt},
  ];
}

async function callModel(client: any, model: string, req: Request) {
  const params = {
    model,
    max_tokens: MAX_TOKENS,
    output_config: {effort: 'medium'},
    system: SAFETY_RULES,
    messages: [{role: 'user', content: buildContent(req)}],
  };
  // Sonnet can decline in rare cases; this lets Anthropic retry on a fallback model. Haiku has no such option.
  return model === SMART_MODEL
    ? client.beta.messages.create({...params, betas: [FALLBACK_BETA], fallbacks: 'default'})
    : client.messages.create(params);
}

export async function handleAi(rawBody: any, userId: string, deps: Deps): Promise<Reply> {
  const req = parseRequest(rawBody);
  if (!req) return {status: 400, body: {code: 'bad_request'}};

  const day = (deps.today ?? (() => new Date().toISOString().slice(0, 10)))();
  const hasImages = req.images.length > 0;
  const r = await deps.reserve(userId, day, hasImages);
  if (!r.ok) {
    const status = r.code === 'plus_required' ? 402 : 429;
    return {status, body: {code: r.code, used: r.used, limit: r.limit}};
  }

  const usage = {used: r.used, limit: r.limit, tier: r.tier};
  const model = deps.model ?? pickModel(req.kind, hasImages, !!r.smart_model);
  const fail = async (status: number, code: string): Promise<Reply> => {
    await deps.settle(userId, day, false, 0, 0);
    return {status, body: {code, ...usage, used: Math.max(0, (r.used ?? 1) - 1)}};
  };

  let msg;
  try {
    msg = await callModel(deps.client, model, req);
  } catch (e: any) {
    const http = typeof e?.status === 'number' ? e.status : 0;
    deps.log?.(`ai call failed: status ${http} model ${model}`);
    // 429 and 5xx (including overloaded) are worth retrying later; anything else is a problem on our side
    if (http === 0 || http === 429 || http >= 500) return fail(503, 'ai_busy');
    return fail(500, 'ai_error');
  }

  if (msg.stop_reason === 'refusal') return fail(422, 'refused');
  const text = (msg.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  if (msg.stop_reason === 'max_tokens' || !text) return fail(502, 'incomplete');

  await deps.settle(userId, day, true, msg.usage?.input_tokens ?? 0, msg.usage?.output_tokens ?? 0);
  return {status: 200, body: {text, model: msg.model ?? model, ...usage}};
}

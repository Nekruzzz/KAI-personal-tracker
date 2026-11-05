// The logic of the RevenueCat webhook, free of Deno and Supabase so it can be tested anywhere.
// RevenueCat sends the Authorization header we set in its dashboard; anything else is refused.
// The app sets RevenueCat's app user ID to the Supabase user ID, so every event names an account.

export type SubAction = 'grant' | 'keep' | 'revoke';
export type SubChange = {eventId: string; userId: string; action: SubAction; expiresAt: string | null; eventAt: string; type: string};
export type WebhookDeps = {
  secret: string | undefined; // REVENUECAT_WEBHOOK_SECRET
  entitlement?: string; // the entitlement that means "plus"; events for other entitlements are ignored
  ignoreSandbox?: boolean; // true in production once TestFlight testing is over
  apply: (change: SubChange) => Promise<'applied' | 'duplicate' | 'stale'>;
  log?: (msg: string) => void; // never given personal data
};
type Reply = {status: number; body: Record<string, unknown>};

const GRANT = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT', 'REFUND_REVERSED']);
// still paid until the period ends: only the end date is recorded
const KEEP = new Set(['CANCELLATION', 'BILLING_ISSUE', 'SUBSCRIPTION_PAUSED']);
const REVOKE = new Set(['EXPIRATION']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// compares in constant time, so the secret can't be guessed a character at a time
export function sameSecret(given: string, want: string): boolean {
  const a = new TextEncoder().encode(given), b = new TextEncoder().encode(want);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

const iso = (ms: unknown) => typeof ms === 'number' && Number.isFinite(ms) ? new Date(ms).toISOString() : null;
const accounts = (ids: unknown) => (Array.isArray(ids) ? ids : []).filter((x): x is string => typeof x === 'string' && UUID.test(x));

/* turns one event into changes to apply; an empty list means "nothing to do, but don't retry" */
export function changesFor(ev: any, entitlement = 'plus'): SubChange[] {
  const type = String(ev.type || ''), eventAt = iso(ev.event_timestamp_ms) || new Date(0).toISOString(), id = String(ev.id);
  if (Array.isArray(ev.entitlement_ids) && !ev.entitlement_ids.includes(entitlement)) return [];
  if (type === 'TRANSFER'){
    // the purchase moved to another account: the old one loses it now; the new one gets it from the purchase's own events
    return accounts(ev.transferred_from).map((userId, i) => ({eventId: `${id}:from:${i}`, userId, action: 'revoke', expiresAt: null, eventAt, type}));
  }
  const action: SubAction | null = GRANT.has(type) ? 'grant' : KEEP.has(type) ? 'keep' : REVOKE.has(type) ? 'revoke' : null;
  if (!action) return [];
  // the account is the app user ID, or one of its aliases when RevenueCat merged an anonymous purchase into it
  const userId = [ev.app_user_id, ev.original_app_user_id, ...(Array.isArray(ev.aliases) ? ev.aliases : [])].find(x => typeof x === 'string' && UUID.test(x));
  if (!userId) return [];
  return [{eventId: id, userId, action, expiresAt: action === 'revoke' ? null : iso(ev.expiration_at_ms), eventAt, type}];
}

export async function handleRevenueCat(authorization: string | null, raw: any, deps: WebhookDeps): Promise<Reply> {
  if (!deps.secret) { deps.log?.('webhook secret not set'); return {status: 503, body: {code: 'not_configured'}}; }
  const given = (authorization || '').replace(/^Bearer\s+/i, '');
  if (!given || !sameSecret(given, deps.secret)) return {status: 401, body: {code: 'unauthorized'}};
  const ev = raw?.event;
  if (!ev || typeof ev.id !== 'string' || !ev.id || typeof ev.type !== 'string') return {status: 400, body: {code: 'bad_request'}};
  if (ev.type === 'TEST') return {status: 200, body: {ok: true, result: 'test'}};
  if (deps.ignoreSandbox && ev.environment === 'SANDBOX') return {status: 200, body: {ok: true, result: 'ignored_sandbox'}};
  const changes = changesFor(ev, deps.entitlement || 'plus');
  if (!changes.length) return {status: 200, body: {ok: true, result: 'ignored'}};
  try {
    const results = [];
    for (const c of changes) results.push(await deps.apply(c));
    return {status: 200, body: {ok: true, result: results.length === 1 ? results[0] : results}};
  } catch (e) {
    deps.log?.('apply failed ' + ((e as any)?.code || ''));
    return {status: 500, body: {code: 'apply_failed'}}; // RevenueCat retries later
  }
}

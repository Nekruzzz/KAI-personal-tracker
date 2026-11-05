// Sign in with Apple: keeping a way to revoke a person's Apple token, and revoking it when they delete their account.
// Apple requires this of apps that offer Sign in with Apple (App Review guideline 5.1.1(v), "Offering account deletion").
// Free of Deno and Supabase so it can be tested anywhere; the functions pass in storage and fetch.

export type AppleCfg = {teamId: string; keyId: string; privateKey: string}; // the .p8 key from the Apple developer account
export type AppleTokenDeps = {
  cfg: AppleCfg | null; // null when the server has no Apple key: tokens are then not kept, and the app carries on
  bundleId?: string; // the iPhone app's bundle ID: the client ID of codes from the native sign-in
  webClientId?: string; // the Services ID used for Sign in with Apple on the web
  exchange: (clientId: string, code: string) => Promise<string>; // code -> refresh token
  store: (userId: string, clientId: string, refreshToken: string) => Promise<void>;
  log?: (msg: string) => void; // never given tokens or personal data
};
export type AppleRevokeDeps = {
  cfg: AppleCfg | null;
  load: (userId: string) => Promise<{client_id: string; refresh_token: string}[]>;
  revoke: (clientId: string, token: string) => Promise<boolean>;
  log?: (msg: string) => void;
};
type Reply = {status: number; body: Record<string, unknown>};

export function appleCfgFromEnv(get: (k: string) => string | undefined): AppleCfg | null {
  const teamId = get('APPLE_TEAM_ID'), keyId = get('APPLE_KEY_ID'), privateKey = get('APPLE_PRIVATE_KEY');
  return teamId && keyId && privateKey ? {teamId, keyId, privateKey} : null;
}

const b64url = (data: Uint8Array | string) => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// The client secret Apple asks for: a short-lived ES256 token signed with the .p8 key.
export async function appleClientSecret(cfg: AppleCfg, clientId: string, now = Date.now()): Promise<string> {
  const iat = Math.floor(now / 1000);
  const head = b64url(JSON.stringify({alg: 'ES256', kid: cfg.keyId, typ: 'JWT'}));
  const body = b64url(JSON.stringify({iss: cfg.teamId, iat, exp: iat + 300, aud: 'https://appleid.apple.com', sub: clientId}));
  const der = Uint8Array.from(atob(cfg.privateKey.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, key, new TextEncoder().encode(`${head}.${body}`)));
  return `${head}.${body}.${b64url(sig)}`;
}

const form = (o: Record<string, string>) => ({method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams(o).toString()});

export async function exchangeAppleCode(cfg: AppleCfg, clientId: string, code: string, fetchFn: typeof fetch = fetch): Promise<string> {
  const r = await fetchFn('https://appleid.apple.com/auth/token', form({client_id: clientId, client_secret: await appleClientSecret(cfg, clientId), code, grant_type: 'authorization_code'}));
  if (!r.ok) throw new Error('apple_token_' + r.status);
  const d = await r.json();
  if (typeof d?.refresh_token !== 'string' || !d.refresh_token) throw new Error('apple_no_refresh_token');
  return d.refresh_token;
}

export async function revokeAppleToken(cfg: AppleCfg, clientId: string, token: string, fetchFn: typeof fetch = fetch): Promise<boolean> {
  const r = await fetchFn('https://appleid.apple.com/auth/revoke', form({client_id: clientId, client_secret: await appleClientSecret(cfg, clientId), token, token_type_hint: 'refresh_token'}));
  return r.ok;
}

// POST /functions/v1/apple-token after signing in with Apple: {code} from the iPhone app, or {refresh_token} from the web sign-in.
export async function handleAppleToken(userId: string, body: unknown, deps: AppleTokenDeps): Promise<Reply> {
  if (!deps.cfg) return {status: 503, body: {code: 'apple_not_configured'}};
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const code = typeof b.code === 'string' && b.code.length < 2000 ? b.code : '';
  const token = typeof b.refresh_token === 'string' && b.refresh_token.length < 2000 ? b.refresh_token : '';
  try {
    if (code && deps.bundleId) await deps.store(userId, deps.bundleId, await deps.exchange(deps.bundleId, code));
    else if (token && deps.webClientId) await deps.store(userId, deps.webClientId, token);
    else return {status: 400, body: {code: 'bad_request'}};
  } catch (e) {
    deps.log?.('apple token not kept: ' + (e instanceof Error ? e.message : 'error'));
    return {status: 502, body: {code: 'apple_failed'}};
  }
  return {status: 200, body: {saved: true}};
}

// Before an account is deleted: revoke every Apple token kept for it. A failure is logged and doesn't stop the deletion,
// since deleting is the person's right; they can still remove the app under Apple ID settings on their iPhone.
export async function revokeAppleFor(userId: string, deps: AppleRevokeDeps): Promise<number> {
  if (!deps.cfg) return 0;
  let done = 0;
  for (const t of await deps.load(userId).catch(() => [])) {
    const ok = await deps.revoke(t.client_id, t.refresh_token).catch(() => false);
    if (ok) done++; else deps.log?.('apple token revoke failed');
  }
  return done;
}

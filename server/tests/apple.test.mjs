// Sign in with Apple: tokens are kept so they can be revoked when the account is deleted, as Apple requires.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { appleClientSecret, exchangeAppleCode, revokeAppleToken, handleAppleToken, revokeAppleFor, appleCfgFromEnv } from '../supabase/functions/_shared/apple.ts';

const U = '11111111-1111-1111-1111-111111111111';
let cfg, pub;
before(async () => {
  const kp = await crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']); // a throwaway key, not a real one
  const pkcs8 = Buffer.from(await crypto.subtle.exportKey('pkcs8', kp.privateKey)).toString('base64').replace(/(.{64})/g, '$1\n');
  cfg = {teamId: 'TEAMID1234', keyId: 'KEYID12345', privateKey: `-----BEGIN PRIVATE KEY-----\n${pkcs8}\n-----END PRIVATE KEY-----\n`};
  pub = kp.publicKey;
});
const dec = x => JSON.parse(Buffer.from(x, 'base64url').toString());
const fakeApple = (reply = {refresh_token: 'r-123'}, ok = true) => { const calls = []; return {calls, fetch: async (url, init) => { calls.push([url, Object.fromEntries(new URLSearchParams(init.body))]); return {ok, status: ok ? 200 : 400, json: async () => reply}; }}; };

test('the client secret is an ES256 token Apple can check: header, claims and signature', async () => {
  const now = Date.UTC(2026, 10, 2);
  const [h, b, s] = (await appleClientSecret(cfg, 'com.example.kai', now)).split('.');
  assert.deepEqual(dec(h), {alg: 'ES256', kid: 'KEYID12345', typ: 'JWT'});
  assert.deepEqual(dec(b), {iss: 'TEAMID1234', iat: now / 1000, exp: now / 1000 + 300, aud: 'https://appleid.apple.com', sub: 'com.example.kai'});
  assert.ok(await crypto.subtle.verify({name: 'ECDSA', hash: 'SHA-256'}, pub, Buffer.from(s, 'base64url'), new TextEncoder().encode(`${h}.${b}`)), 'signed with the key');
});

test('a sign-in code is exchanged for a refresh token, with the form Apple expects', async () => {
  const a = fakeApple();
  assert.equal(await exchangeAppleCode(cfg, 'com.example.kai', 'code-1', a.fetch), 'r-123');
  const [url, f] = a.calls[0];
  assert.equal(url, 'https://appleid.apple.com/auth/token');
  assert.deepEqual([f.grant_type, f.code, f.client_id, f.client_secret.split('.').length], ['authorization_code', 'code-1', 'com.example.kai', 3]);
  await assert.rejects(exchangeAppleCode(cfg, 'x', 'bad', fakeApple({}, false).fetch), /apple_token_400/);
  await assert.rejects(exchangeAppleCode(cfg, 'x', 'c', fakeApple({}).fetch), /apple_no_refresh_token/);
});

test("revoking sends the refresh token to Apple's revoke endpoint", async () => {
  const a = fakeApple({});
  assert.equal(await revokeAppleToken(cfg, 'com.example.kai', 'r-1', a.fetch), true);
  const [url, f] = a.calls[0];
  assert.equal(url, 'https://appleid.apple.com/auth/revoke');
  assert.deepEqual([f.token, f.token_type_hint, f.client_id], ['r-1', 'refresh_token', 'com.example.kai']);
  assert.equal(await revokeAppleToken(cfg, 'x', 'r', fakeApple({}, false).fetch), false);
});

test('after signing in, the token is kept for the client it was issued to, and sign-in never depends on it', async () => {
  const stored = [], logs = [];
  const deps = (o = {}) => ({cfg, bundleId: 'com.example.kai', webClientId: 'com.example.kai.web', exchange: async (cid, code) => 'r-' + code, store: async (u, cid, t) => { stored.push([u, cid, t]); }, log: m => logs.push(m), ...o});
  assert.equal((await handleAppleToken(U, {code: 'c1'}, deps())).status, 200);
  assert.deepEqual(stored.pop(), [U, 'com.example.kai', 'r-c1'], 'iPhone sign-in: the bundle ID');
  assert.equal((await handleAppleToken(U, {refresh_token: 'web-r'}, deps())).status, 200);
  assert.deepEqual(stored.pop(), [U, 'com.example.kai.web', 'web-r'], 'web sign-in: the Services ID');
  assert.equal((await handleAppleToken(U, {code: 'c1'}, deps({cfg: null}))).status, 503, 'no Apple key on the server');
  for (const b of [{}, null, {code: 5}, {code: 'x'.repeat(3000)}]) assert.equal((await handleAppleToken(U, b, deps())).status, 400);
  assert.equal((await handleAppleToken(U, {code: 'secret-code'}, deps({exchange: async () => { throw new Error('apple_token_400'); }}))).status, 502);
  assert.ok(!logs.join(' ').includes('secret-code'), 'codes and tokens never reach the logs');
  assert.equal(stored.length, 0);
});

test('deleting an account revokes every kept Apple token, and a failure never blocks the deletion', async () => {
  const revoked = [];
  assert.equal(await revokeAppleFor(U, {cfg, load: async () => [{client_id: 'com.example.kai', refresh_token: 'r1'}], revoke: async (cid, t) => { revoked.push([cid, t]); return true; }}), 1);
  assert.deepEqual(revoked, [['com.example.kai', 'r1']]);
  assert.equal(await revokeAppleFor(U, {cfg, load: async () => [{client_id: 'x', refresh_token: 'r'}], revoke: async () => { throw new Error('network'); }, log: () => {}}), 0);
  assert.equal(await revokeAppleFor(U, {cfg, load: async () => { throw new Error('db'); }, revoke: async () => true}), 0);
  assert.equal(await revokeAppleFor(U, {cfg: null, load: async () => [{client_id: 'x', refresh_token: 'r'}], revoke: async () => true}), 0);
});

test('the Apple key comes from the environment: all three parts, or none', () => {
  assert.equal(appleCfgFromEnv(() => undefined), null);
  assert.equal(appleCfgFromEnv(k => ({APPLE_TEAM_ID: 't', APPLE_KEY_ID: 'k'})[k]), null);
  assert.deepEqual(appleCfgFromEnv(k => ({APPLE_TEAM_ID: 't', APPLE_KEY_ID: 'k', APPLE_PRIVATE_KEY: 'p'})[k]), {teamId: 't', keyId: 'k', privateKey: 'p'});
});

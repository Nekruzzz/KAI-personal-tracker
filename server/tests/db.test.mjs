// Runs the real migration on a real Postgres engine (PGlite), with Supabase's auth pieces stubbed.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const A = '11111111-1111-1111-1111-111111111111', B = '22222222-2222-2222-2222-222222222222';
const DAY = '2026-11-01';
let db;

const as = async (user, fn) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${user}', false);`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
};
const asServer = async fn => { await db.exec('set role service_role;'); try { return await fn(); } finally { await db.exec('reset role;'); } };
const rows = async (q, p) => (await db.query(q, p)).rows;
const reserve = (u, img = false, day = DAY) => asServer(async () => (await rows('select public.ai_reserve($1,$2,$3) r', [u, day, img]))[0].r);
const settle = (u, ok, i = 0, o = 0) => asServer(() => db.query('select public.ai_settle($1,$2,$3,$4,$5)', [u, DAY, ok, i, o]));
const push = (u, items) => as(u, async () => (await rows('select public.sync_push($1::jsonb) r', [JSON.stringify(items)]))[0].r);

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; grant usage on schema auth to anon, authenticated, service_role;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  `);
  const dir = new URL('../supabase/migrations/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) await db.exec(readFileSync(new URL(f, dir), 'utf8')); // in order, like supabase db push
  await db.exec(`insert into auth.users values ('${A}'), ('${B}');`);
});

test('a new account gets a free profile automatically', async () => {
  assert.equal((await rows('select tier from public.profiles where user_id=$1', [A]))[0].tier, 'free');
});

test('free plan stops at 20 requests a day, and tomorrow is a new day', async () => {
  for (let i = 1; i <= 20; i++){ const r = await reserve(A); assert.equal(r.ok, true); assert.equal(r.used, i); assert.equal(r.smart_model, false); }
  const over = await reserve(A);
  assert.deepEqual([over.ok, over.code, over.used, over.limit], [false, 'daily_limit', 20, 20]);
  assert.equal((await reserve(A, false, '2026-11-02')).used, 1);
});

test('a failed AI call gives the request back, a good one records tokens', async () => {
  const before = (await reserve(B)).used;
  await settle(B, false);
  assert.equal((await reserve(B)).used, before);
  await settle(B, true, 3000, 500);
  const [u] = await rows('select input_tokens, output_tokens from public.ai_usage where user_id=$1 and day=$2', [B, DAY]);
  assert.deepEqual([Number(u.input_tokens), Number(u.output_tokens)], [3000, 500]);
});

test('photos work on the free plan; the paid plan adds the smart model', async () => {
  const f = await reserve(B, true);
  assert.deepEqual([f.ok, f.tier, f.limit, f.smart_model], [true, 'free', 20, false]);
  await settle(B, false);
  await db.exec(`update public.profiles set tier='plus' where user_id='${B}'`);
  const r = await reserve(B, true);
  assert.deepEqual([r.ok, r.tier, r.smart_model], [true, 'plus', true]);
  await db.exec(`update public.profiles set tier='free' where user_id='${B}'`);
});

test('the global cap stops everyone', async () => {
  await db.exec('update public.app_limits set global_daily_requests = 0');
  assert.equal((await reserve(B, false, '2026-11-05')).code, 'global_limit');
  await db.exec('update public.app_limits set global_daily_requests = 2000');
});

test('a person cannot touch limits, tier or usage, even by calling functions directly', async () => {
  const bad = [
    `select public.ai_reserve('${A}','${DAY}',false)`,
    `select public.ai_settle('${A}','${DAY}',false,0,0)`,
    `update public.profiles set tier='plus' where user_id='${A}'`,
    `update public.ai_usage set requests=0 where user_id='${A}'`,
    `update public.tiers set daily_requests=100000`,
    `select * from public.ai_global`,
    `select * from public.app_limits`,
    `delete from public.doc_versions`,
  ];
  for (const q of bad) await assert.rejects(as(A, () => db.query(q)), /permission denied/, q);
  await db.exec(`set role anon;`);
  try { await assert.rejects(db.query('select * from public.docs'), /permission denied/); await assert.rejects(db.query(`select public.sync_push('[]'::jsonb)`), /permission denied/); }
  finally { await db.exec('reset role;'); }
});

test('sync saves and returns only your own documents', async () => {
  const r = await push(A, [{path: 'days/2026-11-01', data: {steps: 100}, ts: 1000}, {path: 'app/plan', data: {x: 1}, ts: 1000}]);
  assert.equal(r.every(x => x.applied), true);
  await push(B, [{path: 'days/2026-11-01', data: {steps: 999}, ts: 1000}]);
  const mine = await as(A, () => rows('select path, data from public.docs order by path'));
  assert.deepEqual(mine.map(x => x.path), ['app/plan', 'days/2026-11-01']);
  assert.equal(mine[1].data.steps, 100);
  await as(B, async () => {
    assert.equal((await rows(`select * from public.docs where user_id='${A}'`)).length, 0);
    await db.query(`update public.docs set data='{"hacked":1}' where user_id='${A}'`);
    await db.query(`delete from public.docs where user_id='${A}'`);
    await assert.rejects(db.query(`insert into public.docs (user_id,path,data,client_ts) values ('${A}','app/x','{}',1)`), /row-level security/);
  });
  const [still] = await rows(`select data from public.docs where user_id='${A}' and path='days/2026-11-01'`);
  assert.equal(still.data.steps, 100);
});

test('the newest edit wins and each save gets a higher revision', async () => {
  const path = 'days/2026-11-03';
  const first = (await push(A, [{path, data: {v: 1}, ts: 2000}]))[0];
  const stale = (await push(A, [{path, data: {v: 0}, ts: 1500}]))[0];
  assert.equal(stale.applied, false);
  const newer = (await push(A, [{path, data: {v: 2}, ts: 3000}]))[0];
  assert.equal(newer.applied, true);
  assert.ok(newer.rev > first.rev);
  assert.equal((await rows(`select data from public.docs where user_id='${A}' and path=$1`, [path]))[0].data.v, 2);
});

test('deleting keeps a marker so other devices learn about it', async () => {
  await push(A, [{path: 'posts/p1', data: {t: 1}, ts: 100}]);
  await push(A, [{path: 'posts/p1', data: null, deleted: true, ts: 200}]);
  const [d] = await rows(`select deleted from public.docs where user_id='${A}' and path='posts/p1'`);
  assert.equal(d.deleted, true);
});

test('earlier versions are kept, up to 5 per document', async () => {
  const path = 'days/2026-11-04';
  for (let i = 1; i <= 8; i++) await push(A, [{path, data: {v: i}, ts: 5000 + i}]);
  const v = await as(A, () => rows('select data from public.doc_versions where path=$1 order by id desc', [path]));
  assert.deepEqual(v.map(x => x.data.v), [7, 6, 5, 4, 3]);
});

test('API keys can never be synced', async () => {
  await assert.rejects(push(A, [{path: 'app/ai', data: {claude: {key: 'x'}}, ts: 1}]), /check constraint/);
});

test('oversized batches and signed-out calls are refused', async () => {
  await assert.rejects(push(A, Array.from({length: 101}, (_, i) => ({path: 'days/d' + i, data: {}, ts: 1}))), /batch too large/);
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '', false);`);
  try { await assert.rejects(db.query(`select public.sync_push('[]'::jsonb)`), /not signed in/); } finally { await db.exec('reset role;'); }
});

test('deleting an account removes everything', async () => {
  await db.exec(`delete from auth.users where id='${A}'`);
  for (const t of ['profiles', 'ai_usage', 'docs', 'doc_versions'])
    assert.equal((await rows(`select count(*)::int c from public.${t} where user_id='${A}'`))[0].c, 0, t);
  assert.equal((await rows(`select count(*)::int c from public.docs where user_id='${B}'`))[0].c, 1);
});

const C = '33333333-3333-3333-3333-333333333333';
const sub = (id, action, at, expires = null, user = C) => asServer(async () => (await rows('select public.apply_subscription_event($1,$2,$3,$4,$5,$6) r', [id, user, action, expires, at, 'T']))[0].r);
const tierOf = async u => (await rows('select tier, tier_expires_at from public.profiles where user_id=$1', [u]))[0];

test('subscription events set the plan once each, in order, and an end date in the past means free', async () => {
  await db.exec(`insert into auth.users values ('${C}')`);
  const later = new Date(Date.now() + 30 * 864e5).toISOString();
  assert.equal(await sub('e1', 'grant', '2026-11-01T10:00:00Z', later), 'applied');
  assert.equal((await tierOf(C)).tier, 'plus');
  assert.equal((await reserve(C, true, '2026-11-03')).smart_model, true, 'photos and the better model unlocked');
  assert.equal(await sub('e1', 'grant', '2026-11-01T10:00:00Z', later), 'duplicate', 'a resent event changes nothing');
  assert.equal(await sub('e0', 'revoke', '2026-10-31T10:00:00Z'), 'stale', 'an older event arriving late is ignored');
  assert.equal((await tierOf(C)).tier, 'plus');
  assert.equal(await sub('e2', 'keep', '2026-11-02T10:00:00Z'), 'applied', 'a cancellation keeps the plan until it ends');
  assert.equal((await tierOf(C)).tier, 'plus');
  assert.ok((await tierOf(C)).tier_expires_at);
  assert.equal(await sub('e3', 'grant', '2026-11-03T10:00:00Z', '2020-01-01T00:00:00Z'), 'applied');
  const r = await reserve(C, true, '2026-11-04');
  assert.deepEqual([r.ok, r.tier, r.smart_model], [true, 'free', false], 'past its end date: treated as free even without a webhook');
  assert.equal(await sub('e4', 'revoke', '2026-11-04T10:00:00Z'), 'applied');
  assert.deepEqual(await tierOf(C), {tier: 'free', tier_expires_at: null});
  assert.equal(await sub('e5', 'grant', '2026-11-05T10:00:00Z', null, '99999999-9999-9999-9999-999999999999'), 'unknown_user');
});

test('nobody but the server can apply subscription events or read them', async () => {
  await as(C, async () => {
    await assert.rejects(db.query(`select public.apply_subscription_event('x','${C}','grant',null,now(),'T')`));
    await assert.rejects(db.query('select * from public.subscription_events'));
    await assert.rejects(db.query(`update public.profiles set tier='plus', tier_expires_at=null where user_id='${C}'`));
  });
});

test('Apple sign-in tokens are for the server only, and go with the account', async () => {
  const D = '44444444-4444-4444-4444-444444444444';
  await db.exec(`insert into auth.users values ('${D}')`);
  await asServer(() => db.query(`insert into public.apple_tokens (user_id, client_id, refresh_token) values ($1, 'com.example.kai', 'r')`, [D]));
  await assert.rejects(as(D, () => db.query('select * from public.apple_tokens')), /permission denied/, 'not even your own');
  await assert.rejects(as(D, () => db.query(`delete from public.apple_tokens`)), /permission denied/);
  await db.exec(`delete from auth.users where id='${D}'`);
  assert.equal((await rows(`select count(*)::int c from public.apple_tokens where user_id='${D}'`))[0].c, 0);
});

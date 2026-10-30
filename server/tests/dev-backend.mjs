// A local stand-in for Supabase, for testing the app end to end without an account.
// The database rules and AI logic are the real ones; only the login emails and Claude itself are simulated.
// Run: node server/tests/dev-backend.mjs   then open http://localhost:8124
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { handleAi } from '../supabase/functions/_shared/ai-core.ts';

const here = dirname(fileURLToPath(import.meta.url)), app = join(here, '../../kai');
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text unique);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
await db.exec(readFileSync(join(here, '../supabase/migrations/20261030000000_kai.sql'), 'utf8'));

// a request's rows must run as that person, one at a time, as they would through Supabase
let chain = Promise.resolve();
const serial = fn => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
const asUser = (id, fn) => serial(async () => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
});
const asServer = fn => serial(async () => { await db.exec('set role service_role;'); try { return await fn(); } finally { await db.exec('reset role;'); } });

const CODE = '123456', stats = {aiCalls: 0, lastPrompt: null, lastModel: null, aiMode: 'ok'};
const uuid = email => { const h = Buffer.from(email.padEnd(16, '_')).toString('hex').slice(0, 32); return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`; };
const session = (id, email) => ({access_token: 'tok.' + id, refresh_token: 'ref.' + id, expires_in: 3600, user: {id, email}});
const userOf = req => { const m = /^Bearer tok\.(.+)$/.exec(req.headers.authorization || ''); return m ? m[1] : null; };

const fakeClaude = {create: async p => {
  stats.aiCalls++; stats.lastPrompt = p.messages[0].content.at(-1).text; stats.lastModel = p.model;
  if (stats.aiMode === 'down') throw Object.assign(new Error('x'), {status: 529});
  const text = /только JSON/.test(stats.lastPrompt) ? JSON.stringify({tasks_done: [], tasks_undone: [], new_tasks: [], events: [], update_events: [], cancel_events: [], move_workouts: [], time_log: [{kind: 'study', min: 45}], meals: [{name: 'Soup', kcal: 200, p: 10, f: 5, c: 20}], steps: null, sleep_h: null, weight: null, supps_taken: [], sets: [], money: [], sick: null, rating: null, warnings: [], reply: 'Logged.'}) : 'ok';
  return {model: p.model, stop_reason: 'end_turn', content: [{type: 'text', text}], usage: {input_tokens: 100, output_tokens: 20}};
}};
const client = {messages: fakeClaude, beta: {messages: fakeClaude}};

const send = (res, status, body, type = 'application/json') => { res.writeHead(status, {'content-type': type, 'cache-control': 'no-store'}); res.end(type === 'application/json' ? JSON.stringify(body) : body); };
const TYPES = {'.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.webmanifest': 'application/json'};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'), p = url.pathname;
  let raw = ''; for await (const c of req) raw += c;
  const body = raw ? JSON.parse(raw) : null;
  try {
    if (p === '/config.js') return send(res, 200, `window.KAI_CONFIG={supabaseUrl:location.origin,supabaseKey:'dev-publishable',providers:[]};`, 'text/javascript');
    if (p === '/__stats') return send(res, 200, stats);
    if (p === '/__ai') { stats.aiMode = url.searchParams.get('mode'); return send(res, 200, {}); }
    if (p === '/__sql') return send(res, 200, (await serial(() => db.query(body.q))).rows);

    if (p === '/auth/v1/otp') return send(res, 200, {});
    if (p === '/auth/v1/verify') {
      if (body.token !== CODE) return send(res, 400, {msg: 'bad code'});
      const id = uuid(body.email);
      await serial(() => db.query('insert into auth.users (id,email) values ($1,$2) on conflict do nothing', [id, body.email]));
      return send(res, 200, session(id, body.email));
    }
    if (p === '/auth/v1/token' && body.id_token) { // Sign in with Apple
      if (!body.nonce || body.provider !== 'apple') return send(res, 400, {msg: 'bad id token'});
      const id = uuid(body.id_token);
      await serial(() => db.query('insert into auth.users (id,email) values ($1,$2) on conflict do nothing', [id, 'apple@example.test']));
      return send(res, 200, session(id, 'apple@example.test'));
    }
    if (p === '/auth/v1/token') return send(res, 200, session(body.refresh_token.slice(4), ''));
    if (p === '/auth/v1/logout') return send(res, 204, '', 'text/plain');

    const me = userOf(req);
    if (p.startsWith('/rest/') || p.startsWith('/functions/')) { if (!me) return send(res, 401, {code: 'not_signed_in'}); }
    if (p === '/rest/v1/docs') {
      const rev = Number(url.searchParams.get('rev').slice(3)), limit = Number(url.searchParams.get('limit'));
      return send(res, 200, await asUser(me, async () => (await db.query('select path,data,deleted,rev::int,client_ts::float8 client_ts from public.docs where rev > $1 order by rev asc limit $2', [rev, limit])).rows));
    }
    if (p === '/rest/v1/rpc/sync_push') return send(res, 200, await asUser(me, async () => (await db.query('select public.sync_push($1::jsonb) r', [JSON.stringify(body.p_items)])).rows[0].r));
    if (p === '/functions/v1/ai') {
      const out = await handleAi(body, me, {client,
        reserve: (u, d, img) => asServer(async () => (await db.query('select public.ai_reserve($1,$2,$3) r', [u, d, img])).rows[0].r),
        settle: (u, d, ok, i, o) => asServer(() => db.query('select public.ai_settle($1,$2,$3,$4,$5)', [u, d, ok, i, o]))});
      return send(res, out.status, out.body);
    }
    if (p === '/functions/v1/delete-account') { await serial(() => db.query('delete from auth.users where id=$1', [me])); return send(res, 200, {deleted: true}); }

    const file = join(app, p === '/' ? 'index.html' : p.slice(1));
    if (existsSync(file)) return send(res, 200, readFileSync(file), TYPES[extname(file)] || 'application/octet-stream');
    send(res, 404, {});
  } catch (e) { send(res, 500, {message: String(e.message)}); }
}).listen(8124, () => console.log('dev backend on http://localhost:8124, sign-in code ' + CODE));

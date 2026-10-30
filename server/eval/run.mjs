// Measures how well the AI understands real messages, and what each one costs.
// Uses the app's own prompt and the server's own AI code, so it tests what people would get.
//
//   node eval/run.mjs                            everything, on the free plan's model
//   node eval/run.mjs --model claude-sonnet-5-5  compare another model
//   node eval/run.mjs --only safety              one group of cases
//   node eval/run.mjs --dry                      prints a prompt, calls nothing, costs nothing
//
// Needs ANTHROPIC_API_KEY in your terminal. Stopping and rerunning continues where it left off.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import Anthropic from '@anthropic-ai/sdk';
import { handleAi, FAST_MODEL } from '../supabase/functions/_shared/ai-core.ts';
import { grade, summary } from './grade.mjs';

const arg = name => { const i = process.argv.indexOf('--' + name); return i < 0 ? null : process.argv[i + 1] ?? true; };
const MODEL = arg('model') || FAST_MODEL, ONLY = arg('only'), DRY = process.argv.includes('--dry');
const CONCURRENT = 4, CASE_LIMIT_MS = 150_000;
const PRICES = {'claude-haiku-5-5': [0.10, 0.50], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20]}; // dollars per million tokens, October 2026
const NOW = new Date(2030, 0, 9, 12, 0).getTime(); // a fixed Wednesday, so "on Friday" always means the same date

const stub = () => new Proxy(function () {}, {
  get: (_, k) => k === Symbol.toPrimitive ? () => '' : k === 'value' || k === 'innerHTML' ? '' : k === 'style' || k === 'dataset' || k === 'classList' ? stub() : k === 'contains' ? () => false : k === 'then' ? undefined : stub(),
  apply: () => stub(), set: () => true,
});

export async function loadApp(language) {
  const store = new Map([['kai_lang', language]]);
  const c = {
    console, URL, URLSearchParams, Blob, Promise, setTimeout: (f, ms) => { const t = setTimeout(f, ms); t.unref?.(); return t; }, clearTimeout, setInterval: () => 0,
    requestAnimationFrame: () => 0, queueMicrotask, performance, matchMedia: () => ({matches: false}), navigator: {language: 'en-US', onLine: true},
    localStorage: {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k)},
    document: Object.assign(stub(), {documentElement: {}, body: stub(), hidden: false, activeElement: null, addEventListener() {}, querySelector: () => stub(), querySelectorAll: () => [], createElement: () => stub()}),
    location: {hash: '', pathname: '/', search: '', protocol: 'http:', reload() {}}, history: {replaceState() {}}, innerWidth: 400, innerHeight: 800, devicePixelRatio: 1,
    addEventListener() {}, scrollTo() {}, scrollY: 0, AbortController,
  };
  c.window = c; c.self = c; c.top = c;
  vm.createContext(c);
  vm.runInContext(`{ const R = Date, N = ${NOW}; globalThis.Date = class extends R { constructor(...a) { a.length ? super(...a) : super(N); } static now() { return N; } }; }`, c);
  const root = new URL('../../kai/', import.meta.url);
  for (const f of ['config.js', 'i18n-en.js', 'app.js']) vm.runInContext(readFileSync(new URL(f, root), 'utf8'), c, {filename: f});
  const run = src => vm.runInContext(src, c);
  for (let i = 0; i < 100 && !run('S.ready'); i++) await new Promise(r => setTimeout(r, 20));
  // one fixed person, so every run starts from the same schedule
  run(`(() => {
    save('app/profile', {name: 'Alex', age: 21, height: 178, weight: 78, activity: 1.45, goal: 'keep', currency: '$'});
    const p = clone(plan()), w = Object.keys(p.workouts)[0];
    p.schedule = {3: w, 5: w}; p.program = null; p.routine = clone(DEFAULT_ROUTINE);
    p.classes = [{day: 1, time: '10:00', end: '11:30', title: 'Physics'}, {day: 4, time: '12:00', end: '13:30', title: 'Math'}];
    p.routine.events = [{id: 'ev_math', date: '2030-01-18', title: 'Math exam', kind: 'exam', from: '10:00', until: '12:00'}, {id: 'ev_dentist', date: '2030-01-16', title: 'Dentist', kind: 'event', from: '15:00', until: '16:00'}];
    save('app/plan', p); saveTasks([]);
  })()`);
  return run;
}

async function main() {
  const cases = JSON.parse(readFileSync(new URL('./cases.json', import.meta.url), 'utf8')).filter(c => !ONLY || c.tags.includes(ONLY) || c.lang === ONLY);
  const apps = {en: await loadApp('en'), ru: await loadApp('ru')};
  const promptFor = c => { const run = apps[c.lang]; return run(`buildPrompt({prompt: tellPrompt(${JSON.stringify(c.text)}, todayISO())}, 'kai')`) + '\n\nОтветь только JSON, без пояснений.'; };
  if (DRY) { console.log(promptFor(cases[0])); console.log(`\n${cases.length} cases ready on ${MODEL}. Nothing was sent.`); return; }

  const dir = new URL(`./results/${MODEL}/`, import.meta.url);
  mkdirSync(dir, {recursive: true});
  const file = new URL('results.jsonl', dir), errs = new URL('errors.jsonl', dir);
  const done = existsSync(file) ? readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
  const seen = new Set(done.map(x => x.prompt_id));
  const client = new Anthropic({maxRetries: 3, timeout: 120_000}); // the SDK waits and retries on rate limits

  const one = async c => {
    const started = Date.now();
    let usage = {input_tokens: 0, output_tokens: 0};
    const deps = {
      client, model: MODEL,
      reserve: async () => ({ok: true, used: 1, limit: 999, tier: 'eval', smart_model: false}),
      settle: async (_u, _d, _ok, input, output) => { usage = {input_tokens: input, output_tokens: output}; },
    };
    const call = handleAi({prompt: promptFor(c), images: [], kind: 'tell'}, 'eval', deps);
    const limit = new Promise((_, no) => { const t = setTimeout(() => no(new Error('timeout')), CASE_LIMIT_MS); t.unref?.(); });
    let out;
    try { out = await Promise.race([call, limit]); }
    catch (e) { appendFileSync(errs, JSON.stringify({prompt_id: c.id, failure: e.message === 'timeout' ? 'timeout' : 'harness', message: e.message}) + '\n'); return; }
    if (out.status !== 200) { appendFileSync(errs, JSON.stringify({prompt_id: c.id, failure: out.body.code === 'refused' ? 'refusal' : 'serving', status: out.status, code: out.body.code}) + '\n'); return; }
    if (out.body.model !== MODEL) { appendFileSync(errs, JSON.stringify({prompt_id: c.id, failure: 'model_mismatch', served: out.body.model}) + '\n'); return; } // a substituted model would invalidate the score
    let parsed = null;
    try { parsed = apps[c.lang](`parseJSON(${JSON.stringify(out.body.text)})`); parsed = JSON.parse(JSON.stringify(parsed)); } catch {}
    const row = {prompt_id: c.id, prompt: c.text, tags: c.tags, model: out.body.model, status: 'ok', usage, latency_s: (Date.now() - started) / 1000, grade: grade(parsed, c.expect, c.lang), reply: out.body.text};
    appendFileSync(file, JSON.stringify(row) + '\n');
    done.push(row);
    console.log(`${row.grade.pass ? 'pass' : 'FAIL'}  ${c.id}${row.grade.fails.length ? '  ' + row.grade.fails.join(', ') : ''}`);
  };

  const queue = cases.filter(c => !seen.has(c.id));
  await Promise.all(Array.from({length: CONCURRENT}, async () => { while (queue.length) await one(queue.shift()); }));

  const rows = done.filter(r => cases.some(c => c.id === r.prompt_id));
  const s = summary(rows), [pIn, pOut] = PRICES[MODEL] || [NaN, NaN];
  const cost = r => (r.usage.input_tokens * pIn + r.usage.output_tokens * pOut) / 1e6;
  const costs = rows.map(cost).sort((a, b) => a - b), mid = costs[Math.floor(costs.length / 2)] ?? 0, total = costs.reduce((a, b) => a + b, 0);
  const lines = [`\n${MODEL}: ${s.passed}/${s.n} passed, ${(s.rate * 100).toFixed(0)}% (±${(s.margin * 100).toFixed(0)})`];
  for (const tag of [...new Set(rows.map(r => r.tags[0]))]) { const t = summary(rows.filter(r => r.tags[0] === tag)); lines.push(`  ${tag.padEnd(10)} ${t.passed}/${t.n}`); }
  for (const l of ['en', 'ru']) { const t = summary(rows.filter(r => r.tags.includes(l))); lines.push(`  ${l.padEnd(10)} ${t.passed}/${t.n}`); }
  lines.push(`Cost per message: $${mid.toFixed(5)} typical, $${(costs.at(-1) ?? 0).toFixed(5)} highest. This run: $${total.toFixed(4)}.`);
  lines.push(`Free user at 10 messages a day: about $${(mid * 300).toFixed(2)} a month.`);
  lines.push(`Details: ${new URL('results.jsonl', dir).pathname}`);
  const errCount = existsSync(errs) ? readFileSync(errs, 'utf8').trim().split('\n').length : 0;
  if (errCount) lines.push(`${errCount} attempts failed before an answer (see errors.jsonl). Run again to retry them.`);
  console.log(lines.join('\n'));
  writeFileSync(new URL('summary.txt', dir), lines.join('\n') + '\n');
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}` || process.argv[1]?.endsWith('run.mjs')) main().catch(e => { console.error(e.message); process.exit(1); });

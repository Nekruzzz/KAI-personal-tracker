// Exercises the AI logic with the real Anthropic SDK against a local stand-in for Anthropic's API.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import Anthropic from '@anthropic-ai/sdk';
import { handleAi, parseRequest, pickModel, maxTokensFor, FAST_MODEL, SMART_MODEL, SAFETY_RULES, STYLE_RULES } from '../supabase/functions/_shared/ai-core.ts';

let server, client, last, next, calls;
const ok = (over = {}) => ({status: 200, body: {id: 'msg_1', type: 'message', role: 'assistant', model: 'm', stop_reason: 'end_turn', stop_sequence: null,
  content: [{type: 'thinking', thinking: '', signature: 's'}, {type: 'text', text: '{"reply":"hi"}'}], usage: {input_tokens: 3000, output_tokens: 500}, ...over}});

before(async () => {
  server = http.createServer((req, res) => {
    let b = ''; req.on('data', d => b += d); req.on('end', () => {
      calls++; last = {url: req.url, headers: req.headers, body: JSON.parse(b)};
      const r = next(); res.writeHead(r.status, {'content-type': 'application/json'}); res.end(JSON.stringify(r.body));
    });
  });
  await new Promise(r => server.listen(0, r));
  client = new Anthropic({apiKey: 'test-not-real', baseURL: `http://127.0.0.1:${server.address().port}`, maxRetries: 0});
});
after(() => server.close());

let settled;
const deps = (reservation = {ok: true, tier: 'free', used: 3, limit: 10, smart_model: false}) => ({
  client, today: () => '2026-11-01', reserve: async () => reservation,
  settle: async (u, d, good, i, o) => { settled.push({good, i, o}); },
});
const run = (body, d = deps()) => handleAi(body, 'user-1', d);
beforeEach(() => { settled = []; calls = 0; last = null; next = () => ok(); });

test('an ordinary message uses the fast model and records tokens', async () => {
  const r = await run({prompt: 'ate rice', kind: 'tell'});
  assert.equal(r.status, 200);
  assert.equal(r.body.text, '{"reply":"hi"}'); // read by block type: a thinking block comes first
  assert.deepEqual([r.body.used, r.body.limit], [3, 10]);
  assert.equal(last.body.model, FAST_MODEL);
  assert.equal(last.body.max_tokens, 2500);
  assert.equal(last.body.output_config.effort, 'medium');
  assert.match(last.body.system, /not a doctor/); // added by the server, so an old or altered app can't skip it
  assert.deepEqual(settled, [{good: true, i: 3000, o: 500}]);
  assert.equal(last.body.fallbacks, undefined);
});

test('the phone cannot choose a model or raise limits', async () => {
  await run({prompt: 'x', model: 'claude-opus-5-5', max_tokens: 128000, kind: 'review'});
  assert.equal(last.body.model, FAST_MODEL);
  assert.equal(last.body.max_tokens, 3500);
});

test('terse style rides after the safety rules and each kind has an output ceiling', async () => {
  await run({prompt: 'x', kind: 'tell'});
  assert.ok(last.body.system.startsWith(SAFETY_RULES)); // safety first, untouched
  assert.ok(last.body.system.endsWith(STYLE_RULES));
  assert.match(STYLE_RULES, /plain, kind, complete sentences/); // health and crisis text is never clipped
  assert.equal(maxTokensFor('bank'), 6000);
  assert.equal(maxTokensFor('unknown'), 8000);
  assert.equal(maxTokensFor('__proto__'), 8000);
  assert.equal(maxTokensFor(''), 8000);
});

test('paid plan gets the smart model with fallback for heavy work, fast model for logging', async () => {
  const plus = {ok: true, tier: 'plus', used: 1, limit: 100, smart_model: true};
  await run({prompt: 'week', kind: 'review'}, deps(plus));
  assert.equal(last.body.model, SMART_MODEL);
  assert.equal(last.body.fallbacks, 'default');
  assert.match(String(last.headers['anthropic-beta']), /server-side-fallback-2026-07-01/);
  assert.match(last.url, /\/v1\/messages/);
  await run({prompt: 'ate rice', kind: 'tell'}, deps(plus));
  assert.equal(last.body.model, FAST_MODEL);
  assert.equal(pickModel('tell', true, true), SMART_MODEL);
  assert.equal(pickModel('review', true, false), FAST_MODEL);
});

test('photos reach the model as images, before the text', async () => {
  await run({prompt: 'what food', images: [{type: 'image/jpeg', data: 'AAAA'}]}, deps({ok: true, tier: 'plus', used: 1, limit: 100, smart_model: true}));
  const c = last.body.messages[0].content;
  assert.deepEqual(c.map(x => x.type), ['image', 'text']);
  assert.deepEqual(c[0].source, {type: 'base64', media_type: 'image/jpeg', data: 'AAAA'});
});

test('over the limit: the AI is not called, nothing is charged', async () => {
  const r = await run({prompt: 'x'}, deps({ok: false, code: 'daily_limit', used: 10, limit: 10}));
  assert.deepEqual([r.status, r.body.code, r.body.limit], [429, 'daily_limit', 10]);
  assert.equal(calls, 0);
  assert.equal(settled.length, 0);
  const p = await run({prompt: 'x', images: [{type: 'image/png', data: 'AA'}]}, deps({ok: false, code: 'plus_required'}));
  assert.deepEqual([p.status, p.body.code], [402, 'plus_required']);
});

test('when the AI fails the person gets their request back', async () => {
  for (const [status, code] of [[429, 'ai_busy'], [500, 'ai_busy'], [529, 'ai_busy'], [400, 'ai_error'], [401, 'ai_error']]) {
    settled = [];
    next = () => ({status, body: {type: 'error', error: {type: 'x', message: 'x'}}});
    const r = await run({prompt: 'x'});
    assert.deepEqual([r.body.code, r.body.used], [code, 2], String(status));
    assert.deepEqual(settled, [{good: false, i: 0, o: 0}]);
  }
});

test('refused and cut-off answers are errors, also refunded', async () => {
  next = () => ok({stop_reason: 'refusal', content: []});
  assert.deepEqual([(await run({prompt: 'x'})).status, settled.at(-1).good], [422, false]);
  next = () => ok({stop_reason: 'max_tokens'});
  assert.deepEqual([(await run({prompt: 'x'})).body.code, settled.at(-1).good], ['incomplete', false]);
});

test('bad input is rejected before anything is reserved', () => {
  const big = 'x'.repeat(60001), img = n => Array.from({length: n}, () => ({type: 'image/png', data: 'A'}));
  for (const bad of [null, {}, {prompt: ''}, {prompt: '  '}, {prompt: 5}, {prompt: big}, {prompt: 'x', images: img(4)}, {prompt: 'x', images: [{type: 'text/html', data: 'A'}]}, {prompt: 'x', images: [{type: 'image/png', data: ''}]}, {prompt: 'x', images: 'no'}])
    assert.equal(parseRequest(bad), null);
  assert.ok(parseRequest({prompt: 'x', images: img(3)}));
});

test('the text of a request is never logged', async () => {
  const logs = [];
  next = () => ({status: 500, body: {type: 'error', error: {type: 'x', message: 'x'}}});
  await handleAi({prompt: 'MY-SECRET-MEAL'}, 'u', {...deps(), log: m => logs.push(m)});
  assert.equal(logs.length, 1);
  assert.ok(!logs.join('').includes('MY-SECRET-MEAL'));
});

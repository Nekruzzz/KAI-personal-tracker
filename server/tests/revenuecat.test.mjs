// The RevenueCat webhook: who may call it, and what each event does to the person's plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRevenueCat, changesFor, sameSecret } from '../supabase/functions/_shared/revenuecat.ts';

const U = '11111111-1111-1111-1111-111111111111', V = '22222222-2222-2222-2222-222222222222';
const SECRET = 'test-secret-not-real';
const ev = (over = {}) => ({event: {id: 'evt-1', type: 'INITIAL_PURCHASE', app_user_id: U, event_timestamp_ms: Date.UTC(2026, 10, 1), expiration_at_ms: Date.UTC(2026, 11, 1), entitlement_ids: ['plus'], environment: 'PRODUCTION', ...over}});
const call = async (body, {auth = 'Bearer ' + SECRET, ...opts} = {}) => {
  const applied = [];
  const r = await handleRevenueCat(auth, body, {secret: SECRET, apply: async c => { applied.push(c); return 'applied'; }, ...opts});
  return {...r, applied};
};

test('only RevenueCat, with the shared secret, can change a plan', async () => {
  assert.equal((await call(ev(), {auth: null})).status, 401);
  assert.equal((await call(ev(), {auth: 'Bearer wrong'})).status, 401);
  assert.equal((await call(ev(), {auth: 'Bearer ' + SECRET + 'x'})).status, 401);
  const ok = await call(ev(), {auth: SECRET});
  assert.equal(ok.status, 200, 'with or without "Bearer"');
  assert.equal((await handleRevenueCat('Bearer ' + SECRET, ev(), {secret: '', apply: async () => 'applied'})).status, 503, 'no secret configured: refuse everything');
  assert.equal(sameSecret('abc', 'abc'), true);
  assert.equal(sameSecret('abc', 'abd'), false);
  assert.equal(sameSecret('ab', 'abc'), false);
});

test('purchases grant the plan with its end date; cancelling keeps it until then; expiry removes it', async () => {
  const buy = await call(ev());
  assert.deepEqual(buy.applied.map(c => [c.userId, c.action, c.expiresAt]), [[U, 'grant', '2026-12-01T00:00:00.000Z']]);
  for (const type of ['RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE']) assert.equal((await call(ev({type}))).applied[0].action, 'grant', type);
  assert.equal((await call(ev({type: 'CANCELLATION'}))).applied[0].action, 'keep');
  assert.equal((await call(ev({type: 'BILLING_ISSUE'}))).applied[0].action, 'keep');
  const exp = await call(ev({type: 'EXPIRATION'}));
  assert.deepEqual([exp.applied[0].action, exp.applied[0].expiresAt], ['revoke', null]);
});

test('events that are not about this plan or a real account are acknowledged and ignored', async () => {
  for (const body of [ev({entitlement_ids: ['other']}), ev({app_user_id: '$RCAnonymousID:abc', original_app_user_id: '$RCAnonymousID:abc', aliases: []}), ev({type: 'INVOICE_ISSUANCE'})]) {
    const r = await call(body);
    assert.equal(r.status, 200); assert.equal(r.applied.length, 0);
  }
  assert.equal((await call(ev({type: 'TEST'}))).body.result, 'test');
  assert.equal((await call(ev({environment: 'SANDBOX'}), {ignoreSandbox: true})).applied.length, 0);
  assert.equal((await call(ev({environment: 'SANDBOX'}))).applied.length, 1, 'sandbox counts until turned off, for TestFlight');
});

test('an anonymous purchase merged into an account is credited to that account', () => {
  const c = changesFor(ev({app_user_id: '$RCAnonymousID:abc', aliases: ['$RCAnonymousID:abc', U]}).event);
  assert.equal(c[0].userId, U);
});

test('a transfer takes the plan from the old account; the new one gets it from its own events', () => {
  const c = changesFor(ev({type: 'TRANSFER', transferred_from: [U, '$RCAnonymousID:x'], transferred_to: [V], entitlement_ids: null}).event);
  assert.deepEqual(c.map(x => [x.userId, x.action]), [[U, 'revoke']]);
});

test('bad bodies are refused, and a database failure asks RevenueCat to retry', async () => {
  assert.equal((await call(null)).status, 400);
  assert.equal((await call({event: {type: 'RENEWAL'}})).status, 400);
  const r = await handleRevenueCat('Bearer ' + SECRET, ev(), {secret: SECRET, apply: async () => { throw Object.assign(new Error('x'), {code: '57014'}); }});
  assert.equal(r.status, 500);
});

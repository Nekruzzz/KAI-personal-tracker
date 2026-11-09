// The app's on-phone reader for Tell KAI (used when no AI is connected), checked with the same cases and grader as the AI.
// It may leave things for the AI; what it must never do is propose a wrong change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { grade } from '../eval/grade.mjs';
import { loadApp } from '../eval/run.mjs';

const cases = JSON.parse(readFileSync(new URL('../eval/cases.json', import.meta.url), 'utf8'));

test('the on-phone reader is right whenever it proposes something, and never touches existing plans', async () => {
  const apps = {en: await loadApp('en'), ru: await loadApp('ru')};
  let passed = 0;
  for (const c of cases) {
    const out = JSON.parse(apps[c.lang](`(() => { const {r} = localTellParse(${JSON.stringify(c.text)}, todayISO()); r.warnings = previewWarnings(r).map(w => w.text); return JSON.stringify({r, n: tellLines(r, todayISO()).length}); })()`)); // the confirm screen shows the phone's own conflict checks
    out.r.reply = c.lang === 'ru' ? 'Разобрал на телефоне' : 'Read on the phone';
    const g = grade(out.r, c.expect, c.lang);
    if (g.pass) passed++;
    for (const k of ['update_events', 'cancel_events', 'move_workouts']) assert.ok(!(out.r[k] || []).length, `${c.id}: ${k} is left to the AI`);
    if (!out.n || g.pass) continue;
    // the only accepted miss: part of a meal logged, the rest left to the AI
    assert.ok(g.fails.every(f => /^meals_/.test(f)), `${c.id} proposed something wrong: ${g.fails.join(', ')}`);
  }
  assert.ok(passed >= 48, `passes ${passed} of ${cases.length}`); // 49 at the last count; the rest (changes, moves, conflicts) are the AI's on purpose
});

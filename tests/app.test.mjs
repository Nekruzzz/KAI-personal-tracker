// Runs the real app code with a stubbed browser, to test its rules without opening a page.
// Run from the project's main folder: node --test tests/
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const stub = () => new Proxy(function () {}, {
  get: (_, k) => k === Symbol.toPrimitive ? () => '' : k === 'value' || k === 'innerHTML' ? '' : k === 'style' || k === 'dataset' || k === 'classList' ? stub() : k === 'contains' ? () => false : k === 'then' ? undefined : stub(),
  apply: () => stub(), set: () => true,
});

let ctx, run;
const wait = ms => new Promise(r => setTimeout(r, ms));
function load(language){
  const store = new Map([['kai_lang', language]]);
  const c = {
    console, URL, URLSearchParams, Blob, Promise, setTimeout: (f, ms) => { const t = setTimeout(f, ms); t.unref?.(); return t; }, clearTimeout, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0, queueMicrotask, performance, matchMedia: () => ({matches: false}), navigator: {language: 'en-US', onLine: true},
    localStorage: {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k)},
    document: Object.assign(stub(), {documentElement: {}, body: stub(), hidden: false, activeElement: null, addEventListener() {}, querySelector: () => stub(), querySelectorAll: () => [], createElement: () => stub()}),
    location: {hash: '', pathname: '/', search: '', protocol: 'http:', reload() {}}, history: {replaceState() {}}, innerWidth: 400, innerHeight: 800, devicePixelRatio: 1,
    addEventListener() {}, scrollTo() {}, scrollY: 0, AbortController,
  };
  // while a test sets globalThis.FORM ({'#id': value}, true for a switch that is on, or an object to inspect later), the sheet's fields read from it
  const doc = c.document, field = v => v && typeof v === 'object' ? v : {value: String(v), checked: v === true};
  c.document = new Proxy(doc, {get: (t, k) => k === 'querySelector' && c.FORM ? (s => s in c.FORM ? field(c.FORM[s]) : t.querySelector(s)) : t[k], set: () => true});
  c.window = c; c.self = c; c.top = c;
  vm.createContext(c);
  const root = new URL('../kai/', import.meta.url);
  for (const f of ['config.js', 'i18n-en.js', 'app.js']) vm.runInContext(readFileSync(new URL(f, root), 'utf8'), c, {filename: f});
  return {c, run: src => vm.runInContext(src, c)};
}
const nextDow = n => run(`(() => { let k = addDays(todayISO(), 7); while (dow(k) !== ${n}) k = addDays(k, 1); return k; })()`); // always well ahead of today
const setPlan = (events = [], classes = [], schedule = {}) => run(`(() => { const p = clone(plan()); p.routine = clone(DEFAULT_ROUTINE); p.routine.events = ${JSON.stringify(events)}; p.classes = ${JSON.stringify(classes)}; p.schedule = ${JSON.stringify(schedule)}; p.program = null; save('app/plan', p); saveTasks([]); })()`);
const warns = date => JSON.parse(run(`JSON.stringify(warningsFor(${JSON.stringify(date)}))`));
const codes = date => warns(date).map(w => w.id.split('_')[0]);

before(async () => {
  ({run} = load('en'));
  for (let i = 0; i < 50 && !run('S.ready'); i++) await wait(20);
  assert.equal(run('S.ready'), true);
});

test('a workout the day before an exam is flagged, with a fix after the exam', () => {
  const mon = nextDow(1), tue = run(`addDays('${mon}', 1)`);
  setPlan([{id: 'x', date: tue, title: 'Physics', kind: 'exam', from: '10:00', until: '12:00'}], [], {1: 'A', 2: 'B'});
  const w = warns(mon).find(x => x.id.startsWith('gymeve'));
  assert.ok(w);
  assert.equal(w.fix.act, 'gymMove');
  assert.ok(w.fix.data.to > tue, 'moved to after the exam');
  assert.equal(w.level, 'warn');
});

test('a workout on exam day is flagged only if it comes before the exam ends', () => {
  const mon = nextDow(1);
  setPlan([{id: 'x', date: mon, title: 'Physics', kind: 'exam', from: '09:00', until: '11:00'}], [], {1: 'A'});
  assert.ok(!codes(mon).includes('gymday'), 'gym at 17:15 is after a morning exam');
  setPlan([{id: 'x', date: mon, title: 'Physics', kind: 'exam', from: '19:00', until: '21:00'}], [], {1: 'A'});
  assert.ok(codes(mon).includes('gymday'));
  setPlan([{id: 'x', date: mon, title: 'Physics', kind: 'exam'}], [], {1: 'A'});
  assert.ok(codes(mon).includes('gymday'), 'no time given: assume it matters');
});

test('overlaps: event with event is serious, a task inside an event is a warning', () => {
  const d = nextDow(3);
  setPlan([{id: 'a', date: d, title: 'A', from: '10:00', until: '11:00'}, {id: 'b', date: d, title: 'B', from: '10:30', until: '12:00'}, {id: 'c', date: d, title: 'C', from: '11:00', until: '12:00', kind: 'event'}]);
  const w = warns(d).filter(x => x.id.startsWith('ov'));
  assert.deepEqual(w.map(x => x.level), ['bad', 'bad'], 'A+B and B+C; A and C only touch');
  run(`saveTasks([{id:'t', title:'Call', due:'${d}', time:'10:15', done:false}])`);
  assert.ok(warns(d).some(x => x.id.startsWith('ov') && x.level === 'warn'));
});

test('class end times are respected', () => {
  const d = nextDow(3), ev = [{id: 'e', date: d, title: 'Meet', from: '11:00', until: '11:30'}];
  setPlan(ev, [{day: 3, time: '10:00', title: 'Math', end: '10:30'}]);
  assert.equal(codes(d).filter(c => c === 'ov').length, 0);
  setPlan(ev, [{day: 3, time: '10:00', title: 'Math', end: '12:00'}]);
  assert.equal(codes(d).filter(c => c === 'ov').length, 1);
  setPlan(ev, [{day: 3, time: '10:00', title: 'Math'}]);
  assert.equal(codes(d).filter(c => c === 'ov').length, 1, 'no end time: assume 90 minutes');
});

test('the gym clashing with a class or an event is flagged', () => {
  const d = nextDow(1);
  setPlan([], [{day: 1, time: '17:00', title: 'Late class', end: '18:30'}], {1: 'A'});
  assert.ok(codes(d).includes('gymcls'));
  setPlan([{id: 'e', date: d, title: 'Doctor', from: '17:30', until: '18:00'}], [], {1: 'A'});
  assert.ok(codes(d).includes('gymev'));
  setPlan([], [{day: 1, time: '09:00', title: 'Morning', end: '10:00'}], {1: 'A'});
  assert.ok(!codes(d).includes('gymcls'));
});

test('late events: short sleep and the night before an exam', () => {
  const tue = nextDow(2), wed = run(`addDays('${tue}', 1)`);
  setPlan([{id: 'c', date: tue, title: 'Concert', from: '21:00', until: '01:30'}]);
  assert.ok(codes(tue).includes('sleep'), 'past midnight counts');
  setPlan([{id: 'c', date: tue, title: 'Dinner', from: '18:00', until: '20:00'}]);
  assert.ok(!codes(tue).includes('sleep'));
  setPlan([{id: 'c', date: tue, title: 'Party', from: '20:00', until: '23:00'}, {id: 'x', date: wed, title: 'Exam', kind: 'exam', from: '10:00'}]);
  assert.ok(codes(tue).includes('lateeve'));
});

test('two exams close together are flagged once', () => {
  const tue = nextDow(2), wed = run(`addDays('${tue}', 1)`);
  setPlan([{id: 'a', date: tue, title: 'A', kind: 'exam', from: '09:00'}, {id: 'b', date: wed, title: 'B', kind: 'exam', from: '09:00'}]);
  assert.equal(codes(tue).filter(c => c === 'exams').length, 1);
  assert.equal(codes(wed).filter(c => c === 'exams').length, 0);
});

test('dismissed warnings stay dismissed, and only those', () => {
  const d = nextDow(3);
  setPlan([{id: 'a', date: d, title: 'A', from: '10:00', until: '11:00'}, {id: 'b', date: d, title: 'B', from: '10:30', until: '12:00'}]);
  const id = warns(d)[0].id;
  run(`setMeta({warnOff: {${JSON.stringify(id)}: true}})`);
  assert.equal(run(`upcomingWarnings(30).some(w => w.id === ${JSON.stringify(id)})`), false);
  assert.equal(run(`upcomingWarnings(30, true).some(w => w.id === ${JSON.stringify(id)})`), true);
  run(`setMeta({warnOff: {}})`);
});

const plan_ = (topics, exDate, per, from) => JSON.parse(run(`JSON.stringify(buildStudyPlan(${JSON.stringify(topics)}, allEvents().find(e => e.id === 'x'), ${per}, ${JSON.stringify(from)}))`));
test('study plan: spreads topics, keeps the last day for review, stays before the exam', () => {
  const mon = nextDow(1), ex = run(`addDays('${mon}', 7)`);
  setPlan([{id: 'x', date: ex, title: 'Bio', kind: 'exam', from: '09:00'}]);
  const p = plan_(['a', 'b', 'c', 'd'], ex, 60, mon);
  assert.equal(p.items.length, 4);
  assert.equal(p.overflow.length, 0);
  assert.equal(p.review, run(`addDays('${ex}', -1)`));
  assert.ok(p.items.every(i => i.date >= mon && i.date < p.review));
  assert.ok(new Set(p.items.map(i => i.date)).size === 4, 'one topic a day when there is room');
  assert.deepEqual(p.items.map(i => i.topic), ['a', 'b', 'c', 'd'], 'keeps the order');
});

test('study plan: says what does not fit instead of overloading', () => {
  const mon = nextDow(1), ex = run(`addDays('${mon}', 2)`);
  setPlan([{id: 'x', date: ex, title: 'Bio', kind: 'exam'}]);
  const free = run(`dayFreeMin('${mon}')`), many = Array.from({length: 40}, (_, i) => 't' + i);
  const p = plan_(many, ex, 90, mon);
  assert.ok(p.overflow.length > 0);
  assert.equal(p.items.length + p.overflow.length, 40);
  assert.ok(p.items.filter(i => i.date === mon).length * 90 <= free);
});

test('study plan: skips other exam days', () => {
  const mon = nextDow(1), tue = run(`addDays('${mon}', 1)`), ex = run(`addDays('${mon}', 4)`);
  setPlan([{id: 'x', date: ex, title: 'Bio', kind: 'exam'}, {id: 'o', date: tue, title: 'Other', kind: 'exam'}]);
  assert.ok(plan_(['a', 'b', 'c'], ex, 30, mon).items.every(i => i.date !== tue));
});

test('study plan: applying replaces open topics, keeps finished ones, and credits time when done', () => {
  const mon = nextDow(1), ex = run(`addDays('${mon}', 7)`);
  setPlan([{id: 'x', date: ex, title: 'Bio', kind: 'exam'}]);
  const apply = t => run(`applyStudyPlan(allEvents().find(e => e.id === 'x'), buildStudyPlan(${JSON.stringify(t)}, allEvents().find(e => e.id === 'x'), 45, '${mon}'))`);
  apply(['a', 'b']);
  assert.equal(run(`planTasks('x').length`), 3, 'two topics and a review');
  const first = run(`planTasks('x')[0].id`), before = run(`getDay(todayISO()).timeExtra?.study || 0`);
  run(`A.tkDone({dataset: {id: '${first}'}, getBoundingClientRect: () => ({left:0,top:0,width:0,height:0})})`);
  assert.equal(run(`getDay(todayISO()).timeExtra.study`), before + 45);
  assert.equal(run(`allEvents().find(e => e.id === 'x').prepMin`), 45);
  apply(['c']);
  assert.equal(run(`planTasks('x').filter(t => t.done).length`), 1, 'finished topic is kept');
  assert.equal(run(`planTasks('x').filter(t => !t.done).length`), 2);
  run(`A.evDel({dataset: {id: 'x'}})`);
  assert.equal(run(`planTasks('x').filter(t => !t.done).length`), 0, 'deleting the exam removes open topics');
  assert.equal(run(`planTasks('x').filter(t => t.done).length`), 1, 'but keeps the record of what was done');
});

test('levels grow at a steady, increasing pace', () => {
  const l = x => JSON.parse(run(`JSON.stringify(levelOf(${x}))`));
  assert.deepEqual([l(0).level, l(99).level, l(100).level, l(299).level, l(300).level], [1, 1, 2, 2, 3]);
  assert.deepEqual([l(150).into, l(150).need], [50, 200]);
});

const setProfile = p => run(`save('app/profile', ${JSON.stringify({name: 'T', activity: 1.45, currency: '$', ...p})})`);
const target = () => JSON.parse(run(`JSON.stringify(targets())`));
test('calorie target follows the goal', () => {
  const adult = {age: 30, height: 175, weight: 80, sex: 'f'};
  setProfile({...adult, goal: 'lose'});
  const lose = target();
  setProfile({...adult, goal: 'keep'});
  const keep = target();
  setProfile({...adult, goal: 'gain'});
  const gain = target();
  assert.ok(lose.kcal < keep.kcal && keep.kcal < gain.kcal);
  assert.equal(keep.deficit, 0);
  assert.ok(Math.abs(keep.kcal - keep.tdee) <= 10);
});

test('nobody under 18 or underweight gets a deficit, even if an old setting asks for one', () => {
  setProfile({age: 15, height: 165, weight: 60, goal: 'lose'});
  assert.deepEqual([target().care, target().deficit], ['minor', 0]);
  setProfile({age: 25, height: 175, weight: 50, goal: 'lose'});
  assert.deepEqual([target().care, target().deficit], ['under', 0]);
  setProfile({age: 15, height: 165, weight: 60, goal: 'lose', override: {kcal: 1000}});
  assert.ok(target().kcal >= target().tdee - 10, 'a low override is ignored');
  assert.equal(run(`adaptiveAdvice()`), null, 'and no advice to eat less');
  assert.match(run(`hFood()`), /still growing/);
});

test('adults keep the floor, and the advice to eat less only comes with a goal to lose', () => {
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose', override: {kcal: 900}});
  assert.ok(target().kcal >= target().bmr - 10);
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep'});
  [...Array(14)].forEach((_, i) => run(`mutDay(addDays(todayISO(), -${i}), d => { d.weight = ${80 + i * 0.01}; d.meals = [{name: 'x', kcal: 1900, p: 1, f: 1, c: 1}]; })`));
  assert.equal(run(`adaptiveAdvice().kcal`), undefined);
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose'});
  assert.ok(run(`adaptiveAdvice().kcal`) > 0, 'a flat weight on a loss goal does suggest a change');
});

test('profiles from before the goal setting keep the plan they had', () => {
  setProfile({age: 30, height: 175, weight: 80});
  const t = target();
  assert.equal(t.goal, 'lose');
  assert.equal(t.bmr, Math.round(10 * 80 + 6.25 * 175 - 5 * 30 + 5));
});

test('worrying messages get a support card first, in both languages, and only once', () => {
  const sig = s => run(`careSignal(${JSON.stringify(s)})`);
  assert.equal(sig('I want to die'), 'crisis');
  assert.equal(sig('не хочу жить'), 'crisis');
  assert.equal(sig('haven\'t eaten for 3 days'), 'eating');
  assert.equal(sig('не ел 3 дня'), 'eating');
  assert.equal(sig('вызываю рвоту после еды'), 'eating');
  assert.equal(sig('ran 5 km and ate chicken'), null);
  assert.equal(sig('физика убьёт меня, экзамен в пятницу'), null);
  assert.match(run(`careCard('crisis')`), /findahelpline\.com/);
});

test('three days of very little food logged brings a gentle note, not a badge', () => {
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose'});
  [1, 2, 3].forEach(i => run(`mutDay(addDays(todayISO(), -${i}), d => { d.meals = [{name: 'x', kcal: 300, p: 1, f: 1, c: 1}]; })`));
  assert.match(run(`lowEatNote()`), /800 kcal/);
  run(`setMeta({lowEatOff: todayISO()})`);
  assert.equal(run(`lowEatNote()`), '');
  run(`setMeta({lowEatOff: null})`);
  run(`mutDay(addDays(todayISO(), -2), d => { d.meals = [{name: 'x', kcal: 1900, p: 1, f: 1, c: 1}]; })`);
  assert.equal(run(`lowEatNote()`), '');
});

test('a person\'s own AI key still gets the safety rules; KAI\'s server adds its own', () => {
  assert.match(run(`buildPrompt({prompt: 'x'}, 'claude')`), /not a doctor/);
  assert.doesNotMatch(run(`buildPrompt({prompt: 'x'}, 'kai')`), /not a doctor/);
  assert.match(run(`buildPrompt({prompt: {head: 'a', body: 'b', tail: 'c'}}, 'openai')`), /not a doctor/);
});

test('every screen opens with a full profile and a few weeks of data', () => {
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose', sex: 'm'});
  [...Array(21)].forEach((_, i) => run(`mutDay(addDays(todayISO(), -${i}), d => { d.weight = ${80 - i * 0.05}; d.steps = 9000; d.sleep = 7; d.meals = [{name: 'x', kcal: 1800, p: 100, f: 50, c: 200}]; })`));
  for (const f of ['viewDay', 'viewHealth', 'viewMoney', 'viewContent', 'viewMore', 'hFood', 'hTrain', 'hBody', 'hSleep', 'hSupps', 'weekReportText', 'profileBrief', 'adaptiveCard']) {
    assert.doesNotThrow(() => run(`${f}()`), f);
    assert.ok(run(`String(${f}()).length`) > 0, f + ' is empty');
  }
  assert.match(run(`weekReportText()`), /14-day weight trend/);
});

test('English shows no leftover Russian on the main screens', () => {
  for (const f of ['viewDay', 'hFood', 'hTrain', 'hBody', 'hSleep', 'hSupps', 'viewMoney', 'viewMore']) {
    const text = run(`${f}()`).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace('Русский', '');
    assert.doesNotMatch(text, /[А-Яа-яЁё]{3,}/, f);
  }
});

test('the food table is usable abroad and has no duplicates', () => {
  const names = JSON.parse(run(`JSON.stringify(PRODUCTS.map(p => p[0]))`));
  assert.equal(new Set(names).size, names.length);
  for (const n of ['Tofu, firm', 'Pita bread', 'Quinoa, cooked', 'Cheese pizza']) assert.ok(names.includes(n), n);
  assert.ok(names.every(n => !/[А-Яа-я]/.test(n)), 'all translated');
});

const reminders = () => JSON.parse(run(`JSON.stringify(buildReminders())`));
test('an exam gets all five reminders, and ones already past are skipped', () => {
  run(`setMeta({remind: {}})`);
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep'});
  const far = run(`addDays(todayISO(), 20)`), near = run(`addDays(todayISO(), 2)`);
  setPlan([{id: 'far', date: far, title: 'Far', kind: 'exam', from: '09:00'}, {id: 'near', date: near, title: 'Near', kind: 'exam', from: '09:00'}, {id: 'd', date: far, title: 'Essay', kind: 'deadline', from: '09:00'}]);
  const r = reminders();
  assert.equal(r.filter(x => x.key.startsWith('xfar_')).length, 5);
  assert.deepEqual(r.filter(x => x.key.startsWith('xnear_')).map(x => x.key), ['xnear_1', 'xnear_h']);
  assert.equal(r.filter(x => x.key.startsWith('xd_')).length, 3);
  assert.ok(r.every(x => x.at > Date.now()));
  assert.ok(r.every(x => Number.isInteger(x.id) && x.id > 0 && x.id < 2 ** 31));
});

test('a full timetable can\'t push exam reminders out of the iPhone\'s limit of 64', () => {
  const classes = [1, 2, 3, 4, 5, 6, 7].flatMap(day => ['08:00', '10:00', '12:00', '14:00', '16:00'].map(time => ({day, time, title: 'C' + day + time})));
  setPlan([{id: 'x', date: run(`addDays(todayISO(), 20)`), title: 'Bio', kind: 'exam', from: '09:00'}], classes);
  const r = reminders();
  assert.ok(r.length <= 60);
  assert.equal(r.filter(x => x.key.startsWith('xx_')).length, 5);
  assert.ok(r.some(x => x.key.startsWith('c')));
  assert.deepEqual(r.map(x => x.at), [...r.map(x => x.at)].sort((a, b) => a - b));
  run(`setMeta({remind: {classes: false, exams: false}})`);
  assert.equal(reminders().some(x => x.key.startsWith('c') || x.key.startsWith('x')), false);
  run(`setMeta({remind: {}})`);
});

test('a conflict tomorrow becomes a reminder the evening before', () => {
  const d = run(`addDays(todayISO(), 3)`);
  setPlan([{id: 'a', date: d, title: 'A', from: '10:00', until: '11:00'}, {id: 'b', date: d, title: 'B', from: '10:30', until: '12:00'}]);
  const w = reminders().find(x => x.key.startsWith('w'));
  assert.equal(new Date(w.at).getHours(), 20);
  assert.equal(w.title, 'A conflict in tomorrow\'s plans');
});

test('on an iPhone, reminders are replaced only when something changed, with real dates', async () => {
  run(`globalThis.lnCalls = []; window.Capacitor = {isNativePlatform: () => true, Plugins: {LocalNotifications: {
    checkPermissions: async () => ({display: 'granted'}), getPending: async () => ({notifications: [{id: 7}]}),
    cancel: async o => { lnCalls.push(['cancel', o]); }, schedule: async o => { lnCalls.push(['schedule', o]); }}}}`);
  try {
    setPlan([{id: 'x', date: run(`addDays(todayISO(), 20)`), title: 'Bio', kind: 'exam', from: '09:00'}]);
    run(`setMeta({remindAsked: false})`);
    await run(`syncReminders()`);
    assert.equal(run(`lnCalls.length`), 0, 'nothing before the person turns them on');
    run(`setMeta({remindAsked: true})`);
    await run(`syncReminders()`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(lnCalls.map(c => c[0]))`)), ['cancel', 'schedule']);
    assert.equal(run(`lnCalls[1][1].notifications[0].schedule.at instanceof Date`), true);
    assert.equal(run(`lnCalls[1][1].notifications.every(n => ['day', 'train', 'recap'].includes(n.extra.go))`), true, 'a tap knows where to go');
    await run(`syncReminders()`);
    assert.equal(run(`lnCalls.length`), 2, 'no change, no work');
  } finally {
    run(`clearTimeout(remindT); delete window.Capacitor; setMeta({remindAsked: false})`);
  }
});

test('Apple Health never overwrites what was typed, and importing twice counts nothing twice', () => {
  const y = run(`addDays(todayISO(), -1)`), z = run(`addDays(todayISO(), -2)`);
  const iso = (d, hm) => new Date(`${d}T${hm}:00`).toISOString();
  run(`mutDay('${y}', d => { d.steps = 12000; d.sleep = 8; d.walkExtra = 0; d.healthWk = null; d.timeExtra = {}; d.sleepHealth = false; }); mutDay('${z}', d => { d.steps = 0; d.sleep = null; d.walkExtra = 0; d.healthWk = null; d.timeExtra = {}; d.sleepHealth = false; })`);
  const data = {
    steps: [{startDate: iso(y, '00:00'), value: 5000}, {startDate: iso(z, '00:00'), value: 6000}],
    sleep: [{endDate: iso(z, '07:00'), value: 420, sleepState: 'asleep'}, {endDate: iso(z, '07:00'), value: 30, sleepState: 'awake'}, {endDate: iso(z, '07:30'), value: 30, sleepState: 'rem'}, {endDate: iso(y, '07:00'), value: 300, sleepState: 'asleep'}],
    workouts: [{startDate: iso(z, '18:00'), duration: 3000, workoutType: 'strengthTraining', platformId: 'w1'}, {startDate: iso(z, '09:00'), duration: 1800, workoutType: 'walking', platformId: 'w2'}],
  };
  const apply = () => run(`applyHealth(${JSON.stringify(data)})`);
  apply();
  const day = k => JSON.parse(run(`JSON.stringify(getDay('${k}'))`));
  assert.deepEqual([day(y).steps, day(y).sleep], [12000, 8], 'typed values stay');
  assert.deepEqual([day(z).steps, day(z).sleep], [6000, 7.5]);
  assert.deepEqual([day(z).timeExtra.gym, day(z).walkExtra], [50, 30]);
  apply();
  assert.deepEqual([day(z).timeExtra.gym, day(z).walkExtra], [50, 30], 'not doubled');
});

test('inside the iPhone app the web-only steps disappear', () => {
  run(`window.Capacitor = {isNativePlatform: () => true, Plugins: {SignInWithApple: {}, Health: {}, LocalNotifications: {checkPermissions: async () => ({display: 'prompt'})}}}`);
  try {
    assert.equal(run(`isStandalone()`), true);
    run(`SH = {}`);
    assert.match(run(`accountBody()`), /authApple/);
    assert.doesNotMatch(run(`accountBody()`), /authOAuth/);
    run(`S.open.acc_remind = true`);
    const more = run(`viewMore()`);
    assert.match(more, /notifSheet/);
    assert.match(more, /Apple Health/);
    assert.doesNotMatch(more, /Set up calendar reminders/);
  } finally {
    run(`SH = null; clearTimeout(remindT); delete window.Capacitor`);
  }
});

test('pounds and inches are only on screen: storage stays metric and the targets don\'t change', () => {
  setProfile({age: 30, height: 178, weight: 80, goal: 'keep', units: 'metric'});
  const metric = target();
  setProfile({age: 30, height: 178, weight: 80, goal: 'keep', units: 'us'});
  assert.deepEqual(target(), metric, 'same person, same targets');
  assert.equal(run('W(80)'), 176.4);
  assert.equal(run('W(wIn(135))'), 135, 'typed value comes back unchanged');
  assert.equal(run('L(lIn(32))'), 32);
  assert.equal(run('heightShow(178)'), "5'10");
  assert.equal(run('heightShow(heightIn("5\'10"))'), "5'10");
  assert.equal(run('heightShow(heightIn("5 10"))'), "5'10");
  assert.equal(run('heightShow(heightIn("70"))'), "5'10");
  assert.equal(run('heightIn("6\'")'), 182.9);
  assert.match(run('hBody()'), /176\.4 lb|Weight today, lb/);
  assert.match(run('hTrain()'), /Lb/);
  run(`CH.set({dataset: {ex: 'x', i: '0', f: 'w'}, value: '135', closest: () => null})`);
  assert.equal(run(`getDay(todayISO()).sets.x[0].w`), 61.235, 'saved in kilograms');
  run(`mutDay(todayISO(), d => { delete d.sets.x; })`);
  assert.match(run(`tellPrompt('x', todayISO())`), /в фунтах/);
  setProfile({age: 30, height: 178, weight: 80, goal: 'keep', units: 'metric'});
  assert.equal(run('W(80)'), 80);
  assert.equal(run('heightIn("178")'), 178);
  assert.doesNotMatch(run(`tellPrompt('x', todayISO())`), /в фунтах/);
});

test('quick add understands both languages', () => {
  const q = s => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(s)}))`));
  const tomorrow = run(`addDays(todayISO(), 1)`);
  assert.deepEqual([q('call mom tomorrow at 18:30').title, q('call mom tomorrow at 18:30').due, q('call mom tomorrow at 18:30').time], ['Call mom', tomorrow, '18:30']);
  assert.equal(q('buy milk tomorrow at 5pm').time, '17:00');
  assert.equal(q('pay rent urgent').pri, 1);
  assert.deepEqual([q('позвонить маме завтра в 18:30').title, q('позвонить маме завтра в 18:30').due], ['Позвонить маме', tomorrow]);
  assert.equal(q('read book').due, null);
});

test('an end before the start is a typo, unless it runs past midnight', () => {
  assert.equal(run(`badSpan('14:00', '12:00')`), true);
  assert.equal(run(`badSpan('10:00', '10:00')`), true);
  assert.equal(run(`badSpan('21:00', '01:30')`), false);
  assert.equal(run(`badSpan('10:00', '12:00')`), false);
  assert.equal(run(`cleanEv({title: 'X', date: '2030-01-01', from: '14:00', until: '12:00'}).until`), undefined);
  assert.equal(run(`cleanEv({title: 'X', date: '2030-01-01', from: '21:00', until: '01:30'}).until`), '01:30');
});

test('what the AI proposes is checked before anything is saved', () => {
  const r = JSON.parse(run(`JSON.stringify(tellPlan({events: [{title: 'Good', date: '2030-01-02', from: '09:00', kind: 'exam'}, {title: 'Bad date', date: 'tomorrow'}, {date: '2030-01-02'}, {title: 'Bad time', date: '2030-01-03', from: '25:99', kind: 'hack'}], new_tasks: [{title: 'T', date: 'nonsense', time: '10:00'}], move_workouts: [{from: 'x'}]}))`));
  const added = r.pl.routine.events.filter(e => ['Good', 'Bad time', 'Bad date'].includes(e.title));
  assert.deepEqual(added.map(e => e.title), ['Good', 'Bad time']);
  assert.equal(added[1].from, undefined);
  assert.equal(added[1].kind, 'event');
  assert.deepEqual([r.tasks[0].due, r.tasks[0].time], [null, null]);
  assert.equal(r.moves.length, 0);
});

test('API keys and queued jobs are never synced', () => {
  const s = p => run(`syncable(${JSON.stringify(p)})`);
  assert.deepEqual([s('app/ai'), s('jobs/1'), s('inbox/1'), s('days/2030-01-01'), s('app/plan'), s('money/2030-01')], [false, false, false, true, true, true]);
});

test('plurals and money in English', () => {
  assert.equal(run(`plural(1, 'task', 'tasks', 'tasks')`), 'task');
  assert.equal(run(`plural(5, 'task', 'tasks', 'tasks')`), 'tasks');
  run(`save('app/profile', {...profile(), currency: '$'})`);
  assert.equal(run(`money(5)`), '$5');
  assert.equal(run(`money(-17)`), '−$17');
  run(`save('app/profile', {...profile(), currency: 'RM'})`);
  assert.equal(run(`money(5)`), '5 RM');
});

test('the day screen still renders with all of it in place', () => {
  const mon = nextDow(1);
  setPlan([{id: 'x', date: run(`addDays(todayISO(), 2)`), title: 'Bio', kind: 'exam', from: '09:00'}], [{day: 1, time: '10:00', title: 'Math', end: '11:00'}], {1: 'A'});
  assert.match(run(`viewDay()`), /Bio/);
  assert.match(run(`viewDay()`), /Level/);
  assert.match(run(`viewMore()`), /Language/);
  assert.ok(mon);
});

test('bedtime reminders are off until turned on, then follow the routine, even past midnight', () => {
  setPlan();
  run(`setMeta({remind: {}})`);
  assert.equal(reminders().some(x => x.key.startsWith('b')), false, 'off by default');
  run(`setMeta({remind: {bed: true}})`);
  const bed = reminders().filter(x => x.key.startsWith('b'));
  assert.ok(bed.length >= 6 && bed.length <= 7, 'one a night for a week');
  const d = run(`addDays(todayISO(), 3)`), r = bed.find(x => x.key === 'b' + d);
  const want = run(`(() => { const s = dayBlocks('${d}').find(b => b.kind === 'sleep').s - 30; return atMin('${d}', s); })()`);
  assert.equal(r.at, want);
  assert.equal(r.title, 'Bedtime soon');
  run(`(() => { const p = clone(plan()); p.routine.events = [{id: 'late', date: '${d}', title: 'Late', bed: '00:30'}]; save('app/plan', p); })()`);
  const late = reminders().find(x => x.key === 'b' + d);
  assert.equal(new Date(late.at).getHours(), 0);
  assert.equal(late.at, run(`atMin('${d}', 1440)`), 'sleep at 00:30 means the night after, not that morning');
  run(`setMeta({remind: {}})`);
});

test('a reminder knows which screen to open, and tapping one opens it', () => {
  run(`setMeta({remind: {}})`);
  setPlan([], [{day: 1, time: '10:00', title: 'Math', end: '11:00'}], {1: 'A', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'B', 7: 'A'});
  const r = reminders();
  assert.ok(r.filter(x => x.key.startsWith('g')).every(x => x.go === 'train'));
  assert.ok(r.filter(x => x.key.startsWith('c')).every(x => x.go === 'day'));
  assert.ok(r.filter(x => x.key.startsWith('r')).every(x => x.go === 'recap'));
  run(`S.tab = 'more'; openFromReminder('train')`);
  assert.deepEqual([run('S.tab'), run('S.sub.health')], ['health', 'train']);
  run(`openFromReminder('day')`);
  assert.equal(run('S.tab'), 'day');
  run(`openFromReminder(undefined)`);
  assert.equal(run('S.tab'), 'day', 'an old reminder without a screen opens the day');
});

test('weight badges speak pounds when the app does, without changing the rule', () => {
  const name = () => run(`BADGES.find(b => b.id === 'kg1').t`);
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose', units: 'metric'});
  assert.equal(name(), 'Minus one kilo');
  assert.equal(run(`badgeOf(BADGES.find(b => b.id === 'kg1'), 0.5)`), '0.5 / 1');
  setProfile({age: 30, height: 175, weight: 80, goal: 'lose', units: 'us'});
  assert.equal(name(), 'Minus two pounds');
  assert.match(run(`BADGES.find(b => b.id === 'kg3').d`), /6\.6 lb/);
  assert.equal(run(`badgeOf(BADGES.find(b => b.id === 'kg1'), 0.5)`), '1.1 / 2.2 lb');
  assert.equal(run(`BADGES.find(b => b.id === 'kg1').n`), 1, 'still counted in kg');
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep', units: 'metric'});
});

test('a new person sees one obvious first step, and nothing marked missed before they started', () => {
  const m0 = JSON.stringify(run(`JSON.stringify(meta())`));
  run(`setMeta({startedOn: todayISO(), toldOnce: false, firstTellOff: false})`);
  assert.equal(run(`hasTold()`), false);
  assert.match(run(`viewDay()`), /Tell KAI how your day went/);
  run(`setMeta({toldOnce: true})`);
  assert.doesNotMatch(run(`viewDay()`), /Tell KAI how your day went/, 'gone after the first message');
  run(`setMeta({toldOnce: false, firstTellOff: true})`);
  assert.doesNotMatch(run(`viewDay()`), /Tell KAI how your day went/, 'and when dismissed');
  assert.equal(run(`trackedFrom()`), run(`todayISO()`));
  run(`setMeta(JSON.parse(${m0}))`);
});

test('the tasks header doesn\'t say "all done" when there was nothing to do', () => {
  run(`saveTasks([])`);
  assert.doesNotMatch(run(`taskCard()`), /all done/);
});

test('charts and tabs can be read by a screen reader', () => {
  assert.match(run(`donut([{v: 3, c: 'c1', label: 'Food'}, {v: 1, c: 'c2', label: 'Rent'}])`), /role="img" aria-label="Food 75%, Rent 25%"/);
  assert.match(run(`donut([{v: 0, c: 'c1', label: 'Food'}])`), /aria-hidden="true"/);
  run(`S.tab = 'health'; S.sub.health = 'train'`);
  const html = run(`viewHealth()`);
  for (const m of html.matchAll(/role="tablist">([\s\S]*?)<\/div>/g)) assert.ok(!/<button(?![^>]*role="tab")/.test(m[1]), 'every button in a tablist is a tab');
  run(`S.tab = 'day'`);
});

test('English sentences with numbers read as whole sentences', () => {
  const tue = nextDow(2);
  setPlan([{id: 'c', date: tue, title: 'Concert', from: '21:00', until: '01:30'}]);
  const w = warns(tue).find(x => x.id.startsWith('sleep'));
  assert.match(w.text, /^Only [\d.]+ h of sleep after “Concert”: you get up at \d\d:\d\d\.$/);
  assert.equal(run(`trf('Тренировка {w} выполнена', {w: 'Upper'})`), 'Mark the Upper workout done');
  assert.equal(run(`trf('{a} опубл. · {b} в плане · цель {c}', {a: 1, b: 2, c: 4})`), '1 published · 2 planned · goal 4');
  assert.equal(run(`trf('нет такого {x}')`), 'нет такого {x}', 'an unknown key and gap stay visible rather than vanish');
});

test('the readiness card gives the same reps in reserve as the program for the same effort', () => {
  run(`S.sub.health = 'train'; mutDay(todayISO(), d => { d.ready = {}; })`);
  const html = run(`readyCard(todayISO())`);
  const eff = Number(/Effort today: <b>(\d+) out of 10/.exec(html)?.[1]);
  if (eff === 6) assert.match(html, /Keep 3–4 reps in reserve/);
  else assert.match(html, new RegExp(`Keep ${Math.max(1, 9 - eff)}–${Math.max(2, 10 - eff)} reps`));
});

test('a home program with no equipment: added to existing plans without switching them, and asked about at the start', () => {
  const v2 = run(`JSON.stringify((() => { const p = clone(plan()); delete p.programs.home3; delete p.workouts['Дом 1']; delete p.workouts['Дом 2']; p.version = 2; p.program = 'abc'; p.schedule = {1: 'A', 3: 'B', 5: 'C'}; return p; })())`);
  const m = JSON.parse(run(`JSON.stringify(migratePlan(${v2}))`));
  assert.equal(m.program, 'abc', 'the program in use stays');
  assert.deepEqual(m.schedule, {1: 'A', 3: 'B', 5: 'C'});
  assert.ok(m.programs.home3 && m.programs.easy4 && m.programs.abc);
  assert.ok(m.workouts['Дом 1'] && m.workouts['Дом 2']);
  assert.equal(run(`migratePlan(${JSON.stringify(m)})`), null, 'only once');
  const v1 = JSON.parse(run(`JSON.stringify(migratePlan(clone(DEFAULT_PLAN)))`));
  assert.equal(v1.version, 3); assert.equal(v1.program, 'easy4', 'old installs keep the program they were moved to before');
  const all = Object.values(JSON.parse(run(`JSON.stringify(HOME_WORKOUTS)`))).flatMap(w => w.ex);
  assert.ok(all.every(e => e.bw || e.unit || e.id === 'deadbug'), 'no weights to enter at home');
  assert.ok(all.every(e => !/штанг|гантел|блок|тренажёр/i.test(e.name + e.how)), 'no equipment named');
  // first run: the place decides the program
  run(`SH = null; A.welcome(); SH.ob.goals = ['gym']; SH.ob.where = 'gym'; A.obDone()`);
  assert.equal(run(`plan().program`), 'easy4');
  run(`A.welcome(); SH.ob.goals = ['gym']; SH.ob.where = 'home'; A.obDone()`);
  assert.equal(run(`plan().program`), 'home3');
  assert.equal(run(`plan().programs.home3.start`), run(`todayISO()`), 'two easier weeks from today');
  assert.match(run(`gymWord()`), /^Workout ·/);
  run(`S.sub.health = 'train'; S.sub.w = 'Дом 1'`);
  assert.match(run(`viewHealth()`), /Squats to a chair/);
  run(`S.sub.w = null`);
});

test('appearance follows the system until fixed on this device, and is never synced', () => {
  assert.equal(run(`themePref()`), 'system');
  run(`A.setTheme({dataset: {v: 'light'}})`);
  assert.equal(run(`themePref()`), 'light');
  assert.equal(run(`isDark()`), false);
  run(`A.setTheme({dataset: {v: 'system'}})`);
  assert.equal(run(`themePref()`), 'system');
  assert.match(run(`viewMore()`), /Appearance/);
});

test('on an iPhone, onboarding ends with a permissions step that explains before iOS asks', async () => {
  run(`globalThis.asked = 0; window.Capacitor = {isNativePlatform: () => true, Plugins: {LocalNotifications: {requestPermissions: async () => { asked++; return {display: 'granted'}; }, checkPermissions: async () => ({display: 'granted'}), getPending: async () => ({notifications: []}), cancel: async () => {}, schedule: async () => {}, addListener() {}}}}`);
  try {
    run(`setMeta({remindAsked: false}); SH = null; A.welcome(); SH.ob.goals = ['study']; A.obDone()`);
    assert.equal(run(`SH && SH.title`), 'Permissions');
    assert.equal(run(`asked`), 0, 'nothing asked before a tap');
    assert.match(run(`permBody()`), /Allow/);
    await run(`A.notifOn()`);
    assert.equal(run(`asked`), 1);
    assert.equal(run(`meta().remindAsked`), true);
    assert.match(run(`permBody()`), /Done/);
  } finally { run(`clearTimeout(remindT); delete window.Capacitor; SH = null; setMeta({remindAsked: false})`); }
});

test('the plan screen shows both limits and says plainly that the price is a placeholder', () => {
  run(`SH = {}`);
  const h = run(`planBody()`);
  assert.match(h, /AI requests a day/);
  assert.match(h, />10</); assert.match(h, />100</);
  assert.match(h, /placeholder, not a real price/);
  assert.match(h, /nothing is charged/);
  assert.match(h, /<button class="btn block" disabled>/, 'nothing to buy yet');
  run(`setMeta({claudeUsage: {'2026-10': {n: 3, in: 1000, out: 200}}})`);
  assert.match(run(`usageBody()`), /3 requests · 1,000 tokens in, 200 out/);
  run(`setMeta({claudeUsage: {'2026-10': {n: 1, in: 10, out: 2}}})`);
  assert.match(run(`usageBody()`), /1 request · 10 tokens in, 2 out/);
  run(`SH = null; setMeta({claudeUsage: {}})`);
});

test('a full queue or a full phone refuses the request with a message, and keeps the text', async () => {
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = (m) => toasts.push(m)`);
  try {
    run(`for (let i = 0; i < 30; i++) save('jobs/full' + i, {id: 'full' + i, kind: 'tell', prompt: 'x', nImg: 0, json: true, meta: {}, provider: 'pc', label: '', status: 'queued', created: new Date().toISOString(), tries: 0})`);
    assert.equal(await run(`submitJob('tell', {prompt: 'x', provider: 'pc'})`), null);
    assert.match(run(`toasts.at(-1)`), /already 30 requests in the queue.*Your text is still here/);
    run(`for (let i = 0; i < 30; i++) remove('jobs/full' + i)`);
    run(`globalThis.itb0 = imageToBlob; imageToBlob = async () => { throw Object.assign(new Error('full'), {name: 'QuotaExceededError'}); }`);
    assert.equal(await run(`submitJob('food', {prompt: 'x', images: [{}], provider: 'pc'})`), null);
    assert.match(run(`toasts.at(-1)`), /out of space, so the photo wasn't saved/);
    assert.equal(run(`Object.keys(S.docs).filter(k => k.startsWith('jobs/')).length`), 0, 'no half-made request left behind');
  } finally { run(`toast = toast0; if (globalThis.itb0) imageToBlob = itb0`); }
});

test('sync: one document the server refuses is set aside, the rest still upload, and a later change retries it', async () => {
  run(`globalThis.af0 = apiFetch; apiFetch = async (path, opts) => { const items = JSON.parse(opts.body).p_items; return {ok: !items.some(i => i.path === 'days/bad'), status: items.some(i => i.path === 'days/bad') ? 400 : 200, json: async () => []}; }`);
  try {
    run(`syncSave({owner: 'u', dirty: {'days/a': 1, 'days/bad': 2, 'days/b': 3}})`);
    await run(`syncPush()`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(syncState())`)), {owner: 'u', dirty: {}, stuck: {'days/bad': 2}});
    run(`syncMark('days/bad')`);
    const st = JSON.parse(run(`JSON.stringify(syncState())`));
    assert.ok(st.dirty['days/bad'] && !st.stuck['days/bad'], 'changed again: worth another try');
  } finally { run(`apiFetch = af0; clearTimeout(syncTimer); syncSave(null)`); }
});

test('a save the phone fails to write is tried again, and nothing newer is overwritten', async () => {
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = (m) => toasts.push(m); globalThis.db0 = DB; globalThis.fails = 1; globalThis.writes = [];
    DB = {...db0, doc: p => p !== 'app/retrytest' ? db0.doc(p) : {set: async d => { if (fails-- > 0) throw new Error('io'); writes.push(d.v); }, delete: async () => {}}}`);
  try {
    run(`save('app/retrytest', {v: 1})`);
    await wait(50);
    assert.ok(run(`toasts.some(t => /Didn't save, trying again/.test(t))`), run(`toasts.join(' | ')`));
    await wait(3200);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(writes)`)), [1]);
    run(`fails = 1; writes = []; save('app/retrytest', {v: 2})`);
    await wait(50);
    run(`save('app/retrytest', {v: 3})`);
    await wait(6500);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(writes)`)), [3], 'the failed older copy is not written over the newer one');
    assert.equal(run(`localOnly.has('app/retrytest')`), false, 'nothing left pending');
  } finally { run(`DB = db0; toast = toast0; delete S.docs['app/retrytest']`); }
});

test('AI answers are read from code fences and thinking, and anything else is refused', () => {
  assert.deepEqual(JSON.parse(run(`JSON.stringify(parseJSON('<think>hmm {no}</think>Sure! \`\`\`json\\n{"a": 1}\\n\`\`\`'))`)), {a: 1});
  assert.deepEqual(JSON.parse(run(`JSON.stringify(parseJSON('Here: {"b": {"c": 2}} done'))`)), {b: {c: 2}});
  assert.throws(() => run(`parseJSON('no json here')`));
  assert.throws(() => run(`parseJSON('')`));
});

test('applying a Tell KAI answer logs it once, in metric, even with a double tap', () => {
  run(`save('app/profile', {...profile(), units: 'us'})`);
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.meals = []; x.weight = null; x.steps = 0; x.log = []; })`);
  run(`save('inbox/t1', {id: 't1', kind: 'tell', meta: {date: '${d}', text: 'lunch'}, done: false, created: new Date().toISOString(), result: {reply: 'ok', meals: [{name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}], weight: 80, steps: 5000, money: [{type: 'out', amount: 12, cat: 'Кафе и рестораны', note: 'soup'}]}})`);
  const txBefore = run(`monthTx(todayISO().slice(0, 7)).length`);
  run(`SH = null; A.tellApply({dataset: {id: 't1'}}); A.tellApply({dataset: {id: 't1'}})`);
  const day = JSON.parse(run(`JSON.stringify(getDay('${d}'))`));
  assert.equal(day.meals.length, 1);
  assert.equal(day.weight, 80, 'stored in kg whatever the screen shows');
  assert.equal(day.steps, 5000);
  assert.equal(run(`monthTx(todayISO().slice(0, 7)).length`), txBefore + 1);
  assert.equal(run(`S.docs['inbox/t1'].done`), true);
  run(`save('app/profile', {...profile(), units: 'metric'}); remove('inbox/t1')`);
});

test('a backup comes back whole: no keys or queued requests leave the phone, and a bad file changes nothing', async () => {
  run(`globalThis.shared = null; globalThis.sod0 = shareOrDownload; shareOrDownload = async (n, b) => { shared = await b.text(); return true; }`);
  run(`save('app/ai', {...(S.docs['app/ai'] || {}), claude: {key: 'sk-local-only'}, openai: {key: 'sk-other'}}); save('jobs/x1', {id: 'x1', status: 'queued', created: new Date().toISOString()}); mutDay(todayISO(), d => { d.steps = 4321; })`);
  try {
    await run(`A.exportData()`);
    const backup = JSON.parse(run(`shared`));
    assert.equal(backup.app, 'kai');
    assert.equal(backup.docs['app/ai'].claude.key, '', 'the API key is not in the file');
    assert.equal(backup.docs['app/ai'].openai.key, '');
    assert.ok(!Object.keys(backup.docs).some(k => k.startsWith('jobs/')));
    assert.equal(backup.docs['days/' + run(`todayISO()`)].steps, 4321);
    // restore onto a changed phone
    run(`mutDay(todayISO(), d => { d.steps = 1; })`);
    backup.docs['../escape'] = {x: 1}; backup.docs['jobs/evil'] = {status: 'queued'};
    backup.docs['app/plan'].dailyTasks = [{id: 'steps', title: '8 000+ шагов', cat: 'steps'}]; // as if made on a phone set to Russian
    const file = (text) => `({files: [{text: async () => ${JSON.stringify(text)}}]})`;
    await run(`CH.importData(${file(JSON.stringify(backup))})`);
    assert.equal(run(`getDay(todayISO()).steps`), 4321);
    assert.equal(run(`S.docs['app/ai'].claude.key`), 'sk-local-only', 'the key on this phone is kept');
    assert.equal(run(`'../escape' in S.docs || 'jobs/evil' in S.docs`), false);
    assert.equal(run(`plan().dailyTasks[0].title`), '8,000+ steps');
    const before = run(`JSON.stringify(S.docs['app/plan'])`);
    await run(`CH.importData(${file('not a backup')})`);
    assert.equal(run(`JSON.stringify(S.docs['app/plan'])`), before);
  } finally { run(`shareOrDownload = sod0; remove('jobs/x1')`); }
});

test("a backup or cloud copy made in Russian shows its default texts in English here, and keeps the person's own", () => {
  const ru = run(`JSON.stringify({...clone(plan()), dailyTasks: [{id: 'steps', title: '8 000+ шагов', cat: 'steps'}, {id: 'c1', title: 'Полить цветы', cat: 'custom'}]})`);
  const out = JSON.parse(run(`JSON.stringify(langDoc('app/plan', ${ru}))`));
  assert.equal(out.dailyTasks[0].title, '8,000+ steps');
  assert.equal(out.dailyTasks[1].title, 'Полить цветы', 'what the person wrote stays as written');
  assert.equal(out.dailyTasks[0].id, 'steps', 'ids are never translated');
});

test('cached minutes per day follow changes to the day and to the plan', () => {
  const d = run(`addDays(todayISO(), -1)`);
  run(`mutDay('${d}', x => { x.timeExtra = {study: 30}; x.walkExtra = 0; })`);
  assert.equal(run(`timeOn('${d}').study`), 30);
  assert.equal(run(`timeOn('${d}') === timeOn('${d}')`), true, 'second call is cached');
  run(`mutDay('${d}', x => { x.timeExtra = {study: 45}; })`);
  assert.equal(run(`timeOn('${d}').study`), 45, 'a changed day is counted again');
  run(`globalThis.__x = timeOn('${d}'); save('app/plan', clone(plan()))`);
  assert.equal(run(`timeOn('${d}') !== globalThis.__x`), true, 'a changed plan is counted again');
});

test('the "which AI" choice only appears once two AIs are set up', () => {
  run(`SH = {}; save('app/ai', {...(S.docs['app/ai'] || {}), claude: {key: ''}, openai: {key: ''}})`);
  assert.equal(run(`provPicker(false)`), '');
  run(`save('app/ai', {...S.docs['app/ai'], claude: {key: 'k1'}, openai: {key: 'k2'}})`);
  assert.match(run(`provPicker(false)`), /Which AI/);
  run(`save('app/ai', {...S.docs['app/ai'], claude: {key: ''}, openai: {key: ''}}); SH = null`);
});

test('under 18, sports supplements are not suggested, and a doctor is', () => {
  run(`save('app/plan', {...clone(plan()), supps: []})`);
  setProfile({age: 16, height: 170, weight: 60, goal: 'keep'});
  const kid = run(`suppPresetsHTML()`);
  assert.doesNotMatch(kid, /Caffeine|Creatine|Whey/);
  assert.match(kid, /Vitamin D3/);
  assert.match(kid, /Talk to a doctor/);
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep'});
  assert.match(run(`suppPresetsHTML()`), /Caffeine/);
});

test('first sync on a device: the cloud copy wins, a backup of what it replaces is kept, and what exists only here is uploaded', async () => {
  const y = run(`addDays(todayISO(), -1)`), z = run(`addDays(todayISO(), -2)`);
  run(`mutDay('${y}', d => { d.steps = 111; }); mutDay('${z}', d => { d.steps = 222; })`);
  const cloudDay = JSON.parse(run(`JSON.stringify({...getDay('${y}'), steps: 999})`));
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = m => toasts.push(m); globalThis.backups = [];
    globalThis.af0 = apiFetch; apiFetch = async path => ({ok: true, status: 200, json: async () => path.includes('rev=gt.0') ? [{path: 'days/${y}', data: ${JSON.stringify(cloudDay)}, deleted: false, rev: 7, client_ts: 1}] : []})`);
  try {
    run(`syncSave({owner: 'u', first: true, dirty: {}})`);
    await run(`syncFirst()`);
    assert.equal(run(`getDay('${y}').steps`), 999, 'the cloud copy is used');
    assert.equal(run(`getDay('${z}').steps`), 222, 'a day only on this phone stays');
    const st = JSON.parse(run(`JSON.stringify(syncState())`));
    assert.ok(st.dirty[`days/${z}`], 'and is queued for upload');
    assert.ok(!st.dirty[`days/${y}`], 'the day that came from the cloud is not sent back');
    assert.equal(st.cursor, 7);
    assert.equal(st.first, false);
    assert.ok(run(`toasts.some(t => /a copy from this phone was saved/i.test(t))`), run(`toasts.join(' | ')`));
    const k = [...await run(`blobKeys()`)].find(x => x.startsWith('presync_'));
    assert.ok(k, 'the backup is kept on the phone');
    assert.equal(JSON.parse(await run(`blobGet('${k}').then(b => b.text())`)).docs[`days/${y}`].steps, 111, 'with the version the cloud replaced');
    assert.match(run(`copyTitle('${k}')`), /^Before the first cloud sync, \d+ \w+$/);
  } finally { run(`apiFetch = af0; toast = toast0; clearTimeout(syncTimer); syncSave(null)`); }
});

test('supplements are switched off: no tab, no task, no reminder, and a saved list is kept', () => {
  run(`save('app/plan', {...clone(plan()), supps: [{name: 'Vitamin D3', dose: '1000 IU'}], dailyTasks: [...plan().dailyTasks.filter(t => t.cat !== 'supps'), {id: 'supps', title: 'Take supplements', cat: 'supps'}]})`);
  run(`S.sub.health = 'supps'`);
  const h = run(`viewHealth()`);
  assert.doesNotMatch(h, /data-v="supps"/);
  assert.equal(run(`S.sub.health`), 'food', 'an old link to the tab falls back to food');
  assert.equal(run(`buildDay(addDays(todayISO(), 1)).tasks.some(t => t.cat === 'supps')`), false);
  assert.equal(run(`ICS_ITEMS.some(i => i[0] === 'supps')`), false);
  assert.equal(run(`plan().supps.length`), 1, 'the saved list is still there');
});

test('lighter screens: the workout comes first, details are folded, and the header holds only what is used daily', () => {
  run(`S.sub.health = 'train'; S.sub.w = null; S.open.ready = false; delete S.open.acc_trainMore; mutDay(todayISO(), d => { d.workout = 'A'; })`);
  const h = run(`hTrain()`);
  assert.match(h, /How do you feel\?/);
  assert.doesNotMatch(h, /data-act="rdy"/, 'the readiness questions open on a tap');
  assert.match(h, /Progress and details/);
  assert.doesNotMatch(h, /Strength progress/, 'folded until opened');
  assert.doesNotMatch(run(`(renderTop(), document.querySelector('#top').innerHTML)`) || '', /data-act="kb"/);
  assert.match(run(`viewMore()`), /data-act="kb"/, 'the knowledge base is still one tap away in More');
  assert.equal(run(`FACE_ON`), false);
  run(`mutDay(todayISO(), d => { delete d.workout; })`);
});

test('people who are not students see no class timetable, and the body tab has no repeats or empty charts', () => {
  run(`save('app/profile', {...profile(), role: 'work'}); save('app/plan', {...clone(plan()), classes: []})`);
  assert.doesNotMatch(run(`viewMore()`), /Class timetable/);
  assert.equal(run(`onboardSteps().some(s => s[0] === 'classes')`), false);
  run(`save('app/profile', {...profile(), role: 'study'})`);
  assert.match(run(`viewMore()`), /Class timetable/);
  run(`S.sub.health = 'body'`);
  assert.doesNotMatch(run(`hBody()`), /Target adjustment/);
});

test('the workout adapts as soon as readiness is answered, even though the answer is cached', () => {
  run(`mutDay(todayISO(), d => { d.ready = {}; d.sleep = 8; })`);
  const before = JSON.parse(run(`JSON.stringify(adaptInfo(todayISO()))`));
  run(`A.rdy({dataset: {k: 'energy', v: 'low'}})`);
  const after = JSON.parse(run(`JSON.stringify(adaptInfo(todayISO()))`));
  assert.equal(after.delta, before.delta - 1, 'one set fewer straight away');
  run(`mutDay(todayISO(), d => { d.ready = {}; })`);
});

test('the plans screen stays out of sight until payments are real, so a review build has no placeholder price', () => {
  run(`globalThis.cfg0 = {...CFG}; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k'; CFG.plans = false`);
  try {
    assert.doesNotMatch(run(`accountCard()`), /data-act="planSheet"/);
    run(`CFG.plans = true`);
    assert.match(run(`accountCard()`), /data-act="planSheet"/);
  } finally { run(`Object.assign(CFG, cfg0)`); }
});

test('sleep is a section of Body, so the health tabs fit on a phone, and old links to the sleep tab still work', () => {
  run(`S.sub.health = 'sleep'`);
  const h = run(`viewHealth()`);
  assert.equal(run(`S.sub.health`), 'body');
  assert.doesNotMatch(h, /data-v="sleep"/);
  assert.match(h, /Slept last night/);
});

test('the font ships with the app: no request to Google, and the offline shell includes it', () => {
  const html = readFileSync(new URL('../kai/index.html', import.meta.url), 'utf8');
  const sw = readFileSync(new URL('../kai/sw.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
  for (const f of ['manrope-latin.woff2', 'manrope-cyrillic.woff2']) {
    assert.match(html, new RegExp('fonts/' + f));
    assert.match(sw, new RegExp('./fonts/' + f));
    assert.ok(readFileSync(new URL('../kai/fonts/' + f, import.meta.url)).length > 1000);
  }
  assert.match(readFileSync(new URL('../kai/fonts/OFL.txt', import.meta.url), 'utf8'), /SIL Open Font License/);
});

test('without AI, everyday messages are still understood on the phone, in both languages, and shown before anything changes', () => {
  const p = (t) => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()))`));
  let x = p('Slept 7.5 hours, walked 40 minutes and spent 12 on lunch. 9,500 steps');
  assert.equal(x.r.sleep_h, 7.5);
  assert.deepEqual(x.r.time_log, [{kind: 'walk', min: 40}]);
  assert.equal(x.r.steps, 9500);
  assert.deepEqual([x.r.money[0].type, x.r.money[0].amount, x.r.money[0].cat], ['out', 12, 'Кафе и рестораны']);
  x = p('Спал 6 часов, гулял полчаса и потратил 300 на такси. Вес 80,5 кг');
  assert.equal(x.r.sleep_h, 6);
  assert.equal(x.r.weight, 80.5);
  assert.deepEqual([x.r.money[0].amount, x.r.money[0].cat], [300, 'Транспорт']);
  assert.deepEqual(x.r.time_log, [{kind: 'walk', min: 30}], '"полчаса" is 30 minutes');
  assert.deepEqual(p('studied for an hour and a half').r.time_log, [{kind: 'study', min: 90}]);
  x = p('Physics exam on Friday at 10:00, call mom tomorrow at 18:30');
  assert.equal(x.r.events[0].kind, 'exam');
  assert.equal(x.r.events[0].from, '10:00');
  assert.equal(x.r.new_tasks[0].time, '18:30');
  x = p('Had some soup');
  assert.equal(x.left.length, 1, 'food without an amount or a known piece needs the AI');
  assert.equal(p('курсовую сдать до 25 января').r.meals, undefined, 'a date is not a count of food');
  run(`save('app/profile', {...profile(), units: 'us'})`);
  assert.equal(p('weight 180').r.weight, 81.6, 'pounds become kilograms in storage');
  run(`save('app/profile', {...profile(), units: 'metric'})`);
  // the whole flow: nothing is saved until the person confirms
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.sleep = null; }); SH = null; A.tell()`);
  assert.equal(run(`tellLocal('slept 8 hours', '${d}')`), true);
  assert.equal(run(`getDay('${d}').sleep`), null, 'nothing changes before the tap');
  const id = run(`SH.jobId`);
  assert.equal(run(`S.docs['inbox/' + SH.jobId].meta.local`), true);
  run(`A.tellApply({dataset: {id: '${id}'}})`);
  assert.equal(run(`getDay('${d}').sleep`), 8);
  assert.equal(run(`tellLocal('had oatmeal', '${d}')`), false, 'nothing understood: falls through to the usual AI message');
  run(`SH = null`);
});

test('every first-run example works without AI, in both languages', () => {
  const ru = ['Гулял 40 минут, спал 7 часов', 'Потратил 12 на обед', 'В пятницу в 10:00 экзамен', 'Завтра в 18:30 позвонить маме'];
  for (const t of [...JSON.parse(run(`JSON.stringify(TELL_EXAMPLES())`)), ...ru])
    assert.ok(run(`tellLines(localTellParse(${JSON.stringify(t)}, todayISO()).r, todayISO()).length > 0`), t);
});

test('without AI, a food with an amount is found in the built-in table, in either language', () => {
  const meal = t => JSON.parse(run(`JSON.stringify(localMeal(${JSON.stringify(t)}))`));
  const rice = meal('150 g rice');
  assert.match(rice.name, /^Rice, cooked/i, 'cooked unless the message says raw or dry');
  assert.ok(rice.kcal > 100 && rice.kcal < 250, String(rice.kcal));
  const ru = meal('съел 200 г куриной грудки');
  assert.match(ru.name, /Chicken breast/i);
  assert.equal(meal('2 eggs').kcal, Math.round(157 * 1.1), "pieces use the table's piece weight");
  assert.equal(meal('had a nice day'), null);
  assert.match(meal('2 яйца').name, /egg/i, 'Russian word endings');
  assert.match(meal('100 г курицы').name, /Chicken/i);
  const r = JSON.parse(run(`JSON.stringify(localTellParse('150 g rice and slept 7 hours', todayISO()).r)`));
  assert.equal(r.meals.length, 1); assert.equal(r.sleep_h, 7);
  const todo = JSON.parse(run(`JSON.stringify(localTellParse('buy 2 bananas tomorrow', todayISO()).r)`));
  assert.equal((todo.meals || []).length, 0, 'a plan for tomorrow is not a meal');
  assert.equal(todo.new_tasks.length, 1);
});

test('quick add: "завтрак" is breakfast, not tomorrow; "next week" moves a weekday on', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  assert.equal(q('приготовить завтрак').due, null);
  assert.equal(q('позвонить завтра').due, run(`addDays(todayISO(), 1)`));
  const mon = run(`addDays(todayISO(), 1 - dow(todayISO()))`);
  for (const day of ['Monday', 'Wednesday', 'Friday']) {
    const next = q(`call on ${day} next week`).due;
    assert.ok(next >= run(`addDays('${mon}', 7)`) && next < run(`addDays('${mon}', 14)`), `${day} next week: ${next}`);
  }
});

test('without AI, gym sets and checking off today\'s tasks are understood too', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  run(`(() => { const pl = clone(plan()); pl.dailyTasks = [{id: 'posture', title: 'Осанка, 5 минут', cat: 'posture'}]; save('app/plan', pl); })()`);
  const s = p('squats 60 kg for 8, 8 and 7');
  assert.equal(s.sets.length, 3);
  assert.deepEqual(s.sets.map(x => x.r), [8, 8, 7]);
  assert.equal(s.sets[0].w, 60);
  assert.deepEqual(p('did my posture exercises').tasks_done, ['posture']);
  assert.deepEqual(p("didn't get to the posture exercises").tasks_undone, ['posture']);
  assert.equal(p('push-ups against a table 3x10').sets?.length || 0, 3);
});

test('the on-phone reader leaves ordinary sentences alone', () => {
  const lines = t => JSON.parse(run(`JSON.stringify(tellLines(localTellParse(${JSON.stringify(t)}, todayISO()).r, todayISO()))`));
  for (const t of ['I have 2 kids', 'watched 3 episodes of a show', 'my exam score was 85', 'bus 42 was late', 'the gym was crowded', 'Had some soup', 'got an A on the test today', 'Friday is my favourite day', 'read 20 pages',
    'у меня 2 кота', 'посмотрел 3 серии', 'получил 5 за контрольную', 'автобус 42 опоздал', 'мне 21 год', 'в 10 классе', 'пятница мой любимый день'])
    assert.deepEqual(lines(t), [], t);
  assert.match(lines('call me at 5').join(), /17:00/, 'a bare 5 is the afternoon');
  assert.match(lines('bought a new phone for 300').join(), /Electronics/);
});

test('dates with a month name: this year, or next year once the day has passed', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`)).due;
  const y = +run(`todayISO().slice(0, 4)`), today = run(`todayISO()`);
  const expect = (m, d) => { const k = `${y}-${m}-${d}`; return k < today ? `${y + 1}-${m}-${d}` : k; };
  assert.equal(q('essay due January 20'), expect('01', '20'));
  assert.equal(q('сдать курсовую до 25 января'), expect('01', '25'));
  assert.equal(q('trip on 3 Mar'), expect('03', '03'));
  assert.equal(q('8 марта поздравить маму'), expect('03', '08'));
  assert.equal(q('the market 5 minutes away'), null, 'a word that starts like a month is not a date');
});

test('without AI, a clear to-do without a date is still a to-do', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.new_tasks)`));
  assert.deepEqual(p('remind me to buy a new charger'), [{title: 'Buy a new charger', date: null, time: null}]);
  assert.equal(p('надо купить молоко')[0].title, 'Купить молоко');
  assert.deepEqual(p('I need a break'), [], 'only "need to", not any "need"');
});

test('describing food without AI counts it from the food table, and still waits for a tap', () => {
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.meals = []; }); SH = null; A.foodText()`);
  assert.equal(run(`foodLocal('200 g rice with 2 eggs', '${d}')`), true);
  const it = JSON.parse(run(`JSON.stringify(S.docs['inbox/' + SH.jobId])`));
  assert.equal(it.result.meals.length, 1, 'one description, one meal');
  assert.match(it.result.meals[0].name, /rice.*\+.*egg/i);
  assert.equal(run(`getDay('${d}').meals.length`), 0, 'nothing logged yet');
  run(`A.tellApply({dataset: {id: '${it.id}'}})`);
  assert.equal(run(`getDay('${d}').meals.length`), 1);
  assert.equal(run(`foodLocal('a bowl of gazpacho', '${d}')`), false);
  run(`SH = null`);
});

test('an applied answer can be undone in one tap, and everything returns as it was', () => {
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.sleep = 5; x.meals = []; }); saveTasks([])`);
  const before = run(`JSON.stringify([getDay('${d}').sleep, getDay('${d}').meals.length, smartTasks().length, monthTx('${d}'.slice(0, 7)).length])`);
  run(`SH = null; A.tell(); tellLocal('slept 8 hours, 150 g rice, spent 12 on lunch, call mom tomorrow at 18:30', '${d}')`);
  const id = run(`SH.jobId`);
  run(`A.tellApply({dataset: {id: '${id}'}})`);
  assert.equal(run(`getDay('${d}').sleep`), 8);
  run(`A.undoApply()`);
  assert.equal(run(`JSON.stringify([getDay('${d}').sleep, getDay('${d}').meals.length, smartTasks().length, monthTx('${d}'.slice(0, 7)).length])`), before);
  assert.equal(run(`S.docs['inbox/${id}'].done`), false, 'the answer can be applied again');
  run(`SH = null`);
});

test('deleting all data on this phone takes two taps, signs out first so nothing is deleted in the cloud, and keeps the language', async () => {
  const {run: r2} = load('en');
  for (let i = 0; i < 50 && !r2('S.ready'); i++) await wait(20);
  r2(`mutDay(todayISO(), d => { d.steps = 4321; }); syncSave({owner: 'u', dirty: {}}); globalThis.reloaded = 0; location.reload = () => { reloaded++; }`);
  const btn = r2(`globalThis.btn = {dataset: {}, textContent: '', innerHTML: '', disabled: false}; btn`);
  assert.ok(btn);
  await r2(`A.wipeLocal(btn)`);
  assert.equal(r2(`getDay(todayISO()).steps`), 4321, 'the first tap only asks');
  await r2(`A.wipeLocal(btn)`);
  assert.equal(r2(`Object.keys(S.docs).length`), 0);
  assert.equal(r2(`Object.keys(syncState().dirty || {}).length`), 0, 'no deletions queued for the cloud');
  assert.equal(r2(`localStorage.getItem('kai_lang')`), 'en');
  assert.equal(r2(`reloaded`), 1);
});

test('without AI, everyday portions count too, and one message is one meal', () => {
  const r = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  const a = r('had 2 eggs and a slice of toast for breakfast');
  assert.equal(a.meals.length, 1, 'one meal in the diary');
  assert.match(a.meals[0].name, /egg.*\+.*bread/i);
  assert.ok(a.meals[0].kcal > 200 && a.meals[0].kcal < 330, String(a.meals[0].kcal));
  assert.ok(r('lunch: 200g grilled chicken breast with a cup of rice').meals[0].kcal > 450);
  assert.ok(r('ate 2 slices of pizza').meals[0].kcal > 400, 'a pizza slice is a pizza slice, not 30 g');
  assert.match(r('перекусил бананом и горстью орехов').meals[0].name, /banana.*walnut/i);
});

test('an AI food answer is added once even with a double tap, and can be undone', () => {
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.meals = []; }); save('inbox/f1', {id: 'f1', kind: 'food', meta: {date: '${d}', mult: 1}, done: false, created: new Date().toISOString(), result: {name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}}); SH = null`);
  run(`A.foodAdd({dataset: {id: 'f1'}}); A.foodAdd({dataset: {id: 'f1'}})`);
  assert.equal(run(`getDay('${d}').meals.length`), 1);
  run(`A.undoApply()`);
  assert.equal(run(`getDay('${d}').meals.length`), 0);
  assert.equal(run(`S.docs['inbox/f1'].done`), false);
  run(`remove('inbox/f1')`);
  run(`save('inbox/f2', {id: 'f2', kind: 'food', meta: {date: '${d}', mult: 1}, done: false, created: new Date().toISOString(), result: {name: 'Huge', kcal: 90000, p: 10, f: 5, c: 40}}); A.foodAdd({dataset: {id: 'f2'}})`);
  assert.equal(run(`getDay('${d}').meals.length`), 0, 'impossible numbers are not logged');
  run(`remove('inbox/f2')`);
});

test('without AI, sleep from bedtime and wake time', () => {
  const r = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  assert.equal(r('went to bed at 23:30, woke up at 7').sleep_h, 7.5);
  assert.equal(r('лёг в 23, встал в 7 и потратил 5 на кофе').sleep_h, 8);
  assert.equal(r('лёг в 23, встал в 7 и потратил 5 на кофе').money[0].amount, 5, 'the rest of the message is still read');
  assert.equal(r('went to bed at 1, woke up at 9').sleep_h, 8);
});

test('without AI, "I\'m sick" and a day rating are understood, "sick of" is not', () => {
  const r = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  assert.equal(r("I'm sick today").sick, true);
  assert.equal(r('кажется, заболел').sick, true);
  assert.equal(r("I'm sick of rain").sick, undefined);
  assert.equal(r('day was 4/5').rating, 4);
  assert.equal(r('оценка дня 3').rating, 3);
  assert.equal(r('read 3 books').rating, undefined);
});

test('a day note typed into the to-do field goes to Tell KAI instead of becoming a to-do', () => {
  for (const t of ['slept 7 hours', 'spent 12 on lunch', '150 g rice', 'гулял 40 минут']) assert.equal(run(`isDayNote(${JSON.stringify(t)})`), true, t);
  for (const t of ['call mom tomorrow at 18:30', 'buy milk', 'exam on Friday at 10', 'надо оплатить интернет']) assert.equal(run(`isDayNote(${JSON.stringify(t)})`), false, t);
});

test('people who had supplements are told once where they went', () => {
  run(`save('app/plan', {...clone(plan()), supps: [{name: 'Vitamin D3'}]}); setMeta({suppsNoteSeen: false})`);
  assert.match(run(`viewDay()`), /supplements section has been removed/);
  run(`A.suppsNoteOk()`);
  assert.doesNotMatch(run(`viewDay()`), /supplements section has been removed/);
  run(`save('app/plan', {...clone(plan()), supps: []}); setMeta({suppsNoteSeen: false})`);
  assert.doesNotMatch(run(`viewDay()`), /supplements section has been removed/, 'nobody else sees it');
});

test('switches inside a card change the card, not the tab', () => {
  run(`S.tab = 'day'; A.sub({dataset: {k: 'prog', v: 'month'}})`);
  assert.equal(run(`S.tab`), 'day');
  assert.equal(run(`S.sub.prog`), 'month');
  run(`S.tab = 'health'; S.sub.health = 'food'; A.sub({dataset: {k: 'fw', v: 'p'}})`);
  assert.equal(run(`S.tab`), 'health');
  run(`A.sub({dataset: {k: 'health', v: 'train'}})`);
  assert.equal(run(`S.tab`), 'health');
  run(`S.sub.prog = 'week'; S.sub.fw = 'kcal'; S.tab = 'day'`);
});

test('"What can I write?" examples all work without AI, in both languages; the AI ones are marked', () => {
  run(`globalThis.meta85 = clone(meta()); setMeta({modules: {...(meta().modules || {}), money: true}})`);
  const en = JSON.parse(run(`JSON.stringify(TELL_HELP.flatMap(([, xs]) => xs))`));
  const ruSrc = readFileSync(new URL('../kai/app.js', import.meta.url), 'utf8').match(/const TELL_HELP = \[([\s\S]*?)\n\];/)[1];
  const ru = [...ruSrc.matchAll(/tr\('([^']+)'\)/g)].map(m => m[1]).filter(x => /\d|Заболел/.test(x));
  assert.ok(ru.length >= 14);
  for (const t of [...en, ...ru]) assert.ok(run(`tellLines(localTellParse(${JSON.stringify(t)}, todayISO()).r, todayISO()).length > 0 || localAnswer(${JSON.stringify(t)}) !== null`), t); // questions are answered instead
  run(`SH = {}`);
  assert.match(run(`tellHelpHTML()`), /needs AI/);
  run(`SH = null; save('app/meta', meta85)`);
});

test('in the iPhone app with KAI\'s own AI, "paste your own key" is hidden unless the owner allows it; the web keeps it', () => {
  run(`globalThis.cfg1 = {...CFG}; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k'; window.Capacitor = {isNativePlatform: () => true, Plugins: {}}`);
  try {
    assert.doesNotMatch(run(`aiSettings()`), /Connect Claude or ChatGPT|paste an API key/);
    assert.match(run(`aiSettings()`), /KAI's AI/);
    run(`CFG.ownKeys = true`);
    assert.match(run(`aiSettings()`), /Claude/);
    run(`CFG.ownKeys = false; delete window.Capacitor`);
    assert.match(run(`aiSettings()`), /Claude/, 'the web keeps the option');
  } finally { run(`delete window.Capacitor; Object.assign(CFG, cfg1); CFG.supabaseUrl = ''; CFG.supabaseKey = ''`); }
});

test('Health screens say plainly that Health data is in the cloud copy once signed in, and only then', () => {
  assert.equal(run(`healthCloudNote()`), '');
  run(`globalThis.cfg2 = {...CFG}; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k'`);
  try { assert.match(run(`healthCloudNote()`), /cloud copy on KAI's server, not in iCloud/); }
  finally { run(`Object.assign(CFG, cfg2)`); }
});

test('without AI, money in the ways people write it, and thousands with a space are one number', () => {
  const m = t => JSON.parse(run(`JSON.stringify(localMoney(${JSON.stringify(t)}))`));
  assert.equal(m('потратил 1 200 руб на продукты').amount, 1200);
  assert.equal(m('spent $12 on lunch').amount, 12);
  assert.equal(m('spent €20 on a book').amount, 20);
  assert.equal(m('paid 15 dollars for a taxi').amount, 15);
  assert.equal(m('потратил 300р на такси').amount, 300);
  assert.equal(m('обед 12').amount, 12, 'the example the Money screen gives');
  assert.equal(m('кофе 150 руб').amount, 150);
  assert.equal(m('got paid 1 500').type, 'in');
  assert.equal(m('lunch 200 g rice'), null, 'grams are food, not money');
  assert.equal(m('coffee with friends'), null);
});

test('times people say: pm after minutes, tonight, mornings, noon, "in 2 hours"', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  assert.equal(q('call at 9:30pm').time, '21:30');
  assert.equal(q('call at 9:30pm').title, 'Call', 'no "pm" left in the title');
  assert.equal(q('meeting at 3:15 pm tomorrow').time, '15:15');
  assert.deepEqual([q('call mom tonight').due, q('call mom tonight').time], [run('todayISO()'), '19:00']);
  assert.equal(q('call mom tomorrow morning').time, '09:00');
  assert.equal(q('в субботу утром позвонить').time, '09:00');
  assert.equal(q('вечером позвонить маме').title, 'Позвонить маме');
  assert.equal(q('call at noon').time, '12:00');
  const inTwo = q('позвонить маме через 2 часа'), now = run('Date.now()');
  const at = new Date(`${inTwo.due}T${inTwo.time}:00`).getTime();
  assert.ok(Math.abs(at - (now + 2 * 3600e3)) < 61e3, 'two hours from now');
  const meal = JSON.parse(run(`JSON.stringify(localTellParse('вечером съел 200 г риса', todayISO()).r)`));
  assert.equal(meal.meals?.length, 1, 'eaten in the evening is a meal, not a plan');
});

test('in the small hours, the Now card says it is time to sleep, not a free slot', () => {
  run(`globalThis.tl0 = tlState; tlState = date => { const r = tl0(date); const wake = r.bl.find(b => b.kind === 'wake'); return {...r, nowM: Math.max(0, wake.s - 180)}; }`);
  try {
    const h = run(`nowCard()`);
    assert.match(h, /Time to sleep/);
    assert.doesNotMatch(h, /Nothing planned/);
  } finally { run(`tlState = tl0`); }
});

test('the on-phone answer names the parts it did not understand', () => {
  run(`SH = null; A.tell()`);
  run(`tellLocal('slept 7 hours, had some soup', todayISO())`);
  const reply = run(`S.docs['inbox/' + SH.jobId].result.reply`);
  assert.match(reply, /Not understood without AI: “had some soup”|Not understood without AI: «had some soup»/);
  run(`SH = null`);
});

test('typed numbers: thousands with a space or (in English) a comma, and a decimal comma', () => {
  assert.equal(run(`toNum('1 200')`), 1200);
  assert.equal(run(`toNum('9,500')`), 9500, 'English thousands comma');
  assert.equal(run(`toNum('80,5')`), 80.5, 'a decimal comma still works');
  assert.equal(run(`toNum('1,234.5')`), 1234.5);
  assert.equal(run(`toNum('12 5')`), null, 'not a thousands group');
  assert.equal(run(`toNum('')`), null);
  assert.equal(run(`toNum(42)`), 42);
});

test('a typo in the profile never becomes a calorie target; height in meters is understood', () => {
  for (const [h, w, a] of [[17, 70, 25], [175, 7, 25], [175, 70, 250], [2500, 70, 25]]) {
    setProfile({age: a, height: h, weight: w, goal: 'keep', units: 'metric'});
    const t = JSON.parse(run(`JSON.stringify(targets())`));
    assert.equal(t.ok, false, `${h}/${w}/${a}`);
    assert.equal(t.kcal, null);
  }
  assert.match(run(`hFood()`), /look like a typo/);
  run(`save('app/profile', {...profile(), units: 'metric'})`);
  assert.equal(run(`heightIn('1.75')`), 175, 'meters become centimeters');
  assert.equal(run(`heightIn('175')`), 175);
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep', units: 'metric'});
  assert.equal(run(`targets().ok`), true);
});

test('losing weight never sets a target under 1200 kcal, even for small people, and even with an override', () => {
  setProfile({age: 60, height: 150, weight: 45, sex: 'f', goal: 'lose', activity: 1.2, units: 'metric'});
  assert.equal(run(`targets().kcal`), 1200);
  run(`save('app/profile', {...profile(), override: {kcal: 900}})`);
  assert.equal(run(`targets().kcal`), 1200, 'an old or adaptive override cannot go lower either');
  setProfile({age: 60, height: 150, weight: 45, sex: 'f', goal: 'keep', activity: 1.2, units: 'metric'});
  assert.ok(run(`targets().kcal`) < 1200, 'keeping weight still uses the real maintenance figure');
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep', units: 'metric'});
});

test('at the calorie floor, slow weight loss brings advice to move more, never a lower target', () => {
  setProfile({age: 60, height: 150, weight: 45, sex: 'f', goal: 'lose', activity: 1.2, units: 'metric'});
  run(`globalThis.wt0 = weightTrend; weightTrend = () => ({rate: -0.1, perWeek: -0.05})`);
  try {
    const a = JSON.parse(run(`JSON.stringify(adaptiveAdvice())`));
    assert.equal(a.kcal, undefined, 'no button to lower the target');
    assert.match(a.text, /lowest KAI suggests/);
  } finally { run(`weightTrend = wt0`); setProfile({age: 30, height: 175, weight: 80, goal: 'keep', units: 'metric'}); }
});

test('a typo in today\'s weight, sleep or steps is not saved', () => {
  run(`save('app/profile', {...profile(), units: 'metric'}); mutDay(todayISO(), d => { d.weight = 80; d.sleep = 7; })`);
  run(`CH.weight({value: '750'}); CH.sleep({value: '80'})`);
  assert.equal(run(`getDay(todayISO()).weight`), 80);
  assert.equal(run(`getDay(todayISO()).sleep`), 7);
  run(`CH.weight({value: '79,5'}); CH.sleep({value: '7.5'})`);
  assert.equal(run(`getDay(todayISO()).weight`), 79.5);
  assert.equal(run(`getDay(todayISO()).sleep`), 7.5);
  run(`CH.weight({value: ''})`);
  assert.equal(run(`getDay(todayISO()).weight`), null, 'clearing the field still works');
});

test('an answer with an impossible weight or sleep shows and applies neither', () => {
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.weight = 80; x.sleep = 7; }); save('inbox/bad', {id: 'bad', kind: 'tell', meta: {date: '${d}', text: 'x'}, done: false, created: new Date().toISOString(), result: {reply: 'ok', weight: 800, sleep_h: 30, steps: 5000}})`);
  const lines = JSON.parse(run(`JSON.stringify(tellLines(S.docs['inbox/bad'].result, '${d}'))`));
  assert.ok(!lines.some(l => /Weight|Sleep/.test(l)), lines.join(' | '));
  assert.equal(run(`okMeal({name: 'x', kcal: 50000, p: 1, f: 1, c: 1})`), false);
  assert.equal(run(`okMeal({name: 'Soup', kcal: 300, p: 10, f: 5, c: 40})`), true);
  run(`SH = null; A.tellApply({dataset: {id: 'bad'}})`);
  assert.deepEqual([run(`getDay('${d}').weight`), run(`getDay('${d}').sleep`), run(`getDay('${d}').steps`)], [80, 7, 5000]);
  run(`remove('inbox/bad')`);
});

test('money exports as a spreadsheet: every entry, oldest first, with commas and quotes kept intact', () => {
  run(`addTx([{id: 'c1', date: '2030-02-02', type: 'out', amount: 12, cat: 'Кафе и рестораны', note: 'lunch, with "friends"'}, {id: 'c2', date: '2030-01-05', type: 'in', amount: 900, cat: 'Доход', note: 'pay'}])`);
  const csv = run(`moneyCSV()`).split('\r\n');
  assert.equal(csv[0], 'Date,Type,Amount,Category,Note');
  const i5 = csv.findIndex(l => l.startsWith('2030-01-05')), i2 = csv.findIndex(l => l.startsWith('2030-02-02'));
  assert.ok(i5 > 0 && i2 > i5, 'oldest first');
  assert.equal(csv[i2], '2030-02-02,Expense,12,Cafes and restaurants,"lunch, with ""friends"""');
});

test('deleting a to-do, a meal, a transaction or an event can be undone', () => {
  const d = run(`todayISO()`);
  run(`saveTasks([{id: 'u1', title: 'Call', due: null, done: false, pri: 2}]); A.tkDel({dataset: {id: 'u1'}})`);
  assert.equal(run(`smartTasks().length`), 0);
  run(`A.undoApply()`);
  assert.equal(run(`smartTasks()[0].title`), 'Call');
  run(`mutDay('${d}', x => { x.meals = [{name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}]; }); A.delMeal({dataset: {i: '0'}})`);
  assert.equal(run(`getDay('${d}').meals.length`), 0);
  run(`A.undoApply()`);
  assert.equal(run(`getDay('${d}').meals.length`), 1);
  run(`addTx([{id: 'u2', date: '${d}', type: 'out', amount: 7, cat: 'Другое', note: 'x'}]); SH = {tx: {id: 'u2', date: '${d}'}}; A.txDel()`);
  assert.equal(run(`monthTx('${d}'.slice(0, 7)).some(t => t.id === 'u2')`), false);
  run(`A.undoApply()`);
  assert.equal(run(`monthTx('${d}'.slice(0, 7)).some(t => t.id === 'u2')`), true);
  setPlan([{id: 'ev1', date: d, title: 'Dentist', from: '15:00', until: '16:00'}]);
  run(`SH = null; A.evDel({dataset: {id: 'ev1'}})`);
  assert.equal(run(`allEvents().length`), 0);
  run(`A.undoApply()`);
  assert.equal(run(`allEvents()[0].title`), 'Dentist');
  run(`SH = null`);
});

const archives = () => JSON.parse(run(`JSON.stringify(Object.keys(S.docs).filter(k => k.startsWith('seasons/')))`));
const dayState = () => run(`JSON.stringify({days: dayKeys().map(k => [k, S.docs['days/' + k]]), season: S.docs['app/season'] || null})`);

test('finishing a season keeps a copy of the days first, and Undo puts everything back', async () => {
  const d0 = run(`addDays(todayISO(), -3)`), d1 = run(`todayISO()`);
  run(`mutDay('${d0}', x => { x.weight = 80; x.meals = [{id: 'm1', name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}]; }); mutDay('${d1}', x => { x.weight = 79.5; })`);
  await run(`loadCopies()`);
  const before = dayState(), had = archives();
  run(`SH = {}; globalThis.btn = {dataset: {}, innerHTML: '', textContent: ''}`);
  await run(`A.seasonEnd(btn)`);
  assert.ok(run(`dayKeys().length`) >= 2, 'the first tap only asks');
  assert.match(run(`btn.textContent`), /copy on this phone/);
  await run(`A.seasonEnd(btn)`);
  assert.equal(run(`dayKeys().length`), 0, 'the diary is cleared');
  const added = archives().filter(k => !had.includes(k));
  assert.equal(added.length, 1, 'one archive entry');
  const id = added[0].slice(8);
  assert.ok(run(`COPIES.includes('season_${id}')`));
  const copy = JSON.parse(await run(`blobGet('season_${id}').then(b => b.text())`));
  assert.equal(copy.app, 'kai', 'the copy has the format of a saved backup');
  assert.equal(copy.docs[`days/${d0}`].weight, 80);
  run(`A.undoApply()`);
  assert.equal(dayState(), before, 'every day and the season are as they were');
  assert.deepEqual(archives(), had, 'the archive entry is gone');
  await wait(0);
  assert.equal(await run(`blobGet('season_${id}')`), null, 'and so is the copy');
  assert.ok(!run(`COPIES.includes('season_${id}')`));
});

test("a finished season's days come back later, and what was written since is kept", async () => {
  const d0 = run(`addDays(todayISO(), -2)`), d1 = run(`todayISO()`);
  run(`mutDay('${d0}', x => { x.weight = 81; x.sleep = 7; }); mutDay('${d1}', x => { x.meals = [{id: 'a1', name: 'Oats', kcal: 350, p: 12, f: 6, c: 60}]; x.steps = 4000; x.tasks.push({id: 'tz', title: 'Stretch', cat: 'custom', done: true}); })`);
  const had = archives();
  run(`SH = {confirmEnd: true}`);
  await run(`A.seasonEnd({dataset: {}, innerHTML: '', textContent: ''})`);
  const id = archives().find(k => !had.includes(k)).slice(8), season = run(`JSON.stringify(S.docs['app/season'])`);
  run(`mutDay('${d1}', x => { x.meals.push({id: 'a2', name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}); x.steps = 6000; })`);
  run(`SH = {title: 'Season', body: seasonBody}`);
  assert.match(run(`seasonBody()`), new RegExp(`data-act="seasonBack" data-id="${id}"`), 'the archive offers the days back');
  await run(`A.seasonBack({dataset: {id: '${id}'}, innerHTML: '', textContent: ''})`);
  assert.equal(run(`S.docs['days/${d0}'].weight`), 81);
  assert.equal(run(`S.docs['days/${d0}'].sleep`), 7);
  assert.equal(run(`getDay('${d1}').steps`), 6000, 'a value written since stays');
  assert.deepEqual(JSON.parse(run(`JSON.stringify(getDay('${d1}').meals.map(m => m.id).sort())`)), ['a1', 'a2'], 'meals from both are there');
  assert.equal(run(`getDay('${d1}').tasks.find(t => t.id === 'tz')?.done`), true);
  assert.equal(run(`JSON.stringify(S.docs['app/season'])`), season, 'the new season goes on');
  assert.ok(run(`!!S.docs['seasons/${id}']`), 'the archive entry stays');
  assert.equal(await run(`blobGet('season_${id}')`), null, 'the copy is used up');
  assert.doesNotMatch(run(`seasonBody()`), /data-act="seasonBack"/);
  run(`SH = null`);
});

test("if the copy of the days can't be kept, finishing a season clears nothing", async () => {
  run(`mutDay(todayISO(), x => { x.weight = 78; })`);
  const before = dayState(), n = archives().length;
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = m => toasts.push(m); MEMB.set = () => { throw new Error('full'); }; SH = {confirmEnd: true}`);
  try { await run(`A.seasonEnd({dataset: {}, innerHTML: '', textContent: ''})`); }
  finally { run(`delete MEMB.set; toast = toast0; SH = null`); }
  assert.equal(dayState(), before);
  assert.equal(archives().length, n);
  assert.ok(run(`toasts.some(t => /nothing was cleared/.test(t))`), run(`toasts.join(' | ')`));
});

test('restoring a backup can be undone, and what it replaced is kept as a copy', async () => {
  const d = run(`addDays(todayISO(), -4)`);
  run(`mutDay('${d}', x => { x.weight = 77; x.steps = 9000; })`);
  const before = run(`JSON.stringify(S.docs['days/${d}'])`);
  const file = {app: 'kai', version: 1, docs: {[`days/${d}`]: {date: d, tasks: [], meals: [], weight: 70, steps: 100}, 'money/2031-01': {tx: [{id: 'imp', date: '2031-01-02', type: 'out', amount: 5, cat: 'Другое', note: ''}]}}};
  const pick = text => run(`CH.importData({files: [{text: async () => ${JSON.stringify(text)}}], value: 'x'})`);
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = (m, o) => toasts.push(m + (o?.action ? ' [' + o.action.label + ']' : ''))`);
  try {
    await pick(JSON.stringify(file));
    assert.equal(run(`S.docs['days/${d}'].weight`), 70, 'the file wins');
    assert.ok(run(`toasts.some(t => /Entries loaded: 2 \\[Undo\\]/.test(t))`), run(`toasts.join(' | ')`));
    const k = [...await run(`blobKeys()`)].filter(x => x.startsWith('preimport_')).sort().pop(); // the newest
    assert.ok(k, 'a copy of what it replaced');
    const kept = JSON.parse(await run(`blobGet('${k}').then(b => b.text())`)).docs;
    assert.deepEqual(Object.keys(kept), [`days/${d}`], 'only the record it replaced');
    assert.equal(kept[`days/${d}`].weight, 77);
    assert.match(run(`copyTitle('${k}')`), /^Before restoring a backup, /);
    run(`A.undoApply()`);
    assert.equal(run(`JSON.stringify(S.docs['days/${d}'])`), before);
    assert.equal(run(`S.docs['money/2031-01']`), undefined, 'records only in the file are gone again');
    run(`toasts.length = 0`);
    await pick('not json'); await pick('[1, 2]'); await pick('{"docs": {"days/x": 5}}');
    assert.equal(run(`toasts.filter(t => /Wrong file/.test(t)).length`), 3, run(`toasts.join(' | ')`));
  } finally { run(`toast = toast0`); }
});

test('deleting a class and the two resets (day schedule, calorie target) can be undone', () => {
  run(`save('app/plan', {...clone(plan()), classes: [{day: 1, time: '09:00', title: 'Math'}, {day: 2, time: '10:00', title: 'Art'}]}); A.clsDel2({dataset: {i: '0'}})`);
  assert.deepEqual(JSON.parse(run(`JSON.stringify(plan().classes.map(c => c.title))`)), ['Art']);
  run(`A.undoApply()`);
  assert.deepEqual(JSON.parse(run(`JSON.stringify(plan().classes.map(c => c.title))`)), ['Math', 'Art']);
  setProfile({age: 30, height: 175, weight: 80, goal: 'keep'});
  run(`save('app/profile', {...clone(profile()), override: {kcal: 2600}}); A.resetKcal()`);
  assert.equal(run(`profile().override?.kcal`), undefined);
  run(`A.undoApply()`);
  assert.equal(run(`profile().override.kcal`), 2600);
  run(`mutDay(todayISO(), d => { d.shift = {walk: 30}; }); A.tlResetDay()`);
  assert.deepEqual(JSON.parse(run(`JSON.stringify(getDay(todayISO()).shift)`)), {});
  run(`A.undoApply()`);
  assert.deepEqual(JSON.parse(run(`JSON.stringify(getDay(todayISO()).shift)`)), {walk: 30});
});

test('no "make a backup" nag while the account\'s cloud copy is up to date', () => {
  for (let i = 1; i <= 4; i++) run(`mutDay(addDays(todayISO(), -${i}), d => { d.steps = 1000; })`);
  run(`setMeta({onboardHidden: true, lastBackup: null})`);
  assert.match(run(`backupBanner()`), /No backup yet/, 'without an account: reminded');
  run(`globalThis.cfg3 = {...CFG}; globalThis.auth3 = AUTH; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k'; AUTH = {refresh: 'r'}; syncSave({owner: 'u', first: false, dirty: {}})`);
  try {
    assert.equal(run(`backupBanner()`), '');
    assert.equal(run(`onboardSteps().find(s => s[0] === 'backup')[2]`), true);
    run(`syncSave({owner: 'u', first: true, dirty: {}})`);
    assert.match(run(`backupBanner()`), /No backup yet/, 'before the first sync finishes: still reminded');
  } finally { run(`Object.assign(CFG, cfg3); CFG.supabaseUrl = ''; CFG.supabaseKey = ''; AUTH = auth3; syncSave(null); setMeta({onboardHidden: false})`); }
});

test('the first currency is guessed from the phone region, and stays editable', () => {
  const guess = lang => run(`(() => { const l0 = navigator.language; navigator.language = '${lang}'; try { return guessCurrency(); } finally { navigator.language = l0; } })()`);
  assert.equal(guess('en-US'), '$');
  assert.equal(guess('en-GB'), '£');
  assert.equal(guess('de-DE'), '€');
  assert.equal(guess('ru-RU'), '₽');
  assert.equal(guess('ru'), '₽', 'a language alone gives its likely region');
  assert.equal(guess('xx-QQ'), '', 'unknown: left empty');
  run(`SH = null; A.welcome()`);
  assert.equal(run(`SH.ob.cur`), run(`profile().currency || '$'`), 'onboarding starts with it filled in');
  run(`closeSheet()`);
});

test('the iPhone app explains every private thing it touches, so iOS never ends it', () => {
  const plist = readFileSync(new URL('../native/ios/App/App/Info.plist', import.meta.url), 'utf8');
  for (const k of ['NSHealthShareUsageDescription', 'NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription'])
    assert.match(plist, new RegExp(`<key>${k}</key>\\s*<string>[^<]{20,}</string>`), `${k} with a real explanation`);
});

test('the iPhone app ships a privacy manifest that says why it reads file dates and stored settings', () => {
  const m = readFileSync(new URL('../native/ios/App/App/PrivacyInfo.xcprivacy', import.meta.url), 'utf8');
  assert.match(m, /NSPrivacyAccessedAPICategoryFileTimestamp<\/string>\s*<key>NSPrivacyAccessedAPITypeReasons<\/key>\s*<array>\s*<string>C617\.1/);
  assert.match(m, /NSPrivacyAccessedAPICategoryUserDefaults<\/string>\s*<key>NSPrivacyAccessedAPITypeReasons<\/key>\s*<array>\s*<string>CA92\.1/);
  assert.match(m, /<key>NSPrivacyTracking<\/key>\s*<false\/>/, 'no tracking');
  const proj = readFileSync(new URL('../native/ios/App/App.xcodeproj/project.pbxproj', import.meta.url), 'utf8');
  assert.match(proj, /PrivacyInfo\.xcprivacy in Resources \*\/,/, 'copied into the app');
});

test('the permission texts are in Russian too, for every key in Info.plist', () => {
  const plist = readFileSync(new URL('../native/ios/App/App/Info.plist', import.meta.url), 'utf8');
  const ru = readFileSync(new URL('../native/ios/App/App/ru.lproj/InfoPlist.strings', import.meta.url), 'utf8');
  const keys = [...plist.matchAll(/<key>(NS\w+UsageDescription)<\/key>/g)].map(m => m[1]);
  assert.ok(keys.length >= 4);
  for (const k of keys) assert.match(ru, new RegExp(`^${k} = "[^"]*[А-Яа-яЁё][^"]*";$`, 'm'), k);
  const proj = readFileSync(new URL('../native/ios/App/App.xcodeproj/project.pbxproj', import.meta.url), 'utf8');
  assert.match(proj, /InfoPlist\.strings in Resources \*\/,/);
  assert.match(proj, /knownRegions = \([^)]*\bru,/);
});

test('a downloaded update offers a one-tap reload, and an app left open checks again when it returns', () => {
  const L = {}, worker = {state: 'installing', addEventListener: (t, f) => { L['w' + t] = f; }};
  const reg = {installing: worker, update: () => { L.updates = (L.updates || 0) + 1; return Promise.resolve(); }, addEventListener: (t, f) => { L[t] = f; }};
  run(`globalThis.toasts = []; globalThis.toast0 = toast; toast = (m, o) => toasts.push([m, o?.action?.act]); navigator.serviceWorker = {controller: {}}; globalThis.now0 = Date.now`);
  try {
    run(`swReady`)(reg);
    L.updatefound(); worker.state = 'installed'; L.wstatechange();
    assert.deepEqual(JSON.parse(run(`JSON.stringify(toasts)`)), [['A new version of KAI is ready', 'appReload']]);
    run(`swCheck()`); assert.equal(L.updates, undefined, 'not again right away');
    run(`Date.now = () => now0() + 2 * 3600e3; swCheck()`); assert.equal(L.updates, 1, 'an hour later, it checks');
    run(`swCheck()`); assert.equal(L.updates, 1, 'and then waits again');
  } finally { run(`Date.now = now0; toast = toast0; delete navigator.serviceWorker; SW_REG = null`); }
});

test('the weekly summary leads with something real, never "0 min", and leaves out empty tiles', () => {
  const plan = st => JSON.parse(run(`JSON.stringify(recapPlan(${JSON.stringify(st)}))`));
  const base = {total: 0, walk: 0, gym: 0, study: 0, active: 2, tasks: 23, streak: 1};
  const a = plan(base);
  assert.equal(a.head, '23'); assert.equal(a.headLabel, 'tasks done this week');
  assert.deepEqual(a.tiles.map(t => t[1]), ['active days', 'days in a row'], 'no zero-minute tiles, and the tasks are not shown twice');
  const b = plan({...base, total: 130, walk: 90, gym: 40});
  assert.equal(b.head, '2.2 h'); assert.equal(b.headLabel, 'invested this week');
  assert.deepEqual(b.tiles.map(t => t[1]), ['walking', 'gym', 'active days', 'tasks done', 'days in a row']);
  const c = plan({...base, total: 130, walk: 90, gym: 40, focus: 3});
  assert.deepEqual(c.tiles.map(t => t[1]), ['walking', 'gym', 'active days', 'tasks done', 'focus sessions', 'days in a row'], 'focus sessions when there were any');
  assert.equal(plan({...base, total: 200, walk: 50, gym: 50, study: 100, focus: 2}).tiles.length, 6, 'never more than six tiles');
});

test('after Sign in with Apple, the one-time code goes to the server so the account can be revoked later; sign-in never waits for it', async () => {
  Object.assign(run('globalThis'), {crypto, TextEncoder}); // Sign in with Apple hashes its one-time nonce with Web Crypto
  run(`globalThis.calls = []; globalThis.ac0 = authCall; globalThis.af1 = apiFetch; globalThis.cfg4 = {...CFG}; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k';
    authCall = async () => ({ok: true, d: {access_token: 'a', refresh_token: 'r', expires_in: 3600, user: {id: 'u1', email: ''}}});
    apiFetch = async (path, o) => { calls.push([path, o.body]); return {ok: true, status: 200, json: async () => ({})}; };
    window.Capacitor = {isNativePlatform: () => true, Plugins: {SignInWithApple: {authorize: async () => ({response: {identityToken: 'id', authorizationCode: 'code-1'}})}}};
    globalThis.auth5 = AUTH; SH = null`);
  try {
    await run(`A.authApple({dataset: {}, innerHTML: '', textContent: ''})`);
    await wait(10);
    assert.equal(run(`AUTH.id`), 'u1', 'signed in');
    assert.deepEqual(JSON.parse(run(`JSON.stringify(calls)`)), [['/functions/v1/apple-token', '{"code":"code-1"}']]);
    run(`calls.length = 0; apiFetch = async () => { throw new Error('offline'); }`);
    await run(`A.authApple({dataset: {}, innerHTML: '', textContent: ''})`);
    await wait(10);
    assert.equal(run(`AUTH.id`), 'u1', 'a failed hand-over changes nothing');
  } finally { run(`authCall = ac0; apiFetch = af1; delete window.Capacitor; Object.assign(CFG, cfg4); CFG.supabaseUrl = ''; CFG.supabaseKey = ''; AUTH = auth5; lsSet('kai_auth', null); syncSave(null); clearTimeout(syncTimer)`); }
});

test('text size: up to 120%, never so large that a small screen clips, and "as on the phone" by default', () => {
  const scale = (pref, width) => run(`(() => { const g = globalThis; g.screen = {width: ${width}}; ${pref ? `localStorage.setItem('kai_text', '${pref}')` : `localStorage.removeItem('kai_text')`}; try { return textScale(); } finally { delete g.screen; localStorage.removeItem('kai_text'); } })()`);
  assert.equal(scale('120', 390), 1.2);
  assert.equal(scale('110', 390), 1.1);
  assert.equal(scale('150', 390), 1.2, 'capped');
  assert.equal(scale('120', 320), 1, 'an iPhone SE keeps 100%');
  assert.equal(scale('120', 375), 1.2);
  assert.equal(scale(null, 390), 1, 'follows the phone, which here has no text size to report');
  assert.equal(run(`textPref()`), 'system');
});

test('text people type is shown as text on every screen, never as markup', () => {
  const X = '<img src=x onerror=alert(1)>';
  const d = run(`todayISO()`);
  run(`(() => { const X = ${JSON.stringify(X)};
    save('app/profile', {...clone(profile()), name: X, about: X});
    saveTasks([{id: 'x1', title: X, due: '${d}', time: '10:00', done: false, pri: 2}, {id: 'x2', title: X, due: null, done: false, pri: 2}]);
    const p = clone(plan()); p.routine = clone(DEFAULT_ROUTINE); p.routine.events = [{id: 'xe', date: '${d}', title: X, kind: 'exam', from: '09:00', until: '10:00'}]; p.classes = [{day: dow('${d}'), time: '12:00', title: X}]; p.dailyTasks = [...(p.dailyTasks || []), {id: 'xd', title: X, cat: 'custom'}]; save('app/plan', p);
    mutDay('${d}', x => { x.meals = [{id: 'xm', name: X, kcal: 100, p: 1, f: 1, c: 1}]; x.note = X; });
    addTx([{id: 'xt', date: '${d}', type: 'out', amount: 5, cat: X, note: X}]);
    save('kb/xk', {title: X, text: X, summary: X, date: '${d}'});
    save('app/season', {...season(), title: X, goals: [X]});
    save('seasons/xs', {title: X, start: '${d}', end: '${d}', goals: [X], avg: 0, gym: 0});
    save('app/bills', {list: [{id: 'xb', title: X, amount: 9, type: 'out', cat: 'Подписки', day: 1}]});
    saveTasks([...smartTasks(), {id: 'x3', title: X, due: '${d}', done: true, doneAt: '${d}', pri: 2, every: 'week'}]); S.open.tk_done = true;
    SH = {txq: 'img'};
  })()`);
  const screens = {day: `viewDay()`, health: `(S.sub.health = 'food', viewHealth())`, train: `(S.sub.health = 'train', viewHealth())`, money: `viewMoney()`, more: `viewMore()`, season: `seasonBody()`, top: `(renderTop(), document.querySelector('#top').innerHTML || '')`,
    bills: `billsCard(curMonth())`, search: `txFindList()`, billSheet: `(SH = {bill: bills()[0]}, billSheetBody())`, reminders: `remindGroups()`};
  for (const [name, src] of Object.entries(screens)) {
    const html = run(src);
    assert.ok(!/<img src=x/i.test(html), `${name} renders a typed <img> as markup`);
  }
  assert.match(run(`viewDay()`), /&lt;img src=x/, 'it is there, as text');
  run(`SH = null; S.open.tk_done = false; save('app/bills', {list: []})`);
});

test('Tell KAI explains what works without AI the first time, then keeps it to one line', () => {
  run(`setMeta({toldOnce: false})`);
  assert.match(run(`connectNudge(true)`), /Without AI I understand sleep/);
  run(`setMeta({toldOnce: true})`);
  const h = run(`connectNudge(true)`);
  assert.doesNotMatch(h, /Without AI I understand/);
  assert.match(h, /Reading on the phone: simple messages\..*data-act="aiConnect"/);
});

test('on a weight-loss goal, rising weight is called rising, not "too slow", and the advice stays a small, floored cut', () => {
  setProfile({age: 30, height: 178, weight: 80, sex: 'm', goal: 'lose', activity: 1.45, units: 'metric'});
  for (let i = 0; i < 10; i++) run(`mutDay(addDays(todayISO(), -${i}), d => { d.meals = [{id: 'r${i}', name: 'Soup', kcal: 2000, p: 120, f: 60, c: 240}]; })`);
  run(`globalThis.wt1 = weightTrend`);
  try {
    run(`weightTrend = () => ({rate: 0.45, perWeek: 0.35})`);
    const up = JSON.parse(run(`JSON.stringify(adaptiveAdvice())`));
    assert.match(up.text, /Weight is going up while the goal is to lose/);
    assert.equal(up.up, true);
    assert.equal(up.kcal, run(`targets().kcal`) - 150, 'about 150 kcal less');
    assert.ok(up.kcal >= 1200, 'never below the floor');
    assert.match(run(`adaptiveCard()`), />Going up</);
    run(`weightTrend = () => ({rate: -0.1, perWeek: -0.08})`);
    const slow = JSON.parse(run(`JSON.stringify(adaptiveAdvice())`));
    assert.match(slow.text, /too slow/); assert.ok(!slow.up);
    assert.match(run(`adaptiveCard()`), />Slow</);
  } finally { run(`weightTrend = wt1`); setProfile({age: 30, height: 175, weight: 80, goal: 'keep', units: 'metric'}); }
});

test('bar charts label their axis with round numbers', () => {
  const t = v => run(`niceTop(${v})`);
  assert.equal(t(2130 * 1.05), 2500);
  assert.equal(t(12000 * 1.05), 15000);
  assert.equal(t(8.5 * 1.05), 10);
  assert.equal(t(0.7), 0.8);
  assert.equal(t(1), 1);
  assert.equal(t(0), 1);
  const svg = run(`barChart([{x: 'Mon', y: 1240}, {x: 'Tue', y: 1300}], {target: 2130})`);
  assert.match(svg, />2,500</); assert.match(svg, />1,250</);
});

test('without an AI that reads pictures, the note says how to get one in this setup, and the offline note names no provider', () => {
  assert.match(run(`imgNote(true)`), /Claude or ChatGPT/, 'no server: connect a key');
  run(`globalThis.cfg6 = {...CFG}; CFG.supabaseUrl = 'https://example.test'; CFG.supabaseKey = 'k'`);
  try { assert.match(run(`imgNote(true)`), /KAI's AI: sign in/); assert.match(run(`imgNote(false)`), /KAI's AI: sign in/); }
  finally { run(`Object.assign(CFG, cfg6); CFG.supabaseUrl = ''; CFG.supabaseKey = ''`); }
  const app = readFileSync(new URL('../kai/app.js', import.meta.url), 'utf8');
  const offline = app.match(/tr\("(Нет интернета\.[^"]*)"\)/)[1];
  assert.equal(run(`tr(${JSON.stringify(offline)})`), 'No internet. Everything works and saves on your phone; AI requests will wait in the queue.');
});

test('the budget card says what is left and roughly how much a day, in plain English', () => {
  run(`save('app/profile', {...profile(), currency: '$'}); save('app/budget', {monthly: 600})`);
  try {
    const m = run(`todayISO().slice(0, 7)`), daysLeft = run(`(() => { const [y, mm] = todayISO().split('-').map(Number); return new Date(y, mm, 0).getDate() - new Date().getDate() + 1; })()`);
    const h = run(`budgetCard('${m}', 515)`);
    assert.match(h, /Left: \$85/);
    assert.match(h, new RegExp(`about \\$${Math.floor(85 / daysLeft)} a day until the end of the month`));
    assert.match(run(`budgetCard('${m}', 700)`), /Over budget|Overspent|−\$100|-\$100/);
  } finally { run(`remove('app/budget')`); }
});

test('numbers and labels read cleanly: thousands separators, true minus signs, no stray separators, no supplements while off', () => {
  setProfile({age: 30, height: 178, weight: 80, sex: 'm', goal: 'keep', activity: 1.45, units: 'metric'});
  const d = run(`todayISO()`);
  run(`mutDay('${d}', x => { x.meals = [{id: 'nm', name: 'Soup', kcal: 300, p: 10, f: 5, c: 40}]; })`);
  const food = run(`(S.sub.health = 'food', viewHealth())`);
  assert.match(food, /<div class="s">P 10 · F 5 · C 40/, 'no leading separator without a portion');
  assert.match(run(`taskSub({cat: 'food'}, getDay('${d}'))`), /^300 \/ \d,\d{3} kcal · protein 10 \/ \d+ g$/, 'the target has a thousands separator');
  run(`globalThis.wt2 = weightTrend; weightTrend = () => ({rate: -0.18, perWeek: -0.14})`);
  try { setProfile({age: 30, height: 178, weight: 80, sex: 'm', goal: 'keep', units: 'metric'}); assert.match(run(`adaptiveAdvice().text`), /changing by −0\.18% a week \(−0\.14 kg\)/); }
  finally { run(`weightTrend = wt2`); }
  run(`save('app/plan', {...clone(plan()), dailyTasks: [...plan().dailyTasks.filter(t => t.cat !== 'supps'), {id: 'supps', title: 'Take supplements', cat: 'supps'}]}); S.open = {acc_tasks: true}`);
  assert.doesNotMatch(run(`viewMore()`), /Take supplements/, 'switched off, so not listed');
  run(`S.open = {}`);
});

test('Focus: only focused minutes count as study, time away is measured, and a glance away is not a distraction', () => {
  const T0 = Date.UTC(2030, 0, 9, 9, 0);
  run(`globalThis.now0 = Date.now; globalThis.T = ${T0}; Date.now = () => T; globalThis.toasts = []; globalThis.toast1 = toast; toast = m => toasts.push(m)`);
  const day = run(`iso(${T0})`), studyBefore = run(`getDay('${day}').timeExtra?.study || 0`);
  try {
    run(`focusStart(25, 'Algebra')`);
    assert.equal(run(`FOCUS.label`), 'Algebra');
    assert.ok(run(`JSON.parse(localStorage.getItem('kai_focus')).end`) > 0, 'kept across restarts');
    run(`T += 5 * 60000; focusVisibility(true); T += 2000; focusVisibility(false)`);
    assert.equal(run(`FOCUS.leaves`), 0, 'two seconds away is a glance');
    run(`T += 3 * 60000; focusVisibility(true)`);
    assert.ok(run(`buildReminders(T).some(r => r.key === 'focus_back')`), 'a nudge back while away');
    assert.ok(run(`buildReminders(T).some(r => r.key === 'focus_end')`));
    run(`T += 4 * 60000; focusVisibility(false)`);
    assert.equal(run(`FOCUS.leaves`), 1);
    assert.ok(!run(`buildReminders(T).some(r => r.key === 'focus_back')`), 'back: no nudge');
    assert.equal(run(`focusMinutes()`), 8, '12 minutes passed, 4 of them away');
    run(`T += 20 * 60000; focusTick()`);
    assert.equal(run(`FOCUS`), null, 'ends on its own');
    assert.equal(run(`getDay('${day}').timeExtra.study`) - studyBefore, 21, '25 minutes, 4 away');
    assert.match(run(`toasts.join(' | ')`), /Focus: 21 of 25 min · 1 distraction, 4 min away from the app/);
  } finally { run(`Date.now = now0; toast = toast1; FOCUS = null; focusSave()`); }
});

test('Focus: a session survives the app being closed, and the time it was closed counts as away', () => {
  const T0 = Date.UTC(2030, 0, 10, 9, 0);
  run(`globalThis.now0 = Date.now; globalThis.T = ${T0}; Date.now = () => T; globalThis.toast2 = toast; toast = () => {}`);
  const day = run(`iso(${T0})`), before = run(`getDay('${day}').timeExtra?.study || 0`);
  try {
    run(`focusStart(45, 'Essay'); T += 10 * 60000; focusVisibility(true); FOCUS_IV && clearInterval(FOCUS_IV); FOCUS = JSON.parse(localStorage.getItem('kai_focus'))`);
    run(`T += 60 * 60000; focusResume()`);
    assert.equal(run(`FOCUS`), null);
    assert.equal(run(`getDay('${day}').timeExtra.study`) - before, 10, 'only the ten minutes before leaving count');
    run(`focusStart(25, 'x'); T += 6 * 60000; A.focusEnd()`);
    assert.equal(run(`getDay('${day}').timeExtra.study`) - before, 16, 'ending early keeps what was done');
  } finally { run(`Date.now = now0; toast = toast2; FOCUS = null; focusSave()`); }
});

test('Focus on a to-do: minutes go to the topic, marking it done adds only what is left, and the week adds up', () => {
  const T0 = Date.UTC(2030, 0, 11, 9, 0);
  run(`globalThis.now0 = Date.now; globalThis.T = ${T0}; Date.now = () => T; globalThis.toasts3 = []; globalThis.toast3 = toast; toast = (m, o) => toasts3.push([m, o?.action?.act])`);
  const day = run(`iso(${T0})`);
  try {
    const p = JSON.parse(run(`JSON.stringify(clone(plan()))`)); p.routine = p.routine || JSON.parse(run(`JSON.stringify(DEFAULT_ROUTINE)`));
    p.routine.events = [{id: 'fx', date: '2030-01-20', title: 'Physics', kind: 'exam', from: '10:00'}];
    run(`save('app/plan', ${JSON.stringify(p)}); saveTasks([{id: 'tp', title: 'Physics: optics', due: '${day}', done: false, pri: 2, examId: 'fx', topic: 'optics', perTopic: 60}])`);
    const before = run(`getDay('${day}').timeExtra?.study || 0`);
    run(`focusStart(25, 'Physics: optics', 'tp'); T += 25 * 60000; focusTick()`);
    assert.equal(run(`smartTasks().find(t => t.id === 'tp').focusMin`), 25);
    assert.equal(run(`allEvents().find(e => e.id === 'fx').prepMin`), 25, 'exam prep counts the focus');
    assert.deepEqual(JSON.parse(run(`JSON.stringify(toasts3.at(-1))`))[1], 'focusTaskDone', 'offers to mark it done');
    run(`A.focusTaskDone()`);
    assert.equal(run(`smartTasks().find(t => t.id === 'tp').done`), true);
    assert.equal(run(`getDay('${day}').timeExtra.study`) - before, 25, 'marked done today: the remaining 35 go to today, not this day twice');
    assert.equal(run(`allEvents().find(e => e.id === 'fx').prepMin`), 60, "the topic's hour counts once");
    assert.equal(run(`getDay('${day}').focus.at(-1).min`), 25, 'the session is on record');
  } finally { run(`Date.now = now0; toast = toast3; FOCUS = null; focusSave()`); }
});

test('the morning plan: off until turned on, then the day in one line, and nothing on an empty day', () => {
  const tom = run(`addDays(todayISO(), 1)`);
  run(`saveTasks([{id: 'mp1', title: 'Essay', due: '${tom}', done: false, pri: 2}])`);
  setPlan([{id: 'mpx', date: run(`addDays(todayISO(), 4)`), title: 'Chemistry', kind: 'exam', from: '10:00'}]);
  run(`saveTasks([{id: 'mp1', title: 'Essay', due: '${tom}', done: false, pri: 2}])`);
  assert.ok(!reminders().some(r => r.key.startsWith('m')), 'off by default');
  run(`setMeta({remind: {...(meta().remind || {}), morning: true}})`);
  try {
    const m = reminders().find(r => r.key === 'm' + tom);
    assert.ok(m, 'tomorrow morning');
    assert.equal(m.title, 'Your day');
    assert.match(m.body, /1 task/);
    assert.match(m.body, /“Chemistry” in 3 days/);
    const line = run(`morningLine(addDays(todayISO(), 30))`);
    assert.equal(line, '', 'an empty day says nothing');
  } finally { run(`setMeta({remind: {...(meta().remind || {}), morning: false}}); saveTasks([])`); }
});

test('a calendar file becomes classes and events: weekly lessons, exams and deadlines, nothing past or cancelled', () => {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0',
    'BEGIN:VEVENT', 'SUMMARY:Linear Algebra', 'LOCATION:Room 204\\, Main building', 'DTSTART;TZID=Europe/Somewhere:20300107T090000', 'DTEND;TZID=Europe/Somewhere:20300107T103000', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20300530T000000Z', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Old seminar', 'DTSTART:20290901T120000', 'RRULE:FREQ=WEEKLY;UNTIL=20291220T000000Z', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Final exam: Physi', ' cs', 'DTSTART:20300120T100000', 'DTEND:20300120T120000', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Essay due', 'DTSTART;VALUE=DATE:20300115', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Past party', 'DTSTART:20291201T190000', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Cancelled talk', 'STATUS:CANCELLED', 'DTSTART:20300110T190000', 'END:VEVENT',
    ...['20300103', '20300110', '20300117'].flatMap(d => ['BEGIN:VEVENT', 'SUMMARY:Chemistry lab', `DTSTART:${d}T140000`, `DTEND:${d}T160000`, 'END:VEVENT']),
    'END:VCALENDAR'].join('\r\n');
  const r = JSON.parse(run(`JSON.stringify(parseIcs(${JSON.stringify(ics)}, '2030-01-01'))`));
  assert.deepEqual(r.classes, [
    {day: 1, time: '09:00', end: '10:30', title: 'Linear Algebra, Room 204, Main building'},
    {day: 3, time: '09:00', end: '10:30', title: 'Linear Algebra, Room 204, Main building'},
    {day: 4, time: '14:00', end: '16:00', title: 'Chemistry lab'},
  ]);
  assert.deepEqual(r.events, [
    {date: '2030-01-15', title: 'Essay due', kind: 'deadline'},
    {date: '2030-01-20', title: 'Final exam: Physics', kind: 'exam', from: '10:00', until: '12:00'},
  ]);
  setPlan();
  run(`SH = {ics: icsNew(parseIcs(${JSON.stringify(ics)}, '2030-01-01'))}; A.icsApply()`);
  assert.equal(run(`plan().classes.length`), 3);
  assert.ok(run(`allEvents().some(e => e.title === 'Final exam: Physics' && e.kind === 'exam')`));
  assert.equal(run(`icsNew(parseIcs(${JSON.stringify(ics)}, '2030-01-01')).classes.length`), 0, 'importing again adds nothing twice');
  run(`A.undoApply()`);
  assert.equal(run(`plan().classes.length`), 0, 'and it can be undone');
  run(`SH = null`);
});

test('Focus from an exam card adds the focused minutes to that exam\'s preparation', () => {
  const T0 = Date.UTC(2030, 0, 12, 9, 0);
  run(`globalThis.now0 = Date.now; globalThis.T = ${T0}; Date.now = () => T; globalThis.toast4 = toast; toast = () => {}`);
  try {
    setPlan([{id: 'ex9', date: '2030-01-25', title: 'Biology', kind: 'exam', from: '09:00'}]);
    run(`A.focusSheet({dataset: {exam: 'ex9', l: 'Biology'}}); SH.fm = 45; A.focusGo()`);
    assert.equal(run(`FOCUS.exam`), 'ex9');
    run(`T += 45 * 60000; focusTick()`);
    assert.equal(run(`allEvents().find(e => e.id === 'ex9').prepMin`), 45);
  } finally { run(`Date.now = now0; toast = toast4; FOCUS = null; focusSave(); SH = null`); }
});

// form fields for handlers that read the sheet: {'#id': value}, and true for a switch that is on
const withForm = (vals, fn) => {
  run(`globalThis.FORM = ${JSON.stringify(vals)}`);
  try { return fn(); } finally { run(`delete globalThis.FORM`); }
};
const monthsAgo = n => run(`(() => { const [y, m] = curMonth().split('-').map(Number), d = new Date(y, m - 1 - ${n}, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); })()`);

test('Regular payments: due, still to come, paid and skipped, with the 31st falling on the last day of a short month', () => {
  run(`save('app/bills', {list: [{id: 'b1', title: 'Rent', amount: 400, type: 'out', cat: 'Жильё и коммуналка', day: 31}]}); save('money/2030-02', {tx: []}); save('money/2030-03', {tx: []})`);
  try {
    assert.equal(run(`billDue(bills()[0], '2030-02')`), '2030-02-28');
    assert.equal(run(`billState(bills()[0], '2030-02-27')`), 'soon');
    assert.equal(run(`billState(bills()[0], '2030-02-28')`), 'due');
    assert.equal(run(`billsPending('2030-02-10')`), 400);
    run(`addTx([{id: 'p1', type: 'out', amount: 400, date: '2030-02-28', cat: 'Жильё и коммуналка', note: 'Rent', bill: 'b1'}])`);
    assert.equal(run(`billState(bills()[0], '2030-02-28')`), 'paid');
    assert.equal(run(`billsPending('2030-02-28')`), 0);
    assert.equal(run(`billState(bills()[0], '2030-03-31')`), 'due', 'the next month is due again');
    run(`save('app/bills', {list: [{...bills()[0], skip: ['2030-03']}]})`);
    assert.equal(run(`billState(bills()[0], '2030-03-31')`), 'skip');
    assert.equal(run(`billsPending('2030-03-31')`), 0);
  } finally { run(`remove('money/2030-02'); remove('money/2030-03'); save('app/bills', {list: []})`); }
});

test('Regular payments: one tap records the payment once, on its due day, and Undo takes it back', () => {
  const m = run(`curMonth()`);
  run(`globalThis.money0 = clone(S.docs['money/${m}'] || {tx: []}); save('money/${m}', {tx: []}); save('app/bills', {list: [{id: 'b2', title: 'Phone plan', amount: 15, type: 'out', cat: 'Связь и интернет', day: 1}]}); globalThis.toastB = toast; toast = () => {}`);
  try {
    assert.equal(run(`billState(bills()[0])`), 'due');
    run(`A.billPay({dataset: {id: 'b2'}}); A.billPay({dataset: {id: 'b2'}})`);
    const tx = JSON.parse(run(`JSON.stringify(monthTx('${m}'))`));
    assert.equal(tx.length, 1, 'a double tap records it once');
    assert.deepEqual([tx[0].date, tx[0].amount, tx[0].bill, tx[0].note, tx[0].type], [m + '-01', 15, 'b2', 'Phone plan', 'out']);
    assert.equal(run(`billState(bills()[0])`), 'paid');
    run(`A.undoApply()`);
    assert.equal(run(`monthTx('${m}').length`), 0);
    assert.equal(run(`billState(bills()[0])`), 'due');
  } finally { run(`toast = toastB; save('money/${m}', money0); save('app/bills', {list: []})`); }
});

test('Regular payments: a new one is linked to the entry already written this month, and "Every month" on an entry makes one', () => {
  const m = run(`curMonth()`), d = run(`todayISO()`);
  run(`globalThis.money1 = clone(S.docs['money/${m}'] || {tx: []}); save('money/${m}', {tx: [{id: 'r0', type: 'out', amount: 400, date: '${m}-01', cat: 'Другое', note: 'Rent'}]}); save('app/bills', {list: []}); globalThis.toastC = toast; toast = () => {}`);
  try {
    withForm({'#blT': 'Rent', '#blA': '400', '#blD': '1', '#blC': 'Жильё и коммуналка'}, () => run(`A.billNew(); A.billSave()`));
    const b = JSON.parse(run(`JSON.stringify(bills())`));
    assert.equal(b.length, 1);
    assert.deepEqual([b[0].title, b[0].amount, b[0].day, b[0].cat], ['Rent', 400, 1, 'Жильё и коммуналка']);
    assert.equal(run(`monthTx('${m}').length`), 1, 'not recorded twice');
    assert.equal(run(`monthTx('${m}')[0].bill`), b[0].id);
    assert.equal(run(`billState(bills()[0])`), 'paid');
    withForm({'#txA': '9.99', '#txD': d, '#txC': 'Подписки', '#txN': 'Music', '#txRep': true}, () => run(`A.txAdd(); A.txSave()`));
    const music = JSON.parse(run(`JSON.stringify(bills().find(x => x.title === 'Music'))`));
    assert.deepEqual([music.day, music.amount, music.cat], [+d.slice(8), 9.99, 'Подписки']);
    const id = run(`monthTx('${m}').find(t => t.note === 'Music').id`);
    assert.equal(run(`monthTx('${m}').find(t => t.note === 'Music').bill`), music.id);
    withForm({'#txA': '10.99', '#txD': d, '#txC': 'Подписки', '#txN': 'Music'}, () => run(`S.moneyMonth = '${m}'; A.txEdit({dataset: {id: '${id}'}}); A.txSave()`));
    assert.equal(run(`monthTx('${m}').find(t => t.note === 'Music').bill`), music.id, 'editing the entry keeps it linked');
    assert.equal(run(`bills().length`), 2, 'and makes no second payment');
    withForm({'#blT': '', '#blA': '5', '#blD': '3'}, () => run(`A.billNew(); A.billSave()`));
    withForm({'#blT': 'Gym', '#blA': '30', '#blD': '32'}, () => run(`A.billNew(); A.billSave()`));
    assert.equal(run(`bills().length`), 2, 'no name or a day past 31 is refused');
  } finally { run(`toast = toastC; SH = null; save('money/${m}', money1); save('app/bills', {list: []})`); }
});

test('Regular payments: the budget sets aside what is still to pay', () => {
  const m = run(`curMonth()`), d = +run(`todayISO()`).slice(8), days = +run(`new Date(${m.slice(0, 4)}, ${+m.slice(5)}, 0).getDate()`);
  run(`globalThis.budget0 = S.docs['app/budget']; save('app/budget', {monthly: 1000}); save('app/bills', {list: [{id: 'b5', title: 'Rent', amount: 600, type: 'out', cat: 'Жильё и коммуналка', day: 28}]})`);
  try {
    let h = run(`budgetCard('${m}', 100)`);
    assert.ok(h.includes(run(`trf('· из них {s} на регулярные платежи', {s: money(600)})`)));
    assert.ok(h.includes(run(`trf('· в день можно {d} до конца месяца', {d: money(${Math.floor(300 / (days - d + 1))})})`)), 'the daily amount leaves the rent aside');
    run(`save('app/budget', {monthly: 500})`);
    h = run(`budgetCard('${m}', 100)`);
    assert.ok(h.includes(run(`trf('· регулярные платежи ({s}) больше остатка', {s: money(600)})`)));
    assert.ok(!h.includes(run(`tr('· в день можно {d} до конца месяца').split('{d}')[0]`)), 'no daily amount when the payments take it all');
  } finally { run(`budget0 ? save('app/budget', budget0) : remove('app/budget'); save('app/bills', {list: []})`); }
});

test('Regular payments: what is paid once a month around the same day is suggested; daily coffee and turned-down ideas are not', () => {
  const ms = ['2030-03', '2030-04', '2030-05'];
  run(`save('app/bills', {list: []}); ${JSON.stringify(ms)}.forEach((m, i) => save('money/' + m, {tx: [
    {id: 'n' + i, type: 'out', amount: 11, date: m + '-0' + (4 + i), cat: 'Подписки', note: 'Netflix'},
    {id: 'c' + i, type: 'out', amount: 3, date: m + '-10', cat: 'Кафе и рестораны', note: 'Coffee'},
    {id: 'd' + i, type: 'out', amount: 3, date: m + '-11', cat: 'Кафе и рестораны', note: 'Coffee'},
    {id: 'v' + i, type: 'out', amount: 20 + i, date: m + '-12', cat: 'Другое', note: 'Haircut'},
    ...(i ? [{id: 'g' + i, type: 'in', amount: 900, date: m + '-0' + i, cat: 'Доход', note: 'Allowance'}] : []),
  ]}))`);
  try {
    const notes = () => JSON.parse(run(`JSON.stringify(billIdeas('2030-06-15').map(x => x.t.note))`));
    assert.deepEqual(notes(), ['Allowance', 'Netflix'], 'the biggest first; coffee twice a month and a changing amount are not monthly');
    run(`A.billNo({dataset: {k: billIdeas('2030-06-15')[1].key}})`);
    assert.deepEqual(notes(), ['Allowance'], 'turned down once, not offered again');
    assert.ok(!run(`billIdeas('2030-09-15').length`), 'nothing from months too long ago');
  } finally { run(`${JSON.stringify(ms)}.forEach(m => remove('money/' + m)); save('app/bills', {list: []})`); }
});

test('Regular payments: taking a suggestion adds it with its usual day and links this month\'s entry', () => {
  const m = run(`curMonth()`), a = monthsAgo(1), b = monthsAgo(2);
  run(`globalThis.money2 = clone(S.docs['money/${m}'] || {tx: []}); save('app/bills', {list: []}); globalThis.toastD = toast; toast = () => {};
    save('money/${b}', {tx: [{id: 'k1', type: 'out', amount: 25, date: '${b}-05', cat: 'Связь и интернет', note: 'Internet'}]});
    save('money/${a}', {tx: [{id: 'k2', type: 'out', amount: 25, date: '${a}-06', cat: 'Связь и интернет', note: 'Internet'}]});
    save('money/${m}', {tx: [{id: 'k3', type: 'out', amount: 25, date: '${m}-01', cat: 'Связь и интернет', note: 'internet'}]})`);
  try {
    const it = JSON.parse(run(`JSON.stringify(billIdeas()[0])`));
    assert.equal(it.t.note, 'Internet');
    assert.ok(run(`billsCard(curMonth())`).includes('data-act="billIdea"'), 'the Money tab offers it');
    run(`A.billIdea({dataset: {k: ${JSON.stringify(it.key)}}})`);
    const bl = JSON.parse(run(`JSON.stringify(bills())`));
    assert.deepEqual([bl.length, bl[0].title, bl[0].day, bl[0].amount], [1, 'Internet', 6, 25]);
    assert.equal(run(`monthTx('${m}')[0].bill`), bl[0].id, 'this month\'s entry is the payment');
    assert.equal(run(`billIdeas().length`), 0);
    assert.ok(!run(`billsCard(curMonth())`).includes('data-act="billIdea"'));
  } finally { run(`toast = toastD; remove('money/${a}'); remove('money/${b}'); save('money/${m}', money2); save('app/bills', {list: []})`); }
});

test('Regular payments: a reminder at 10:00 on the day and a mention in the morning plan, until it is paid', () => {
  const tmr = run(`addDays(todayISO(), 1)`), m = tmr.slice(0, 7);
  run(`globalThis.money3 = clone(S.docs['money/${m}'] || {tx: []}); globalThis.mods3 = meta().modules; setMeta({modules: {...(mods3 || {}), money: true}}); save('money/${m}', {tx: []}); save('app/bills', {list: [{id: 'b7', title: 'Gym membership', amount: 30, type: 'out', cat: 'Спорт и здоровье', day: ${+tmr.slice(8)}}, {id: 'b8', title: 'Allowance', amount: 900, type: 'in', cat: 'Доход', day: ${+tmr.slice(8)}}]})`);
  try {
    const rem = () => JSON.parse(run(`JSON.stringify(buildReminders().filter(r => r.key.startsWith('p')))`));
    let r = rem();
    assert.equal(r.length, 1, 'money coming in needs no reminder');
    assert.equal(r[0].key, `p${tmr}_b7`);
    assert.equal(r[0].at, run(`atMin('${tmr}', 600)`));
    assert.equal(r[0].go, 'money');
    assert.ok(run(`morningLine('${tmr}')`).includes(run(`trf('платёж «{b}»', {b: 'Gym membership'})`)));
    run(`setMeta({modules: {...meta().modules, money: false}})`);
    assert.equal(rem().length, 0, 'nothing while the Money module is off');
    run(`setMeta({modules: {...meta().modules, money: true}})`);
    run(`addTx([{id: 'q1', type: 'out', amount: 30, date: '${tmr}', cat: 'Спорт и здоровье', note: 'Gym membership', bill: 'b7'}])`);
    assert.equal(rem().length, 0, 'paid early: no reminder');
    run(`S.tab = 'day'; openFromReminder('money')`);
    assert.equal(run(`S.tab`), 'money');
  } finally { run(`S.tab = 'day'; setMeta({modules: mods3}); save('money/${m}', money3); save('app/bills', {list: []})`); }
});

test('rent, subscriptions and phone bills get their own categories when read on the phone', () => {
  const cat = t => run(`localTellParse(${JSON.stringify(t)}, todayISO()).r.money?.[0]?.cat`);
  assert.equal(cat('paid rent 400'), 'Жильё и коммуналка');
  assert.equal(cat('заплатил за квартиру аренду 30000'), 'Жильё и коммуналка');
  assert.equal(cat('spent 11 on netflix subscription'), 'Подписки');
  assert.equal(cat('phone bill 15'), 'Связь и интернет');
  assert.equal(cat('spent 12 on lunch'), 'Кафе и рестораны');
});

test('a new money entry takes its category from the description, until one is picked', () => {
  assert.equal(run(`txGuess('Internet')`), 'Связь и интернет');
  assert.equal(run(`txGuess('Room rent')`), 'Жильё и коммуналка');
  assert.equal(run(`txGuess('Spotify')`), 'Подписки');
  assert.equal(run(`txGuess('lunch with friends')`), 'Кафе и рестораны');
  assert.equal(run(`txGuess('something else')`), undefined);
  assert.match(run(`txForm({type: 'out', note: 'Netflix'})`), /<option value="Подписки" selected>/);
  assert.match(run(`txForm({type: 'out', note: 'Netflix', cat: 'Другое'})`), /<option value="Другое" selected>/, 'a saved category stays');
  withForm({'#txC': {value: 'Переводы'}}, () => {
    run(`SH = {tx: {type: 'out'}}; CH.txNote({value: 'Netflix'})`);
    assert.equal(run(`FORM['#txC'].value`), 'Подписки');
    run(`CH.txCat(); FORM['#txC'].value = 'Учёба'; CH.txNote({value: 'Internet'})`);
    assert.equal(run(`FORM['#txC'].value`), 'Учёба', 'a picked category is kept');
  });
  run(`SH = null`);
});

test('Money compares with the same days of last month, or with the whole month before a past one', () => {
  run(`save('money/2030-04', {tx: [{id: 'a1', type: 'out', amount: 100, date: '2030-04-02', cat: 'Другое', note: 'x'}, {id: 'a2', type: 'out', amount: 50, date: '2030-04-20', cat: 'Другое', note: 'y'}, {id: 'a3', type: 'in', amount: 900, date: '2030-04-01', cat: 'Доход', note: 'z'}]})`);
  try {
    let h = run(`moneyVsPrev('2030-05', 'out', 80, '2030-05-10')`);
    assert.ok(h.includes(run(`trf('Для сравнения, {p}: {s}', {p: '1–10 ' + MONTHS_G[3], s: money(100)})`)), h);
    assert.ok(h.includes(run(`trf('сейчас на {n}% меньше', {n: 20})`)));
    h = run(`moneyVsPrev('2030-05', 'out', 300, '2030-06-15')`);
    assert.ok(h.includes(run(`money(150)`)) && h.includes(run(`trf('сейчас на {n}% больше', {n: 100})`)), 'a past month: the whole month before');
    assert.ok(run(`moneyVsPrev('2030-05', 'in', 900, '2030-05-10')`).includes(run(`tr('сейчас столько же')`)));
    assert.equal(run(`moneyVsPrev('2030-06', 'out', 10, '2030-06-15')`), '', 'nothing recorded last month: no line');
    run(`addTx([{id: 'a4', type: 'out', amount: 500, date: '2030-04-28', cat: 'Другое', note: 'Сводка', summary: true}])`);
    assert.equal(run(`moneyVsPrev('2030-05', 'out', 80, '2030-05-10')`), '', 'a monthly summary has no days to compare');
  } finally { run(`remove('money/2030-04')`); }
});

test('a regular payment links an entry whose old payment was deleted', () => {
  const m = run(`curMonth()`);
  run(`globalThis.money5 = clone(S.docs['money/${m}'] || {tx: []}); save('money/${m}', {tx: [{id: 'o1', type: 'out', amount: 11, date: '${m}-01', cat: 'Подписки', note: 'Netflix', bill: 'gone'}]}); save('app/bills', {list: [{id: 'nb', title: 'Netflix', amount: 11, type: 'out', cat: 'Подписки', day: 1}]})`);
  try {
    assert.equal(run(`billLink(bills()[0], '${m}')?.id`), 'o1');
    assert.equal(run(`billState(bills()[0])`), 'paid');
  } finally { run(`save('money/${m}', money5); save('app/bills', {list: []})`); }
});

test('Tell KAI: "every month" with an amount is shown first, then also makes a regular payment, and Undo removes both', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.money)`));
  assert.deepEqual(p('netflix 11 every month'), [{type: 'out', amount: 11, cat: 'Подписки', note: 'netflix', rep: true}]);
  assert.deepEqual(p('аренда 30000 в месяц')[0], {type: 'out', amount: 30000, cat: 'Жильё и коммуналка', note: 'аренда', rep: true});
  assert.equal(p('spent 9 on spotify monthly')[0].rep, true);
  assert.equal(p('spent 12 on lunch')[0].rep, undefined);
  assert.equal(p('потратил 500 в месяце')?.[0]?.rep, undefined, '"в месяце" is not "every month"');
  const d = run(`todayISO()`), m = d.slice(0, 7);
  run(`globalThis.money6 = clone(S.docs['money/${m}'] || {tx: []}); globalThis.mods6 = meta().modules; setMeta({modules: {...(mods6 || {}), money: true}}); save('app/bills', {list: []}); globalThis.toastE = toast; toast = () => {};
    save('inbox/tb1', {id: 'tb1', kind: 'tell', meta: {date: '${d}', text: 'netflix 11 every month'}, done: false, created: new Date().toISOString(), result: localTellParse('netflix 11 every month', '${d}').r})`);
  try {
    assert.ok(run(`tellLines(S.docs['inbox/tb1'].result, '${d}').join(' ')`).includes(run(`tr('каждый месяц')`)), 'the preview says it repeats');
    assert.equal(run(`bills().length`), 0, 'nothing changes before Apply');
    run(`A.tellApply({dataset: {id: 'tb1'}})`);
    const b = JSON.parse(run(`JSON.stringify(bills())`));
    assert.deepEqual([b.length, b[0].title, b[0].amount, b[0].day], [1, 'Netflix', 11, +d.slice(8)]);
    assert.equal(run(`monthTx('${m}').find(t => t.note === 'netflix').bill`), b[0].id);
    assert.equal(run(`billState(bills()[0])`), 'paid');
    run(`A.undoApply()`);
    assert.equal(run(`bills().length`), 0);
    assert.ok(!run(`monthTx('${m}').some(t => t.note === 'netflix')`));
  } finally { run(`toast = toastE; remove('inbox/tb1'); setMeta({modules: mods6}); save('money/${m}', money6); save('app/bills', {list: []})`); }
});

test('Evening check-in: off until turned on, then 2 hours before bedtime while the day does not count yet', () => {
  const tmr = run(`addDays(todayISO(), 1)`);
  run(`globalThis.rem7 = meta().remind; globalThis.day7 = S.docs['days/${tmr}'] ? clone(S.docs['days/${tmr}']) : undefined; setMeta({remind: {...(rem7 || {}), evening: undefined}})`);
  try {
    assert.ok(!run(`buildReminders().some(r => r.key === 'v${tmr}')`), 'off by default');
    run(`setMeta({remind: {...(meta().remind || {}), evening: true}})`);
    const e = JSON.parse(run(`JSON.stringify(eveningNudge('${tmr}'))`)), bed = run(`bedMin('${tmr}')`);
    assert.equal(e.at, run(`atMin('${tmr}', ${bed == null ? 1260 : `Math.min(${bed} - 120, 1320)`})`));
    const n = run(`Math.ceil(getDay('${tmr}').tasks.length * .7)`);
    assert.equal(e.title, run(`trf('Ещё {n} {t}, и день засчитан', {n: ${n}, t: plural(${n}, tr('задача'), tr('задачи'), tr('задач'))})`));
    assert.ok(e.body.length > 0, 'names what is left');
    assert.ok(run(`buildReminders().some(r => r.key === 'v${tmr}')`));
    run(`mutDay('${tmr}', d => d.tasks.forEach(t => { t.done = true; }))`);
    assert.equal(run(`eveningNudge('${tmr}')`), null, 'a day that counts gets no check-in');
    run(`mutDay('${tmr}', d => { d.tasks.forEach(t => { t.done = false; }); d.status = 'sick'; })`);
    assert.equal(run(`eveningNudge('${tmr}')`), null, 'nor a sick day');
  } finally { run(`setMeta({remind: rem7}); day7 ? save('days/${tmr}', day7) : remove('days/${tmr}')`); }
});

test('Regular payments: subscriptions are added up for the month and the year', () => {
  run(`save('app/bills', {list: [{id: 's1', title: 'Music', amount: 10, type: 'out', cat: 'Подписки', day: 3}, {id: 's2', title: 'Cloud', amount: 2.5, type: 'out', cat: 'Подписки', day: 9}, {id: 's3', title: 'Rent', amount: 400, type: 'out', cat: 'Жильё и коммуналка', day: 1}]})`);
  try {
    assert.ok(run(`billsCard(curMonth())`).includes(run(`trf('Подписки: {m} в месяц, {y} в год', {m: money(12.5), y: money(150)})`)));
  } finally { run(`save('app/bills', {list: []})`); }
});

test('Hold timer: after "get ready", the seconds held go into the next set and the rest starts; Stop records nothing', () => {
  const e = JSON.parse(run(`JSON.stringify(Object.values(plan().workouts).flatMap(w => w.ex).find(e => e.unit))`));
  assert.ok(e, 'the programs have a timed exercise');
  const day = run(`todayISO()`);
  run(`globalThis.now8 = Date.now; globalThis.T = now8(); Date.now = () => T; globalThis.day8 = S.docs['days/${day}'] ? clone(S.docs['days/${day}']) : undefined; globalThis.toastH = toast; toast = () => {};
    mutDay('${day}', d => { d.sets = {...(d.sets || {}), ['${e.id}']: []}; })`);
  try {
    const n = run(`setsFor(holdEx('${e.id}'), todayISO())`);
    run(`A.holdStart({dataset: {ex: '${e.id}'}}); T += 2000; holdTick()`);
    assert.ok(!run(`HOLD.started`), 'still getting ready');
    run(`T += 1000 + 10400; holdTick(); A.holdDone()`);
    assert.equal(run(`getDay('${day}').sets['${e.id}'][0].r`), 10, '"Done" early: the seconds actually held');
    assert.equal(run(`TIMER.end > 0`), n > 1, 'the rest starts by itself');
    run(`A.holdStart({dataset: {ex: '${e.id}'}})`);
    assert.equal(run(`TIMER.end`), 0, 'a hold ends the rest');
    run(`T += 3000 + 999000; holdTick()`);
    assert.equal(run(`getDay('${day}').sets['${e.id}'][1]?.r`), n > 1 ? +e.hi : undefined, 'held to the end: the top of the range');
    run(`stopRest(); A.holdStart({dataset: {ex: '${e.id}'}}); T += 8000; A.holdStop()`);
    assert.equal(run(`HOLD`), null);
    assert.equal(run(`getDay('${day}').sets['${e.id}'].filter(x => x && +x.r).length`), Math.min(2, n), 'Stop records nothing');
  } finally { run(`Date.now = now8; toast = toastH; if (HOLD) holdEnd(false); stopRest(); day8 ? save('days/${day}', day8) : remove('days/${day}')`); }
});

test('Focus awards: the first session, 45 minutes without leaving, and 10 hours in all', () => {
  const day = '2030-03-03', st = () => JSON.parse(run(`JSON.stringify(badgeStats())`));
  const goal = id => run(`(b => b.k + ':' + b.n)(BADGES.find(b => b.id === '${id}'))`);
  assert.deepEqual([goal('focus1'), goal('focusClean'), goal('focus10h')], ['focusN:1', 'focusClean:1', 'focusH:10']);
  const s0 = st();
  run(`save('days/${day}', {...buildDay('${day}'), focus: [{at: '10:00', min: 25, of: 25, leaves: 1}, {at: '11:00', min: 0, of: 25, leaves: 4}]})`);
  try {
    let s1 = st();
    assert.equal(s1.focusN - s0.focusN, 1, 'a session with no focused minutes does not count');
    assert.equal(s1.focusClean - s0.focusClean, 0, 'one that was left does not count as clean');
    assert.ok(Math.abs(s1.focusH - s0.focusH - 25 / 60) < 1e-9);
    run(`mutDay('${day}', d => { d.focus.push({at: '14:00', min: 45, of: 45, leaves: 0}, {at: '16:00', min: 30, of: 30, leaves: 0}); })`);
    s1 = st();
    assert.equal(s1.focusClean - s0.focusClean, 1, 'only 45 minutes or more without leaving');
    assert.ok(run(`earnedBadgeIds().includes('focus1') && earnedBadgeIds().includes('focusClean')`));
  } finally { run(`remove('days/${day}')`); }
});

test('awards of a switched-off module are hidden unless already earned', () => {
  run(`globalThis.mods10 = meta().modules; globalThis.badges10 = meta().badges; setMeta({modules: {...(mods10 || {}), content: false}, badges: {...(badges10 || {}), post1: undefined}})`);
  try {
    let ids = JSON.parse(run(`JSON.stringify(badgesShown().map(b => b.id))`));
    assert.ok(!ids.includes('post1') && !ids.includes('post12'));
    assert.ok(ids.includes('first') && ids.includes('focus1'));
    run(`setMeta({badges: {...meta().badges, post1: '2030-01-01'}})`);
    ids = JSON.parse(run(`JSON.stringify(badgesShown().map(b => b.id))`));
    assert.ok(ids.includes('post1') && !ids.includes('post12'), 'one already earned stays on the shelf');
    run(`setMeta({modules: {...meta().modules, content: true}})`);
    assert.ok(run(`badgesShown().some(b => b.id === 'post12')`));
  } finally { run(`setMeta({modules: mods10, badges: badges10})`); }
});

test('Tell KAI on the phone: running, cycling, swimming and yoga are workouts; sleep ranges; money from family; pharmacy and Uber', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  assert.deepEqual(p('ran 5 km in 30 minutes').time_log, [{kind: 'gym', min: 30}]);
  assert.equal(p('ran 5 km in 30 minutes').new_tasks.length, 0, 'not a to-do in 30 minutes');
  assert.deepEqual(p('пробежал 5 км за 30 минут').time_log, [{kind: 'gym', min: 30}]);
  assert.deepEqual(p('сходил в зал на час').time_log, [{kind: 'gym', min: 60}], 'went to the gym: not a walk');
  assert.deepEqual(p('ходил пешком 40 минут').time_log, [{kind: 'walk', min: 40}]);
  assert.deepEqual(p('swam 30 minutes').time_log, [{kind: 'gym', min: 30}]);
  assert.deepEqual(p('катался на велике 45 минут').time_log, [{kind: 'gym', min: 45}]);
  assert.deepEqual(p('йога 20 минут').time_log, [{kind: 'gym', min: 20}]);
  assert.deepEqual(p("I'm running 10 minutes late").time_log, [], 'running late is not a workout');
  assert.equal(p('slept from 1 to 9').sleep_h, 8);
  assert.equal(p('slept 11pm to 7am').sleep_h, 8);
  assert.equal(p('slept 11 to 7').sleep_h, 8, '11 means the evening');
  assert.equal(p('спал с часу до 9').sleep_h, 8);
  assert.equal(p('спал с 23 до 7').sleep_h, 8);
  assert.equal(p('went to bed at 23:30, woke up at 7').sleep_h, 7.5);
  assert.equal(p('woke up at 7').new_tasks.length, 0, '"woke up at 7" is not a to-do');
  assert.deepEqual(p('got 50 from mom').money[0], {type: 'in', amount: 50, cat: 'Переводы входящие', note: 'got 50 from mom'});
  assert.equal(p('получил 2000 от мамы').money[0].type, 'in');
  assert.equal(p('мама перевела мне 2000').money[0].amount, 2000);
  assert.equal(p('получил 5 по матану').money.length, 0, 'a grade is not money');
  assert.equal(p('spent 20 at the pharmacy').money[0].cat, 'Спорт и здоровье');
  assert.equal(p('потратил 300 в аптеке').money[0].amount, 300);
  assert.equal(p('uber 18').money[0].cat, 'Транспорт');
});

test('a weight without a unit is read in kilograms or pounds, whichever is closer to the last one logged', () => {
  const day = '2029-12-30';
  run(`globalThis.prof11 = clone(profile()); save('app/profile', {...profile(), units: 'us'}); save('days/${day}', {...buildDay('${day}'), weight: 70})`);
  try {
    assert.equal(run(`localTellParse('вес 70,4', todayISO()).r.weight`), 70.4, 'pounds in the settings, but 70.4 kg is the likely meaning');
    assert.equal(run(`localTellParse('weight 155', todayISO()).r.weight`), 70.3);
    assert.equal(run(`localTellParse('weight 71 kg', todayISO()).r.weight`), 71);
  } finally { run(`save('app/profile', prof11); remove('days/${day}')`); }
});

test('Tell KAI on the phone: parts of the day, "in 2 weeks", "next Monday", flights, skipped gym, sets without commas, a second amount', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  const today = run(`todayISO()`), plus = n => run(`addDays(todayISO(), ${n})`);
  assert.deepEqual(p('рейс 20 декабря в 6 утра').events.map(e => [e.title, e.from]), [['Рейс', '06:00']], 'morning, and a flight is an event');
  assert.equal(q('позвонить в 9 вечера').time, '21:00');
  assert.equal(q('встреча в 3 дня').time, '15:00');
  assert.equal(q('в 11 ночи лечь').time, '23:00');
  assert.equal(q('в 2 ночи будильник').time, '02:00');
  assert.deepEqual([q('сдать отчёт через 2 дня').due, q('сдать отчёт через 2 дня').time], [plus(2), null], '"через 2 дня" is days, not 14:00');
  assert.equal(q('midterm in 2 weeks').due, plus(14));
  assert.equal(q('контрольная через неделю').due, plus(7));
  assert.equal(q('essay in 3 days').due, plus(3));
  assert.equal(p('контрольная через 2 недели').events[0].kind, 'exam');
  const nm = q('эссе сдать в следующий понедельник');
  assert.equal(nm.title, 'Эссе сдать');
  assert.equal(run(`dow('${nm.due}')`), 1);
  assert.ok(nm.due > today);
  run(`globalThis.plan12 = clone(plan())`);
  setPlan([], [], {1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A'});
  const wd = run(`(() => { for (let i = 0; i < 14; i++){ const k = addDays(todayISO(), i); if (getDay(k).tasks.some(t => t.id === 'gym')) return k; } return ''; })()`);
  assert.ok(wd, 'a workout day in the next two weeks');
  assert.deepEqual(JSON.parse(run(`JSON.stringify(localTellParse('пропустил зал', '${wd}').r.tasks_undone)`)), ['gym']);
  run(`save('app/plan', plan12)`);
  assert.deepEqual(p('10к шагов').steps, 10000);
  assert.equal(p('жим 60 кг на 8 8 6').sets.map(x => x.r).join(','), '8,8,6');
  assert.deepEqual(p('spent 30 on books and 12 on lunch').money.map(m => [m.amount, m.cat]), [[30, 'Учёба'], [12, 'Кафе и рестораны']]);
  assert.equal(p('12 on lunch').money.length, 0, 'an amount alone is only spending after another spending');
  assert.equal(p('slept badly, 5 hours').sleep_h, 5);
  assert.equal(p('плохо спал, 5 часов').sleep_h, 5);
});

test('repeating to-dos: understood when typed, the next one comes when one is checked off, and it can stop', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  const today = run(`todayISO()`);
  let t = q('take out the trash every monday');
  assert.deepEqual([t.title, t.every, run(`dow('${t.due}')`)], ['Take out the trash', 'week', 1]);
  t = q('выносить мусор по понедельникам');
  assert.deepEqual([t.title, t.every, run(`dow('${t.due}')`)], ['Выносить мусор', 'week', 1]);
  assert.deepEqual([q('call grandma every sunday at 18:00').time, q('call grandma every sunday at 18:00').every], ['18:00', 'week']);
  assert.deepEqual([q('pay rent every month').every, q('pay rent every month').due], ['month', today]);
  assert.equal(q('каждое утро зарядка').every, 'day');
  assert.equal(q('каждое утро зарядка').title, 'Зарядка');
  assert.equal(q('review finances weekly').every, 'week');
  assert.equal(q('monthly report due friday').every, undefined, '"monthly" before a noun is part of the name');
  assert.equal(q('weekly review').every, undefined);
  assert.equal(run(`nextDue('2030-01-31', 'month', '2030-01-31')`), '2030-02-28', 'the 31st falls on the last day of a short month');
  assert.equal(run(`nextDue('2030-02-28', 'month', '2030-02-28')`), '2030-03-28');
  assert.equal(run(`nextDue('2020-01-06', 'week', '2030-01-01')`), '2030-01-07', 'never in the past, on the same weekday');
  run(`globalThis.tasks13 = clone(smartTasks()); saveTasks([{id: 'rp1', title: 'Laundry', due: '${today}', time: null, pri: 2, done: false, created: '${today}', every: 'week'}])`);
  try {
    run(`A.tkDone({dataset: {id: 'rp1'}})`);
    const list = JSON.parse(run(`JSON.stringify(smartTasks())`));
    assert.equal(list.length, 2);
    assert.ok(list.find(x => x.id === 'rp1').done, 'this one stays done, in the history');
    const next = list.find(x => x.id !== 'rp1');
    assert.deepEqual([next.title, next.done, next.every, next.due], ['Laundry', false, 'week', run(`addDays('${today}', 7)`)]);
    assert.ok(run(`taskCard()`).includes(run(`EVERY.week()`)), 'the list says it repeats');
    run(`A.tkStopRepeat({dataset: {id: '${next.id}'}})`);
    run(`A.tkDone({dataset: {id: '${next.id}'}})`);
    assert.equal(run(`smartTasks().filter(x => !x.done).length`), 0, 'stopped: no next one');
    const r = JSON.parse(run(`JSON.stringify(localTellParse('выносить мусор по понедельникам', todayISO()).r)`));
    assert.equal(r.new_tasks[0].every, 'week');
    assert.ok(run(`tellLines(localTellParse('выносить мусор по понедельникам', todayISO()).r, todayISO()).join(' ')`).includes(run(`EVERY.week()`)), 'Tell KAI shows the repeat before adding');
  } finally { run(`saveTasks(tasks13)`); }
});

test('checking off a to-do by mistake can be undone, with the next one of a repeating to-do', () => {
  const today = run(`todayISO()`);
  run(`globalThis.tasks14 = clone(smartTasks()); saveTasks([{id: 'u1', title: 'Gym bag', due: '${today}', time: null, pri: 2, done: false, created: '${today}', every: 'week'}])`);
  try {
    run(`A.tkDone({dataset: {id: 'u1'}})`);
    assert.equal(run(`smartTasks().length`), 2);
    run(`A.undoApply()`);
    const list = JSON.parse(run(`JSON.stringify(smartTasks())`));
    assert.deepEqual(list.map(t => [t.id, t.done]), [['u1', false]]);
  } finally { run(`saveTasks(tasks14)`); }
});

test('food named on its own is one piece, coffee with milk is one drink, and the to-do field keeps shopping items', () => {
  const meals = t => JSON.parse(run(`JSON.stringify((localTellParse(${JSON.stringify(t)}, todayISO()).r.meals || []).map(m => m.name))`));
  assert.equal(meals('яблоко и банан').length, 1, 'joined into one meal');
  assert.match(meals('яблоко и банан')[0], /Яблоко|Apple/);
  assert.match(meals('протеиновый коктейль')[0], /330/);
  assert.match(meals('сникерс')[0], /50/);
  assert.match(meals('выпил кофе с молоком')[0], /капучино|cappuccino/i);
  assert.match(meals('выпил кофе')[0], /чёрный|Black coffee/i, 'coffee alone is black');
  assert.match(meals('гречка 200 г с котлетой')[0], /\+/);
  assert.deepEqual(meals('Had some soup'), [], 'a vague amount stays unread');
  assert.deepEqual(meals('the gym was crowded'), []);
  assert.equal(run(`isDayNote('молоко')`), false, 'in the to-do field, "молоко" is something to buy');
  assert.equal(run(`isDayNote('slept 7 hours')`), true);
});

test('Tell KAI on the phone: screen time in words, saved on Apply while the module is on', () => {
  const d = run(`todayISO()`);
  run(`globalThis.mods15 = meta().modules; globalThis.day15 = S.docs['days/${d}'] ? clone(S.docs['days/${d}']) : undefined; setMeta({modules: {...(mods15 || {}), screentime: true}}); globalThis.toastS = toast; toast = () => {}`);
  try {
    const sm = t => run(`localTellParse(${JSON.stringify(t)}, todayISO()).r.screen_min`);
    assert.equal(sm('screen time 3h 20m'), 200);
    assert.equal(sm('экранное время 4 часа'), 240);
    assert.equal(sm('провёл 2 часа в телефоне'), 120);
    assert.equal(sm('spent 45 minutes on my phone'), 45);
    assert.equal(sm('slept 7 hours'), undefined);
    run(`save('inbox/ts1', {id: 'ts1', kind: 'tell', meta: {date: '${d}', text: 'screen time 3h 20m'}, done: false, created: new Date().toISOString(), result: localTellParse('screen time 3h 20m', '${d}').r})`);
    assert.ok(run(`tellLines(S.docs['inbox/ts1'].result, '${d}').join(' ')`).includes(run(`fmtMin(200)`)));
    run(`A.tellApply({dataset: {id: 'ts1'}})`);
    assert.equal(run(`getDay('${d}').screen.total`), 200);
    run(`setMeta({modules: {...meta().modules, screentime: false}})`);
    assert.equal(sm('screen time 3h'), undefined, 'not while the module is off');
  } finally { run(`toast = toastS; remove('inbox/ts1'); setMeta({modules: mods15}); day15 ? save('days/${d}', day15) : remove('days/${d}')`); }
});

test('to-dos done today can be shown and reopened; a repeating one takes back its next', () => {
  const today = run(`todayISO()`);
  run(`globalThis.tasks16 = clone(smartTasks()); globalThis.toastR = toast; toast = () => {}; saveTasks([{id: 'd1', title: 'Water plants', due: '${today}', time: null, pri: 2, done: false, created: '${today}', every: 'week'}, {id: 'd2', title: 'Email tutor', due: '${today}', time: null, pri: 2, done: false, created: '${today}'}])`);
  try {
    run(`A.tkDone({dataset: {id: 'd1'}}); A.tkDone({dataset: {id: 'd2'}})`);
    assert.ok(run(`taskCard()`).includes(run(`trf('Сделано сегодня: {n}', {n: 2})`)));
    run(`S.open.tk_done = true`);
    assert.ok(run(`taskCard()`).includes('data-act="tkReopen"'));
    run(`A.tkReopen({dataset: {id: 'd1'}})`);
    const open = JSON.parse(run(`JSON.stringify(smartTasks().filter(t => !t.done).map(t => t.id))`));
    assert.deepEqual(open, ['d1'], "reopened, and the next week's one is gone");
    run(`A.tkReopen({dataset: {id: 'd2'}})`);
    assert.equal(run(`smartTasks().filter(t => !t.done).length`), 2);
  } finally { run(`S.open.tk_done = false; toast = toastR; saveTasks(tasks16)`); }
});

test('each daily task keeps its own streak; days without it and sick days do not break it, nor today still open', () => {
  const base = '2031-05-20', day = i => run(`addDays('${base}', -${i})`);
  run(`for (let i = 0; i < 7; i++){ const k = addDays('${base}', -i); save('days/' + k, {date: k, tasks: [{id: 'hab', title: 'Posture', done: i !== 5}]}); }`);
  try {
    assert.equal(run(`habitStreak('hab', '${base}')`), 5, 'five done days, then a missed one');
    run(`mutDay('${base}', d => { d.tasks[0].done = false; })`);
    assert.equal(run(`habitStreak('hab', '${base}')`), 4, 'today not done yet does not break it');
    run(`mutDay('${day(5)}', d => { d.status = 'sick'; })`);
    assert.equal(run(`habitStreak('hab', '${base}')`), 5, 'a sick day is skipped');
    run(`mutDay('${day(2)}', d => { d.tasks = []; })`);
    assert.equal(run(`habitStreak('hab', '${base}')`), 4, 'a day without the task is skipped, not counted');
    assert.equal(run(`habitStreakHTML({id: 'hab'}, false)`), '', 'shown only from today: the test days are in the future');
  } finally { run(`for (let i = 0; i < 7; i++) remove('days/' + addDays('${base}', -i))`); }
});

test('new students get a card to add their timetable, until classes exist, it is dismissed, or two weeks pass', () => {
  run(`globalThis.meta17 = clone(meta()); globalThis.prof17 = clone(profile()); globalThis.plan17 = clone(plan());
    save('app/profile', {...profile(), role: 'study'}); setMeta({startedOn: todayISO(), toldOnce: true, ttCardOff: false}); save('app/plan', {...plan(), classes: []})`);
  try {
    assert.ok(run(`timetableCard()`).includes('data-act="clsAdd2"'));
    assert.ok(run(`timetableCard()`).includes('icsImport'), 'with the calendar file button');
    run(`save('app/plan', {...plan(), classes: [{day: 1, time: '09:00', title: 'Physics'}]})`);
    assert.equal(run(`timetableCard()`), '', 'not once classes exist');
    run(`save('app/plan', {...plan(), classes: []}); setMeta({startedOn: addDays(todayISO(), -14)})`);
    assert.equal(run(`timetableCard()`), '', 'not after two weeks');
    run(`setMeta({startedOn: todayISO()}); save('app/profile', {...profile(), role: 'work'})`);
    assert.equal(run(`timetableCard()`), '', 'only for students');
    run(`save('app/profile', {...profile(), role: 'study'}); A.ttCardOff()`);
    assert.equal(run(`timetableCard()`), '', 'dismissed');
  } finally { run(`setMeta(meta17); save('app/profile', prof17); save('app/plan', plan17)`); }
});

test('Money categories against the month before: a real change is shown, small ones are not', () => {
  run(`save('money/2030-07', {tx: [{id: 'p1', type: 'out', amount: 100, date: '2030-07-03', cat: 'Кафе и рестораны', note: 'a'}, {id: 'p2', type: 'out', amount: 50, date: '2030-07-05', cat: 'Транспорт', note: 'b'}, {id: 'p3', type: 'out', amount: 40, date: '2030-07-25', cat: 'Кафе и рестораны', note: 'c'}]})`);
  try {
    const h = run(`catVsPrev('2030-08', 'out', 'Кафе и рестораны', 130, '2030-08-10')`);
    assert.match(h, /worse/);
    assert.ok(h.includes('30%'), 'same days: 100 then, 130 now');
    assert.equal(run(`catVsPrev('2030-08', 'out', 'Транспорт', 52, '2030-08-10')`), '', 'under 10% is not worth a word');
    assert.match(run(`catVsPrev('2030-08', 'out', 'Кафе и рестораны', 70, '2030-09-02')`), /better.*50%/, 'a past month: the whole month before (140), 50% less');
    assert.equal(run(`catVsPrev('2030-08', 'out', 'Супермаркеты', 80, '2030-08-10')`), '', 'nothing the month before');
  } finally { run(`remove('money/2030-07')`); }
});

test('money search finds entries by name, category or amount in every month', () => {
  run(`save('money/2030-10', {tx: [{id: 's1', type: 'out', amount: 30, date: '2030-10-05', cat: 'Спорт и здоровье', note: 'Gym membership'}, {id: 's2', type: 'out', amount: 12, date: '2030-10-07', cat: 'Кафе и рестораны', note: 'Lunch'}]}); save('money/2030-11', {tx: [{id: 's3', type: 'out', amount: 30, date: '2030-11-05', cat: 'Спорт и здоровье', note: 'gym'}, {id: 's4', type: 'in', amount: 300, date: '2030-11-01', cat: 'Доход', note: 'Allowance'}]})`);
  try {
    const f = q => JSON.parse(run(`JSON.stringify(txFindResults(${JSON.stringify(q)}))`));
    let r = f('GYM');
    assert.deepEqual(r.list.map(t => t.id), ['s3', 's1'], 'newest first, any case');
    assert.equal(r.total, -60);
    assert.deepEqual(f('30').list.map(t => t.id), ['s3', 's1'], 'by amount');
    assert.ok(f(run(`tr('Кафе и рестораны')`).slice(0, 4)).list.some(t => t.id === 's2'), 'by category name');
    assert.equal(f('allowance').total, 300);
    assert.deepEqual(f('').list, []);
  } finally { run(`remove('money/2030-10'); remove('money/2030-11')`); }
});

test('links from quick actions: #todo shows the Day with the to-do field, #focus opens Focus', () => {
  run(`globalThis.meta18 = clone(meta()); setMeta({welcomed: true}); globalThis.focused = 0; globalThis.qs18 = document.querySelector`);
  try {
    run(`location.hash = '#focus'; S.tab = 'money'; SH = null; openFromLink()`);
    assert.equal(run(`S.tab`), 'day');
    assert.ok(run(`!!SH && typeof SH.body === 'function' && SH.body().includes('data-act="focusGo"')`), 'the Focus sheet is open');
    run(`closeSheetQuiet(); S.tab = 'money'; location.hash = '#todo'; openFromLink()`);
    assert.equal(run(`S.tab`), 'day');
    assert.equal(run(`SH`), null, 'no sheet over the to-do field');
  } finally { run(`location.hash = ''; closeSheetQuiet(); setMeta(meta18)`); }
});

test('a study plan ends with its exam: leftover topics leave the to-do list and the questions', () => {
  const today = run(`todayISO()`), past = run(`addDays(todayISO(), -2)`), soon = run(`addDays(todayISO(), 5)`);
  run(`globalThis.tasks19 = clone(smartTasks()); globalThis.plan19 = clone(plan())`);
  setPlan([{id: 'exOld', date: past, title: 'Chemistry', kind: 'exam'}, {id: 'exNew', date: soon, title: 'Biology', kind: 'exam'}]);
  try {
    run(`saveTasks([{id: 'st1', title: 'Revise: acids', due: '${run(`addDays(todayISO(), -3)`)}', done: false, pri: 2, examId: 'exOld'}, {id: 'st2', title: 'Revise: cells', due: '${today}', done: false, pri: 2, examId: 'exNew'}, {id: 'st3', title: 'Buy pens', due: null, done: false, pri: 2}])`);
    assert.equal(run(`studyOver(smartTasks()[0])`), true);
    assert.equal(run(`studyOver(smartTasks()[1])`), false);
    assert.equal(run(`studyOver(smartTasks()[2])`), false);
    const card = run(`taskCard()`);
    assert.ok(!card.includes('Revise: acids') && card.includes('Revise: cells'));
    assert.ok(!run(`JSON.stringify(checkins())`).includes('Revise: acids'), 'no "overdue, done?" for a finished exam');
    assert.equal(run(`smartTasks().length`), 3, 'nothing is deleted');
  } finally { run(`saveTasks(tasks19); save('app/plan', plan19)`); }
});

test('budget limits for single categories: saved with the budget, shown on the category, over the limit in red', () => {
  run(`globalThis.budget20 = S.docs['app/budget'] ? clone(S.docs['app/budget']) : undefined`);
  try {
    run(`saveBudget(900, {'Кафе и рестораны': '100', 'Транспорт': '', 'Не категория': '5', 'Супермаркеты': '-50'})`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(S.docs['app/budget'])`)), {monthly: 900, cats: {'Кафе и рестораны': 100, 'Супермаркеты': 50}});
    assert.ok(run(`catLimitBar('Кафе и рестораны', 40)`).includes(run(`trf('{s} из {l}', {s: money(40), l: money(100)})`)));
    assert.match(run(`catLimitBar('Кафе и рестораны', 90)`), /var\(--warn\)/, '85% and up is a warning');
    assert.ok(run(`catLimitBar('Кафе и рестораны', 112)`).includes(run(`trf('лимит превышен на {s}', {s: money(12)})`)));
    assert.equal(run(`catLimitBar('Транспорт', 40)`), '', 'no limit, nothing extra');
    run(`saveBudget(null, {'Кафе и рестораны': '100'})`);
    assert.equal(run(`S.docs['app/budget'].cats['Кафе и рестораны']`), 100, 'limits stay without a monthly budget');
    assert.ok(run(`catLimitsHTML()`).includes('data-lim="Кафе и рестораны"'));
  } finally { run(`budget20 ? save('app/budget', budget20) : remove('app/budget')`); }
});

test('an AI answer to Tell KAI gets "every month", repeating to-dos and screen time from the phone, still shown before Apply', () => {
  const d = run(`todayISO()`);
  run(`globalThis.mods21 = meta().modules; setMeta({modules: {...(mods21 || {}), screentime: true, money: true}})`);
  try {
    const text = 'Netflix 11 every month, take out the trash every Monday, screen time 2h';
    const r = JSON.parse(run(`JSON.stringify(enrichTell({reply: 'ok', money: [{type: 'out', amount: 11, cat: 'Подписки', note: 'Netflix'}, {type: 'out', amount: 5, cat: 'Кафе и рестораны', note: 'coffee'}], new_tasks: [{title: 'Take out the trash', date: null, time: null}]}, ${JSON.stringify(text)}, '${d}'))`));
    assert.equal(r.money[0].rep, true);
    assert.equal(r.money[1].rep, undefined, 'only the one that repeats');
    assert.equal(r.new_tasks[0].every, 'week');
    assert.equal(run(`dow('${r.new_tasks[0].date}')`), 1, 'and it gets its first Monday');
    assert.equal(r.screen_min, 120);
    assert.ok(run(`tellLines(${JSON.stringify(r)}, '${d}').join(' ')`).includes(run(`tr('каждый месяц')`)));
    assert.deepEqual(JSON.parse(run(`JSON.stringify(enrichTell({reply: 'x'}, 'hello', '${d}'))`)).money, [], 'nothing to add: unchanged apart from empty lists');
  } finally { run(`setMeta({modules: mods21})`); }
});

test('exam results: asked after the exam, saved with a grade, and listed under past exams', () => {
  const today = run(`todayISO()`), y = run(`addDays(todayISO(), -1)`), old = run(`addDays(todayISO(), -20)`);
  run(`globalThis.plan22 = clone(plan()); globalThis.toastX = toast; toast = () => {}`);
  setPlan([{id: 'xr', date: y, title: 'Statistics', kind: 'exam', from: '10:00', until: '12:00'}, {id: 'xo', date: old, title: 'Old exam', kind: 'exam'}, {id: 'xd', date: y, title: 'Essay', kind: 'deadline'}]);
  try {
    let qs = JSON.parse(run(`JSON.stringify(checkins().filter(q => q.type === 'exam'))`));
    assert.deepEqual(qs.map(q => q.id), ['xr'], 'only a recent exam, not a deadline or one from weeks ago');
    run(`A.ciAns({dataset: {k: 'x_xr', a: 'wait', id: 'xr'}})`);
    assert.equal(run(`checkins().filter(q => q.type === 'exam').length`), 0, '"don\\u2019t know yet" waits until tomorrow');
    withForm({'#ciGrade': 'A'}, () => run(`A.ciAns({dataset: {k: 'x_xr', a: 'pass', id: 'xr'}})`));
    assert.deepEqual(JSON.parse(run(`JSON.stringify(allEvents().find(e => e.id === 'xr').result)`)), {passed: true, grade: 'A', at: today});
    const html = run(`pastExamsHTML()`);
    assert.ok(html.includes('Statistics') && html.includes('Old exam'));
    assert.ok(html.includes(run(`trf('сдано {n} из {k}', {n: 1, k: 1})`)));
    assert.ok(html.includes(run(`tr('сдан')`) + ' · A'));
    assert.ok(!html.includes('Essay'), 'deadlines are not exams');
  } finally { run(`toast = toastX; save('app/plan', plan22)`); }
});

test('Tell KAI on the phone: an exam result in words, for a recent exam with that name', () => {
  const d = run(`todayISO()`), y = run(`addDays(todayISO(), -2)`);
  run(`globalThis.plan23 = clone(plan()); globalThis.toastY = toast; toast = () => {}`);
  setPlan([{id: 'ys', date: y, title: 'Экзамен по статистике', kind: 'exam'}, {id: 'yc', date: y, title: 'Chemistry exam', kind: 'exam'}]);
  try {
    const xr = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, '${d}').r.exam_results || [])`));
    assert.deepEqual(xr('сдал статистику на 5'), [{id: 'ys', passed: true, grade: '5'}]);
    assert.deepEqual(xr('passed the chemistry exam with an A'), [{id: 'yc', passed: true, grade: 'A'}]);
    assert.deepEqual(xr('failed chemistry'), [{id: 'yc', passed: false, grade: null}]);
    assert.deepEqual(xr('не сдал статистику'), [{id: 'ys', passed: false, grade: null}]);
    assert.deepEqual(xr('сдал лабу'), [], 'a lab report is not one of the exams');
    assert.deepEqual(xr('passed the exam'), [], 'two recent exams: the name must say which');
    assert.deepEqual(xr('passed by the shop'), []);
    run(`save('inbox/te1', {id: 'te1', kind: 'tell', meta: {date: '${d}', text: 'сдал статистику на 5'}, done: false, created: new Date().toISOString(), result: localTellParse('сдал статистику на 5', '${d}').r})`);
    assert.ok(run(`tellLines(S.docs['inbox/te1'].result, '${d}').join(' ')`).includes('5'), 'shown before Apply');
    run(`A.tellApply({dataset: {id: 'te1'}})`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(allEvents().find(e => e.id === 'ys').result)`)), {passed: true, grade: '5', at: d});
  } finally { run(`toast = toastY; remove('inbox/te1'); save('app/plan', plan23)`); }
});

test("Focus history keeps each session's name, and the week is shown by subject", () => {
  const d = run(`todayISO()`);
  run(`globalThis.day24 = S.docs['days/${d}'] ? clone(S.docs['days/${d}']) : undefined; mutDay('${d}', x => { x.focus = [{at: '09:00', min: 50, of: 50, leaves: 0, l: 'Statistics'}, {at: '11:00', min: 25, of: 25, leaves: 1, l: 'Chemistry'}, {at: '13:00', min: 20, of: 25, leaves: 0, l: 'Statistics'}, {at: '15:00', min: 10, of: 25, leaves: 2}]; })`);
  try {
    const w = JSON.parse(run(`JSON.stringify(focusWeek())`));
    assert.deepEqual(w.by.filter(([l]) => ['Statistics', 'Chemistry'].includes(l)), [['Statistics', 70], ['Chemistry', 25]]);
    assert.ok(w.by.some(([l, m]) => l === run(`tr('Учёба')`) && m >= 10), 'an old session without a name counts as study');
    run(`A.focusSheet({dataset: {}})`);
    assert.ok(run(`SH.body()`).includes('Statistics ' + run(`fmtMin(70)`)));
  } finally { run(`closeSheetQuiet(); day24 ? save('days/${d}', day24) : remove('days/${d}')`); }
});

test('a repeating to-do sent to the Calendar repeats there too', () => {
  const ics = run(`icsText2([{id: 'r1', title: 'Gym bag', date: '2030-01-07', time: '08:00', every: 'week'}, {id: 'r2', title: 'Call', date: '2030-01-07', time: '18:00'}])`);
  const ev = ics.split('BEGIN:VEVENT').slice(1);
  assert.match(ev[0], /RRULE:FREQ=WEEKLY/);
  assert.doesNotMatch(ev[1], /RRULE/);
});

test('regular payments go into the web app\\u2019s calendar file as monthly events', () => {
  assert.equal(run(`billRule(5)`), 'FREQ=MONTHLY;BYMONTHDAY=5');
  assert.equal(run(`billRule(31)`), 'FREQ=MONTHLY;BYMONTHDAY=28,29,30,31;BYSETPOS=-1', 'the last day of a short month');
  assert.equal(run(`billRule(29)`), 'FREQ=MONTHLY;BYMONTHDAY=28,29;BYSETPOS=-1');
  assert.equal(run(`billFirstDue({day: 10}, '2030-01-15')`), '2030-02-10');
  assert.equal(run(`billFirstDue({day: 20}, '2030-01-15')`), '2030-01-20');
  assert.equal(run(`billFirstDue({day: 31}, '2030-01-31')`), '2030-01-31');
  assert.equal(run(`billFirstDue({day: 31}, '2030-02-01')`), '2030-02-28');
});

test("a season's archive keeps its focus time and exam results", () => {
  run(`globalThis.plan25 = clone(plan())`);
  setPlan([{id: 'sa', date: '2030-02-10', title: 'A', kind: 'exam', result: {passed: true}}, {id: 'sb', date: '2030-02-12', title: 'B', kind: 'exam', result: {passed: false}}, {id: 'sc', date: '2029-12-01', title: 'C', kind: 'exam', result: {passed: true}}, {id: 'sd', date: '2030-02-14', title: 'D', kind: 'exam'}]);
  try {
    const x = JSON.parse(run(`JSON.stringify(seasonExtra('2030-01-01', [{focus: [{min: 50}, {min: 25}]}, {focus: [{min: 45}]}, {}], '2030-03-01'))`));
    assert.deepEqual(x, {focusMin: 120, examsPassed: 1, examsKnown: 2}, 'only this season, and only exams with a result');
    const line = run(`seasonExtraLine(${JSON.stringify(x)})`);
    assert.ok(line.includes(run(`fmtMin(120)`)) && line.includes(run(`trf('· экзамены: сдано {n} из {k}', {n: 1, k: 2})`)));
    assert.equal(run(`seasonExtraLine({focusMin: 20, examsKnown: 0})`), '', 'little to say: nothing added');
  } finally { run(`save('app/plan', plan25)`); }
});

test("an exam card's Focus works on the next open topic of its study plan", () => {
  const today = run(`todayISO()`), soon = run(`addDays(todayISO(), 6)`);
  run(`globalThis.plan26 = clone(plan()); globalThis.tasks26 = clone(smartTasks())`);
  setPlan([{id: 'ef', date: soon, title: 'Biology', kind: 'exam'}]);
  try {
    assert.match(run(`examCard()`), /data-act="focusSheet" data-exam="ef"/, 'no plan: the session is for the exam');
    run(`saveTasks([{id: 't1', title: 'Cells', due: '${run(`addDays(todayISO(), 2)`)}', done: false, pri: 2, examId: 'ef', perTopic: 60}, {id: 't0', title: 'Genetics', due: '${today}', done: false, pri: 2, examId: 'ef', perTopic: 60}, {id: 'tx', title: 'Old', due: '${today}', done: true, pri: 2, examId: 'ef'}])`);
    assert.equal(run(`nextTopic('ef').id`), 't0');
    assert.match(run(`examCard()`), /data-act="focusTask" data-id="t0"/);
  } finally { run(`saveTasks(tasks26); save('app/plan', plan26)`); }
});

test("what's new shows once to people who used an earlier version, never over another sheet, and not after onboarding", () => {
  run(`globalThis.meta27 = clone(meta()); closeSheetQuiet(); setMeta({welcomed: true, seenNew: undefined})`);
  try {
    run(`SH = {title: 'other'}`);
    assert.equal(run(`whatsNewShow()`), false, 'not over another sheet');
    run(`SH = null`);
    assert.equal(run(`whatsNewShow()`), true);
    assert.equal(run(`meta().seenNew`), run(`WHATS_NEW_ID`));
    run(`closeSheetQuiet()`);
    assert.equal(run(`whatsNewShow()`), false, 'once');
    run(`setMeta({welcomed: false, seenNew: undefined})`);
    assert.equal(run(`whatsNewShow()`), false, 'not before onboarding is done');
  } finally { run(`closeSheetQuiet(); setMeta({...meta27, seenNew: meta27.seenNew, welcomed: meta27.welcomed})`); }
});

test('Tell KAI on the phone: "yesterday" puts the day’s records on yesterday, plans stay relative to today', () => {
  const d = run(`todayISO()`), y = run(`addDays(todayISO(), -1)`), m = y.slice(0, 7);
  assert.equal(run(`tellDayOf('вчера потратил 500 на такси', '${d}')`), y);
  assert.equal(run(`tellDayOf('позавчера потратил 300 на обед', '${d}')`), run(`addDays(todayISO(), -2)`));
  assert.equal(run(`tellDayOf('yesterday walked 40 minutes', '${d}')`), y);
  assert.equal(run(`tellDayOf('вчера на завтрак овсянка 60 г', '${d}')`), y, 'breakfast is not tomorrow');
  assert.equal(run(`tellDayOf('вчера договорились: завтра в 10 встреча', '${d}')`), d, 'with tomorrow in it, today stays');
  assert.equal(run(`tellDayOf('spent 12 on lunch', '${d}')`), d);
  assert.equal(JSON.parse(run(`JSON.stringify(localTellParse('ran 5k yesterday morning', '${d}').r.new_tasks)`)).length, 0, 'not a to-do for tomorrow');
  run(`globalThis.money28 = clone(S.docs['money/${m}'] || {tx: []}); globalThis.day28 = S.docs['days/${y}'] ? clone(S.docs['days/${y}']) : undefined; globalThis.toastZ = toast; toast = () => {}; globalThis.SH0 = SH; SH = {}`);
  try {
    run(`tellLocal('yesterday walked 40 minutes and spent 20 on taxi', '${d}')`);
    const id = run(`SH.jobId`), it = JSON.parse(run(`JSON.stringify(S.docs['inbox/' + SH.jobId])`));
    assert.equal(it.meta.date, y);
    assert.ok(run(`tellLines(S.docs['inbox/${id}'].result, '${y}')[0]`).includes(run(`tr('вчера')`)), 'the preview says which day');
    const walk0 = run(`getDay('${y}').walkExtra || 0`);
    run(`A.tellApply({dataset: {id: '${id}'}})`);
    assert.equal(run(`getDay('${y}').walkExtra || 0`) - walk0, 40);
    assert.ok(run(`monthTx('${m}').some(t => t.date === '${y}' && +t.amount === 20)`));
  } finally { run(`toast = toastZ; SH = SH0; save('money/${m}', money28); day28 ? save('days/${y}', day28) : remove('days/${y}')`); }
});

test('a regular payment that is due is asked about on the Day tab: paid, skipped, or later', () => {
  const d = run(`todayISO()`), m = d.slice(0, 7);
  run(`globalThis.money29 = clone(S.docs['money/${m}'] || {tx: []}); globalThis.mods29 = meta().modules; globalThis.day29 = S.docs['days/${d}'] ? clone(S.docs['days/${d}']) : undefined; globalThis.toastP = toast; toast = () => {};
    setMeta({modules: {...(mods29 || {}), money: true}}); save('money/${m}', {tx: []});
    save('app/bills', {list: [{id: 'pb1', title: 'Rent', amount: 400, type: 'out', cat: 'Жильё и коммуналка', day: 1}, {id: 'pb2', title: 'Phone', amount: 15, type: 'out', cat: 'Связь и интернет', day: 1}]})`);
  try {
    let qs = JSON.parse(run(`JSON.stringify(checkins().filter(q => q.type === 'bill'))`));
    assert.equal(qs.length, 1, 'one at a time');
    run(`A.ciAns({dataset: {k: 'p_' + ${JSON.stringify(qs[0].id)}, a: 'paid', id: ${JSON.stringify(qs[0].id)}}})`);
    assert.equal(run(`billState(bills().find(b => b.id === ${JSON.stringify(qs[0].id)}))`), 'paid');
    qs = JSON.parse(run(`JSON.stringify(checkins().filter(q => q.type === 'bill'))`));
    assert.equal(qs.length, 1, 'then the other one');
    run(`A.ciAns({dataset: {k: 'p_' + ${JSON.stringify(qs[0].id)}, a: 'skip', id: ${JSON.stringify(qs[0].id)}}})`);
    assert.equal(run(`billState(bills().find(b => b.id === ${JSON.stringify(qs[0].id)}))`), 'skip');
    assert.equal(run(`checkins().filter(q => q.type === 'bill').length`), 0);
    run(`setMeta({modules: {...meta().modules, money: false}}); save('money/${m}', {tx: []}); save('app/bills', {list: [{id: 'pb3', title: 'Gym', amount: 30, type: 'out', cat: 'Спорт и здоровье', day: 1}]})`);
    assert.equal(run(`checkins().filter(q => q.type === 'bill').length`), 0, 'not while Money is off');
  } finally { run(`toast = toastP; setMeta({modules: mods29}); save('money/${m}', money29); save('app/bills', {list: []}); day29 ? save('days/${d}', day29) : remove('days/${d}')`); }
});

test('a habit reaching 7 days in a row gets a moment, other days do not', () => {
  const today = run(`todayISO()`);
  const keep = JSON.parse(run(`JSON.stringify([...Array(8)].map((_, i) => [addDays(todayISO(), -i), S.docs['days/' + addDays(todayISO(), -i)] || null]))`));
  run(`for (let i = 1; i <= 6; i++){ const k = addDays(todayISO(), -i); save('days/' + k, {date: k, tasks: [{id: 'hm', title: 'Stretch', done: true}]}); } save('days/' + addDays(todayISO(), -7), {date: addDays(todayISO(), -7), tasks: [{id: 'hm', title: 'Stretch', done: false}]});
    mutDay(todayISO(), d => { d.tasks = [...(d.tasks || []).filter(t => t.id !== 'hm'), {id: 'hm', title: 'Stretch', done: true}]; })`);
  try {
    assert.equal(run(`habitStreak('hm')`), 7);
    assert.equal(run(`habitMilestone({id: 'hm', title: 'Stretch'})`), true);
    run(`mutDay(todayISO(), d => { d.tasks.find(t => t.id === 'hm').done = false; })`);
    assert.equal(run(`habitMilestone({id: 'hm', title: 'Stretch'})`), false, '6 days: nothing yet');
  } finally { run(`${JSON.stringify(keep)}.forEach(([k, v]) => v ? save('days/' + k, v) : remove('days/' + k))`); }
});

test('repeat intervals: "every 2 weeks", "every other day", "каждые 3 дня", "раз в 2 недели"', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  let t = q('change the bedsheets every 2 weeks');
  assert.deepEqual([t.title, t.every, t.n], ['Change the bedsheets', 'week', 2]);
  t = q('water the plants every other day');
  assert.deepEqual([t.title, t.every, t.n], ['Water the plants', 'day', 2]);
  t = q('полить цветы каждые 3 дня');
  assert.deepEqual([t.title, t.every, t.n], ['Полить цветы', 'day', 3]);
  t = q('уборка раз в 2 недели');
  assert.deepEqual([t.every, t.n], ['week', 2]);
  assert.equal(q('pay rent every month').n, undefined, 'plain repeats keep no interval');
  assert.equal(run(`nextDue('2030-01-06', 'week', '2030-01-06', 2)`), '2030-01-20');
  assert.equal(run(`nextDue('2030-01-31', 'month', '2030-01-31', 3)`), '2030-04-30');
  assert.equal(run(`nextDue('2030-01-31', 'month', '2030-01-31')`), '2030-02-28');
  assert.equal(run(`everyText({every: 'week', n: 2})`), run(`trf('каждые {n} {u}', {n: 2, u: plural(2, tr('неделя'), tr('недели'), tr('недель'))})`));
  assert.match(run(`icsText2([{id: 'i1', title: 'Sheets', date: '2030-01-06', time: '10:00', every: 'week', n: 2}])`), /RRULE:FREQ=WEEKLY;INTERVAL=2/);
  const today = run(`todayISO()`);
  run(`globalThis.tasks30 = clone(smartTasks()); globalThis.toastQ = toast; toast = () => {}; saveTasks([{id: 'iv', title: 'Sheets', due: '${today}', done: false, pri: 2, every: 'week', n: 2}])`);
  try {
    run(`A.tkDone({dataset: {id: 'iv'}})`);
    const next = JSON.parse(run(`JSON.stringify(smartTasks().find(x => !x.done))`));
    assert.deepEqual([next.due, next.n], [run(`addDays('${today}', 14)`), 2]);
  } finally { run(`toast = toastQ; saveTasks(tasks30)`); }
});

test('a to-do can carry a note: saved, shown as text, kept by the next repeat, removed when emptied', () => {
  const today = run(`todayISO()`), X = '<img src=x onerror=alert(1)>';
  run(`globalThis.tasks31 = clone(smartTasks()); globalThis.toastN = toast; toast = () => {}; saveTasks([{id: 'tn', title: 'Lab report', due: '${today}', done: false, pri: 2, every: 'week'}]); S.open.tk_tn = true`);
  try {
    run(`CH.tkNote({value: '  sections 3-4  ', dataset: {id: 'tn'}})`);
    assert.equal(run(`smartTasks()[0].note`), 'sections 3-4');
    run(`CH.tkNote({value: ${JSON.stringify(X)}, dataset: {id: 'tn'}})`);
    assert.ok(!/<img src=x/.test(run(`taskCard()`)), 'shown as text');
    run(`A.tkDone({dataset: {id: 'tn'}})`);
    assert.equal(run(`smartTasks().find(t => !t.done).note`), X, 'the next one keeps the note');
    run(`CH.tkNote({value: '', dataset: {id: smartTasks().find(t => !t.done).id}})`);
    assert.equal(run(`'note' in smartTasks().find(t => !t.done)`), false);
  } finally { run(`toast = toastN; S.open.tk_tn = false; saveTasks(tasks31)`); }
});

test('debts: read on the phone, kept apart from spending, settled with Undo', () => {
  const d = run(`todayISO()`), m = d.slice(0, 7);
  run(`globalThis.mods32 = meta().modules; globalThis.debts32 = S.docs['app/debts'] ? clone(S.docs['app/debts']) : undefined; globalThis.money32 = clone(S.docs['money/${m}'] || {tx: []}); globalThis.toastD2 = toast; toast = () => {};
    setMeta({modules: {...(mods32 || {}), money: true}}); save('app/debts', {list: []})`);
  try {
    const db = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, '${d}').r.debts || [])`));
    assert.deepEqual(db('Sam owes me 20'), [{who: 'Sam', amount: 20, dir: 'in'}]);
    assert.deepEqual(db('I owe Alex 15'), [{who: 'Alex', amount: 15, dir: 'out'}]);
    assert.deepEqual(db('lent Sam 30'), [{who: 'Sam', amount: 30, dir: 'in'}]);
    assert.deepEqual(db('borrowed 50 from Jo'), [{who: 'Jo', amount: 50, dir: 'out'}]);
    assert.deepEqual(db('Петя должен мне 500'), [{who: 'Петя', amount: 500, dir: 'in'}]);
    assert.deepEqual(db('я должен Пете 300'), [{who: 'Пете', amount: 300, dir: 'out'}]);
    assert.deepEqual(db('занял 1000 у Маши'), [{who: 'Маши', amount: 1000, dir: 'out'}]);
    assert.deepEqual(db('spent 12 on lunch'), []);
    assert.equal(JSON.parse(run(`JSON.stringify(localTellParse('Sam owes me 20', '${d}').r.money)`)).length, 0, 'not spending');
    run(`save('inbox/td1', {id: 'td1', kind: 'tell', meta: {date: '${d}', text: 'Sam owes me 20'}, done: false, created: new Date().toISOString(), result: localTellParse('Sam owes me 20', '${d}').r}); A.tellApply({dataset: {id: 'td1'}})`);
    assert.equal(run(`debts().length`), 1);
    assert.ok(run(`debtsCard(curMonth())`).includes('data-act="debtSettle"'));
    const id = run(`debts()[0].id`);
    run(`A.debtSettle({dataset: {id: '${id}'}})`);
    assert.equal(run(`debts().length`), 0);
    run(`A.undoApply()`);
    assert.equal(run(`debts().length`), 1, 'Undo brings it back');
  } finally { run(`toast = toastD2; remove('inbox/td1'); setMeta({modules: mods32}); save('money/${m}', money32); debts32 ? save('app/debts', debts32) : remove('app/debts')`); }
});

test('the week ahead lists each day: classes, workout, exams, to-dos and payments', () => {
  const t1 = run(`addDays(todayISO(), 1)`), t3 = run(`addDays(todayISO(), 3)`);
  run(`globalThis.plan33 = clone(plan()); globalThis.tasks33 = clone(smartTasks()); globalThis.mods33 = meta().modules; setMeta({modules: {...(mods33 || {}), money: true}})`);
  setPlan([{id: 'wa', date: t3, title: 'Physics', kind: 'exam', from: '10:00'}], [{day: run(`dow('${t1}')`), time: '09:00', title: 'Algebra'}]);
  try {
    run(`saveTasks([{id: 'wt', title: 'Buy pens', due: '${t1}', done: false, pri: 2}]); save('app/bills', {list: [{id: 'wb', title: 'Phone', amount: 15, type: 'out', cat: 'Связь и интернет', day: ${+t3.slice(8)}}]})`);
    const days = JSON.parse(run(`JSON.stringify(weekAheadDays())`));
    assert.equal(days.length, 7);
    const d1 = days[1].items.map(x => x.t), d3 = days[3].items.map(x => x.t);
    assert.ok(d1.includes('Buy pens') && d1.some(t => /1/.test(t)), 'a class and the to-do tomorrow');
    assert.ok(d3.includes('Physics') && d3.includes('Phone'), 'the exam and the payment');
    assert.ok(run(`(A.weekAhead(), SH.body())`).includes('Physics'));
  } finally { run(`closeSheetQuiet(); save('app/plan', plan33); saveTasks(tasks33); save('app/bills', {list: []}); setMeta({modules: mods33})`); }
});

test('the average of exam grades shows only for numbers on one scale', () => {
  assert.equal(run(`gradeAverage(['5', '4', null])`), run(`num(4.5, 1)`));
  assert.equal(run(`gradeAverage(['92%', '80 points'])`), '86');
  assert.equal(run(`gradeAverage(['A', '5'])`), null, 'a letter: no average');
  assert.equal(run(`gradeAverage(['5', '92'])`), null, 'two scales: no average');
  assert.equal(run(`gradeAverage(['4'])`), null, 'one grade is not an average');
});

test('money owed for two weeks is asked about; "not yet" waits a week, "yes" closes it', () => {
  const d = run(`todayISO()`), old = run(`addDays(todayISO(), -15)`);
  run(`globalThis.mods34 = meta().modules; globalThis.debts34 = S.docs['app/debts'] ? clone(S.docs['app/debts']) : undefined; globalThis.day34 = S.docs['days/${d}'] ? clone(S.docs['days/${d}']) : undefined;
    setMeta({modules: {...(mods34 || {}), money: true}}); save('app/debts', {list: [{id: 'dq', who: 'Sam', amount: 20, dir: 'in', date: '${old}'}, {id: 'dr', who: 'Kim', amount: 5, dir: 'in', date: '${d}'}, {id: 'ds', who: 'Jo', amount: 9, dir: 'out', date: '${old}'}]})`);
  try {
    let qs = JSON.parse(run(`JSON.stringify(checkins().filter(q => q.type === 'debt'))`));
    assert.deepEqual(qs.map(q => q.id), ['dq'], 'only what is owed to you, from two weeks ago');
    run(`A.ciAns({dataset: {k: 'd_dq', a: 'no', id: 'dq'}})`);
    assert.equal(run(`debtQs(addDays(todayISO(), 6)).length`), 0, 'not asked again within the week');
    assert.equal(run(`debtQs(addDays(todayISO(), 7)).length`), 1);
    run(`A.ciAns({dataset: {k: 'd_dq', a: 'yes', id: 'dq'}})`);
    assert.ok(!run(`debts().some(x => x.id === 'dq')`), 'closed');
  } finally { run(`setMeta({modules: mods34}); debts34 ? save('app/debts', debts34) : remove('app/debts'); day34 ? save('days/${d}', day34) : remove('days/${d}')`); }
});

test('a debt keeps what it was for', () => {
  run(`globalThis.mods35 = meta().modules; setMeta({modules: {...(mods35 || {}), money: true}})`);
  try {
    const db = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.debts || [])`));
    assert.deepEqual(db('Sam owes me 20 for the cinema'), [{who: 'Sam', amount: 20, dir: 'in', note: 'the cinema'}]);
    assert.deepEqual(db('Петя должен мне 500 за кино'), [{who: 'Петя', amount: 500, dir: 'in', note: 'кино'}]);
  } finally { run(`setMeta({modules: mods35})`); }
});

test('Tell KAI on the phone: "dinner at 8" is the evening, "meet" is an event, day words stay out of money notes', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  assert.equal(p('dinner with Sam on friday at 8').new_tasks[0].time, '20:00');
  assert.equal(run(`parseQuick('call the bank at 8').time`), '08:00', 'without an evening word, 8 stays the morning');
  assert.equal(p('meet Kim tomorrow 3pm').events[0].from, '15:00');
  assert.equal(p('spent 40 on groceries yesterday').money[0].note, 'groceries');
  assert.deepEqual([p('вчера продукты 1200').money[0].amount, p('вчера продукты 1200').money[0].cat], [1200, 'Супермаркеты']);
});

test('the month before in one card, in the first five days, until dismissed', () => {
  run(`globalThis.meta36 = clone(meta()); globalThis.budget36 = S.docs['app/budget'] ? clone(S.docs['app/budget']) : undefined;
    save('money/2030-09', {tx: [{id: 'a', type: 'out', amount: 100, date: '2030-09-03', cat: 'Супермаркеты', note: 'x'}]});
    save('money/2030-10', {tx: [{id: 'b', type: 'out', amount: 90, date: '2030-10-03', cat: 'Кафе и рестораны', note: 'y'}, {id: 'c', type: 'out', amount: 30, date: '2030-10-05', cat: 'Транспорт', note: 'z'}, {id: 'd', type: 'in', amount: 500, date: '2030-10-01', cat: 'Доход', note: 'w'}]});
    save('app/budget', {monthly: 100}); setMeta({monthRecapSeen: null})`);
  try {
    const r = JSON.parse(run(`JSON.stringify(monthRecap('2030-10'))`));
    assert.deepEqual([r.sum, r.pct, r.top, r.topSum, r.over], [120, 20, 'Кафе и рестораны', 90, 20]);
    const h = run(`monthRecapCard('2030-11', '2030-11-02')`);
    assert.ok(h.includes(run(`trf('бюджет превышен на {s}', {s: money(20)})`)) && h.includes('(+20%)'));
    assert.equal(run(`monthRecapCard('2030-11', '2030-11-06')`), '', 'only the first five days');
    run(`A.monthRecapOff({dataset: {m: '2030-10'}})`);
    assert.equal(run(`monthRecapCard('2030-11', '2030-11-02')`), '', 'dismissed');
  } finally { run(`remove('money/2030-09'); remove('money/2030-10'); budget36 ? save('app/budget', budget36) : remove('app/budget'); setMeta({monthRecapSeen: meta36.monthRecapSeen || null})`); }
});

test('a daily task can be limited to some weekdays', () => {
  const mon = nextDow(1), tue = run(`addDays('${mon}', 1)`);
  run(`globalThis.plan37 = clone(plan()); (() => { const p = clone(plan()); p.dailyTasks = [{id: 'mp', title: 'Meal prep', cat: 'custom'}]; save('app/plan', p); })()`);
  try {
    run(`A.dtDays({dataset: {i: 0}})`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(SH.dd)`)), [1, 2, 3, 4, 5, 6, 7]);
    run(`[2, 3, 4, 5, 6, 7].forEach(n => A.dtDay({dataset: {n}})); A.dtDaysSave({dataset: {i: 0}})`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(plan().dailyTasks[0].days)`)), [1]);
    assert.ok(run(`buildDay('${mon}').tasks.some(t => t.id === 'mp')`), 'on Monday');
    assert.ok(!run(`buildDay('${tue}').tasks.some(t => t.id === 'mp')`), 'not on Tuesday');
    assert.equal(run(`'days' in buildDay('${mon}').tasks.find(t => t.id === 'mp')`), false, 'the day keeps no copy of the rule');
    assert.equal(run(`daysLabel([1])`), run(`DOW[1]`));
    assert.equal(run(`daysLabel(undefined)`), run(`tr('Каждый день')`));
  } finally { run(`closeSheetQuiet(); save('app/plan', plan37)`); }
});

test('a to-do repeating on several weekdays becomes one per weekday; one-off days are left alone', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  let r = p('english class every tuesday and thursday at 18:00');
  assert.deepEqual(r.new_tasks.map(t => [t.title, run(`dow('${t.date}')`), t.time, t.every]), [['English class', 2, '18:00', 'week'], ['English class', 4, '18:00', 'week']]);
  r = p('зал по понедельникам и пятницам');
  assert.deepEqual(r.new_tasks.map(t => [t.title, run(`dow('${t.date}')`)]), [['Зал', 1], ['Зал', 5]]);
  r = p('meeting on monday and tuesday');
  assert.ok(!r.new_tasks.some(t => t.every), 'two one-off days are not a repeat');
});

test('the to-do field makes one repeating to-do per weekday too', () => {
  run(`globalThis.tasks38 = clone(smartTasks()); saveTasks([]); globalThis.FORM = {'#qa': 'gym every monday and friday'}`);
  try {
    run(`A.qaAdd()`);
    const ts = JSON.parse(run(`JSON.stringify(smartTasks())`));
    assert.deepEqual(ts.map(t => [t.title, run(`dow('${t.due}')`), t.every]), [['Gym', 1, 'week'], ['Gym', 5, 'week']]);
  } finally { run(`delete globalThis.FORM; saveTasks(tasks38)`); }
});

test('a full Focus session offers a 5-minute break', () => {
  const T0 = Date.UTC(2030, 2, 3, 9, 0);
  run(`globalThis.now9 = Date.now; globalThis.T = ${T0}; Date.now = () => T; globalThis.toasts9 = []; globalThis.toast9 = toast; toast = (m, o) => toasts9.push(o?.action?.act)`);
  try {
    run(`focusStart(25, 'Study'); T += 25 * 60000; focusTick()`);
    assert.ok(run(`toasts9.includes('focusBreak')`));
    run(`A.focusBreak()`);
    assert.ok(run(`TIMER.end - T > 290000 || TIMER.end - Date.now() > 0`), 'the break counts down');
  } finally { run(`stopRest(); Date.now = now9; toast = toast9; FOCUS = null; focusSave()`); }
});

test('the part after a colon becomes the to-do’s note', () => {
  assert.deepEqual(JSON.parse(run(`JSON.stringify(splitNote('Lab report: sections 3-4, template B'))`)), {title: 'Lab report', note: 'sections 3-4, template B'});
  assert.deepEqual(JSON.parse(run(`JSON.stringify(splitNote('Купить продукты — молоко, хлеб'))`)), {title: 'Купить продукты', note: 'молоко, хлеб'});
  assert.deepEqual(JSON.parse(run(`JSON.stringify(splitNote('Call mom'))`)), {title: 'Call mom'});
  const r = JSON.parse(run(`JSON.stringify(localTellParse('need to finish the lab report tomorrow: sections 3-4', todayISO()).r.new_tasks)`));
  assert.equal(r[0].note, 'sections 3-4');
  run(`globalThis.tasks39 = clone(smartTasks()); globalThis.FORM = {'#qa': 'buy groceries tomorrow: milk, bread'}`);
  try {
    run(`A.qaAdd()`);
    const t = JSON.parse(run(`JSON.stringify(smartTasks()[smartTasks().length - 1])`));
    assert.deepEqual([t.title, t.note], ['Buy groceries', 'milk, bread']);
  } finally { run(`delete globalThis.FORM; saveTasks(tasks39)`); }
});

test('a colon before the date keeps the date: "exam: physics on friday at 10"', () => {
  const r = JSON.parse(run(`JSON.stringify(localTellParse('exam: physics on friday at 10', todayISO()).r)`));
  assert.equal(r.events.length, 1);
  assert.equal(run(`dow('${r.events[0].date}')`), 5);
});

test('dates and times in words: the 15th, this weekend, end of the week, half past one', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`));
  const today = run(`todayISO()`), d = run(`dow(todayISO())`);
  const dom = q('exam on the 15th').due, dom2 = q('экзамен 15-го').due;
  assert.equal(dom.slice(8), '15'); assert.ok(dom >= today); assert.equal(dom, dom2);
  assert.equal(run(`domDate(31, '2030-02-10')`), '2030-02-28', 'a short month ends early');
  assert.equal(run(`domDate(5, '2030-12-10')`), '2031-01-05', 'a passed day is next month');
  assert.equal(q('room on the 2nd floor').due, null, 'a floor is not a date');
  assert.equal(q('лекция для 2-го курса').due, null);
  const wk = q('buy flowers this weekend').due;
  assert.equal(wk, d >= 6 ? today : run(`addDays(todayISO(), ${6 - d})`));
  assert.equal(q('купить цветы на выходных').due, wk);
  assert.equal(run(`dow('${q('essay due end of the week').due}')`), d <= 5 ? 5 : d);
  assert.equal(run(`softDate('end of the month', '2030-02-10')`), '2030-02-28');
  assert.equal(q('lunch at half past one').time, '13:30');
  assert.equal(q('обед в половине второго').time, '13:30');
  assert.equal(q('ужин в половине восьмого вечера').time, '19:30');
  assert.equal(q('dinner at half past 7 pm').time, '19:30');
  assert.equal(q('call at a quarter to nine').time, '08:45');
  assert.equal(q('созвон без четверти девять').time, '08:45');
  assert.equal(q('stand-up at a quarter past 9').title, 'Stand-up');
});

test('to-do titles drop "remind me to", stray "the" and a leading colon', () => {
  const q = t => JSON.parse(run(`JSON.stringify(parseQuick(${JSON.stringify(t)}))`)).title;
  assert.equal(q('remind me to call mom in 2 hours'), 'Call mom');
  assert.equal(q('напомни позвонить маме через 2 часа'), 'Позвонить маме');
  assert.equal(q('dentist the day after tomorrow at 11'), 'Dentist');
  assert.equal(q('tonight: finish slides'), 'Finish slides');
});

test('water is not logged as food; sports count as training time', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  assert.ok(!(p('drank 3 glasses of water').meals || []).length);
  assert.ok(!(p('выпил 3 стакана воды').meals || []).length);
  assert.ok(/Watermelon/.test(p('ate watermelon 200g').meals[0].name), 'watermelon is still found');
  assert.deepEqual(p('played football for 90 minutes').time_log, [{kind: 'gym', min: 90}]);
  assert.deepEqual(p('растяжка 15 мин').time_log, [{kind: 'gym', min: 15}]);
});

test('the top of the range: weight for lifts, a harder variant at home, longer holds', () => {
  const h = e => run(`exTopHint(${JSON.stringify(e)})`);
  assert.ok(!/kg|кг|lb|фнт/i.test(h({bw: true, hi: 12})), 'no weight for a bodyweight exercise');
  assert.ok(/12/.test(h({bw: true, hi: 12})));
  assert.ok(!/kg|кг|lb|фнт/i.test(h({unit: run(`tr('сек')`), hi: 30})), 'no weight for a plank');
  assert.ok(/2[.,]5|5 (?:lb|фнт)/i.test(h({hi: 10})), 'barbell lifts still add weight');
  const days = run(`JSON.stringify(Object.values(HOME_WORKOUTS).flatMap(w => w.ex).filter(e => !e.bw && !e.unit).map(e => e.id))`);
  assert.equal(days, "[]", "every home exercise is bodyweight or a hold");
  assert.ok(run(`exBw({id: "deadbug"})`), "an older plan’s dead bug counts as bodyweight");
});

test('the Daily list names exercises in short, not by their first word', () => {
  const s = n => run(`exShort(${JSON.stringify(n)})`);
  assert.equal(s('Reverse lunges with support'), 'Reverse lunges');
  assert.equal(s('Push-ups against a table or wall'), 'Push-ups');
  assert.equal(s('Incline dumbbell press (30°)'), 'Incline dumbbell press');
  assert.equal(s('Тяга каната к лицу (face pull)'), 'Тяга каната');
  assert.equal(s('Отжимания на брусьях'), 'Отжимания на брусьях');
  assert.equal(s('Жим штанги лёжа'), 'Жим штанги');
  assert.equal(s('Планка'), 'Планка');
});

test('to-dos left from earlier days move to today in one tap, with Undo', () => {
  run(`globalThis.tasks41 = clone(smartTasks()); saveTasks([{id: 'l1', title: 'Old A', due: addDays(todayISO(), -3), done: false, pri: 2}, {id: 'l2', title: 'Old B', due: addDays(todayISO(), -1), time: '00:01', done: false, pri: 2}, {id: 'l3', title: 'Future', due: addDays(todayISO(), 2), done: false, pri: 2}])`);
  try {
    assert.ok(/data-act="tkLateToday"/.test(run(`taskCard()`)));
    run(`A.tkLateToday()`);
    const ts = JSON.parse(run(`JSON.stringify(smartTasks())`));
    assert.deepEqual(ts.map(t => t.due === run(`todayISO()`)), [true, true, false]);
    assert.equal(ts[1].time, null, 'a time already gone is dropped');
    assert.ok(!/data-act="tkLateToday"/.test(run(`taskCard()`)));
    run(`A.undoApply()`);
    assert.ok(JSON.parse(run(`JSON.stringify(smartTasks())`))[0].due < run(`todayISO()`), 'Undo puts them back');
  } finally { run(`saveTasks(tasks41)`); }
});

test('on the first day, past blocks are not "checked off 0"', () => {
  const st = `b => null`;
  run(`globalThis.meta42 = clone(meta()); setMeta({startedOn: todayISO()})`);
  try {
    assert.equal(run(`pastDone([{id: 'x'}], ${st}, todayISO())`), '');
    assert.ok(/1/.test(run(`pastDone([{id: 'x'}], b => 'done', todayISO())`)));
    run(`setMeta({startedOn: addDays(todayISO(), -5)})`);
    assert.ok(/0/.test(run(`pastDone([{id: 'x'}], ${st}, todayISO())`)), 'later days still say it');
  } finally { run(`save('app/meta', meta42)`); }
});

test('money in more everyday words: "$5 coffee", "lunch for 12", "1,200", stipend, refund, a second item', () => {
  const m = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.money)`));
  assert.deepEqual(m('$5 coffee').map(x => [x.type, x.amount]), [['out', 5]]);
  assert.deepEqual(m('lunch for 12').map(x => x.amount), [12]);
  assert.deepEqual(m('обед за 400').map(x => x.amount), [400]);
  assert.deepEqual(m('spent 1,200 on rent').map(x => [x.amount, x.cat]), [[1200, 'Жильё и коммуналка']]);
  assert.deepEqual(m('stipend 300').map(x => [x.type, x.cat]), [['in', 'Доход']]);
  assert.deepEqual(m('получил стипендию 3000').map(x => [x.type, x.amount]), [['in', 3000]]);
  assert.deepEqual(m('refund 20 from amazon').map(x => [x.type, x.note]), [['in', 'refund from amazon']]);
  assert.deepEqual(m('train ticket 22').map(x => x.cat), ['Транспорт']);
  assert.deepEqual(m('подарок маме 1500').map(x => x.note), ['подарок маме']);
  assert.deepEqual(m('кофе 200 и булочка 100').map(x => x.amount), [200, 100]);
  assert.deepEqual(m('2 pizzas'), [], 'a count without a currency is food, not money');
  assert.deepEqual(m('spent 10 on lunch and weight 70'), m('spent 10 on lunch'), 'a weight after money is not a second payment');
});

test('a morning question asks for hours of sleep, one tap', () => {
  const date = run(`todayISO()`);
  run(`globalThis.hk43 = [1, 2, 3].map(i => S.docs['days/' + addDays(todayISO(), -i)]?.sleepHealth); [1, 2, 3].forEach(i => S.docs['days/' + addDays(todayISO(), -i)] && mutDay(addDays(todayISO(), -i), d => { delete d.sleepHealth; }))`);
  run(`globalThis.day43 = clone(getDay(todayISO())); mutDay(todayISO(), d => { delete d.sleep; d.asked = {}; if (!d.tasks.some(t => t.cat === 'sleep')) d.tasks.push({id: 'sl43', cat: 'sleep', title: 'Sleep', done: false}); })`);
  try {
    assert.equal(run(`sleepQ(todayISO(), getDay(todayISO()), 9)?.k`), 'sl', run(`JSON.stringify([getDay(todayISO()).sleep, getDay(todayISO()).tasks.map(t => t.cat), [0,1,2,3].map(i => S.docs['days/' + addDays(todayISO(), -i)]?.sleepHealth)])`));
    assert.equal(run(`sleepQ(todayISO(), getDay(todayISO()), 15)`), null, 'not in the afternoon');
    assert.ok(/data-a="9"/.test(run(`sleepQBody({})`)));
    run(`globalThis.toast43 = toast; toast = () => {}; A.ciAns({dataset: {k: 'sl', a: '6', id: ''}}); toast = toast43`);
    assert.equal(run(`getDay(todayISO()).sleep`), 6);
    assert.equal(run(`sleepQ(todayISO(), getDay(todayISO()), 9)`), null, 'answered once');
    run(`mutDay(addDays(todayISO(), -1), d => { d.sleepHealth = true; }); mutDay(todayISO(), d => { delete d.sleep; })`);
    assert.equal(run(`sleepQ(todayISO(), getDay(todayISO()), 9)`), null, 'not when Apple Health fills it in');
  } finally { run(`save('days/' + todayISO(), day43); [1, 2, 3].forEach((i, j) => S.docs['days/' + addDays(todayISO(), -i)] && mutDay(addDays(todayISO(), -i), d => { if (hk43[j] === undefined) delete d.sleepHealth; else d.sleepHealth = hk43[j]; }))`); }
});

test('streak freezes: earned every 7 days, used by themselves on a missed day', () => {
  run(`globalThis.meta44 = clone(meta()); globalThis.days44 = Object.fromEntries([...Array(20)].map((_, i) => ['days/' + addDays(todayISO(), -i), S.docs['days/' + addDays(todayISO(), -i)] && clone(S.docs['days/' + addDays(todayISO(), -i)])]))`);
  run(`globalThis.toast44 = toast; toast = () => {}`);
  const secure = i => run(`mutDay(addDays(todayISO(), -${i}), d => { d.status = null; d.tasks.forEach(t => { t.done = true; }); })`);
  const miss = i => run(`mutDay(addDays(todayISO(), -${i}), d => { d.status = null; d.tasks.forEach(t => { t.done = false; }); })`);
  try {
    run(`save('app/meta', {...meta(), freeze: {n: 1, used: []}, startedOn: addDays(todayISO(), -30)})`);
    for (let i = 2; i <= 10; i++) secure(i);
    miss(1); miss(0); miss(11);
    assert.equal(run(`streak()`), 0, 'yesterday was missed');
    run(`freezeTick()`);
    assert.equal(run(`streak()`), 9, 'the freeze kept the 9 days');
    assert.equal(run(`freezeDoc().n`), 0);
    assert.ok(run(`frozenDays().has(addDays(todayISO(), -1))`));
    run(`freezeTick()`); assert.equal(run(`freezeDoc().n`), 0, 'once a day');
    // two missed days with one freeze: nothing is used
    run(`save('app/meta', {...meta(), freeze: {n: 1, used: []}})`); miss(2);
    run(`freezeTick()`); assert.equal(run(`freezeDoc().n`), 1);
    // earning: 7 days in a row
    run(`save('app/meta', {...meta(), freeze: {n: 0, used: []}})`);
    for (let i = 0; i <= 6; i++) secure(i); miss(7);
    assert.equal(run(`streak()`), 7);
    run(`freezeTick()`); assert.equal(run(`freezeDoc().n`), 1);
    run(`save('app/meta', {...meta(), freeze: {...freezeDoc(), day: null}})`); run(`freezeTick()`); assert.equal(run(`freezeDoc().n`), 1, 'the same 7 days pay once');
    assert.ok(/1/.test(run(`freezeRow()`)));
    assert.ok(run(`bestStreak()`) >= 7);
  } finally { run(`toast = toast44; save('app/meta', meta44); Object.entries(days44).forEach(([k, v]) => v ? save(k, v) : remove(k))`); }
});

test('weekly challenges: fixed on Monday from last week, done once, worth XP', () => {
  run(`globalThis.meta45 = clone(meta()); globalThis.toast45 = toast; toast = () => {}`);
  try {
    run(`save('app/meta', {...meta(), challenges: {}, startedOn: addDays(todayISO(), -60)})`);
    const w = JSON.parse(run(`JSON.stringify(weekChallenges())`));
    assert.equal(w.list[0].id, 'counted');
    assert.ok(w.list.length >= 2 && w.list.length <= 3);
    assert.ok(w.list.every(c => c.goal > 0));
    assert.ok(/This week|Вызовы недели/.test(run(`challengeCard()`)));
    run(`challengeTick()`);
    assert.ok(run(`!!meta().challenges[weekChallenges().mon]`), 'saved for the week');
    const xp0 = run(`totalXP()`);
    // make the first challenge reachable and tick
    run(`save('app/meta', {...meta(), challenges: {[weekChallenges().mon]: {list: [{id: 'todos', goal: 1}], done: []}}}); globalThis.tasks45 = clone(smartTasks()); saveTasks([...smartTasks(), {id: 'c45', title: 'x', done: true, doneAt: todayISO(), pri: 2}])`);
    run(`challengeTick()`);
    assert.deepEqual(JSON.parse(run(`JSON.stringify(weekChallenges().done)`)), ['todos']);
    assert.equal(run(`challengeXP()`), 150, 'one of one: the challenge and the bonus');
    assert.ok(run(`totalXP()`) >= xp0 + 150);
    run(`challengeTick()`); assert.equal(run(`challengeXP()`), 150, 'paid once');
    run(`saveTasks(tasks45)`);
  } finally { run(`toast = toast45; save('app/meta', meta45)`); }
});

test('the day after a streak breaks, a kind card shows one step, once', () => {
  run(`globalThis.meta46 = clone(meta()); globalThis.days46 = Object.fromEntries([...Array(10)].map((_, i) => ['days/' + addDays(todayISO(), -i), S.docs['days/' + addDays(todayISO(), -i)] && clone(S.docs['days/' + addDays(todayISO(), -i)])]))`);
  try {
    run(`save('app/meta', {...meta(), freeze: {n: 0, used: [], day: todayISO()}, comebackSeen: null})`);
    for (let i = 2; i <= 6; i++) run(`mutDay(addDays(todayISO(), -${i}), d => { d.status = null; d.tasks.forEach(t => { t.done = true; }); })`);
    run(`mutDay(addDays(todayISO(), -1), d => { d.status = null; d.tasks.forEach(t => { t.done = false; }); }); mutDay(todayISO(), d => { d.status = null; d.tasks.forEach(t => { t.done = false; }); })`);
    assert.equal(run(`comebackInfo()?.run`), 5);
    assert.ok(/data-act="comebackOk"/.test(run(`comebackCard()`)));
    run(`A.comebackOk()`);
    assert.equal(run(`comebackCard()`), '', 'dismissed for this break');
    run(`save('app/meta', {...meta(), comebackSeen: null, freeze: {n: 0, used: [addDays(todayISO(), -1)], day: todayISO()}})`);
    assert.equal(run(`comebackCard()`), '', 'not when a freeze covered the day');
  } finally { run(`save('app/meta', meta46); Object.entries(days46).forEach(([k, v]) => v ? save(k, v) : remove(k))`); }
});

test('awards for challenges, freezes and coming back after a break', () => {
  run(`globalThis.meta47 = clone(meta()); globalThis.days47 = Object.fromEntries([...Array(10)].map((_, i) => ['days/' + addDays(todayISO(), -i), S.docs['days/' + addDays(todayISO(), -i)] && clone(S.docs['days/' + addDays(todayISO(), -i)])]))`);
  try {
    run(`save('app/meta', {...meta(), challenges: {'2030-01-07': {list: [{id: 'counted', goal: 3}, {id: 'walk', goal: 150}], done: ['counted', 'walk']}}, freeze: {n: 0, used: [addDays(todayISO(), -9)]}})`);
    for (let i = 3; i <= 7; i++) run(`mutDay(addDays(todayISO(), -${i}), d => { d.status = null; d.tasks.forEach(t => { t.done = true; }); })`);
    run(`mutDay(addDays(todayISO(), -2), d => { d.status = null; d.tasks.forEach(t => { t.done = false; }); }); mutDay(addDays(todayISO(), -1), d => { d.status = null; d.tasks.forEach(t => { t.done = true; }); })`);
    const st = JSON.parse(run(`JSON.stringify(habitBadgeStats(dayKeys()))`));
    assert.equal(st.chDone, 2); assert.equal(st.chWeeks, 1); assert.equal(st.frozen, 1);
    assert.ok(st.comeback >= 1, 'the day after the break counted');
    const ids = JSON.parse(run(`JSON.stringify(earnedBadgeIds())`));
    for (const id of ['ch1', 'chWeek', 'freeze1', 'comeback']) assert.ok(ids.includes(id), id);
    assert.ok(!ids.includes('chWeek4'));
  } finally { run(`save('app/meta', meta47); Object.entries(days47).forEach(([k, v]) => v ? save(k, v) : remove(k))`); }
});

test('levels have titles', () => {
  assert.notEqual(run(`levelTitle(1)`), run(`levelTitle(5)`));
  assert.equal(run(`levelTitle(3)`), run(`levelTitle(2)`));
  assert.equal(run(`levelTitle(99)`), run(`levelTitle(21)`));
  assert.ok(run(`levelRow()`).includes(run(`levelTitle(levelOf(totalXP()).level)`)));
});

test('the evening nudge names the streak at stake', () => {
  assert.ok(/12/.test(run(`nudgeTitle(2, 12)`)));
  assert.ok(!/12/.test(run(`nudgeTitle(2, 1)`)));
  assert.notEqual(run(`nudgeTitle(2, 12)`), run(`nudgeTitle(2, 1)`));
});

test('the weekly recap counts challenges done', () => {
  run(`globalThis.meta48 = clone(meta())`);
  try {
    run(`const e = recapRange()[6]; save('app/meta', {...meta(), challenges: {[addDays(e, 1 - dow(e))]: {list: [{id: 'counted', goal: 3}, {id: 'walk', goal: 150}, {id: 'todos', goal: 5}], done: ['counted', 'walk']}}})`);
    const st = JSON.parse(run(`JSON.stringify(recapStats())`));
    assert.deepEqual([st.chDone, st.chN], [2, 3]);
    assert.ok(JSON.parse(run(`JSON.stringify(recapPlan(recapStats()).tiles)`)).some(t => t[0] === '2 / 3'));
  } finally { run(`save('app/meta', meta48)`); }
});

test('a plan after spending is not read as a second payment', () => {
  const r = JSON.parse(run(`JSON.stringify(localTellParse('spent 8 on coffee and pastry, and chem quiz on Monday at 11', todayISO()).r)`));
  assert.deepEqual(r.money.map(m => m.amount), [8]);
  const r2 = JSON.parse(run(`JSON.stringify(localTellParse('кофе 200 и встреча в 15', todayISO()).r)`));
  assert.deepEqual(r2.money.map(m => m.amount), [200]);
});

test('the chain shows 13 weeks of days in the Streak sheet', () => {
  const h = run(`chainGrid()`);
  assert.equal((h.split("class=\"legend\"")[0].match(/<i class="cg-/g) || []).length, 91);
  assert.ok(/role="img"/.test(h));
});

test('one weekly challenge can be swapped, once a week', () => {
  run(`globalThis.meta49 = clone(meta()); globalThis.toast49 = toast; toast = () => {}`);
  try {
    run(`save('app/meta', {...meta(), challenges: {[addDays(todayISO(), 1 - dow(todayISO()))]: {list: [{id: 'counted', goal: 7}, {id: 'todos', goal: 40}], done: []}}})`);
    assert.ok(/data-act="chSwap"/.test(run(`challengeCard()`)));
    run(`A.chSwap({dataset: {id: 'todos'}})`);
    const w = JSON.parse(run(`JSON.stringify(weekChallenges())`));
    assert.ok(w.swapped); assert.ok(!w.list.some(c => c.id === 'todos')); assert.equal(w.list.length, 2);
    assert.ok(!/data-act="chSwap"/.test(run(`challengeCard()`)), 'once a week');
    run(`challengeTick()`); assert.ok(run(`weekChallenges().swapped`), 'kept after a tick');
  } finally { run(`toast = toast49; save('app/meta', meta49)`); }
});

test('the main task of the day: one at a time, first in the list, +20 XP', () => {
  run(`globalThis.tasks50 = clone(smartTasks()); globalThis.toast50 = toast; toast = () => {}`);
  try {
    run(`saveTasks([{id: 'a', title: 'Essay', due: todayISO(), done: false, pri: 2}, {id: 'b', title: 'Laundry', due: todayISO(), done: false, pri: 2}, {id: 'c', title: 'Someday', due: null, done: false, pri: 2}])`);
    assert.equal(run(`mitQ(todayISO(), 9)?.k`), 'mit');
    assert.ok(/data-a="a"/.test(run(`mitQBody({})`)));
    run(`A.tkMit({dataset: {id: 'b'}})`);
    assert.equal(run(`mitQ(todayISO(), 9)`), null, 'asked only while there is none');
    run(`A.tkMit({dataset: {id: 'c'}})`);
    const ts = JSON.parse(run(`JSON.stringify(smartTasks())`));
    assert.deepEqual(ts.map(t => !!t.mit), [false, false, true], 'one at a time');
    assert.equal(ts[2].due, run(`todayISO()`), 'the main task is for today');
    assert.ok(run(`taskCard()`).indexOf('Someday') < run(`taskCard()`).indexOf('Essay'), 'first in the list');
    const xp = run(`totalXP()`);
    run(`A.tkDone({dataset: {id: 'c'}})`);
    assert.equal(run(`totalXP()`), xp + 30);
  } finally { run(`toast = toast50; saveTasks(tasks50)`); }
});

test('a Saturday reminder lists the challenges still open, when turned on', () => {
  run(`globalThis.meta51 = clone(meta())`);
  try {
    const mon = run(`addDays(todayISO(), 1 - dow(todayISO()))`);
    run(`save('app/meta', {...meta(), challenges: {'${mon}': {list: [{id: 'counted', goal: 7}, {id: 'todos', goal: 40}], done: []}}})`);
    const c = JSON.parse(run(`JSON.stringify(challengeNudge(todayISO()))`));
    if (run(`dow(todayISO())`) <= 6){ assert.ok(c && /2/.test(c.title)); assert.equal(run(`dow('${mon}') + 5`), 6); }
    assert.ok(!run(`buildReminders(0).some(r => r.key.startsWith('ch'))`), 'off until turned on');
    run(`setMeta({remind: {...(meta().remind || {}), challenges: true}})`);
    if (run(`dow(todayISO())`) < 6) assert.ok(run(`buildReminders(0).some(r => r.key.startsWith('ch'))`));
  } finally { run(`save('app/meta', meta51)`); }
});

test('everyday dishes are not read as one of their ingredients', () => {
  const m = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.meals || [])`)).map(x => x.name).join();
  assert.ok(!/твёрд|hard/i.test(m('сырники 200г')), 'syrniki are not hard cheese');
  assert.ok(!/грудка|breast/i.test(m('вареники 250г')), 'vareniki are not boiled chicken');
  assert.ok(/Цезарь|Caesar/.test(m('салат цезарь 250г')));
  assert.ok(/Hamburger|Гамбургер/.test(m('ate a burger')));
  assert.ok(/Hot dog|Хот-дог/.test(m('a hot dog')) && !/Sausage|Сосиска/.test(m('a hot dog')));
  assert.ok(/Lentil soup|Суп чечевичный/.test(m('lentil soup 300g')));
  assert.ok(/сыр|cheese/i.test(m('200 г сыра')), 'cheese is still cheese');
  assert.equal(run(`sameWord('сыром', 'сыр')`), true);
  assert.equal(run(`sameWord('сырни', 'сыр')`), false);
});

test('the level sheet explains how XP is earned and the next title', () => {
  run(`A.levelInfo()`);
  const h = run(`document.querySelector('.sheet')?.innerHTML || SH?.html || ''`);
  assert.ok(run(`levelRow()`).includes('data-act="levelInfo"'));
  run(`closeSheet()`);
});

test('sound is on by default, and a choice in settings is kept', () => {
  run(`globalThis.meta52 = clone(meta())`);
  try {
    run(`const m = clone(meta()); delete m.fx; save('app/meta', m)`);
    assert.equal(run(`FX().sound`), true);
    run(`setMeta({fx: {sound: false}})`);
    assert.equal(run(`FX().sound`), false);
  } finally { run(`save('app/meta', meta52)`); }
});

test('haptics: native types for outcomes, the error pattern for "that did not work"', () => {
  const calls = JSON.parse(run(`(() => { const c = []; const nh = {notification: o => (c.push('n:' + o.type), Promise.resolve()), impact: o => (c.push('i:' + o.style), Promise.resolve()), selectionStart: () => Promise.resolve(), selectionChanged: () => (c.push('s'), Promise.resolve()), selectionEnd: () => Promise.resolve()}; ['success', 'error', 'warning', 'selection', 'medium', 'light'].forEach(k => nativeHaptic(nh, k)); return JSON.stringify(c); })()`));
  assert.deepEqual(calls, ['n:SUCCESS', 'n:ERROR', 'n:WARNING', 's', 'i:MEDIUM', 'i:LIGHT']);
  assert.equal(run(`isErrToast(tr('Впиши, что сделать'))`), true);
  assert.equal(run(`isErrToast(tr('День оценён'))`), false);
  assert.equal(run(`hapDefault('undoApply')`), 'medium');
});

test('cached answers follow the data: day lists, posts and XP update after a save', () => {
  const n0 = run(`dayKeys().length`), xp0 = run(`totalXP()`);
  const k = '2031-01-01';
  run(`save('days/${k}', {...buildDay('${k}'), tasks: buildDay('${k}').tasks.map(t => ({...t, done: true}))})`);
  try {
    assert.equal(run(`dayKeys().length`), n0 + 1);
    assert.ok(run(`totalXP()`) > xp0, 'XP counts the new day');
    run(`dayKeys().reverse()`); assert.equal(run(`dayKeys()[0] <= dayKeys()[dayKeys().length - 1]`), true, 'a caller reversing the list does not change the cache');
  } finally { run(`remove('days/${k}')`); }
  assert.equal(run(`dayKeys().length`), n0);
  assert.equal(run(`hm('07:30')`), 450); assert.equal(run(`hm('07:30')`), 450);
});

test('no advice to eat less while logged food is far below the target', () => {
  setProfile({age: 30, height: 178, weight: 80, sex: 'm', goal: 'lose', activity: 1.45, units: 'metric'});
  for (let i = 0; i < 10; i++) run(`mutDay(addDays(todayISO(), -${i}), d => { d.meals = [{id: 'lw${i}', name: 'Soup', kcal: 600, p: 30, f: 20, c: 60}]; })`);
  run(`globalThis.wt2 = weightTrend`);
  try {
    run(`weightTrend = () => ({rate: 0.45, perWeek: 0.35})`);
    const a = JSON.parse(run(`JSON.stringify(adaptiveAdvice())`));
    assert.equal(a.kcal, undefined, 'no button to lower the target');
    assert.equal(a.state, 'log');
    assert.match(a.text, /far below|намного ниже/);
  } finally { run(`weightTrend = wt2`); }
});

test('Tell KAI: what already happened is not a to-do; pomodoros, "1h30", study ranges and sets of reps are read', () => {
  const p = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
  for (const t of ['went to bed at 1am', 'проснулся в 6:30', 'поспал днём 30 минут', 'called mom at 5']) assert.equal(p(t).new_tasks.length, 0, t);
  assert.equal(p('call mom at 5').new_tasks.length, 1, 'a plan is still a plan');
  assert.equal(p('feed the cat at 6').new_tasks.length, 1, '"feed" is not a past tense');
  assert.deepEqual(p('studied for 3 pomodoros').time_log, [{kind: 'study', min: 75}]);
  assert.deepEqual(p('revised biology 1h30').time_log, [{kind: 'study', min: 90}]);
  assert.deepEqual(p('делал домашку с 18 до 20').time_log, [{kind: 'study', min: 120}]);
  assert.deepEqual(p('качался час').time_log, [{kind: 'gym', min: 60}]);
  assert.deepEqual(p('плавание 45 минут').time_log, [{kind: 'gym', min: 45}]);
  assert.deepEqual(p('дошёл до универа за 25 минут').time_log, [{kind: 'walk', min: 25}]);
  assert.equal(p('did 3 sets of 10 pushups').sets.length, 3);
  assert.ok(!p('отжимания 3х15').sets.some(s => s.ex === 'dips'), 'push-ups are not dips');
  assert.deepEqual(p('drank coffee 3.50').money.map(m => m.amount), [3.5]);
  assert.ok(!/60 мин/.test(run(`JSON.stringify(localTellParse('лёг в час ночи', todayISO()).left)`)), 'в час ночи is one o clock');
});

test('the week ahead is asked on Sunday evening or Monday morning, once', () => {
  run(`globalThis.meta53 = clone(meta())`);
  try {
    run(`setMeta({startedOn: '2030-01-01', weekPlan: null})`);
    const sun = '2030-03-10', mon = '2030-03-11';
    assert.equal(run(`dow('${sun}')`), 7);
    assert.equal(run(`weekPlanQ('${sun}', 18)?.k`), 'wp_' + mon);
    assert.equal(run(`weekPlanQ('${sun}', 11)`), null, 'not on Sunday morning');
    assert.equal(run(`weekPlanQ('${mon}', 9)?.k`), 'wp_' + mon, 'Monday morning, if Sunday was missed');
    assert.equal(run(`weekPlanQ('2030-03-12', 9)`), null);
    run(`setMeta({weekPlan: 'wp_${mon}'})`);
    assert.equal(run(`weekPlanQ('${mon}', 9)`), null, 'answered once for the week');
    assert.ok(/data-act="ciWeek"/.test(run(`weekPlanBody({k: 'wp_x'})`)));
  } finally { run(`save('app/meta', meta53)`); }
  const ev = JSON.parse(run(`JSON.stringify(localTellParse('essay by friday', todayISO()).r.events)`));
  assert.equal(ev[0]?.kind, 'deadline');
  assert.equal(JSON.parse(run(`JSON.stringify(localTellParse('buy milk by friday', todayISO()).r.new_tasks)`)).length, 1);
});

test('Focus: the fourth full session of the day offers a 15-minute break', () => {
  run(`globalThis.day54 = clone(getDay(todayISO()))`);
  try {
    run(`mutDay(todayISO(), d => { d.focus = [1, 2, 3].map(() => ({at: '09:00', min: 25, of: 25, leaves: 0})); })`);
    assert.equal(run(`focusBreakAction().act`), 'focusBreak');
    run(`mutDay(todayISO(), d => { d.focus.push({at: '11:00', min: 25, of: 25, leaves: 0}); })`);
    assert.equal(run(`focusBreakAction().act`), 'focusBreakLong');
    run(`mutDay(todayISO(), d => { d.focus.push({at: '12:00', min: 5, of: 25, leaves: 0}); })`);
    assert.equal(run(`focusBreakAction().act`), 'focusBreakLong', 'a cut-short session does not count');
  } finally { run(`save('days/' + todayISO(), day54)`); }
});

test('savings goals: saved apart from spending, with Undo and a celebration at the goal', () => {
  run(`globalThis.sv55 = S.docs['app/savings'] ? clone(S.docs['app/savings']) : null; globalThis.toast55 = toast; globalThis.t55 = []; toast = (m, o) => t55.push(m)`);
  try {
    run(`save('app/savings', {list: []})`);
    assert.ok(/data-act="saveNew"/.test(run(`savingsCard(curMonth())`)));
    run(`globalThis.FORM = {'#svT': 'Laptop', '#svG': '1000', '#svS': '200'}; A.saveCreate(); delete globalThis.FORM`);
    const g = JSON.parse(run(`JSON.stringify(savings()[0])`));
    assert.deepEqual([g.title, g.target, g.saved], ['Laptop', 1000, 200]);
    const tx0 = run(`monthTx(curMonth()).length`);
    run(`globalThis.FORM = {'#svA': '800'}; A.saveMove({dataset: {id: '${g.id}', dir: '1'}}); delete globalThis.FORM`);
    assert.equal(run(`savings()[0].saved`), 1000);
    assert.equal(run(`monthTx(curMonth()).length`), tx0, 'not a spending entry');
    assert.ok(run(`!!savings()[0].doneAt`));
    run(`A.undoApply()`);
    assert.equal(run(`savings()[0].saved`), 200, 'Undo takes it back');
    assert.equal(run(`saveMilestone('x', 40, 55); 1`), 1);
  } finally { run(`toast = toast55; sv55 ? save('app/savings', sv55) : remove('app/savings')`); }
});

test('Tell KAI puts "saved 50 for the laptop" into the savings goal, not spending', () => {
  run(`globalThis.meta56 = clone(meta()); setMeta({modules: {...(meta().modules || {}), money: true}})`);
  run(`globalThis.sv56 = S.docs['app/savings'] ? clone(S.docs['app/savings']) : null; save('app/savings', {list: [{id: 'g1', title: 'Laptop', target: 1000, saved: 100, created: todayISO(), log: []}]})`);
  try {
    for (const t of ['saved 50 for the laptop', 'put 50 into savings', 'отложил 50 в копилку']){
      const r = JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r)`));
      assert.deepEqual(r.savings, [{id: 'g1', amount: 50}], t);
      assert.equal(r.money.length, 0, t + ': not spending');
    }
    assert.equal(JSON.parse(run(`JSON.stringify(localTellParse('saved 50 for a trip', todayISO()).r.savings || [])`)).length, 0, 'no goal by that name');
    run(`savingsAddMany([{id: 'g1', amount: 50}])`);
    assert.equal(run(`savings()[0].saved`), 150);
    const lines = run(`tellLines({savings: [{id: 'g1', amount: 50}], time_log: [], money: [], new_tasks: [], events: []}, todayISO()).join('|')`);
    assert.ok(/Laptop/.test(lines));
  } finally { run(`sv56 ? save('app/savings', sv56) : remove('app/savings'); save('app/meta', meta56)`); }
});

test('days export as a spreadsheet, one row a day', () => {
  const k = '2031-02-02';
  run(`save('days/${k}', {...buildDay('${k}'), sleep: 7.5, steps: 9000, weight: 70, meals: [{name: 'x', kcal: 500, p: 30, f: 10, c: 50}], note: 'Good, "busy" day'})`);
  try {
    const csv = run(`daysCSV()`).split('\r\n');
    assert.ok(csv.length >= 2);
    const row = csv.find(r => r.startsWith(k));
    assert.ok(row, 'the day is there');
    assert.ok(row.includes('9000') && row.includes('500') && row.includes('"Good, ""busy"" day"'));
    const cols = line => { let n = 1, inQ = false; for (const ch of line){ if (ch === '"') inQ = !inQ; else if (ch === ',' && !inQ) n++; } return n; };
    assert.equal(cols(row), cols(csv[0]), 'as many columns as the header');
  } finally { run(`remove('days/${k}')`); }
});

test('insights compare the person’s own days, only with enough days and a clear gap', () => {
  run(`globalThis.days57 = Object.fromEntries(dayKeys().filter(k => k >= addDays(todayISO(), -95)).map(k => [k, clone(S.docs['days/' + k])])); Object.keys(days57).forEach(k => remove('days/' + k))`);
  try {
    for (let i = 0; i < 12; i++) run(`(() => { const k = addDays(todayISO(), -${i + 1}); save('days/' + k, {...buildDay(k), status: 'ok', sleep: ${i % 2 ? 8 : 5}, tasks: buildDay(k).tasks.map((t, j) => ({...t, done: ${i % 2 ? 'true' : 'j % 2 === 0'}}))}); })()`);
    const list = JSON.parse(run(`JSON.stringify(insights())`));
    const sl = list.find(x => /7/.test(x.text));
    assert.ok(sl && sl.a > sl.b, 'better days after longer sleep');
    assert.ok(run(`insightsCard()`).includes(String(sl.a)));
    for (let i = 0; i < 12; i++) run(`remove('days/' + addDays(todayISO(), -${i + 1}))`);
    for (let i = 0; i < 4; i++) run(`(() => { const k = addDays(todayISO(), -${i + 1}); save('days/' + k, {...buildDay(k), sleep: ${i % 2 ? 8 : 5}}); })()`);
    assert.equal(run(`insights().length`), 0, 'not with a handful of days');
  } finally { run(`dayKeys().filter(k => k >= addDays(todayISO(), -95)).forEach(k => remove('days/' + k)); Object.entries(days57).forEach(([k, v]) => save('days/' + k, v))`); }
});

test('a screen that throws shows a message with Reload, and the error goes to a local log', () => {
  run(`localStorage.removeItem('kai_errlog')`);
  const h = run(`safeView(() => { throw new Error('boom'); })`);
  assert.ok(/data-act="appReload"/.test(h) && /role="alert"/.test(h));
  const log = JSON.parse(run(`JSON.stringify(errLog())`));
  assert.equal(log.length, 1); assert.equal(log[0].m, 'boom'); assert.equal(log[0].k, 'render');
  run(`safeView(() => { throw new Error('boom'); })`);
  assert.equal(run(`errLog().length`), 1, 'the same error twice is one entry');
  assert.equal(run(`safeView(() => 'ok')`), 'ok');
  run(`localStorage.removeItem('kai_errlog')`);
});

test('insights also compare the day rating after long and short sleep', () => {
  run(`globalThis.days58 = Object.fromEntries(dayKeys().filter(k => k >= addDays(todayISO(), -95)).map(k => [k, clone(S.docs['days/' + k])])); Object.keys(days58).forEach(k => remove('days/' + k))`);
  try {
    for (let i = 0; i < 12; i++) run(`(() => { const k = addDays(todayISO(), -${i + 1}); save('days/' + k, {...buildDay(k), status: 'ok', sleep: ${i % 2 ? 8 : 5.5}, rating: ${i % 2 ? 4 : 3}, tasks: buildDay(k).tasks.map(t => ({...t, done: true}))}); })()`);
    const r = JSON.parse(run(`JSON.stringify(insights())`)).find(x => /оцениваешь/.test(x.text) && /7\+/.test(x.text));
    assert.ok(r, 'a rating insight');
    assert.equal(r.a, run(`num(4, 1)`)); assert.equal(r.b, run(`num(3, 1)`));
  } finally { run(`dayKeys().filter(k => k >= addDays(todayISO(), -95)).forEach(k => remove('days/' + k)); Object.entries(days58).forEach(([k, v]) => save('days/' + k, v))`); }
});

test('telling KAI the same to-do or event twice adds it once', () => {
  run(`globalThis.tasks59 = clone(smartTasks()); globalThis.plan59 = clone(plan())`);
  try {
    const apply = t => run(`(() => { const {r} = localTellParse(${JSON.stringify(t)}, todayISO()); const id = uid(); save('inbox/' + id, {id, kind: 'tell', result: r, meta: {date: todayISO(), text: ${JSON.stringify(t)}, local: true}, done: false}); A.tellApply({dataset: {id}}); })()`);
    const n0 = run(`smartTasks().filter(t => !t.done).length`);
    apply('gym every monday and friday'); apply('gym every monday and friday');
    assert.equal(run(`smartTasks().filter(t => !t.done).length`), n0 + 2, 'two weekly to-dos, not four');
    apply('call the bank tomorrow at 10'); apply('call the bank tomorrow at 10');
    assert.equal(run(`smartTasks().filter(t => !t.done && /bank/i.test(t.title)).length`), 1);
    const e0 = run(`allEvents().length`);
    run(`tellPlanApply({events: [{title: 'Physics exam', date: addDays(todayISO(), 9), kind: 'exam', from: '10:00'}]}); tellPlanApply({events: [{title: 'physics exam', date: addDays(todayISO(), 9), kind: 'exam', from: '10:00'}]})`);
    assert.equal(run(`allEvents().length`), e0 + 1);
  } finally { run(`saveTasks(tasks59); save('app/plan', plan59)`); }
});

test('the preview says when a told to-do is already in the plans', () => {
  run(`globalThis.tasks60 = clone(smartTasks())`);
  try {
    run(`saveTasks([...smartTasks(), {id: 'dup1', title: 'Call the bank', due: addDays(todayISO(), 1), time: '10:00', done: false, pri: 2}])`);
    const lines = run(`tellLines(localTellParse('call the bank tomorrow at 10', todayISO()).r, todayISO()).join('|')`);
    assert.ok(/Already in your plans: Call the bank|Уже в планах: Call the bank/.test(lines), lines);
    assert.ok(!/\+ (?:задача|to-do)/i.test(lines));
  } finally { run(`saveTasks(tasks60)`); }
});

test('Tell KAI answers simple questions from the records, on the phone', () => {
  run(`globalThis.meta61 = clone(meta()); setMeta({modules: {...(meta().modules || {}), money: true}})`);
  const m = run(`todayISO().slice(0, 7)`), today = run(`todayISO()`);
  run(`globalThis.money61 = S.docs['money/${m}'] ? clone(S.docs['money/${m}']) : null; globalThis.day61 = clone(getDay(todayISO()))`);
  try {
    run(`addTx([{id: 'a61', date: todayISO(), type: 'out', amount: 12, cat: 'Кафе и рестораны', note: 'lunch'}, {id: 'b61', date: todayISO(), type: 'out', amount: 8, cat: 'Транспорт', note: 'taxi'}])`);
    const want = run(`money(monthTx(todayISO().slice(0, 7)).filter(x => x.type === 'out' && x.status !== 'fail' && x.date === todayISO()).reduce((s, x) => s + +x.amount, 0))`);
    const a = run(`localAnswer('how much did I spend today?')`);
    assert.ok(a && a.includes(want), a + ' / ' + want);
    const wantTaxi = run(`money(monthTx(todayISO().slice(0, 7)).filter(x => x.type === 'out' && x.date === todayISO() && x.cat === 'Транспорт').reduce((s, x) => s + +x.amount, 0))`);
    const b = run(`localAnswer('how much did I spend on taxi today?')`);
    assert.ok(b && b.includes(wantTaxi) && /taxi|такси|Transport|Транспорт/i.test(b), b);
    run(`mutDay(todayISO(), d => { d.sleep = 7.5; })`);
    assert.ok(/7[.,]5/.test(run(`localAnswer('how much did I sleep today?')`)));
    assert.ok(/\d/.test(run(`localAnswer('what is my streak?')`)));
    assert.equal(run(`localAnswer('slept 7 hours')`), null, 'a statement is not a question');
    assert.equal(run(`localAnswer('what is the capital of France?')`), null, 'not about the records');
  } finally { run(`money61 ? save('money/${m}', money61) : remove('money/${m}'); save('days/' + todayISO(), day61); save('app/meta', meta61)`); }
});

test('food without AI: pepperoni pizza is pizza, a can of cola, a Big Mac with medium fries, an omelette of three eggs', () => {
  const m = t => JSON.parse(run(`JSON.stringify(localTellParse(${JSON.stringify(t)}, todayISO()).r.meals || [])`));
  const pz = m('two slices of pepperoni pizza and a can of coke')[0];
  assert.ok(/pizza|пицца/i.test(pz.name) && !/pepper(?!oni)|перец/i.test(pz.name), pz.name);
  assert.ok(pz.kcal >= 600 && pz.kcal <= 1000, String(pz.kcal));
  const bm = m('ate a big mac and medium fries')[0];
  assert.ok(bm.kcal >= 750 && bm.kcal <= 1200, String(bm.kcal));
  assert.ok(m('съел омлет из трёх яиц').length, 'eggs are counted');
  assert.equal(m('had oatmeal').length, 0, 'a dish without an amount still needs one');
});

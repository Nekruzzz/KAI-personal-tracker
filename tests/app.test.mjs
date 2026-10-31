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
    console, URL, URLSearchParams, Blob, Promise, setTimeout: (f, ms) => { const t = setTimeout(f, ms); t.unref?.(); return t; }, clearTimeout, setInterval: () => 0,
    requestAnimationFrame: () => 0, queueMicrotask, performance, matchMedia: () => ({matches: false}), navigator: {language: 'en-US', onLine: true},
    localStorage: {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k)},
    document: Object.assign(stub(), {documentElement: {}, body: stub(), hidden: false, activeElement: null, addEventListener() {}, querySelector: () => stub(), querySelectorAll: () => [], createElement: () => stub()}),
    location: {hash: '', pathname: '/', search: '', protocol: 'http:', reload() {}}, history: {replaceState() {}}, innerWidth: 400, innerHeight: 800, devicePixelRatio: 1,
    addEventListener() {}, scrollTo() {}, scrollY: 0, AbortController,
  };
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
  assert.equal(run(`foodLocal('a bowl of soup', '${d}')`), false);
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
  const en = JSON.parse(run(`JSON.stringify(TELL_HELP.flatMap(([, xs]) => xs))`));
  const ruSrc = readFileSync(new URL('../kai/app.js', import.meta.url), 'utf8').match(/const TELL_HELP = \[([\s\S]*?)\n\];/)[1];
  const ru = [...ruSrc.matchAll(/tr\('([^']+)'\)/g)].map(m => m[1]).filter(x => /\d|Заболел/.test(x));
  assert.ok(ru.length >= 14);
  for (const t of [...en, ...ru]) assert.ok(run(`tellLines(localTellParse(${JSON.stringify(t)}, todayISO()).r, todayISO()).length > 0`), t);
  run(`SH = {}`);
  assert.match(run(`tellHelpHTML()`), /needs AI/);
  run(`SH = null`);
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

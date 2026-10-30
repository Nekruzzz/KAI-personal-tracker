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

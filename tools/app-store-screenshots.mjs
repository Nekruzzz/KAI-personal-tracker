// App Store screenshots: 1320×2868 (6.9-inch iPhone), from the real app with made-up sample data, in English and Russian.
// Needs Playwright with Chromium (npm i -D playwright, then npx playwright install chromium) and the app served locally:
//   python3 -m http.server 8123 --directory kai
//   node tools/app-store-screenshots.mjs [output folder, default: screenshots]
// App Store Connect scales these down for smaller iPhones. The data is invented: no real names, places or numbers.
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // also finds a globally installed Playwright

const URL = process.env.KAI_URL || 'http://localhost:8123/';
const AT = new Date(2026, 10, 18, 9, 41); // a weekday morning in the middle of a month, at the time the status bar shows
const OUT = process.argv[2] || 'screenshots';
mkdirSync(OUT, {recursive: true});

// a status bar like the iPhone's, and the space iOS keeps for it, which a desktop browser doesn't have
const PHONE = `
  .top,.top.plain{padding-top:calc(70px + 54px)!important}
  .hdr{top:calc(8px + 54px)!important}
  .edge-t{height:calc(54px + 118px)!important}
  .nav{bottom:calc(8px + 26px)!important}
  .app{padding-bottom:calc(112px + 34px)!important}
  .scrim{padding-top:calc(24px + 54px)!important}
  :root:root body::before{content:"9:41"!important;position:fixed!important;left:0;right:0;top:0;height:54px!important;z-index:100!important;display:flex!important;align-items:center;padding:6px 0 0 52px;font:600 17px -apple-system,system-ui,sans-serif;color:var(--text)!important;background:none!important}
  .toast{display:none!important}
`;

// sample data, the same in both languages apart from the words
async function seed(p, lang){
  await p.evaluate(lang => {
    closeSheet();
    const ru = lang === 'ru';
    setMeta({welcomed: true, onboardHidden: true, toldOnce: true, firstTellOff: true, startedOn: addDays(todayISO(), -24), lastBackup: todayISO(), seenNew: WHATS_NEW_ID});
    save('app/profile', {...profile(), name: ru ? 'Саша' : 'Alex', age: 22, height: 178, weight: 74, goal: 'keep', sex: 'm', units: 'metric', currency: ru ? '₽' : '$', role: 'study'});
    const meals = ru
      ? [['Овсянка с ягодами', 420, 18, 9, 66], ['Курица с рисом', 640, 45, 14, 80], ['Греческий йогурт', 180, 17, 4, 12]]
      : [['Oats with berries', 420, 18, 9, 66], ['Chicken and rice', 640, 45, 14, 80], ['Greek yogurt', 180, 17, 4, 12]];
    for (let i = 0; i < 24; i++) mutDay(addDays(todayISO(), -i), d => {
      d.weight = +(74.6 - i * 0.03 + (i % 3) * 0.15).toFixed(1); d.steps = 6500 + (i * 911) % 5000; d.sleep = 7 + (i % 4) * 0.3;
      d.meals = (i ? meals : meals.slice(0, 2)).map(([name, kcal, p, f, c], j) => ({id: 'm' + i + j, name, kcal, p, f, c}));
      d.tasks.forEach((t, j) => { t.done = i ? (i + j) % 4 !== 0 : j < 3; });
    });
    saveTasks([
      {id: 's1', title: ru ? 'Сдать лабораторную' : 'Hand in the lab report', due: todayISO(), time: '16:00', done: false, pri: 1},
      {id: 's2', title: ru ? 'Купить продукты' : 'Buy groceries', due: addDays(todayISO(), 1), done: false, pri: 2},
    ]);
    const p = clone(plan()); p.routine = p.routine || clone(DEFAULT_ROUTINE);
    p.routine.events = [{id: 'e1', date: addDays(todayISO(), 4), title: ru ? 'Экзамен по математике' : 'Maths exam', kind: 'exam', from: '10:00', until: '12:00'}];
    save('app/plan', p);
    const cats = ['Кафе и рестораны', 'Супермаркеты', 'Транспорт', 'Связь и интернет', 'Спорт и здоровье'];
    const notes = ru ? ['Обед', 'Продукты', 'Автобус', 'Телефон', 'Зал'] : ['Lunch', 'Groceries', 'Bus', 'Phone', 'Gym'];
    const k = ru ? 90 : 1;
    addTx([...Array(14)].map((_, i) => ({id: 'x' + i, date: addDays(todayISO(), -(i % 9)), type: 'out', amount: Math.round((6 + (i * 37) % 40) * k), cat: cats[i % 5], note: notes[i % 5]}))
      .concat([{id: 'in1', date: addDays(todayISO(), -3), type: 'in', amount: 900 * k, cat: 'Доход', note: ru ? 'Стипендия' : 'Allowance'}]));
    // a budget with regular payments: the phone plan paid this month, the others still to come
    save('app/budget', {monthly: 700 * k});
    save('app/bills', {list: [{id: 'b1', title: ru ? 'Телефон' : 'Phone plan', amount: 15 * k, type: 'out', cat: 'Связь и интернет', day: 5}, {id: 'b2', title: ru ? 'Музыка' : 'Music', amount: 10 * k, type: 'out', cat: 'Подписки', day: 21}, {id: 'b3', title: ru ? 'Спортзал' : 'Gym', amount: 30 * k, type: 'out', cat: 'Спорт и здоровье', day: 25}]});
    addTx([{id: 'bp1', date: todayISO().slice(0, 8) + '05', type: 'out', amount: 15 * k, cat: 'Связь и интернет', note: ru ? 'Телефон' : 'Phone plan', bill: 'b1'}]);
  }, lang);
  await p.waitForTimeout(1800); // awards and milestones from the sample data settle
  await p.evaluate(() => { closeSheet(); document.querySelectorAll('.fxl,.toast').forEach(e => e.remove()); });
}

const SHOTS = [
  ['1-day', 'light', async p => { await p.evaluate(() => { S.tab = 'day'; render(); window.scrollTo(0, 0); }); }],
  ['2-tell', 'dark', async (p, lang) => {
    await p.evaluate(() => { S.tab = 'day'; render(); A.tell(); });
    await p.waitForTimeout(400);
    await p.fill('#tellT', lang === 'ru' ? 'Спал 7 часов, гулял 40 минут, потратил 350 на обед, завтра в 18:30 позвонить маме' : 'Slept 7 hours, walked 40 minutes, spent 12 on lunch, call mom tomorrow at 18:30');
    await p.click('[data-act=tellGo]'); await p.waitForTimeout(1200);
  }],
  ['3-food', 'light', async p => { await p.evaluate(() => { closeSheet(); S.tab = 'health'; S.sub.health = 'food'; render(); window.scrollTo(0, 0); }); }],
  ['4-workout', 'dark', async p => { await p.evaluate(() => { closeSheet(); S.tab = 'health'; S.sub.health = 'train'; render(); window.scrollTo(0, 0); }); }],
  ['5-money', 'light', async p => { await p.evaluate(() => { closeSheet(); S.tab = 'money'; render(); window.scrollTo(0, 0); }); }],
  ['6-body', 'dark', async p => { await p.evaluate(() => { closeSheet(); S.tab = 'health'; S.sub.health = 'body'; render(); window.scrollTo(0, 0); }); }],
];

const b = await chromium.launch();
for (const lang of ['en', 'ru']) for (const [name, scheme, go] of SHOTS) {
  const p = await b.newPage({viewport: {width: 440, height: 956}, deviceScaleFactor: 3, colorScheme: scheme, isMobile: true, hasTouch: true});
  await p.clock.setFixedTime(AT);
  await p.addInitScript(l => { try { localStorage.setItem('kai_lang', l); localStorage.removeItem('kai_theme'); } catch {} }, lang);
  await p.goto(URL); await p.waitForFunction(() => typeof S !== 'undefined' && S.ready); await p.waitForTimeout(800);
  await p.addStyleTag({content: PHONE});
  await seed(p, lang);
  await go(p, lang); await p.waitForTimeout(700);
  await p.screenshot({path: `${OUT}/${lang}-${name}.png`});
  await p.close();
  console.log(`${OUT}/${lang}-${name}.png`);
}
await b.close();

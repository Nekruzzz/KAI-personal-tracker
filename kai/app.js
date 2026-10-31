"use strict";
/* ============ language: Russian text in the code is the key, i18n-en.js holds the English ============ */
const LANG = (() => { try { const s = localStorage.getItem('kai_lang'); if (s === 'ru' || s === 'en') return s; } catch {} return /^ru/i.test(navigator.language || '') ? 'ru' : 'en'; })();
const LOCALE = LANG === 'ru' ? 'ru-RU' : 'en-GB';
const tr = s => { if (LANG === 'ru' || typeof s !== 'string') return s; const d = window.I18N_EN || {}; if (d[s] !== undefined) return d[s]; const k = s.trim(), v = d[k]; return v === undefined ? s : s.replace(k, () => v); };
// a whole sentence with {named} gaps, so each language can put the numbers where they belong
const trf = (s, v = {}) => tr(s).replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
document.documentElement.lang = LANG;
/* ============ core ============ */
const A = {}, CH = {};
const P = {
  check:'<path d="M20 6 9 17l-5-5"/>',
  chevR:'<path d="m9 18 6-6-6-6"/>',
  chevL:'<path d="m15 18-6-6 6-6"/>',
  day:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
  video:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  wallet:'<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  gym:'<path d="M14.4 14.4 9.6 9.6"/><path d="M18.66 21.51a2 2 0 1 1-2.83-2.82l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.37-6.37a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83z"/><path d="m21.5 21.5-1.4-1.4M3.9 3.9 2.5 2.5"/><path d="M6.4 12.77a2 2 0 1 1-2.83-2.83l1.76-1.77a2 2 0 1 1-2.82-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.76a2 2 0 1 1 2.83 2.83z"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  pill:'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  food:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  star:'<path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/>',
  sick:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  swap:'<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
  edit:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  coffee:'<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
  cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  phone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  laptop:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  down:'<path d="M12 5v14M19 12l-7 7-7-7"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  posture:'<circle cx="12" cy="4" r="2"/><path d="M12 6v8M8 10h8M12 14l-3 7M12 14l3 7"/>',
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  crown:'<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/>',
  checkc:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  steps:'<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>',
  scale:'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
};
const ic = (n, cls='') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${P[n]||P.list}</svg>`;

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const pad = n => String(n).padStart(2,'0');
const iso = d => { d = new Date(d); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const todayISO = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return iso(d); };
const dayDiff = (a, b) => Math.round((new Date(b+'T12:00:00') - new Date(a+'T12:00:00'))/864e5);
const dow = s => { const d = new Date(s+'T12:00:00').getDay(); return d === 0 ? 7 : d; }; // 1=Пн..7=Вс
const DOW = ['',tr('Пн'),tr('Вт'),tr('Ср'),tr('Чт'),tr('Пт'),tr('Сб'),tr('Вс')];
const DOW_FULL = ['',tr('понедельник'),tr('вторник'),tr('среда'),tr('четверг'),tr('пятница'),tr('суббота'),tr('воскресенье')];
const MONTHS = [tr('январь'),tr('февраль'),tr('март'),tr('апрель'),tr('май'),tr('июнь'),tr('июль'),tr('август'),tr('сентябрь'),tr('октябрь'),tr('ноябрь'),tr('декабрь')];
const MONTHS_G = [tr('января'),tr('февраля'),tr('марта'),tr('апреля'),tr('мая'),tr('июня'),tr('июля'),tr('августа'),tr('сентября'),tr('октября'),tr('ноября'),tr('декабря')];
const fmtDay = s => { const d = new Date(s+'T12:00:00'); return d.getDate()+' '+MONTHS_G[d.getMonth()]+', '+DOW_FULL[dow(s)]; };
const fmtShort = s => { const d = new Date(s+'T12:00:00'); return d.getDate()+' '+MONTHS_G[d.getMonth()].slice(0,3); };
const num = (v, d=0) => { const n = Number(v); if (!isFinite(n)) return '0'; return n.toLocaleString(LOCALE, {minimumFractionDigits:d, maximumFractionDigits:d}); };
const money = v => { const c = S.docs['app/profile']?.currency; const n = num(v, Math.abs(v % 1) > 0.001 ? 2 : 0); if (c && LANG !== 'ru' && /^[$€£₹¥]$/.test(c)) return (v < 0 ? '−' : '') + c + num(Math.abs(v), Math.abs(v % 1) > 0.001 ? 2 : 0); return n + (c ? ' ' + c : ''); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
// "1 200" is 1200; in English "9,500" is 9500 (a thousands comma); otherwise a comma is the decimal point, as in "80,5"
const toNum = v => {
  if (v === '' || v == null) return null;
  let x = String(v).trim().replace(/(\d)[\s\u00a0]+(?=\d{3}(?!\d))/g, '$1');
  x = LANG === 'en' && /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(x) ? x.replace(/,/g, '') : x.replace(',', '.');
  const n = Number(x); return isFinite(n) ? n : null;
};

const TQ = []; let TCUR = null;
function toast(msg, o={}){
  TQ.push([msg, o]); if (TQ.length > 3) TQ.splice(0, TQ.length - 3);
  if (!TCUR) return nextToast();
  const left = 1300 - (Date.now() - TCUR.at);
  clearTimeout(TCUR.timer); TCUR.timer = setTimeout(hideToast, Math.max(0, left));
}
function nextToast(){
  const it = TQ.shift(); if (!it){ TCUR = null; return; }
  const [msg, o] = it;
  const t = document.createElement('div'); t.className = 'toast' + (o.tone ? ' tn-'+o.tone : ''); t.setAttribute('role','status');
  t.innerHTML = (o.iconHTML ? `<span class="ti">${o.iconHTML}</span>` : o.icon ? `<span class="ti">${ic(o.icon)}</span>` : '') + `<span>${esc(msg)}</span>` + (o.action ? `<button class="link toast-act" data-act="${o.action.act}">${esc(o.action.label)}</button>` : '');
  document.body.append(t);
  TCUR = {el: t, at: Date.now(), timer: setTimeout(hideToast, TQ.length && !o.action ? 1300 : (o.ms || 2600))};
}
function hideToast(){ if (!TCUR) return; const t = TCUR.el; t.classList.add('out'); setTimeout(()=>{ t.remove(); TCUR = null; nextToast(); }, 240); }


/* ============ defaults (the starting program, rebuilt into the database on first run) ============ */
const DEFAULT_PLAN = {
  version: 1,
  schedule: {1:'A', 3:'B', 5:'C'},
  workouts: {
    A: { name:tr('Тренировка A · ноги + жим'), ex:[
      {id:'squat', name:tr('Приседания со штангой'), sets:3, lo:6, hi:10, rest:tr('2–3 мин'), how:tr('Стопы на ширине плеч, спина нейтральная, садись до параллели или ниже. Колени идут по линии носков. Оставляй 1–2 повтора в запасе.')},
      {id:'bench', name:tr('Жим штанги лёжа'), sets:3, lo:6, hi:10, rest:tr('2–3 мин'), how:tr('Лопатки сведены и опущены, стопы в пол. Опускай гриф на низ груди, локти ~45° к корпусу.')},
      {id:'pulldown', name:tr('Тяга верхнего блока'), sets:3, lo:8, hi:12, rest:tr('1.5–2 мин'), how:tr('Тяни к верху груди локтями вниз, без раскачки. Вверху полностью растягивай спину.')},
      {id:'rdl', name:tr('Румынская тяга'), sets:2, lo:8, hi:10, rest:tr('2 мин'), how:tr('Колени чуть согнуты, таз уходит назад, гриф скользит по ногам. Опускай до сильного натяжения задней поверхности бедра.')},
      {id:'facepull', name:tr('Тяга каната к лицу (face pull)'), sets:2, lo:12, hi:15, rest:tr('1 мин'), how:tr('Для осанки. Тяни к переносице, разводя руки, в конце локти выше кистей. Пауза 1 сек.')},
      {id:'plank', name:tr('Планка'), sets:2, lo:30, hi:45, unit:tr('сек'), rest:tr('1 мин'), how:tr('Таз подкручен, ягодицы и пресс напряжены, тело прямая линия.')},
    ]},
    B: { name:tr('Тренировка B · спина + плечи'), ex:[
      {id:'legpress', name:tr('Жим ногами'), sets:3, lo:8, hi:12, rest:tr('2 мин'), how:tr('Поясница прижата, опускай платформу до угла ~90° в коленях и глубже, если поясница не отрывается.')},
      {id:'incline', name:tr('Жим гантелей на наклонной (30°)'), sets:3, lo:8, hi:12, rest:tr('2 мин'), how:tr('Лопатки сведены, опускай гантели до уровня груди, сводя их вверху без удара.')},
      {id:'row', name:tr('Тяга гантели в наклоне'), sets:3, lo:8, hi:12, rest:tr('1.5 мин'), how:tr('Спина ровная, тяни локоть к тазу, не к плечу. Внизу дай лопатке уйти вперёд.')},
      {id:'ohp', name:tr('Жим гантелей сидя'), sets:2, lo:8, hi:12, rest:tr('1.5 мин'), how:tr('Спина прижата к спинке, не прогибайся. Опускай до уровня ушей.')},
      {id:'yraise', name:tr('Y-подъёмы лёжа на наклонной'), sets:2, lo:10, hi:15, rest:tr('1 мин'), how:tr('Для осанки (нижняя трапеция). Лёжа грудью на скамье, поднимай лёгкие гантели буквой Y большими пальцами вверх.')},
      {id:'legraise', name:tr('Подъём ног в висе'), sets:2, lo:10, hi:15, rest:tr('1 мин'), how:tr('Без раскачки, подкручивай таз вверх, а не просто поднимай ноги.')},
    ]},
    C: { name:tr('Тренировка C · всё тело'), ex:[
      {id:'hipthrust', name:tr('Ягодичный мост со штангой'), sets:3, lo:8, hi:12, rest:tr('2 мин'), how:tr('Лопатки на скамье, подбородок прижат, вверху пауза и сильное сжатие ягодиц.')},
      {id:'lunge', name:tr('Болгарские выпады'), sets:2, lo:8, hi:12, rest:tr('1.5 мин'), how:tr('Задняя нога на скамье, корпус чуть вперёд. Опускайся вниз, а не вперёд.')},
      {id:'dips', name:tr('Отжимания на брусьях'), sets:3, lo:6, hi:12, rest:tr('2 мин'), how:tr('Опускайся до угла 90° в локтях, плечи вниз. Если тяжело, используй гравитрон.')},
      {id:'pullup', name:tr('Подтягивания (или гравитрон)'), sets:3, lo:5, hi:10, rest:tr('2 мин'), how:tr('Старт из полного виса, тяни грудь к перекладине, без рывков.')},
      {id:'curl', name:tr('Сгибания на бицепс'), sets:2, lo:10, hi:15, rest:tr('1 мин'), how:tr('Локти прижаты, без раскачки корпусом.')},
      {id:'pushdown', name:tr('Разгибания на трицепс на блоке'), sets:2, lo:10, hi:15, rest:tr('1 мин'), how:tr('Локти неподвижны, внизу полностью выпрямляй руки.')},
      {id:'facepull2', name:tr('Тяга каната к лицу'), sets:2, lo:12, hi:15, rest:tr('1 мин'), how:tr('Как в тренировке A.')},
    ]},
  },
  posture: [
    {name:tr('Подбородок назад (chin tucks)'), dose:tr('2 × 10, пауза 3 сек')},
    {name:tr('Растяжка грудных в дверном проёме'), dose:tr('2 × 30 сек')},
    {name:tr('Разведение резинки перед грудью'), dose:'2 × 15'},
    {name:tr('«Ангел» у стены'), dose:'2 × 10'},
  ],
  dailyTasks: [
    {id:'posture', title:tr('Осанка, 5 минут'), cat:'posture'},
    {id:'steps', title:tr('8 000+ шагов'), cat:'steps'},
    {id:'food', title:tr('Питание по норме КБЖУ'), cat:'food'},
    {id:'supps', title:tr('Принять БАДы'), cat:'supps'},
    {id:'prep', title:tr('Приготовить еду на завтра'), cat:'prep'},
    {id:'sleep', title:tr('Лечь до 23:30, 7+ часов сна'), cat:'sleep'},
  ],
  classes: [],
  supps: [],
  menu: null,
};
const DEFAULT_CONTENT = {
  platforms: {
    telegram:{nick:'', topic:'', goal:'', followers:[]},
    tiktok:{nick:'', topic:'', goal:'', followers:[]},
    instagram:{nick:'', topic:'', goal:'', followers:[]},
    threads:{nick:'', topic:'', goal:'', followers:[]},
    youtube:{nick:'', topic:'', goal:'', followers:[]},
  },
  weeklyTarget: 4,
  promo: '',
};
const PLATFORMS = [
  {id:'telegram', name:'Telegram', short:'TG', c:'c1'},
  {id:'tiktok', name:'TikTok', short:'TT', c:'c2'},
  {id:'instagram', name:'Instagram', short:'IG', c:'c3'},
  {id:'threads', name:'Threads', short:'TH', c:'c4'},
  {id:'youtube', name:'YouTube', short:'YT', c:'c5'},
];
const PL = Object.fromEntries(PLATFORMS.map(p=>[p.id,p]));
const OUT_CATS = [
  ['Переводы','c1','swap'],['Кафе и рестораны','c2','coffee'],['Рассрочка','c3','percent'],['Связь и интернет','c4','phone'],
  ['Супермаркеты','c5','cart'],['Электроника','c6','laptop'],['Транспорт','c7','activity'],['Онлайн-покупки','c8','bag'],
  ['Финансовые услуги','c0','cash'],['Спорт и здоровье','c0','heart'],['Учёба','c0','cap'],['Другое','c0','list'],
];
const IN_CATS = [['Пополнение','c4','down'],['Переводы входящие','c1','swap'],['Доход','c3','cash'],['Бонусы','c6','gift'],['Другое','c0','list']];
const catInfo = (type, name) => (type==='in'?IN_CATS:OUT_CATS).find(c=>c[0]===name) || [tr('Другое'),'c0','list'];
// supplements are switched off for now: lighter app. A saved list stays in the plan, so turning this back on restores it
const SUPPS_ON = false;
const shownDaily = pl => (pl.dailyTasks || []).filter(t => t.cat !== 'supps' || SUPPS_ON);
const FACE_ON = false;
const TASK_COLOR = {gym:'c1', food:'c2', prep:'c2', supps:'c7', sleep:'c7', posture:'c3', steps:'c3', study:'c4', content:'c5', custom:'c0', money:'c4'};
const TASK_ICON = {gym:'gym', posture:'posture', steps:'steps', food:'food', supps:'pill', prep:'food', sleep:'moon', study:'cap', content:'video', custom:'list', money:'wallet'};
const POST_STATUS = ['Идея','Сценарий','Снято','Опубликовано'];

/* ============ state + storage (IndexedDB on the device) ============ */
const isNative = () => !!window.Capacitor?.isNativePlatform?.(), plug = n => window.Capacitor?.Plugins?.[n];
const S = { docs:{}, tab: 'day', sub: {health:'food', content:'overview', money:'out'}, open:{}, moneyMonth: todayISO().slice(0,7), live:false, ready:false, online: navigator.onLine };
let DB = null, IDB = null;

function memDB(){
  const docs = new Map(), subs = new Set();
  const snap = p => ({ id:p.split('/').pop(), exists:docs.has(p), data:()=>docs.get(p) });
  const notify = () => subs.forEach(f=>f());
  return {
    doc: p => ({ path:p, get: async()=>snap(p), set: async d=>{docs.set(p, clone(d)); queueMicrotask(notify);}, delete: async()=>{docs.delete(p); queueMicrotask(notify);} }),
    collection: c => ({ onSnapshot: next => { const f = () => { const ds = [...docs.keys()].filter(k=>k.startsWith(c+'/') && k.split('/').length===2).map(snap); next({docs:ds}); }; subs.add(f); setTimeout(f); return ()=>subs.delete(f); } }),
  };
}
const DB_NAME = 'kai';
const idbRaw = name => new Promise((res, rej) => {
  const r = indexedDB.open(name, 1);
  r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('docs'); d.createObjectStore('blobs'); };
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
/* copies data from an earlier database of this app, once; the old one is left untouched */
async function idbAdopt(db){
  const count = await new Promise((res, rej) => { const q = db.transaction('docs').objectStore('docs').count(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  if (count || !indexedDB.databases) return;
  for (const {name} of await indexedDB.databases()){
    if (!name || name === DB_NAME) continue;
    const old = await new Promise(res => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => res(null); });
    if (!old) continue;
    if (old.objectStoreNames.contains('docs') && old.objectStoreNames.contains('blobs')){
      for (const store of ['docs', 'blobs']){
        const rows = await new Promise((res, rej) => { const out = [], q = old.transaction(store).objectStore(store).openCursor(); q.onsuccess = () => { const c = q.result; if (c){ out.push([c.key, c.value]); c.continue(); } else res(out); }; q.onerror = () => rej(q.error); });
        await new Promise((res, rej) => { const tx = db.transaction(store, 'readwrite'), st = tx.objectStore(store); rows.forEach(([k, v]) => st.put(v, k)); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
      }
      old.close(); return;
    }
    old.close();
  }
}
async function idbOpen(){ const db = await idbRaw(DB_NAME); try { await idbAdopt(db); } catch {} return db; }
const idbTx = (store, mode, fn) => new Promise((res, rej) => { const tx = IDB.transaction(store, mode); const st = tx.objectStore(store); const out = fn(st); tx.oncomplete = () => res(out && 'result' in out ? out.result : undefined); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
async function idbDB(){
  IDB = await idbOpen();
  const docs = new Map();
  await new Promise((res, rej) => { const rq = IDB.transaction('docs').objectStore('docs').openCursor(); rq.onsuccess = () => { const c = rq.result; if (c){ docs.set(c.key, c.value); c.continue(); } else res(); }; rq.onerror = () => rej(rq.error); });
  const subs = new Map();
  const notify = c => (subs.get(c) || []).forEach(f => f());
  const snap = p => ({ id:p.split('/').pop(), exists:docs.has(p), data:()=>docs.get(p) });
  return {
    doc: p => ({ path:p, get: async()=>snap(p),
      set: async d => { const v = clone(d); docs.set(p, v); await idbTx('docs','readwrite', st => st.put(v, p)); notify(p.split('/')[0]); },
      delete: async () => { docs.delete(p); await idbTx('docs','readwrite', st => st.delete(p)); notify(p.split('/')[0]); } }),
    collection: c => ({ onSnapshot: next => { const f = () => next({docs:[...docs.keys()].filter(k=>k.startsWith(c+'/') && k.split('/').length===2).map(snap)}); if (!subs.has(c)) subs.set(c, new Set()); subs.get(c).add(f); setTimeout(f); return () => subs.get(c).delete(f); } }),
  };
}
/* blobs: photos, screenshots waiting in the AI queue */
const blobPut = (k, b) => IDB ? idbTx('blobs','readwrite', st => st.put(b, k)) : Promise.resolve();
const blobGet = k => IDB ? idbTx('blobs','readonly', st => st.get(k)) : Promise.resolve(null);
const blobDel = k => IDB ? idbTx('blobs','readwrite', st => st.delete(k)) : Promise.resolve();
const blobKeys = () => IDB ? idbTx('blobs','readonly', st => st.getAllKeys()) : Promise.resolve([]);
const BURL = {};
function blobURL(k){ if (BURL[k]) return BURL[k]; if (BURL[k] === undefined){ BURL[k] = null; blobGet(k).then(b => { if (b){ BURL[k] = URL.createObjectURL(b); scheduleRender(); } }); } return ''; }

const COLLS = ['app','days','money','posts','analyses','kb','seasons','jobs','inbox'];
const unsubs = [];
function attach(db){
  unsubs.splice(0).forEach(u=>{try{u()}catch{}});
  DB = db;
  let pending = new Set(COLLS);
  COLLS.forEach(c => {
    unsubs.push(db.collection(c).onSnapshot(snap => {
      const seen = new Set();
      snap.docs.forEach(d => { if (d.exists) { const p = c+'/'+d.id; seen.add(p); if (!localOnly.has(p)) S.docs[p] = d.data(); } });
      Object.keys(S.docs).forEach(k => { if (k.startsWith(c+'/') && !seen.has(k) && !localOnly.has(k)) delete S.docs[k]; });
      if (pending.has(c)) { pending.delete(c); if (!pending.size) onFirstLoad(); }
      dataChanged(); scheduleRender();
    }));
  });
}
// path → local writes still on their way to the database; a snapshot taken between two quick saves must not bring back the older one
const localOnly = new Map();
const inFlight = path => localOnly.set(path, (localOnly.get(path) || 0) + 1);
const landed = path => { const n = (localOnly.get(path) || 1) - 1; if (n > 0) localOnly.set(path, n); else localOnly.delete(path); };
const chains = {};
function dataChanged(){ ADAPT.clear(); } // cached answers that depend on data
function save(path, data){
  S.docs[path] = data; inFlight(path); syncMark(path); remindSoon(); dataChanged();
  chains[path] = (chains[path] || Promise.resolve()).then(() => DB.doc(path).set(data)).then(() => { landed(path); delete retries[path]; }).catch(e => {
    // still counted as in flight, so a snapshot can't swap the change for the older stored copy before the retry
    const full = e && e.name === 'QuotaExceededError';
    toast(full ? tr('В телефоне закончилось место: освободи память, иначе последние изменения пропадут при закрытии приложения') : tr('Не сохранилось, пробую ещё раз'), {ms: 5000});
    saveRetry(path, data, full ? 30000 : 3000);
  });
  scheduleRender();
}
/* the change is still in memory: write it again later, unless something newer replaced it */
const retries = {};
function saveRetry(path, data, ms){
  if ((retries[path] = (retries[path] || 0) + 1) > 5){ landed(path); return; }
  setTimeout(() => { landed(path); if (S.docs[path] === data) save(path, data); }, ms * retries[path]);
}
function remove(path){
  delete S.docs[path]; inFlight(path); syncMark(path); remindSoon(); dataChanged();
  chains[path] = (chains[path] || Promise.resolve()).then(() => DB.doc(path).delete()).then(() => landed(path)).catch(() => { landed(path); toast(tr('Не удалилось')); });
  scheduleRender();
}

function onFirstLoad(){
  S.ready = true;
  remindSoon();
  if (isNative()){ S.healthAt = Date.now(); healthImport().catch(() => {}); }
  const hadPlan = !!S.docs['app/plan'];
  if (!hadPlan) save('app/plan', clone(DEFAULT_PLAN));
  if (!S.docs['app/content']) save('app/content', clone(DEFAULT_CONTENT));
  try { if (!localStorage.getItem('kai_lang')){ const was = S.docs['app/profile'] ? (meta().planLang || 'ru') : LANG; localStorage.setItem('kai_lang', was); if (was !== LANG) return location.reload(); } } catch {} // installs from before the language switch are Russian
  if (!S.docs['app/profile']) save('app/profile', {name:'', activity:1.45, currency:'', goal:'keep', units: navigator.language === 'en-US' ? 'us' : 'metric'});
  else if (!('currency' in S.docs['app/profile'])) save('app/profile', {...S.docs['app/profile'], currency:'с.'}); // installs from before v5
  if (!S.docs['app/season']) save('app/season', {title:tr('Сезон 1'), start: todayISO(), length: 90, goals:[]});
  if (!S.docs['app/ai']) save('app/ai', clone(DEFAULT_AI));
  if (!meta().badges) initBadges();
  langSync(hadPlan);
  ensureMigrated();
  if (!hadPlan){ const pl = clone(plan()); if (useProgram(pl, 'home3')) save('app/plan', pl); } // a new install starts with no equipment assumed
  if (!meta().welcomed) setTimeout(() => A.welcome(), 700);
  Object.entries(S.docs).forEach(([k,v]) => { if (k.startsWith('jobs/') && v.status === 'running') save(k, {...v, status:'queued', using:null}); });
  // prune finished answers older than 30 days
  const old = addDays(todayISO(), -30);
  Object.entries(S.docs).forEach(([k,v]) => { if (k.startsWith('inbox/') && v.done && (v.date||'') < old) remove(k); });
  setTimeout(processQueue, 800);
  syncSoon(1000);
}

/* getters */
const plan = () => S.docs['app/plan'] || DEFAULT_PLAN;
const profile = () => S.docs['app/profile'] || {name:''};
const season = () => S.docs['app/season'] || {title:tr('Сезон 1'), start: todayISO(), length:90, goals:[]};
const content = () => { const c = S.docs['app/content'] || DEFAULT_CONTENT; return c; };
const posts = () => Object.entries(S.docs).filter(([k])=>k.startsWith('posts/')).map(([k,v])=>({...v, id:k.slice(6)}));
const analyses = () => Object.entries(S.docs).filter(([k])=>k.startsWith('analyses/')).map(([k,v])=>({...v, id:k.slice(9)})).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
const kbItems = () => Object.entries(S.docs).filter(([k])=>k.startsWith('kb/')).map(([k,v])=>({...v, id:k.slice(3)})).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
const dayKeys = () => Object.keys(S.docs).filter(k=>k.startsWith('days/')).map(k=>k.slice(5)).sort();

/* ---- units: always stored in kg and cm, so the calculations and the AI never change; pounds and inches exist only on screen ---- */
const isUS = () => profile().units === 'us';
const LB = 2.20462, IN = 2.54;
const kgU = () => isUS() ? tr('фнт') : tr('кг'), cmU = () => isUS() ? tr('дюйм') : tr('см');
const W = kg => kg == null || kg === '' || !isUS() ? kg : +(kg * LB).toFixed(1);
const wIn = v => v && isUS() ? +(v / LB).toFixed(3) : v;
const L = cm => cm == null || cm === '' || !isUS() ? cm : +(cm / IN).toFixed(1);
const lIn = v => v && isUS() ? +(v * IN).toFixed(2) : v;
const heightShow = cm => { if (!cm || !isUS()) return cm ?? ''; const t = Math.round(cm / IN); return Math.floor(t / 12) + "'" + (t % 12); };
const heightIn = text => { const x = String(text).trim(), m = x.match(/^(\d)\s*['’\s]\s*(\d{1,2})?\s*["”]?$/), cm = toNum(x); return !isUS() ? (cm >= 1 && cm <= 2.5 ? Math.round(cm * 100) : cm) /* "1.75" means meters */ : m ? +(((+m[1]) * 12 + (+m[2] || 0)) * IN).toFixed(1) : lIn(toNum(x)); };
const goalOf = p => ['lose', 'keep', 'gain'].includes(p.goal) ? p.goal : 'lose'; // a profile with no goal dates from when fat loss was the only plan
const KCAL_FLOOR = 1200;
function targets(){
  const p = profile();
  const w = toNum(p.weight), h = toNum(p.height), a = toNum(p.age);
  if (!w || !h || !a) return {ok:false, kcal:null, p:null, f:null, c:null, steps:8000, sleep:7.5};
  // a typo (height 17, age 250) must not turn into a target: no numbers until the profile looks like a person
  if (h < 100 || h > 250 || w < 25 || w > 300 || a < 10 || a > 100) return {ok:false, implausible:true, kcal:null, p:null, f:null, c:null, steps:8000, sleep:7.5};
  // with no sex given, the midpoint of the two formulas; profiles from before the goal setting keep the value they were planned with
  const bmr = 10*w + 6.25*h - 5*a + (p.sex === 'f' ? -161 : p.sex === 'm' || !p.goal ? 5 : -78);
  const tdee = bmr * (toNum(p.activity) || 1.45);
  // a growing body or a low weight never gets a deficit, whatever the setting or an earlier override says
  const care = a < 18 ? 'minor' : w / (h/100)**2 < 18.5 ? 'under' : null;
  const goal = goalOf(p), aim = care && goal === 'lose' ? 'keep' : goal;
  const deficit = aim === 'lose' ? Math.min(500, Math.round(w * 0.005 * 7700 / 7)) : 0, surplus = aim === 'gain' ? 250 : 0;
  const base = Math.round((tdee - deficit + surplus)/10)*10;
  const ov = p.override || {};
  // losing weight never goes under 1200 kcal, the same line the AI is held to (SAFETY_RULES), even for small people whose BMR is lower
  const kcal = care ? Math.max(base, ov.kcal || 0) : Math.max(Math.round(bmr/10)*10, ov.kcal || base, aim === 'lose' ? KCAL_FLOOR : 0);
  const prot = ov.p || Math.round(w * (aim === 'lose' ? 2.0 : 1.6)), fat = ov.f || Math.round(w * 0.8);
  const carbs = Math.max(80, Math.round((kcal - prot*4 - fat*9)/4));
  return {ok:true, kcal, base, p: prot, f: fat, c: carbs, steps: ov.steps||8000, sleep:7.5, tdee:Math.round(tdee), bmr:Math.round(bmr), deficit, surplus, goal, aim, care, adjusted: !!ov.kcal && kcal === ov.kcal};
}

function workoutFor(date){
  const d = S.docs['days/'+date];
  if (d && d.workout !== undefined) return d.workout; // explicit override (moved/extra)
  const pl = plan(), pr = pl.programs?.[pl.program];
  if (pr){ if (pr.start && date < pr.start) return null; if ((pr.skip||[]).includes(date)) return null; }
  return pl.schedule?.[dow(date)] || null;
}

function buildDay(date){
  const pl = plan();
  const tasks = [];
  const w = workoutFor(date);
  if (w && pl.workouts[w]) tasks.push({id:'gym', title:gymWord()+pl.workouts[w].name.split(' · ')[0], cat:'gym', done:false});
  const cls = (pl.classes||[]).filter(c=>Number(c.day)===dow(date));
  if (cls.length) tasks.push({id:'study', title:tr('Учёба · ')+cls.length+' '+plural(cls.length,tr('пара'),tr('пары'),tr('пар')), cat:'study', done:false});
  const ps = posts().filter(p=>p.date===date && p.status!=='Опубликовано');
  if (ps.length && modOn('content')) tasks.push({id:'content', title:tr('Контент · ')+ps.length+' '+plural(ps.length,tr('ролик'),tr('ролика'),tr('роликов')), cat:'content', done:false});
  (pl.dailyTasks||[]).forEach(t => { if (t.cat==='supps' && (!SUPPS_ON || !(pl.supps||[]).length)) return; tasks.push({...t, done:false}); });
  return {date, tasks, meals:[], sets:{}, supps:{}, status:'ok', rating:null, steps:null, sleep:null, weight:null, log:[]};
}
function getDay(date){
  const saved = S.docs['days/'+date];
  if (!saved) return buildDay(date);
  // keep auto tasks in sync with plan/posts for days not finished
  const fresh = buildDay(date);
  const ids = new Set(saved.tasks.map(t=>t.id));
  const merged = {...saved, tasks: [...saved.tasks]};
  fresh.tasks.forEach(t => { if (!ids.has(t.id) && ['gym','study','content'].includes(t.id)) merged.tasks.unshift(t); });
  merged.tasks = merged.tasks.filter(t => !['gym','study','content'].includes(t.id) || t.done || fresh.tasks.some(f=>f.id===t.id) || t.moved);
  if (!SUPPS_ON && date >= todayISO()) merged.tasks = merged.tasks.filter(t => t.cat !== 'supps' || t.done); // past days keep their score
  return merged;
}
function mutDay(date, fn){ const prev = getDay(date), d = clone(prev); const before = JSON.stringify(d.meals||[]); fn(d); if (JSON.stringify(d.meals||[]) !== before) syncFoodTask(d); save('days/'+date, d); dayMilestone(prev, d); }
function syncFoodTask(d){
  const t = targets(), ft = d.tasks.find(x=>x.cat==='food'); if (!ft || !t.ok || !d.meals?.length) return;
  const e = eaten(d);
  if (e.p >= t.p*0.9 && e.kcal >= t.kcal*0.85 && e.kcal <= t.kcal*1.05) ft.done = true;
  else if (e.kcal > t.kcal*1.1) ft.done = false;
}
const meta = () => S.docs['app/meta'] || {};
function setMeta(patch){ save('app/meta', {...meta(), ...patch}); }

function plural(n, a, b, c){ if (LANG !== 'ru') return Math.abs(n) === 1 ? a : c; n = Math.abs(n)%100; const n1 = n%10; if (n>10&&n<20) return c; if (n1>1&&n1<5) return b; if (n1===1) return a; return c; }

function dayScore(d){ if (!d || !d.tasks?.length) return null; return d.tasks.filter(t=>t.done).length / d.tasks.length; }
function streak(){
  let s = 0, date = todayISO();
  const t = S.docs['days/'+date];
  if (!(t && (dayScore(t) >= .7 || t.status==='sick'))) date = addDays(date, -1);
  for (let i=0;i<400;i++){
    const d = S.docs['days/'+date];
    if (!d) break;
    if (d.status === 'sick') { date = addDays(date,-1); continue; }
    if (dayScore(d) >= .7) { s++; date = addDays(date,-1); } else break;
  }
  return s;
}
function eaten(d){ return (d.meals||[]).reduce((a,m)=>({kcal:a.kcal+(+m.kcal||0), p:a.p+(+m.p||0), f:a.f+(+m.f||0), c:a.c+(+m.c||0)}), {kcal:0,p:0,f:0,c:0}); }
function lastValue(field){ const ks = dayKeys().reverse(); for (const k of ks){ const v = S.docs['days/'+k]?.[field]; if (v != null && v !== '') return {date:k, v}; } return null; }

/* ============ charts ============ */
function donut(segs, size=120, sw=14, center=''){
  const r = (size - sw)/2, C = 2*Math.PI*r, total = segs.reduce((a,s)=>a+s.v,0);
  let off = 0; const gap = segs.filter(s=>s.v>0).length > 1 ? 3 : 0;
  const arcs = total ? segs.filter(s=>s.v>0).map(s => { const len = Math.max(0, s.v/total*C - gap); const el = `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${s.c.startsWith('#')?s.c:'var(--'+s.c+')'}" stroke-width="${sw}" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size/2} ${size/2})"><title>${esc(s.label||'')}: ${esc(s.fmt||s.v)}</title></circle>`; off += s.v/total*C; return el; }).join('') : '';
  // read out as the parts and their shares; an empty donut says nothing the text beside it doesn't
  const said = segs.filter(s => s.v > 0 && s.label).map(s => `${s.label} ${Math.round(s.v / total * 100)}%`).join(', ');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" ${said ? `role="img" aria-label="${esc(said)}"` : 'aria-hidden="true"'}><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${sw}"/>${arcs}${center}</svg>`;
}
function ring(frac, size=86, sw=10, color='', label='', key=''){
  const r=(size-sw)/2, C=2*Math.PI*r, f=Math.max(0,Math.min(1,frac||0));
  const from = key && RING_PREV[key] != null ? RING_PREV[key] : f; if (key) RING_PREV[key] = f;
  const stroke = color || (f >= 1 ? 'url(#ringGold)' : 'url(#ringG)');
  return `<svg class="ring ${f>=1?'full':''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label)}: ${Math.round(f*100)}%"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${sw}"/><circle class="ringarc" data-to="${f*C}" data-c="${C}" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${from*C} ${C}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="var(--text)" font-weight="800" font-size="${size*.22}" data-count-from="${Math.round(from*100)}" data-count-to="${Math.round(f*100)}" data-suf="%">${Math.round(from*100)}%</text></svg>`;
}
/* line chart: pts [{x:'label', y:number}] ; opts {target, unit, avg} */
function lineChart(pts, opts={}){
  const W=340, H=150, L=34, R=10, T=12, B=22;
  if (pts.length < 2) return `<div class="empty">${opts.empty || tr('Нужно минимум 2 записи, чтобы построить график')}</div>`;
  const ys = pts.map(p=>p.y).concat(opts.target!=null?[opts.target]:[]);
  let lo = Math.min(...ys), hi = Math.max(...ys); if (lo===hi){lo-=1;hi+=1;} const padv=(hi-lo)*.12; lo-=padv; hi+=padv;
  const X = i => L + i*(W-L-R)/(pts.length-1), Y = v => T + (hi-v)*(H-T-B)/(hi-lo);
  const grid = [0,.5,1].map(f=>{ const v = lo+(hi-lo)*(1-f); const y=Y(v); return `<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--track)"/><text x="${L-6}" y="${y}" fill="var(--text-3)" font-size="10" text-anchor="end" dominant-baseline="central">${num(v, opts.dec??0)}</text>`; }).join('');
  const line = pts.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = line + `L${X(pts.length-1)},${H-B}L${X(0)},${H-B}Z`;
  const avg = opts.avg ? pts.map((p,i)=>{ const s = pts.slice(Math.max(0,i-6), i+1); return {y: s.reduce((a,b)=>a+b.y,0)/s.length}; }) : null;
  const avgLine = avg ? avg.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('') : '';
  const tgt = opts.target!=null ? `<line x1="${L}" x2="${W-R}" y1="${Y(opts.target)}" y2="${Y(opts.target)}" stroke="var(--text-3)" stroke-dasharray="4 4"/>` : '';
  const xl = [0, Math.floor((pts.length-1)/2), pts.length-1].map(i=>`<text x="${X(i)}" y="${H-6}" fill="var(--text-3)" font-size="10" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}">${esc(pts[i].x)}</text>`).join('');
  const last = pts.length-1;
  const data = esc(JSON.stringify({L,R,W,H,pts:pts.map((p,i)=>({x:p.x, y:p.y, a: avg?avg[i].y:null, px:X(i), py:Y(p.y)})), unit:opts.unit||'', dec:opts.dec??0}));
  return `<div class="chart" data-chart="${data}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label||tr('график'))}">
    <defs><linearGradient id="g${opts.id||'x'}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--${opts.c||'c1'})" stop-opacity=".28"/><stop offset="1" stop-color="var(--${opts.c||'c1'})" stop-opacity="0"/></linearGradient></defs>
    ${grid}${tgt}<path d="${area}" fill="url(#g${opts.id||'x'})"/>
    <path d="${opts.avg?avgLine:line}" fill="none" stroke="var(--${opts.c||'c1'})" stroke-width="2" stroke-linejoin="round"/>
    ${opts.avg?pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.y)}" r="2.2" fill="var(--text-3)"/>`).join(''):''}
    <circle cx="${X(last)}" cy="${Y(opts.avg?avg[last].y:pts[last].y)}" r="4.5" fill="var(--${opts.c||'c1'})" stroke="var(--card)" stroke-width="2"/>
    ${xl}<line class="cross" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="var(--text-3)" visibility="hidden"/></svg></div>`;
}
function barChart(pts, opts={}){
  const W=340, H=140, L=30, R=6, T=10, B=22;
  if (!pts.length) return `<div class="empty">${tr("Пока нет данных")}</div>`;
  const hi = Math.max(1, ...pts.map(p=>p.y), opts.target||0)*1.1;
  const bw = (W-L-R)/pts.length;
  const Y = v => T + (hi-v)*(H-T-B)/hi;
  const bars = pts.map((p,i)=>{ const x = L+i*bw+bw*.18, w = bw*.64, y = Y(p.y), h = H-B-y; const c = opts.colorFn ? opts.colorFn(p) : `var(--${opts.c||'c1'})`; return h>0?`<path d="M${x},${H-B}V${y+Math.min(4,h)}Q${x},${y} ${x+Math.min(4,w/2)},${y}H${x+w-Math.min(4,w/2)}Q${x+w},${y} ${x+w},${y+Math.min(4,h)}V${H-B}Z" fill="${c}"/>`:''; }).join('');
  const tgt = opts.target!=null ? `<line x1="${L}" x2="${W-R}" y1="${Y(opts.target)}" y2="${Y(opts.target)}" stroke="var(--text-2)" stroke-dasharray="4 4"/><text x="${W-R}" y="${Y(opts.target)-5}" fill="var(--text-2)" font-size="10" text-anchor="end">${tr("цель")} ${num(opts.target, opts.dec??0)}</text>` : '';
  const grid = [0,.5,1].map(f=>{ const v=hi*f; return `<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--track)"/><text x="${L-5}" y="${Y(v)}" fill="var(--text-3)" font-size="10" text-anchor="end" dominant-baseline="central">${num(v, v<10?1:0)}</text>`; }).join('');
  const step = Math.ceil(pts.length/7);
  const xl = pts.map((p,i)=> i%step===0 || i===pts.length-1 ? `<text x="${L+i*bw+bw/2}" y="${H-6}" fill="var(--text-3)" font-size="10" text-anchor="middle">${esc(p.x)}</text>`:'').join('');
  const data = esc(JSON.stringify({L,R,W,H,bar:true,pts:pts.map((p,i)=>({x:p.x,y:p.y,px:L+i*bw+bw/2,py:Y(p.y)})), unit:opts.unit||'', dec:opts.dec??0}));
  return `<div class="chart" data-chart="${data}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label||tr('график'))}">${grid}${bars}${tgt}${xl}</svg></div>`;
}
document.addEventListener('pointermove', e => {
  const ch = e.target.closest?.('.chart'); $$('.tip').forEach(t=>{ if (!ch || t.parentElement!==ch) t.remove(); });
  if (!ch || !ch.dataset.chart) return;
  const d = JSON.parse(ch.dataset.chart); const svg = ch.querySelector('svg'); const r = svg.getBoundingClientRect();
  const sx = (e.clientX - r.left) * d.W / r.width;
  let best = 0; d.pts.forEach((p,i)=>{ if (Math.abs(p.px-sx) < Math.abs(d.pts[best].px-sx)) best = i; });
  const p = d.pts[best]; let tip = ch.querySelector('.tip'); if (!tip){ tip = document.createElement('div'); tip.className='tip'; ch.append(tip); }
  tip.innerHTML = `<b>${num(p.y, d.dec)}${d.unit?' '+esc(d.unit):''}</b> · ${esc(p.x)}${p.a!=null?`<br><span class="muted">${tr("среднее 7 дн:")} `+num(p.a,1)+'</span>':''}`;
  tip.style.left = (p.px * r.width / d.W) + 'px'; tip.style.top = (p.py * r.height / d.H) + 'px';
  const cross = svg.querySelector('.cross'); if (cross){ cross.setAttribute('x1',p.px); cross.setAttribute('x2',p.px); cross.setAttribute('visibility','visible'); }
});
document.addEventListener('pointerleave', e=>{ if (e.target.classList?.contains('chart')) $$('.tip', e.target).forEach(t=>t.remove()); }, true);

function profileBrief(){
  const p = profile(), t = targets(), s = season();
  return `Пользователь: ${p.name||'без имени'}${p.sex==='m'?', мужчина':p.sex==='f'?', женщина':''}, ${p.age||'?'} лет, рост ${p.height||'?'} см, вес ${p.weight||'?'} кг, талия ${p.waist||'?'} см. ${p.about?p.about+' ':''}Цели сезона ${tr('«')}${s.title}${tr('»')}: ${(s.goals||[]).join('; ')}. Норма: ${t.ok?`${t.kcal} ккал, белок ${t.p} г, жиры ${t.f} г, углеводы ${t.c} г`:'профиль не заполнен, норма не рассчитана'}; шаги ${t.steps}.${goalBrief(t)}`;
}
const goalBrief = t => !t.ok ? '' : ({lose: ' Цель по весу: снизить.', keep: ' Цель по весу: держать.', gain: ' Цель по весу: набрать.'}[t.aim]) + (t.care ? ' Не предлагай дефицит калорий и похудение: ' + (t.care === 'minor' ? 'пользователю нет 18 лет.' : 'вес ниже нормы.') : '');

/* ============ AI: three providers + offline queue ============ */
const DEFAULT_AI = {
  order: ['claude','openai','pc','phone'],
  claude: {key:'', model:'claude-sonnet-5-5', proxy:''},
  openai: {key:'', model:'', models:[]},
  pc: {url:'', model:'', vision:true},
  phone: {model:'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', downloaded:false},
};
const PROV = {
  kai: {name:tr('ИИ KAI'), short:'KAI', icon:'spark'},
  app: {name:tr('Claude в приложении Claude'), short:'Claude', icon:'spark'},
  claude: {name:'Claude', short:'Claude', icon:'spark'},
  openai: {name:'ChatGPT', short:'ChatGPT', icon:'spark'},
  pc: {name:tr('ИИ на компьютере'), short:tr('Компьютер'), icon:'laptop'},
  phone: {name:tr('ИИ в телефоне'), short:tr('Телефон'), icon:'phone'},
};
const PHONE_MODELS = [
  ['Qwen2.5-1.5B-Instruct-q4f16_1-MLC','Qwen 2.5 · 1.5B', tr('≈1.6 ГБ · лучший баланс, хорошо понимает русский')],
  ['Qwen2.5-3B-Instruct-q4f16_1-MLC','Qwen 2.5 · 3B', tr('≈2.5 ГБ · умнее, для iPhone 15 Pro и новее')],
  ['Llama-3.2-1B-Instruct-q4f16_1-MLC','Llama 3.2 · 1B', tr('≈0.9 ГБ · самая лёгкая, русский слабее')],
];
const CLAUDE_MODELS = [['claude-sonnet-5-5',tr('Sonnet 5.5 · основной')],['claude-haiku-5-5',tr('Haiku 5.5 · быстрее и дешевле')],['claude-opus-5-5',tr('Opus 5.5 · самый умный, дороже')]];
const WEBLLM_URL = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
const PROMPT_LIMIT = {kai: 59000, app: 26000, claude: 60000, openai: 60000, pc: 14000, phone: 5000};
let SAMPLE_CAP = null, DL_CAP = null;
/* inside the Claude app the page may ask Claude directly (viewer's own account); outside it uses the three providers */
const PROV_LIST = () => S.inClaude ? ['app'] : [...(cloudOn() ? ['kai'] : []), 'claude','openai','pc','phone'];
const NEEDS_CONFIRM = ['tell','food','bank','screen'];
const aiCfg = () => {
  const c = {...DEFAULT_AI, ...(S.docs['app/ai']||{})};
  c.openai = {...DEFAULT_AI.openai, ...(c.openai||{})};
  const all = [...(cloudOn() ? ['kai'] : []), 'claude','openai','pc','phone'], o = c.order || [];
  c.order = [...all.filter(x => !o.includes(x)), ...o.filter(x => all.includes(x))];
  if (c.claude && c.claude.model === 'claude-sonnet-5') c.claude = {...c.claude, model:'claude-sonnet-5-5'};
  return c;
};
const AI = { testMsg:{}, running:false, engine:null, engineModel:null, loading:null, progress:'', downUntil:{}, lastErr:{} };

function provReady(p, needImg){
  const c = aiCfg();
  if (p === 'app') return !!SAMPLE_CAP && S.online && (!needImg || S.appImg);
  if (p === 'kai') return S.online && signedIn();
  if (p === 'claude') return S.online && !!(c.claude?.key || c.claude?.proxy);
  if (p === 'openai') return S.online && !!c.openai?.key;
  if (p === 'pc') return !!c.pc?.url && !!c.pc?.model && (!needImg || c.pc.vision);
  if (p === 'phone') return !needImg && ('gpu' in navigator) && !!c.phone?.downloaded;
  return false;
}
function provConfigured(p){ const c = aiCfg(); if (p==='app') return !!SAMPLE_CAP; if (p==='kai') return signedIn(); return p==='claude' ? !!(c.claude?.key||c.claude?.proxy) : p==='openai' ? !!c.openai?.key : p==='pc' ? !!(c.pc?.url && c.pc?.model) : !!c.phone?.downloaded; }
const imgCapable = () => S.inClaude ? !!S.appImg : provConfigured('kai') || provConfigured('claude') || provConfigured('openai') || (provConfigured('pc') && aiCfg().pc.vision);
function pickProvider(job){
  const list = job.provider && job.provider !== 'auto' ? [job.provider] : S.inClaude ? ['app'] : aiCfg().order;
  const now = Date.now();
  return list.find(p => provReady(p, job.nImg > 0) && !(AI.downUntil[p] > now) && (aiAgreed() || !REMOTE_AI.includes(p))) || null;
}
class AIError extends Error { constructor(msg, fatal){ super(msg); this.fatal = fatal; } }
async function callApp(prompt, imgs, json){
  try {
    const r = await SAMPLE_CAP(prompt + (json ? '\n\nОтветь только JSON, без пояснений.' : ''), {cache:false, ...(imgs.length ? {images: imgs} : {})});
    return r.text;
  } catch(e){
    const fatal = ['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed','images_unavailable','image_rejected','refused','prompt_too_large','invalid_request'].includes(e?.code);
    const msg = {not_granted:tr('Нужно разрешить приложению обращаться к Claude.'), rate_limited:tr('Слишком много запросов подряд, попробую позже.'), images_unavailable:tr('Здесь нельзя отправить фото.'), image_rejected:tr('Фото не подошло: попробуй другое.'), refused:tr('Claude не стал отвечать на этот запрос.'), prompt_too_large:tr('Слишком много текста за раз.')}[e?.code] || tr('Claude сейчас недоступен.');
    throw new AIError(msg, fatal);
  }
}

async function imageToBlob(file){
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width*k); cv.height = Math.round(bmp.height*k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.85));
  } catch { return file; }
}
const blobToB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(b); });

/* the server adds these rules for KAI's own AI (ai-core.ts); a person's own key goes straight to the provider, so they travel with the prompt */
const safetyNote = prov => prov === 'kai' ? '' : '\n\nRules that outrank everything above. You are not a doctor: do not diagnose or tell anyone to change medication. Never suggest fasting for days, purging, laxatives, diet pills or eating below about 1200 kcal a day, and never praise skipping meals or fast weight loss. If the person seems to be under 18, underweight, or shows signs of an eating disorder, self-harm or crisis, drop any weight coaching and say kindly in the reply that they deserve support from a doctor or someone they trust, while keeping the requested format.';
const langNote = () => LANG === 'ru' ? '' : '\n\nIMPORTANT: the app language is English. Ignore any request above to write in Russian: write every sentence, name and piece of advice in English. Keep JSON keys, ids, dates and values chosen from a given list (categories, statuses, evidence and confidence levels) exactly as given above.';
function buildPrompt(job, prov){
  const lim = PROMPT_LIMIT[prov];
  if (typeof job.prompt === 'string') return (job.prompt.length > lim ? job.prompt.slice(0, lim) : job.prompt) + safetyNote(prov) + langNote();
  const {head='', body='', tail=''} = job.prompt;
  return head + body.slice(0, Math.max(300, lim - head.length - tail.length)) + tail + safetyNote(prov) + langNote();
}
function withTimeout(ms){ const c = new AbortController(); const t = setTimeout(()=>c.abort(), ms); return {signal:c.signal, done:()=>clearTimeout(t)}; }

async function callClaude(prompt, imgs, json){
  const c = aiCfg().claude;
  const content = [];
  for (const b of imgs) content.push({type:'image', source:{type:'base64', media_type:b.type||'image/jpeg', data: await blobToB64(b)}});
  content.push({type:'text', text: prompt + (json ? '\n\nОтветь только JSON, без пояснений.' : '')});
  const t = withTimeout(180000);
  let r;
  try {
    r = await fetch(c.proxy || 'https://api.anthropic.com/v1/messages', { method:'POST', signal:t.signal,
      headers: c.proxy ? {'content-type':'application/json'} : {'content-type':'application/json', 'x-api-key': c.key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({model: c.model || 'claude-sonnet-5-5', max_tokens: 4096, messages:[{role:'user', content}]}) });
  } catch(e){ throw new AIError(tr('Нет связи с Claude'), false); } finally { t.done(); }
  if (r.status === 401 || r.status === 403) throw new AIError(tr('Claude отклонил ключ API. Проверь ключ в настройках ИИ.'), true);
  if (r.status === 400){ const e = await r.json().catch(()=>({})); throw new AIError(tr('Claude не принял запрос: ')+(e.error?.message||tr('ошибка 400')), true); }
  if (!r.ok) throw new AIError(tr('Claude временно недоступен (')+r.status+')', false);
  const d = await r.json();
  if (d.usage){ const m = todayISO().slice(0,7), u = clone(meta().claudeUsage || {}); const cur = u[m] || {in:0, out:0, n:0}; u[m] = {in: cur.in + (d.usage.input_tokens||0), out: cur.out + (d.usage.output_tokens||0), n: cur.n + 1}; setMeta({claudeUsage: u}); }
  return (d.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');
}
async function callPC(prompt, imgs, json){
  const c = aiCfg().pc;
  const base = c.url.replace(/\/+$/,'').replace(/\/v1$/,'');
  let content = prompt;
  if (imgs.length){ content = [{type:'text', text:prompt}]; for (const b of imgs) content.push({type:'image_url', image_url:{url:'data:'+(b.type||'image/jpeg')+';base64,'+await blobToB64(b)}}); }
  const body = {model:c.model, messages:[{role:'user', content}], temperature:0.3, stream:false};
  if (json) body.response_format = {type:'json_object'};
  const t = withTimeout(300000);
  let r;
  try { r = await fetch(base + '/v1/chat/completions', {method:'POST', signal:t.signal, headers:{'content-type':'application/json'}, body: JSON.stringify(body)}); }
  catch(e){ throw new AIError(tr('Компьютер не отвечает: включён ли он и запущен ли Ollama или LM Studio?'), false); } finally { t.done(); }
  if (!r.ok){ const e = await r.text().catch(()=>''); throw new AIError(tr('Компьютер вернул ошибку ')+r.status+(e?': '+e.slice(0,140):''), r.status===404 || r.status===400); }
  const d = await r.json();
  return d.choices?.[0]?.message?.content || '';
}
async function phoneEngine(onProgress){
  const c = aiCfg().phone;
  if (!('gpu' in navigator)) throw new AIError(tr('Этот браузер не поддерживает WebGPU. Нужен iOS 26 / Safari 26 или новее.'), true);
  if (AI.engine && AI.engineModel === c.model) return AI.engine;
  if (AI.loading) return AI.loading;
  AI.loading = (async () => {
    const webllm = await import(WEBLLM_URL);
    if (AI.engine){ try { await AI.engine.unload(); } catch{} }
    const eng = await webllm.CreateMLCEngine(c.model, { initProgressCallback: p => { AI.progress = p.text || ''; onProgress && onProgress(p); } });
    AI.engine = eng; AI.engineModel = c.model; return eng;
  })();
  try { return await AI.loading; } finally { AI.loading = null; }
}
async function callPhone(prompt, json){
  const eng = await phoneEngine();
  const r = await eng.chat.completions.create({ messages:[{role:'user', content: prompt}], temperature:0.3, max_tokens:1200, ...(json?{response_format:{type:'json_object'}}:{}) });
  return r.choices?.[0]?.message?.content || '';
}
function parseJSON(t){
  t = String(t||'').replace(/<think>[\s\S]*?<\/think>/g,'');
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) t = m[1];
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new AIError(tr('ИИ ответил не в том формате'), false);
  return JSON.parse(t.slice(a, b+1));
}

/* submit a job: runs now if some AI is reachable, otherwise waits in the queue */
async function submitJob(kind, {prompt, images=[], json=true, meta={}, provider='auto', label=''}){
  if (!['pc', 'phone'].includes(provider) && !(await askConsent())) return null;
  if (queued().filter(j => j.status !== 'error').length >= JOB_MAX){ toast(trf('В очереди уже {n} запросов. Дождись ответов или удали лишние в разделе «ИИ». Твой текст остался на месте.', {n: JOB_MAX}), {ms: 6000}); return null; }
  const id = uid();
  const imgs = [];
  try { for (let i=0; i<images.length; i++){ const b = await imageToBlob(images[i]); await blobPut('job_'+id+'_'+i, b); imgs.push(b); } }
  catch(e){
    for (let i=0; i<images.length; i++) blobDel('job_'+id+'_'+i).catch(() => {});
    toast(e?.name === 'QuotaExceededError' ? tr('В телефоне закончилось место, поэтому фото не сохранилось. Освободи память и попробуй ещё раз.') : tr('Не получилось сохранить фото. Попробуй ещё раз.'), {ms: 6000});
    return null;
  }
  save('jobs/'+id, {id, kind, prompt, nImg: images.length, json, meta, provider, label, status:'queued', created: new Date().toISOString(), tries:0});
  JOB_IMGS[id] = imgs;
  setTimeout(processQueue, 50);
  return id;
}
const JOB_IMGS = {};
const JOB_MAX = 30; // waiting requests; beyond this something is wrong, and photos would fill the phone
const queued = () => Object.entries(S.docs).filter(([k])=>k.startsWith('jobs/')).map(([,v])=>v).sort((a,b)=>a.created.localeCompare(b.created));

async function processQueue(){
  if (AI.running || !DB) return; AI.running = true;
  try {
    for (const job of queued()){
      if (job.status === 'error') continue;
      const prov = pickProvider(job); if (!prov) continue;
      save('jobs/'+job.id, {...job, status:'running', using: prov});
      jobStatus(job.id);
      try {
        let imgs = JOB_IMGS[job.id];
        if (!imgs){ imgs = []; for (let i=0;i<job.nImg;i++){ const b = await blobGet('job_'+job.id+'_'+i); if (b) imgs.push(b); } }
        const prompt = buildPrompt(job, prov);
        const text = prov==='kai' ? await callKai(prompt, imgs, job.json, job.kind) : prov==='app' ? await callApp(prompt, imgs, job.json) : prov==='claude' ? await callClaude(prompt, imgs, job.json) : prov==='openai' ? await callOpenAI(prompt, imgs, job.json) : prov==='pc' ? await callPC(prompt, imgs, job.json) : await callPhone(prompt, job.json);
        let result;
        try { result = job.json ? parseJSON(text) : {text}; }
        catch(e){ if ((job.tries||0) < 1){ save('jobs/'+job.id, {...job, status:'queued', tries:(job.tries||0)+1, lastError:tr('ответ не в том формате, пробую ещё раз')}); continue; } throw new AIError(tr('ИИ (')+PROV[prov].short+tr(') дважды ответил не в том формате. Выбери другой ИИ и повтори.'), true); }
        await finishJob(job, result, prov);
      } catch(e){
        const fatal = e instanceof AIError ? e.fatal : false;
        const msg = e instanceof AIError ? e.message : (tr('Ошибка: ')+(e?.message||e));
        AI.lastErr[prov] = msg;
        if (!fatal) AI.downUntil[prov] = Date.now() + 60000;
        save('jobs/'+job.id, {...S.docs['jobs/'+job.id], status: fatal ? 'error' : 'queued', lastError: msg, using:null});
        jobStatus(job.id);
      }
    }
  } finally { AI.running = false; renderBadge(); }
  // another provider may have become available while we worked
  if (queued().some(j => j.status==='queued' && pickProvider(j))) setTimeout(processQueue, 500);
}
setInterval(() => { if (queued().some(j=>j.status==='queued')) processQueue(); }, 45000);
window.addEventListener('online', () => { S.online = true; AI.downUntil = {}; processQueue(); scheduleRender(); });
window.addEventListener('offline', () => { S.online = false; scheduleRender(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') processQueue(); });

async function finishJob(job, result, prov){
  const item = {id: job.id, kind: job.kind, result, meta: job.meta, provider: prov, label: job.label, date: todayISO(), created: job.created, done: !NEEDS_CONFIRM.includes(job.kind)};
  if (item.done) try { JOB_APPLY[job.kind]?.(item); } catch(e){ item.done = false; item.applyError = String(e?.message||e); }
  save('inbox/'+job.id, item);
  remove('jobs/'+job.id);
  for (let i=0;i<job.nImg;i++) blobDel('job_'+job.id+'_'+i);
  delete JOB_IMGS[job.id];
  if (SH && SH.jobId === job.id && SH.outId && $('#'+SH.outId)) { $('#'+SH.outId).innerHTML = jobView(item); }
  else toast(`${tr("Ответ готов:")} ${job.label || KIND_NAME[job.kind] || tr('ИИ')}`);
  renderBadge();
}
const KIND_NAME = {review:tr('разбор недели'), tell:tr('разбор дня'), food:tr('КБЖУ еды'), menu:tr('меню'), supp:tr('справка по БАДу'), stats:tr('разбор статистики'), script:tr('сценарий'), promo:tr('план продвижения'), bank:tr('операции из банка'), kbAsk:tr('ответ по базе'), kbExtract:tr('запись в базу'), screen:tr('экранное время')};

/* while a sheet waits on a job, show where it is */
function jobStatus(id){
  if (!SH || SH.jobId !== id || !SH.outId || S.docs['inbox/'+id]) return;
  const el = $('#'+SH.outId); if (!el) return;
  const j = S.docs['jobs/'+id]; if (!j) return;
  if (j.status === 'running') el.innerHTML = `<div class="note"><span class="spin"></span> ${tr("Думает")} ${esc(PROV[j.using]?.name||tr('ИИ'))}…${j.using==='phone'&&AI.progress?`<div class="hint" id="phoneProg">${esc(AI.progress)}</div>`:''}</div>`;
  else if (j.status === 'error') el.innerHTML = `<div class="note">${esc(j.lastError||tr('Ошибка'))}</div><div class="btnrow"><button class="btn ghost" data-act="jobRetry" data-id="${id}">${tr("Повторить")}</button></div>`;
  else if (!S.online) el.innerHTML = `<div class="note">${ic('repeat')} ${tr('Нет интернета. Запрос сохранён в очереди и отправится сам, когда связь вернётся. Можешь закрыть окно: ответ придёт в раздел «ИИ».')}</div>`;
  else el.innerHTML = `<div class="note">${ic('repeat')} ${tr("Сейчас ни один ИИ недоступен")}${j.lastError?' ('+esc(j.lastError)+')':''}${tr(". Запрос сохранён в очереди и отправится сам, как только появится интернет или компьютер. Можешь закрыть окно — ответ придёт в раздел «ИИ».")}</div>`;
}
function queueNow(id, outId){ if (!id || !SH) return; SH.jobId = id; SH.outId = outId; setTimeout(()=>jobStatus(id), 60); }

/* provider picker used in every AI sheet */
function provPicker(needImg){
  if (PROV_LIST().filter(provConfigured).length < 2 && !(SH?.prov && SH.prov !== 'auto')) return ''; // a choice only matters with two or more set up
  const cur = SH?.prov || 'auto';
  const opts = [['auto',tr('Авто')], ...PROV_LIST().map(p=>[p, PROV[p].short])];
  return `<div class="field"><label>${tr("Какой ИИ")}</label><div class="seg">${opts.map(([v,l])=>{ const ok = v==='auto' || provReady(v, needImg); const off = v==='phone' && needImg; return `<button class="${cur===v?'on':''}" data-act="pickProv" data-v="${v}" ${off?tr('disabled title="ИИ в телефоне не видит картинки"'):''}>${l}${v!=='auto'?`<span class="pdot" style="background:${off?'#444':ok?'var(--good)':'#555'}"></span>`:''}</button>`; }).join('')}</div>
  <div class="hint">${cur==='auto'?tr('Возьмёт первый доступный по твоему порядку. Если нет ни одного — подождёт в очереди.'):provReady(cur, needImg)?PROV[cur].name+tr(' доступен.'):PROV[cur].name+tr(' сейчас недоступен: запрос подождёт, пока он появится.')}</div></div>`;
}
A.pickProv = el => { SH.prov = el.dataset.v; const f = el.closest('.field'); if (f) f.outerHTML = provPicker(!!SH.needImg); };

/* ---------- results: how each kind is shown and applied ---------- */
const JOB_APPLY = {
  menu: it => { const p = clone(plan()); p.menu = {...it.result, date: it.date}; save('app/plan', p); },
  supp: it => { const p = clone(plan()); p.supps = p.supps||[]; if (!p.supps.some(s=>s.name===it.result.name)) p.supps.push(it.result); if (!p.dailyTasks.some(t=>t.cat==='supps')) p.dailyTasks.push({id:'supps', title:tr('Принять БАДы'), cat:'supps'}); save('app/plan', p); },
  stats: it => { const r = it.result, m = it.meta; save('analyses/'+it.id, {...r, platform:m.platform, kind:m.kind, date:it.date, note:m.note||''}); if (r.followers){ const cc = clone(content()); const pp = cc.platforms[m.platform] = cc.platforms[m.platform]||{followers:[]}; pp.followers = (pp.followers||[]).filter(x=>x.d!==it.date); pp.followers.push({d:it.date, v:+r.followers}); save('app/content', cc); } },
  script: it => { save('posts/'+it.id, {...it.result, platforms: it.meta.platforms||[], status:'Сценарий', date: it.meta.planDate||'', created: new Date().toISOString()}); },
  promo: it => { const cc = clone(content()); cc.promo = it.result.text; cc.promoDate = it.date; save('app/content', cc); },
  kbAsk: () => {},
  review: () => {},
  kbExtract: it => { const k = S.docs['kb/'+it.meta.kbId]; if (!k) return; const r = it.result; save('kb/'+it.meta.kbId, {...k, title: k.title && k.title!=='Заметка' ? k.title : (r.title||k.title), text: r.text ? ((k.text?k.text+'\n\n':'') + r.text) : k.text, summary: r.summary||k.summary||'', tags: r.tags||k.tags||[], pending:false}); },
};
function jobView(it){
  const r = it.result || {}, by = `<div class="hint">${it.provider === 'local' ? tr('Разобрано на телефоне') : `${tr("Ответил:")} ${esc(PROV[it.provider]?.name||tr('ИИ'))}`}${it.meta?.date && it.meta.date!==todayISO()?tr(' · запрос от ')+fmtShort(it.meta.date):''}</div>`;
  if (it.applyError) return `<div class="note">${tr("Не получилось применить:")} ${esc(it.applyError)}</div>`;
  switch (it.kind){
    case 'tell': return tellView(it) + by;
    case 'food': return foodView(it) + by;
    case 'bank': return bankView(it) + by;
    case 'menu': return `<div class="note">${tr("Меню готово:")} ${(r.meals||[]).map(m=>esc(m.name)).join(' · ')}</div><button class="btn ghost" data-act="goFood">${tr("Открыть меню")}</button>` + by;
    case 'supp': return `<div class="note"><b>${esc(r.name)}</b> ${tr("добавлен.")} ${esc(r.dose||'')} · ${esc(r.timing||'')}</div>` + by;
    case 'stats': return analysisHTML({...r, platform:it.meta.platform, kind:it.meta.kind, date:it.date, id:it.id}) + by;
    case 'script': return `<div class="note">${tr("Сценарий «")}${esc(r.title)}${tr("» готов.")}</div><button class="btn" data-act="openPost" data-id="${it.id}">${tr("Открыть сценарий")}</button>` + by;
    case 'promo': return `<div class="ai-out">${esc(r.text)}</div>` + by;
    case 'review': return `<div class="ai-out">${esc(r.text)}</div>` + by;
    case 'screen': return screenView(it) + by;
    case 'kbAsk': return `${it.meta?.q?`<div class="hint">${tr("Вопрос:")} ${esc(it.meta.q)}</div>`:''}<div class="ai-out">${esc(r.text)}</div>` + by;
    case 'kbExtract': return `<div class="note">${tr("Запись «")}${esc(r.title||S.docs['kb/'+it.meta?.kbId]?.title||'')}${tr("» обработана и сохранена в базе.")}</div>` + by;
  }
  return '';
}
A.jobRetry = el => { const j = S.docs['jobs/'+el.dataset.id]; if (!j) return; save('jobs/'+j.id, {...j, status:'queued', tries:0, lastError:''}); AI.downUntil = {}; processQueue(); };
A.jobCancel = el => { const j = S.docs['jobs/'+el.dataset.id]; if (!j) return; for (let i=0;i<j.nImg;i++) blobDel('job_'+j.id+'_'+i); remove('jobs/'+j.id); drawSheet(); };
A.jobProv = el => { const j = S.docs['jobs/'+el.dataset.id]; if (!j) return; save('jobs/'+j.id, {...j, provider: el.value, status:'queued', lastError:''}); AI.downUntil = {}; processQueue(); };
A.inboxDone = el => { const it = S.docs['inbox/'+el.dataset.id]; if (it) save('inbox/'+it.id, {...it, done:true}); drawSheet(); };

/* header badge */
function aiCounts(){ const q = queued().length; const a = Object.entries(S.docs).filter(([k,v])=>k.startsWith('inbox/') && !v.done).length; return {q, a}; }
function renderBadge(){ const b = $('#aiBadge'); if (!b) return; const {q, a} = aiCounts(); b.textContent = a || q || ''; b.hidden = !(a || q); b.style.background = a ? 'var(--bad)' : 'var(--warn)'; }

/* ---------- the AI sheet: queue, answers, settings ---------- */
A.aiSheet = () => { openSheet(tr('ИИ'), aiBody); SH.aiTab = SH.aiTab || (aiStatus().ok ? 'inbox' : 'set'); drawSheet(); };
function aiBody(){
  const tab = SH?.aiTab || 'inbox', {q, a} = aiCounts();
  return `<div class="seg"><button class="${tab==='inbox'?'on':''}" data-act="aiTab" data-v="inbox">${tr("Ответы")}${a?' · '+a:''}</button><button class="${tab==='queue'?'on':''}" data-act="aiTab" data-v="queue">${tr("Очередь")}${q?' · '+q:''}</button><button class="${tab==='set'?'on':''}" data-act="aiTab" data-v="set">${tr("Настройки")}</button></div>` +
    (tab==='inbox' ? aiInbox() : tab==='queue' ? aiQueue() : aiSettings());
}
A.aiTab = el => { SH.aiTab = el.dataset.v; drawSheet(); };
function aiInbox(){
  const items = Object.entries(S.docs).filter(([k])=>k.startsWith('inbox/')).map(([,v])=>v).sort((x,y)=>(y.created||'').localeCompare(x.created||''));
  const open = items.filter(i=>!i.done), done = items.filter(i=>i.done).slice(0, 12);
  return `${open.length ? open.map(it=>`<section class="card" style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(it.label||KIND_NAME[it.kind])}</b><button class="link" data-act="inboxDone" data-id="${it.id}">${tr("Скрыть")}</button></div>${jobView(it)}</section>`).join('') : `<div class="empty">${tr("Новых ответов, которые нужно подтвердить, нет")}</div>`}
  ${done.length?`<div class="sec-h"><h2>${tr("Готово")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${done.map(it=>`<button class="row" data-act="toggleOpen" data-k="ib_${it.id}" style="flex-wrap:wrap"><span class="ic">${ic(PROV[it.provider]?.icon||'spark')}</span><div class="mid"><div class="t">${esc(it.label||KIND_NAME[it.kind])}</div><div class="s">${fmtShort(it.date)} · ${esc(PROV[it.provider]?.short||'')}</div></div></button>${S.open['ib_'+it.id]?`<div class="detail" style="margin-left:0">${jobView(it)}</div>`:''}`).join('')}</div></section>`:''}`;
}
function aiQueue(){
  const js = queued();
  const st = {queued:tr('ждёт'), running:tr('выполняется'), error:tr('ошибка')};
  return js.length ? `<div class="hint">${tr("Запросы отправляются сами, когда приложение открыто и доступен выбранный ИИ.")}</div>` + js.map(j=>`<section class="card" style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(j.label||KIND_NAME[j.kind])}</b><span class="tag ${j.status==='error'?'bad':j.status==='running'?'good':'warn'}">${st[j.status]||j.status}</span></div>
    <div class="hint">${new Date(j.created).toLocaleString(LOCALE,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${j.nImg?tr(' · фото: ')+j.nImg:''}${j.lastError?' · '+esc(j.lastError):''}</div>
    <div style="display:flex;gap:8px;align-items:center"><select class="in" aria-label="${tr("Какой ИИ")}" data-ch="jobProv" data-id="${j.id}" style="flex:1">${[['auto',tr('Авто')], ...PROV_LIST().map(p=>[p, PROV[p].short])].map(([v,l])=>`<option value="${v}" ${ (j.provider||'auto')===v?'selected':''} ${v==='phone'&&j.nImg?'disabled':''}>${l}</option>`).join('')}</select>
    <button class="btn ghost" data-act="jobRetry" data-id="${j.id}">${tr("Отправить")}</button><button class="iconbtn" data-act="jobCancel" data-id="${j.id}" aria-label="${tr("Отменить")}" style="color:var(--text-3)">${ic('trash')}</button></div></section>`).join('') : `<div class="empty">${tr("Очередь пуста")}</div>`;
}
CH.jobProv = el => A.jobProv(el);
function aiSettingsFull(){
  const c = aiCfg(), gpu = 'gpu' in navigator;
  const row = (p, i) => `<div class="row"><span class="ic">${ic(PROV[p].icon)}</span><div class="mid"><div class="t">${i+1}. ${PROV[p].name}</div><div class="s">${provConfigured(p)?(provReady(p)?tr('готов'):tr('настроен, сейчас недоступен')):tr('не настроен')}</div></div><button class="iconbtn" data-act="aiUp" data-v="${p}" aria-label="${tr("Выше")}" ${i===0?'disabled':''}>${ic('chevL').replace('<svg','<svg style="transform:rotate(90deg)"')}</button></div>`;
  return `<section class="card" style="padding:4px 18px"><div class="hint" style="padding-top:12px">${tr("Порядок для режима «Авто»: первый доступный отвечает.")}</div><div class="list">${c.order.map(row).join('')}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Claude (через интернет)")}</b>
    <div class="hint">${tr("Нужен ключ API из console.anthropic.com. Оплата за запросы отдельно от подписки Claude. Ключ хранится только в этом телефоне и не попадает в резервные копии.")}</div>
    <div class="field"><label for="aiKey">${tr("Ключ API")}</label><input class="in" id="aiKey" type="password" autocomplete="off" value="${esc(c.claude.key||'')}" placeholder="sk-ant-…"></div>
    <div class="field"><label for="aiCM">${tr("Модель")}</label><select class="in" id="aiCM">${CLAUDE_MODELS.map(([v,l])=>`<option value="${v}" ${c.claude.model===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label for="aiProxy">${tr("Адрес своего сервера-посредника (необязательно)")}</label><input class="in" id="aiProxy" value="${esc(c.claude.proxy||'')}" placeholder="https://…workers.dev"></div>
    ${(() => { const u = meta().claudeUsage?.[todayISO().slice(0,7)]; return u ? `<div class="note">${tr("В этом месяце:")} ${u.n} ${plural(u.n,tr('запрос'),tr('запроса'),tr('запросов'))}${tr(", токенов")} ${num(u.in)} ${tr("на вход и")} ${num(u.out)} ${tr("на выход. Точную сумму смотри в console.anthropic.com → Usage.")}</div>` : ''; })()}
    <div class="btnrow"><button class="btn" data-act="aiSaveClaude">${tr("Сохранить")}</button><button class="btn ghost" data-act="aiTest" data-v="claude">${tr("Проверить")}</button></div><div id="aiT_claude">${AI.testMsg.claude||''}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("ChatGPT (через интернет)")}</b>
    <div class="field"><label for="oaKey">${tr("Ключ API")}</label><input class="in" id="oaKey" type="password" autocomplete="off" value="${esc(c.openai.key||'')}" placeholder="sk-…"></div>
    <div class="field"><label for="oaModel">${tr("Модель")}</label><input class="in" id="oaModel" list="oaMl" value="${esc(c.openai.model||'')}" placeholder="gpt-5-mini"><datalist id="oaMl">${(c.openai.models||[]).map(m=>`<option value="${esc(m)}">`).join('')}</datalist></div>
    <div class="btnrow"><button class="btn" data-act="aiSaveOpenAI">${tr("Сохранить")}</button><button class="btn ghost" data-act="aiTest" data-v="openai">${tr("Проверить")}</button></div><div id="aiT_openai">${AI.testMsg.openai||''}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("ИИ на компьютере (Ollama или LM Studio)")}</b>
    <div class="hint">${tr("Адрес должен начинаться с https. Проще всего через Tailscale: инструкция в файле «Как настроить».")}</div>
    <div class="field"><label for="aiPU">${tr("Адрес")}</label><input class="in" id="aiPU" value="${esc(c.pc.url||'')}" placeholder="https://my-pc.tail1234.ts.net"></div>
    <div class="field"><label for="aiPM">${tr("Модель")}</label><input class="in" id="aiPM" list="aiPMl" value="${esc(c.pc.model||'')}" placeholder="${tr("например, gemma3:12b")}"><datalist id="aiPMl">${(AI.pcModels||[]).map(m=>`<option value="${esc(m)}">`).join('')}</datalist></div>
    <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="aiPV" ${c.pc.vision?'checked':''}> ${tr("Модель понимает картинки (gemma3, qwen2.5vl, llava)")}</label>
    <div class="btnrow"><button class="btn" data-act="aiSavePC">${tr("Сохранить")}</button><button class="btn ghost" data-act="aiTest" data-v="pc">${tr("Проверить и найти модели")}</button></div><div id="aiT_pc">${AI.testMsg.pc||''}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("ИИ в телефоне (без интернета)")}</b>
    ${gpu?'':`<div class="note">${tr("Этот браузер не поддерживает WebGPU. Обнови iPhone до iOS 26 или новее.")}</div>`}
    <div class="hint">${tr("Модель скачивается один раз по Wi-Fi и потом работает без сети. Понимает только текст: разбор дня, советы, база знаний. Фото и скриншоты он не видит.")}</div>
    <div class="list">${PHONE_MODELS.map(([v,l,d])=>`<label class="row"><input type="radio" name="pm" value="${v}" ${c.phone.model===v?'checked':''} data-ch="phoneModel"><div class="mid"><div class="t">${l}</div><div class="s">${d}</div></div></label>`).join('')}</div>
    <div class="note">${c.phone.downloaded?`${tr("Скачана:")} ${esc(PHONE_MODELS.find(m=>m[0]===c.phone.model)?.[1]||c.phone.model)}`:tr('Модель ещё не скачана')}</div>
    <div class="btnrow"><button class="btn" data-act="phoneDl" ${gpu?'':'disabled'}>${c.phone.downloaded?tr('Проверить модель'):tr('Скачать модель')}</button>${c.phone.downloaded?`<button class="btn danger" data-act="phoneDel">${tr("Удалить")}</button>`:''}</div><div id="phoneDlOut" class="hint"></div></section>`;
}
A.aiUp = el => { const c = clone(aiCfg()); const i = c.order.indexOf(el.dataset.v); if (i>0){ [c.order[i-1], c.order[i]] = [c.order[i], c.order[i-1]]; save('app/ai', c); drawSheet(); } };
A.aiSaveClaude = () => { const c = clone(aiCfg()); c.claude = {key: val('aiKey'), model: val('aiCM'), proxy: val('aiProxy')}; save('app/ai', c); AI.downUntil = {}; toast(tr('Сохранено')); processQueue(); };
A.aiSavePC = () => { const c = clone(aiCfg()); c.pc = {url: val('aiPU'), model: val('aiPM'), vision: $('#aiPV').checked}; save('app/ai', c); AI.downUntil = {}; toast(tr('Сохранено')); processQueue(); };
CH.phoneModel = el => { const c = clone(aiCfg()); c.phone = {model: el.value, downloaded:false}; save('app/ai', c); drawSheet(); };
A.aiTest = async el => {
  const p = el.dataset.v;
  const show = html => { AI.testMsg[p] = html; const o = $('#aiT_'+p); if (o) o.innerHTML = html; };
  if (p==='claude') A.aiSaveClaude(); else if (p==='openai') A.aiSaveOpenAI(); else A.aiSavePC();
  busy(el, true, tr('Проверяю…'));
  try {
    if (p==='pc'){
      const base = val('aiPU').replace(/\/+$/,'').replace(/\/v1$/,'');
      const t = withTimeout(8000); const r = await fetch(base+'/v1/models', {signal:t.signal}); t.done();
      const d = await r.json(); AI.pcModels = (d.data||[]).map(m=>m.id);
      if (!val('aiPM') && AI.pcModels[0]){ const c = clone(aiCfg()); c.pc.model = AI.pcModels[0]; save('app/ai', c); drawSheet(); }
      show(`<div class="note">${tr("Компьютер на связи. Модели:")} ${esc(AI.pcModels.join(', ')||tr('не найдено — скачай модель в Ollama'))}</div>`);
    } else if (p==='openai'){
      const text = await callOpenAI(tr('Ответь одним словом: работает'), [], false);
      show(`<div class="note">${tr("ChatGPT на связи: «")}${esc(text.trim().slice(0,40))}${tr('»')}</div>`);
    } else {
      const text = await callClaude(tr('Ответь одним словом: работает'), [], false);
      show(`<div class="note">${tr("Claude на связи: «")}${esc(text.trim().slice(0,40))}${tr('»')}</div>`);
    }
    processQueue();
  } catch(e){ show(`<div class="note">${esc(e instanceof AIError ? e.message : p==='pc' ? tr('Нет ответа от компьютера. Проверь адрес, что Ollama запущен и что в Tailscale включён этот телефон.') : tr('Нет связи с Claude.'))}</div>`); }
  const b = $(`[data-act=aiTest][data-v=${p}]`); if (b) busy(b, false);
};
A.phoneDl = async el => {
  const out = $('#phoneDlOut');
  busy(el, true, tr('Скачиваю…'));
  try { await navigator.storage?.persist?.(); } catch {}
  try {
    await phoneEngine(p => { out.textContent = (p.progress!=null ? Math.round(p.progress*100)+'% · ' : '') + (p.text||''); });
    const c = clone(aiCfg()); c.phone.downloaded = true; save('app/ai', c);
    out.textContent = tr('Готово. Модель работает без интернета.');
    toast(tr('ИИ в телефоне готов')); processQueue();
  } catch(e){ out.textContent = (e instanceof AIError ? e.message : tr('Не получилось: ')+(e?.message||e)) + tr(' Если телефону не хватает памяти, выбери модель полегче.'); }
  busy(el, false);
};
A.phoneDel = async () => {
  try { const webllm = await import(WEBLLM_URL); await webllm.deleteModelAllInfoInCache(aiCfg().phone.model); } catch {}
  if (AI.engine){ try { await AI.engine.unload(); } catch{} AI.engine = null; }
  const c = clone(aiCfg()); c.phone.downloaded = false; save('app/ai', c); drawSheet(); SH.aiTab = 'set';
};

/* ============ v3: feel — haptics, sound, particles, confetti, flame, rewards ============ */
const FX = () => ({haptics:true, sound:false, ...(meta().fx||{})});
const reduceMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

/* Haptics. Android: Vibration API. iPhone (iOS 18+): Safari has no Vibration API, but toggling a native
   <input type="checkbox" switch> plays the system haptic tick, so we click a hidden one. */
let HAP_EL = null;
function hapEl(){
  if (HAP_EL && HAP_EL.isConnected) return HAP_EL;
  const l = document.createElement('label'); l.className = 'hap'; l.setAttribute('aria-hidden', 'true');
  const i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1;
  l.append(i); document.body.append(l); HAP_EL = l; return l;
}
const HAP = {
  selection: {v: 8, ios: [0]},
  light: {v: 14, ios: [0]},
  medium: {v: [20, 50, 20], ios: [0, 90]},
  success: {v: [14, 70, 14, 70, 45], ios: [0, 110, 230]},
  heavy: {v: [30, 40, 60], ios: [0, 70, 140, 210]},
  error: {v: [45, 60, 45], ios: [0, 90, 180]},
};
let HAP_AT = 0;
function haptic(kind = 'light'){
  HAP_AT = performance.now();
  if (!FX().haptics) return;
  const nh = isNative() && plug('Haptics');
  if (nh){ (kind === 'success' ? nh.notification({type: 'SUCCESS'}) : nh.impact({style: kind === 'medium' ? 'MEDIUM' : kind === 'heavy' ? 'HEAVY' : 'LIGHT'})).catch?.(() => {}); return; }
  const p = HAP[kind] || HAP.light;
  try { if (typeof navigator.vibrate === 'function') { navigator.vibrate(p.v); return; } } catch {}
  /* iOS only plays the tick while the tap is still being handled, so the first one is fired right now, not from a timer */
  p.ios.forEach(t => { if (!t){ try { hapEl().click(); } catch {} } else setTimeout(() => { try { hapEl().click(); } catch {} }, t); });
}
/* every tap gets a tick even when its handler forgot to ask for one: removing is firmer, saving is light, the rest is a selection tick */
function hapDefault(act){
  if (act === 'scrim') return null;
  if (/Del|Remove|Reset|Cancel|Clear|Drop|Trash/.test(act)) return 'medium';
  if (/Add|Save|Done|Go$|Apply|Take|Send|Submit|Connect|Paste|Start|Finish|Mark|Check/.test(act)) return 'light';
  return 'selection';
}

/* Short synthesized sounds (off by default, switch in profile). */
function sound(kind){
  if (!FX().sound || typeof AUDIO === 'undefined' || !AUDIO) return;
  try {
    const now = AUDIO.currentTime;
    const notes = {
      pop: [[740, 0, .07], [1110, .05, .1]],
      success: [[523, 0, .14], [659, .1, .14], [784, .2, .22]],
      pr: [[587, 0, .1], [784, .08, .1], [988, .16, .1], [1175, .24, .28]],
      badge: [[659, 0, .12], [880, .1, .12], [1047, .2, .12], [1319, .3, .35]],
    }[kind] || [];
    notes.forEach(([f, t, d]) => { const o = AUDIO.createOscillator(), g = AUDIO.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, now + t); g.gain.exponentialRampToValueAtTime(.22, now + t + .015); g.gain.exponentialRampToValueAtTime(.0001, now + t + d); o.connect(g).connect(AUDIO.destination); o.start(now + t); o.stop(now + t + d + .03); });
  } catch {}
}

/* Overlay layer for particles, lives outside the re-rendered view. */
let FXL = null;
function fxLayer(){ if (!FXL || !FXL.isConnected){ FXL = document.createElement('div'); FXL.className = 'fxl'; FXL.setAttribute('aria-hidden', 'true'); document.body.append(FXL); } return FXL; }
function burst(x, y, o = {}){
  if (reduceMotion()) return;
  const n = o.n || 14, colors = o.colors || ['#2ebd6b', '#7ee2a8', '#ffd84d', '#ffffff'];
  for (let i = 0; i < n; i++){
    const d = document.createElement('i'), s = (o.size || 5) + Math.random() * 4;
    d.className = 'spark' + (i % 3 === 0 ? ' sq' : '');
    d.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${colors[i % colors.length]}`;
    fxLayer().append(d);
    const a = Math.PI * 2 * i / n + Math.random() * .6, r = (o.r || 34) + Math.random() * 28;
    d.animate([
      {transform: 'translate(-50%,-50%) scale(1)', opacity: 1},
      {transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r + (o.fall || 10)}px)) scale(.15) rotate(${Math.random() * 200}deg)`, opacity: 0},
    ], {duration: 560 + Math.random() * 300, easing: 'cubic-bezier(.12,.75,.3,1)'}).onfinish = () => d.remove();
  }
}
function burstAt(el, o){ if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, o); }
function confetti(o = {}){
  if (reduceMotion()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti';
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; fxLayer().append(cv);
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const colors = o.colors || ['#2ebd6b', '#ffd84d', '#ff9a2e', '#ffffff', '#3987e5', '#d55181', '#9085e9'];
  const ox = o.x ?? W / 2, oy = o.y ?? H * .38, N = o.n || 150, spread = o.spread || 1.15;
  const ps = [...Array(N)].map(() => { const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * spread, v = (o.power || 11) * (.45 + Math.random() * .75); return {x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 5 + Math.random() * 5, h: 8 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - .5) * .35, c: colors[(Math.random() * colors.length) | 0], round: Math.random() < .25}; });
  const t0 = performance.now(), life = o.life || 2600; let last = t0;
  const frame = t => {
    const dt = Math.min(2.5, (t - last) / 16.7); last = t;
    ctx.clearRect(0, 0, W, H);
    const fade = Math.max(0, 1 - Math.max(0, t - t0 - life * .55) / (life * .45));
    let alive = false;
    for (const p of ps){
      p.vy += .32 * dt; p.vx *= Math.pow(.985, dt); p.vy *= Math.pow(.985, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.y > H + 30 || fade <= 0) continue;
      alive = true; ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.round){ ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else { const sy = Math.abs(Math.cos(p.r * 1.7)); ctx.fillRect(-p.w / 2, -p.h * sy / 2, p.w, p.h * sy + .8); }
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame); else cv.remove();
  };
  requestAnimationFrame(frame);
}

/* Animated flame. level: 0 — не горит, 1 — 1–6 дней, 2 — 7–29, 3 — 30+ (синий огонь). */
function flame(level, state = '', size = 26){
  return `<span class="flame lv${level} ${state}" style="width:${size}px;height:${Math.round(size * 1.3)}px" aria-hidden="true"><svg viewBox="0 0 24 32"><path class="fo" d="M12 1.5c1.2 5.2 6.8 8.3 6.8 16.3A6.8 6.8 0 0 1 5.2 17.8c0-3.7 1.8-5.9 3-7.7.8 2.6 1.9 3.8 3.3 4.3-.6-4.4-.4-8.6.5-12.9Z" fill="url(#flg${level})"/><path class="fi" d="M12 15.5c.7 2.6 3.2 3.7 3.2 6.9a3.2 3.2 0 0 1-6.4 0c0-1.8.9-2.9 1.5-3.8.4 1.1.9 1.7 1.5 1.9 0-1.7 0-3.3.2-5Z" fill="${level ? (level === 3 ? '#e6f7ff' : '#fff4c2') : '#55585c'}"/></svg></span>`;
}
const flameLevel = st => st <= 0 ? 0 : st >= 30 ? 3 : st >= 7 ? 2 : 1;
function daySecured(d){ return !!d && (d.status === 'sick' || (dayScore(d) || 0) >= .7); }
function streakChip(){
  const st = streak(), secured = daySecured(S.docs['days/' + todayISO()]);
  const state = st === 0 && !secured ? '' : secured ? 'lit' : 'lit dim';
  const ign = S.fx?.ignite && Date.now() - S.fx.ignite < 1600 ? ' ignite' : ''; if (S.fx) S.fx.ignite = 0;
  return `<button class="streak ${secured ? 'on' : ''} ${ign ? 'pulse' : ''}" data-act="streakInfo" aria-label="${tr("Серия")} ${st} ${plural(st, tr('день'), tr('дня'), tr('дней'))}">${flame(flameLevel(st), state + ign, 22)}<b>${st}</b></button>`;
}
function bestStreak(){
  let best = 0, cur = 0, prev = null;
  dayKeys().forEach(k => {
    const d = S.docs['days/' + k];
    if (prev && dayDiff(prev, k) > 1) cur = 0;
    prev = k;
    if (d.status === 'sick') return;
    if ((dayScore(d) || 0) >= .7){ cur++; best = Math.max(best, cur); } else cur = 0;
  });
  return best;
}
const MILESTONES = [3, 7, 14, 30, 60, 90];
A.streakInfo = () => {
  haptic('selection');
  const st = streak(), best = Math.max(bestStreak(), st), secured = daySecured(S.docs['days/' + todayISO()]);
  const next = MILESTONES.find(m => m > st) || null;
  const d = getDay(todayISO()), need = Math.max(0, Math.ceil(d.tasks.length * .7) - d.tasks.filter(t => t.done).length);
  openSheet(tr('Серия'), `<div style="display:grid;place-items:center;gap:6px;padding:8px 0 4px">${flame(flameLevel(st), st || secured ? 'lit big' : 'big', 72)}<div class="hero-num" style="font-size:48px">${st}</div><div class="muted">${plural(st, tr('день'), tr('дня'), tr('дней'))} ${tr("подряд · рекорд")} ${best}</div></div>
    <div class="note">${secured ? tr('Сегодня уже засчитан. Огонь горит.') : `${tr("Сегодня ещё не засчитан: отметь ещё")} ${need} ${plural(need, tr('задачу'), tr('задачи'), tr('задач'))}${tr(", чтобы огонь не погас.")}`}</div>
    ${next ? `<section class="card" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between"><b>${tr("Следующая награда")}</b><span class="muted">${st} / ${next}</span></div><div class="bar"><i style="width:${st / next * 100}%;background:linear-gradient(90deg,#ff7a1f,#ffd84d)"></i></div></section>` : ''}
    <div class="hint">${tr("День засчитывается, когда выполнено 70% задач. Дни, отмеченные «Болею», серию не сжигают. С 7 дней огонь разгорается сильнее, с 30 — становится синим.")}</div>`);
};

/* Rings animate from their previous value. */
const RING_PREV = {};
function animateUI(root = document){
  $$('.ringarc[data-to]', root).forEach(c => {
    const to = c.dataset.to, C = c.dataset.c; c.removeAttribute('data-to');
    if (reduceMotion()) { c.setAttribute('stroke-dasharray', `${to} ${C}`); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transition = 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)'; c.setAttribute('stroke-dasharray', `${to} ${C}`); }));
  });
  $$('[data-count-to]', root).forEach(el => {
    const from = +el.dataset.countFrom, to = +el.dataset.countTo, suf = el.dataset.suf || ''; el.removeAttribute('data-count-to');
    if (from === to || reduceMotion()) { el.textContent = to + suf; return; }
    const t0 = performance.now(), dur = 700;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* Day-level moments: 70% keeps the streak, 100% is a perfect day. */
function dayMilestone(prev, next){
  if (!next || next.status === 'sick' || next.date !== todayISO()) return;
  const a = dayScore(prev) || 0, b = dayScore(next) || 0, t = targets();
  if (t.ok && eaten(prev).p < t.p && eaten(next).p >= t.p) setTimeout(() => celebrate('goal', {text: tr('Норма белка выполнена: ') + num(eaten(next).p) + tr(' г'), icon: 'food'}), 200);
  if ((+prev.steps || 0) < t.steps && (+next.steps || 0) >= t.steps) setTimeout(() => celebrate('goal', {text: tr('Норма шагов: ') + num(next.steps), icon: 'steps'}), 200);
  if (a < 1 && b >= 1 && next.tasks.length >= 3) setTimeout(() => celebrate('perfect'), 320);
  else if (a < .7 && b >= .7) setTimeout(() => celebrate('secured'), 320);
}
function celebrate(kind, o = {}){
  if (kind === 'secured'){
    S.fx = {...(S.fx || {}), ignite: Date.now()}; scheduleRender();
    haptic('success'); sound('success');
    setTimeout(() => burstAt($('.streak .flame'), {colors: ['#ff9a2e', '#ffd84d', '#ff5a1f', '#fff4c2'], n: 18, r: 30, fall: -6}), 120);
    const st = streak();
    const next = MILESTONES.find(m => m > st);
    toast(st <= 1 ? tr('Огонь зажжён. Завтра — день 2') : `${tr("Серия продлена:")} ${st} ${plural(st, tr('день'), tr('дня'), tr('дней'))}${next && next - st <= 2 ? ` ${tr("· до награды")} ${next - st}` : ''}`, {iconHTML: flame(flameLevel(st), 'lit', 18), tone: 'fire'});
  }
  if (kind === 'perfect'){
    S.fx = {...(S.fx || {}), ignite: Date.now()}; scheduleRender();
    haptic('heavy'); sound('success'); confetti();
    toast(tr('Идеальный день: всё выполнено'), {icon: 'star', tone: 'gold'});
  }
  if (kind === 'pr'){
    haptic('success'); sound('pr');
    if (o.el) burstAt(o.el, {colors: ['#ffd84d', '#ffb020', '#ffffff', '#2ebd6b'], n: 20, r: 40});
    confetti({n: 70, power: 9, y: innerHeight * .5, life: 1800});
    toast(o.text || tr('Новый рекорд'), {icon: 'trophy', tone: 'gold', ms: 3400});
  }
  if (kind === 'workout'){
    haptic('success'); sound('success'); confetti({n: 110});
    toast(o.text || tr('Тренировка засчитана'), {icon: 'gym', tone: 'good', ms: 3400});
  }
  if (kind === 'goal'){
    haptic('medium'); sound('pop');
    if (o.el) burstAt(o.el, {n: 12});
    toast(o.text, {icon: o.icon || 'target', tone: 'good'});
  }
}

/* ============ achievements ============ */
const BADGES = [
  {id:'first', icon:'checkc', c:'#2ebd6b', t:tr('Первый шаг'), d:tr('Отметить первую задачу'), k:'checks', n:1},
  {id:'st3', icon:'flame', c:'#ff8a2e', t:tr('Разогрев'), d:tr('Серия 3 дня'), k:'best', n:3},
  {id:'st7', icon:'flame', c:'#ff6a1f', t:tr('Неделя огня'), d:tr('Серия 7 дней'), k:'best', n:7},
  {id:'st14', icon:'flame', c:'#ff4d1f', t:tr('Две недели'), d:tr('Серия 14 дней'), k:'best', n:14},
  {id:'st30', icon:'flame', c:'#4fa8ff', t:tr('Синий огонь'), d:tr('Серия 30 дней'), k:'best', n:30},
  {id:'st60', icon:'crown', c:'#4fa8ff', t:tr('Железная воля'), d:tr('Серия 60 дней'), k:'best', n:60},
  {id:'st90', icon:'crown', c:'#ffd84d', t:tr('Весь сезон'), d:tr('Серия 90 дней'), k:'best', n:90},
  {id:'perfect1', icon:'star', c:'#ffd84d', t:tr('Идеальный день'), d:tr('Выполнить все задачи за день'), k:'perfect', n:1},
  {id:'perfect7', icon:'star', c:'#ffb020', t:tr('Семь идеальных'), d:tr('7 идеальных дней'), k:'perfect', n:7},
  {id:'gym1', icon:'gym', c:'#3987e5', t:tr('Первая тренировка'), d:tr('Засчитать тренировку'), k:'gym', n:1},
  {id:'gym12', icon:'gym', c:'#3987e5', t:tr('Месяц в зале'), d:tr('12 тренировок'), k:'gym', n:12},
  {id:'gym36', icon:'trophy', c:'#ffd84d', t:tr('Сезон в зале'), d:tr('36 тренировок'), k:'gym', n:36},
  {id:'pr1', icon:'zap', c:'#ffd84d', t:tr('Первый рекорд'), d:tr('Побить свой лучший подход'), k:'prs', n:1},
  {id:'pr10', icon:'zap', c:'#ffb020', t:tr('Рекордсмен'), d:tr('10 личных рекордов'), k:'prs', n:10},
  {id:'protein7', icon:'food', c:'#d95926', t:tr('Белковый режим'), d:tr('Белок в норме 7 дней подряд'), k:'proteinRun', n:7},
  {id:'steps7', icon:'steps', c:'#199e70', t:tr('Ходок'), d:tr('7 дней подряд норма шагов'), k:'stepsRun', n:7},
  {id:'sleep7', icon:'moon', c:'#9085e9', t:tr('Режим сна'), d:tr('7 ночей подряд по 7+ часов'), k:'sleepRun', n:7},
  // the rule stays in kg (1 kg = 2.2 lb, 3 kg = 6.6 lb); only the words follow the pounds setting
  {id:'kg1', icon:'scale', c:'#2ebd6b', get t(){ return isUS() ? tr('Минус два фунта') : tr('Минус килограмм'); }, get d(){ return isUS() ? tr('Средний вес за неделю на 2,2 фунта ниже старта') : tr('Средний вес за неделю на 1 кг ниже старта'); }, k:'lost', n:1},
  {id:'kg3', icon:'scale', c:'#2ebd6b', get t(){ return isUS() ? tr('Минус шесть фунтов') : tr('Минус три'); }, get d(){ return isUS() ? tr('На 6,6 фунта ниже старта') : tr('На 3 кг ниже старта'); }, k:'lost', n:3},
  {id:'post1', icon:'video', c:'#d55181', t:tr('В эфире'), d:tr('Опубликовать первый ролик'), k:'posts', n:1},
  {id:'post12', icon:'video', c:'#d55181', t:tr('Автор'), d:tr('12 опубликованных роликов'), k:'posts', n:12},
  {id:'safe', icon:'shield', c:'#2ebd6b', t:tr('Данные в безопасности'), d:tr('Сделать резервную копию'), k:'backup', n:1},
];
function badgeStats(){
  const ks = dayKeys(), t = targets();
  const st = {checks:0, best: Math.max(bestStreak(), streak()), perfect:0, gym:0, prs:0, proteinRun:0, stepsRun:0, sleepRun:0, lost:0, posts:0, backup: meta().lastBackup ? 1 : 0};
  let run = {p:0, s:0, z:0}, prev = null;
  ks.forEach(k => {
    const d = S.docs['days/' + k];
    if (prev && dayDiff(prev, k) > 1) run = {p:0, s:0, z:0};
    prev = k;
    st.checks += (d.tasks || []).filter(x => x.done).length;
    if (d.status !== 'sick' && (dayScore(d) || 0) >= 1 && (d.tasks || []).length >= 3) st.perfect++;
    if ((d.tasks || []).some(x => x.id === 'gym' && x.done)) st.gym++;
    st.prs += (d.prs || []).length;
    run.p = t.ok && d.meals?.length && eaten(d).p >= t.p * .9 ? run.p + 1 : 0; st.proteinRun = Math.max(st.proteinRun, run.p);
    run.s = d.steps && +d.steps >= t.steps ? run.s + 1 : 0; st.stepsRun = Math.max(st.stepsRun, run.s);
    run.z = d.sleep && +d.sleep >= 7 ? run.z + 1 : 0; st.sleepRun = Math.max(st.sleepRun, run.z);
  });
  const ws = ks.filter(k => k >= season().start).map(k => toNum(S.docs['days/' + k].weight)).filter(Boolean);
  if (ws.length >= 10){ const a = ws.slice(0, 5).reduce((x, y) => x + y, 0) / 5, b = ws.slice(-5).reduce((x, y) => x + y, 0) / 5; st.lost = Math.max(0, Math.floor((a - b) * 10) / 10); }
  st.posts = posts().filter(p => p.status === 'Опубликовано').length;
  return st;
}
let badgeTimer = null;
function queueBadgeCheck(){ clearTimeout(badgeTimer); badgeTimer = setTimeout(checkBadges, 700); }
const earnedBadgeIds = () => { const st = badgeStats(); return BADGES.filter(b => (st[b.k] || 0) >= b.n).map(b => b.id); };
function initBadges(){ setMeta({badges: Object.fromEntries(earnedBadgeIds().map(id => [id, todayISO()]))}); }
function checkBadges(){
  if (!S.ready || !S.live && !DB) return;
  checkLevel();
  const have = meta().badges, earned = earnedBadgeIds();
  if (!have){ initBadges(); return; }
  const fresh = earned.filter(id => !have[id]);
  if (!fresh.length) return;
  setMeta({badges: {...have, ...Object.fromEntries(fresh.map(id => [id, todayISO()]))}});
  const busyNow = SH || (typeof TIMER !== 'undefined' && TIMER.end) || document.activeElement?.matches?.('input,textarea,select');
  if (fresh.length > 2 || busyNow) { haptic('success'); toast(fresh.length > 1 ? `${tr("Новые награды:")} ${fresh.length}` : tr('Новая награда: ') + BADGES.find(b => b.id === fresh[0]).t, {icon: 'trophy', tone: 'gold', ms: 3200}); return; }
  showBadge(fresh[0], true);
}
function badgeIcon(b, on, size = 56){
  return `<span class="badge-ic ${on ? 'on' : ''}" style="--bc:${b.c};width:${size}px;height:${size}px">${b.icon === 'flame' ? flame(on ? (b.n >= 30 ? 3 : 2) : 0, on ? 'lit' : '', size * .42) : ic(b.icon)}</span>`;
}
function showBadge(id, fresh){
  const b = BADGES.find(x => x.id === id); if (!b) return;
  const got = meta().badges?.[id];
  openSheet(fresh ? tr('Новая награда') : tr('Награда'), `<div class="badge-show ${fresh ? 'fresh' : ''}">${badgeIcon(b, !!got, 112)}<div class="hero-num" style="font-size:28px;text-align:center">${b.t}</div><div class="muted" style="text-align:center">${b.d}${got ? tr(' · получена ') + fmtShort(got) : ''}</div></div>
    ${!got ? badgeProgress(b) : ''}<button class="btn block" data-act="closeSheet">${fresh ? tr('Круто') : tr('Закрыть')}</button>`);
  if (fresh){ haptic('success'); sound('badge'); setTimeout(() => confetti({n: 120, y: innerHeight * .45}), 250); }
}
const badgeOf = (b, v) => { const n1 = x => num(x, x % 1 ? 1 : 0); return b.k === 'lost' && isUS() ? `${n1(W(v))} / ${n1(W(b.n))} ${kgU()}` : `${n1(v)} / ${b.n}`; };
function badgeProgress(b){ const v = Math.min(b.n, badgeStats()[b.k] || 0); return `<section class="card" style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between"><span>${tr("Прогресс")}</span><span class="muted">${badgeOf(b, v)}</span></div><div class="bar"><i style="width:${v / b.n * 100}%;background:${b.c}"></i></div></section>`; }
function badgesShelf(){
  const have = meta().badges || {};
  const list = [...BADGES].sort((a, b) => (have[b.id] ? 1 : 0) - (have[a.id] ? 1 : 0));
  const n = BADGES.filter(b => have[b.id]).length;
  return `<div class="sec-h"><h2>${tr("Награды ·")} ${n} ${tr("из")} ${BADGES.length}</h2><button class="link" data-act="badgesAll">${tr("Все")}</button></div>
    <div class="shelf">${list.slice(0, 10).map(b => `<button class="shelf-b" data-act="badge" data-id="${b.id}" aria-label="${esc(b.t)}">${badgeIcon(b, !!have[b.id], 54)}<span>${esc(b.t)}</span></button>`).join('')}</div>`;
}
A.badge = el => { haptic('selection'); showBadge(el.dataset.id, false); };
A.badgesAll = () => { const have = meta().badges || {}, st = badgeStats(); openSheet(tr('Награды'), `<div class="badge-grid">${BADGES.map(b => { const v = Math.min(b.n, st[b.k] || 0); return `<button class="shelf-b" data-act="badge" data-id="${b.id}">${badgeIcon(b, !!have[b.id], 60)}<span>${esc(b.t)}</span><small>${have[b.id] ? fmtShort(have[b.id]) : badgeOf(b, v)}</small></button>`; }).join('')}</div>`); };

/* ============ personal records in the gym ============ */
const e1rm = s => s && +s.w > 0 && +s.r > 0 ? (+s.w) * (1 + (+s.r) / 30) : 0;
function bestBefore(exId, date){ let b = 0; dayKeys().forEach(k => { if (k >= date) return; (S.docs['days/' + k].sets?.[exId] || []).forEach(s => { b = Math.max(b, e1rm(s)); }); }); return b; }
function checkPR(exId, i, inputEl){
  const date = todayISO(), d = S.docs['days/' + date]; const s = d?.sets?.[exId]?.[i]; const v = e1rm(s); if (!v) return;
  const prev = bestBefore(exId, date); if (!prev || v <= prev) return;
  const key = exId + ':' + i; if ((d.prSets || []).includes(key)) return;
  const others = (d.sets[exId] || []).some((x, j) => j !== i && e1rm(x) >= v);
  mutDay(date, dd => { dd.prSets = [...(dd.prSets || []), key]; if (!others) dd.prs = [...new Set([...(dd.prs || []), exId])]; });
  if (others) return;
  const e = Object.values(plan().workouts).flatMap(w => w.ex).find(x => x.id === exId);
  celebrate('pr', {el: inputEl?.closest('.set'), text: `${tr("Рекорд:")} ${e ? e.name : exId} ${W(s.w)}×${s.r} (≈${num(W(v), 1)} ${kgU()} ${tr("на 1 повтор)")}`});
}

/* ============ render loop ============ */
let rq = false, deferred = false;
function scheduleRender(){
  if (rq) return; rq = true;
  requestAnimationFrame(() => {
    rq = false;
    const a = document.activeElement;
    if (a && $('#view').contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { deferred = true; return; }
    render();
  });
}
document.addEventListener('focusout', () => { if (!deferred) return; setTimeout(() => { const a = document.activeElement; if (a && $('#view').contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return; deferred = false; render(); }, 60); });

function render(){
  ensureMigrated();
  if ((S.tab === 'content' || S.tab === 'money') && !modOn(S.tab)) S.tab = 'day';
  renderTop(); renderNav();
  const v = $('#view');
  const y = window.scrollY;
  v.innerHTML = ({day:viewDay, health:viewHealth, content:viewContent, money:viewMoney, more:viewMore}[S.tab] || viewDay)();
  if (S.animIn && !reduceMotion()){ v.classList.remove('tab-in'); void v.offsetWidth; v.classList.add('tab-in'); clearTimeout(S.animT); S.animT = setTimeout(()=>v.classList.remove('tab-in'), 600); }
  S.animIn = false;
  window.scrollTo(0, y);
  animateUI(v);
  queueBadgeCheck();
}
const emptyState = (icon, text) => `<div class="empty"><span class="e-ic">${ic(icon)}</span><span>${text}</span></div>`;
const greeting = () => { const h = new Date().getHours(); return h < 5 ? tr('Доброй ночи') : h < 12 ? tr('Доброе утро') : h < 18 ? tr('Добрый день') : tr('Добрый вечер'); };
function renderTop(){
  const titles = {health:tr('Здоровье'), content:tr('Контент'), money:tr('Деньги'), more:tr('Ещё')};
  $('#top').className = 'top' + (S.tab==='day' ? '' : ' plain');
  $('#top').innerHTML = `<div class="hdr">
    <button class="ava" data-act="profile" aria-label="${tr("Профиль")}">${esc((profile().name||'K')[0])}</button>
    <button class="hname" data-act="profile" aria-label="${tr("Профиль")}">${esc(profile().name||tr('Профиль'))} ${ic('chevR')}</button>
    <span class="hsp"></span>
    <button class="iconbtn aibtn" data-act="aiSheet" aria-label="${tr("ИИ: ответы и очередь")}">${ic('spark')}<span class="badge" id="aiBadge" hidden></span></button>
  </div>${S.tab==='content'?`<button class="backlink" data-act="tab" data-v="more">${tr("‹ Ещё")}</button>`:''}${titles[S.tab]?`<h1 class="ptitle">${titles[S.tab]}</h1>`:`<h1 class="vh">${tr('День')}</h1>`}
  ${S.online && syncBehind() ? `<div class="note" style="margin-top:12px">${trf('Облачная копия отстаёт: изменений ждут отправки {n}. Всё сохранено на телефоне, отправлю, когда сервер ответит.', {n: syncBehind()})}</div>` : ''}
  ${!S.online ? `<div class="note" style="margin-top:12px">${tr("Нет интернета. Всё работает и сохраняется в телефоне; запросы к Claude подождут в очереди.")}</div>`:''}
  ${!S.live && S.ready ? `<div class="note" style="margin-top:12px">${tr("Хранилище телефона недоступно: данные не сохранятся после закрытия. Проверь, что это не приватная вкладка Safari.")}</div>`:''}`;
  setTimeout(renderBadge);
}
function renderNav(){
  $('.nav')?.setAttribute('aria-label', tr('Разделы'));
  const tabs = [['day',tr('День'),'day'],['health',tr('Здоровье'),'heart'],['tell','KAI','mic'],['money',tr('Деньги'),'wallet'],['more',tr('Ещё'),'more']].filter(([id]) => modOn(id));
  const cur = S.tab === 'content' ? 'more' : S.tab;
  $('#nav').innerHTML = tabs.map(([id,l,i]) => id==='tell'
    ? `<button class="mic" data-act="tell" aria-label="${tr("Рассказать о дне")}"><span class="b">${ic('mic')}</span><span>${l}</span></button>`
    : `<button class="${cur===id?'on':''}" data-act="tab" data-v="${id}" ${cur===id?'aria-current="page"':''}><span class="nb">${ic(i)}</span><span>${l}</span></button>`).join('');
}

/* ============ DAY ============ */
function viewDay(){
  const date = todayISO(), d = getDay(date), pl = plan();
  const done = d.tasks.filter(t=>t.done).length, total = d.tasks.length, sc = total ? done/total : 0;
  const st = streak();
  const need = Math.max(0, Math.ceil(total*.7) - done);
  const status = d.status==='sick' ? `<span class="tag sick">${tr("Болею · серия на паузе")}</span>`
    : sc>=1 ? `<span class="tag gold">${tr("Идеальный день")}</span>`
    : sc>=.7 ? `${tr("Засчитан · до 100% ещё")} ${total-done}`
    : LANG === 'ru' ? `Ещё ${need} ${plural(need,'задача','задачи','задач')} — и день засчитан` : `${need} more ${plural(need,'task','tasks','tasks')} and the day counts`;
  let h = `<section class="card hero dayhero ${sc>=1&&d.status!=='sick'?'perfect':''}">
    <div class="hero-top"><span class="greet">${greeting()}${profile().name?', '+esc(profile().name):''}</span>${streakChip()}</div>
    <div class="hero-row"><div class="grow">
      <div class="hero-num">${done}<span class="of"> ${tr("из")} ${total}</span></div>
      <div class="hero-sub">${status}</div>
    </div>${ring(sc, 88, 10, '', tr('Выполнено за день'), 'day')}</div>
    <div class="actions">
      <button data-act="tell">${ic('mic')}${tr("Сказать KAI")}</button>
      <button data-act="rate">${ic('star')}${d.rating?'<span class="stars">'+'★'.repeat(d.rating)+'<i>'+'★'.repeat(5-d.rating)+'</i></span>':tr('Оценить день')}</button>
      <button data-act="sick">${ic('sick')}${d.status==='sick'?tr('Я здоров'):tr('Болею')}</button>
    </div></section>`;
  h += firstTellCard();
  h += suppsGoneNote();
  h += yesterdayBanner();
  h += recapBanner();
  h += warnCard();
  h += examCard();
  h += checkinCard();
  h += nowCard();
  h += taskCard();
  h += timelineCard();
  h += screenCard();
  h += onboardCard();
  h += backupBanner();
  h += `<div class="sec-h"><h2>${modOn('tasks') ? tr('Ежедневное') : tr('Сегодня, ') + fmtShort(date)}</h2>${modOn('tasks') ? `<span class="hint">${fmtShort(date)}</span>` : `<button class="link" data-act="addTask">${tr("+ Задача")}</button>`}</div>
  <section class="card" style="padding:4px 18px"><div class="list">${d.tasks.map(t=>taskRow(t, d)).join('') || emptyState('day',tr('На сегодня задач нет'))}</div></section>`;
  // week: kept with the other numbers in the folded stats, so the Day screen stays about today
  const beforeWeek = h; h = '';
  const mon = addDays(date, 1-dow(date));
  h += `<div class="sec-h"><h2>${tr("Неделя")}</h2></div><section class="card"><div class="week">${[0,1,2,3,4,5,6].map(i=>{
    const ds = addDays(mon,i), dd = S.docs['days/'+ds], s = dd ? dayScore(dd) : null, past = ds < date;
    let bg = 'var(--track)', txt = '';
    if (dd?.status==='sick') { bg='var(--sick)'; txt=tr('Б'); }
    else if (s!=null && (past || ds===date)) { bg = s>=.7?'var(--good)':s>0?'var(--warn)':'var(--bad)'; txt = s>=.7 ? ic('check') : Math.round(s*100); }
    else if (past && ds >= trackedFrom()) { bg='var(--bad-bg)'; txt='–'; } // days before KAI was installed aren't missed
    const w = workoutFor(ds);
    return `<div class="wd ${ds===date?'today':''}"><span>${DOW[i+1]}</span><span class="dot" style="background:${bg}">${txt}</span><span>${w?tr(w):'·'}</span></div>`;
  }).join('')}</div><div class="legend" style="margin-top:12px"><span><i style="background:var(--good)"></i>70%+</span><span><i style="background:var(--warn)"></i>${tr("частично")}</span><span><i style="background:var(--bad)"></i>${tr("пропуск")}</span><span><i style="background:var(--sick)"></i>${tr("болел")}</span><span>${tr("буква — тренировка")}</span></div></section>`;
  const weekHTML = h; h = beforeWeek;
  // stats
  const hKeep = h; h = weekHTML;
  const last7 = [...Array(7)].map((_,i)=>addDays(date,-i)).map(k=>S.docs['days/'+k]).filter(x=>x && x.status!=='sick');
  const avg7 = last7.length ? last7.reduce((a,x)=>a+(dayScore(x)||0),0)/last7.length : 0;
  const s = season(), di = Math.max(1, dayDiff(s.start, date)+1);
  if (!accOpen('stats')){ h = hKeep; return h + acc('stats', 'activity', tr('Прогресс и награды'), statsSummary(st, avg7), '', true); } // folded: the summary is enough
  const gymDone = dayKeys().filter(k=>k>=s.start && S.docs['days/'+k].tasks?.some(t=>t.id==='gym'&&t.done)).length;
  h += `<div class="sec-h"><h2>${tr("Статистика")}</h2><button class="link" data-act="season">${tr("Сезон")}</button></div>
  <section class="card" style="display:flex;flex-direction:column;gap:14px">
    <div class="stat3"><div><span class="st-ic">${flame(flameLevel(st), st?'lit':'', 16)}</span><b>${st}</b><span>${tr("серия · рекорд")} ${Math.max(st, bestStreak())}</span></div><div><span class="st-ic" style="color:var(--good)">${ic('checkc')}</span><b>${Math.round(avg7*100)}%</b><span>${tr("выполнено за 7 дн")}</span></div><div><span class="st-ic" style="color:var(--c1)">${ic('gym')}</span><b>${gymDone}</b><span>${tr("тренировок в сезоне")}</span></div></div>
    <div><div class="hint" style="margin-bottom:8px">${tr("Последние 30 дней")}</div><div class="heat">${[...Array(30)].map((_,i)=>{ const k = addDays(date, i-29), dd = S.docs['days/'+k], sc2 = dd?dayScore(dd):null; let c = 'var(--track-2)'; if (dd?.status==='sick') c='var(--sick)'; else if (sc2!=null) c = sc2>=.7?'var(--good)':k===date?'var(--edge)':sc2>=.4?'var(--warn)':'var(--bad)'; else if (k<date && k>=s.start && k>=trackedFrom()) c='var(--bad-bg)'; return `<i style="background:${c}" title="${fmtShort(k)}${sc2!=null?': '+Math.round(sc2*100)+'%':''}"></i>`; }).join('')}</div></div>
    <div><div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px"><span>${esc(s.title)}</span><span class="muted">${tr("день")} ${di} ${tr("из")} ${s.length||90}</span></div><div class="bar"><i style="width:${Math.min(100,di/(s.length||90)*100)}%;background:var(--accent)"></i></div></div>
  </section>`;
  h += weekCard();
  h += badgesShelf();
  const statsHTML = progressCard() + h; h = hKeep;
  h += acc('stats', 'activity', tr('Прогресс и награды'), statsSummary(st, avg7), statsHTML, true);
  return h;
}
const statsSummary = (st, avg7) => `${tr('Уровень')} ${levelOf(totalXP()).level} · ${tr("серия")} ${st} ${tr("· выполнено")} ${Math.round(avg7*100)}${tr("% за 7 дней")}`;
function taskSub(t, d){
  const pl = plan(), tg = targets();
  if (t.cat==='gym'){ const w = pl.workouts[workoutFor(d.date)]; return w ? w.ex.length+tr(' упражнений · ')+w.ex.slice(0,2).map(e=>e.name.split(' ')[0]).join(', ')+'…' : ''; }
  if (t.cat==='food'){ const e = eaten(d); return tg.ok ? `${num(e.kcal)} / ${tg.kcal} ${tr("ккал · белок")} ${num(e.p)} / ${tg.p} ${tr("г")}` : tr('заполни профиль для нормы'); }
  if (t.cat==='study'){ const c = (pl.classes||[]).filter(c=>Number(c.day)===dow(d.date)).sort((a,b)=>a.time.localeCompare(b.time)); return c.map(x=>x.time).join(', '); }
  if (t.cat==='content'){ const ps = posts().filter(p=>p.date===d.date); return ps.map(p=>p.title).join(' · '); }
  if (t.cat==='supps'){ const n = (pl.supps||[]).length, k = Object.values(d.supps||{}).filter(Boolean).length; return `${k} ${tr("из")} ${n}`; }
  if (t.cat==='steps') return d.steps ? num(d.steps)+tr(' шагов') : '';
  if (t.cat==='sleep') return d.sleep ? d.sleep+tr(' ч сна') : '';
  if (t.moved) return tr('перенесено со вчера');
  return t.note || '';
}
function taskRow(t, d){
  const open = S.open['t_'+t.id];
  const just = S.fx?.task === t.id && Date.now() - (S.fx.t||0) < 1500; if (just) S.fx.task = null;
  const sub = taskSub(t,d);
  return `<div class="row task ${t.done?'done':''} ${just?'just':''}">
    <span class="tic" style="--tc:var(--${TASK_COLOR[t.cat]||'c0'})">${ic(TASK_ICON[t.cat]||'list')}</span>
    <button class="mid" data-act="openTask" data-id="${esc(t.id)}" aria-expanded="${!!open}" style="text-align:left"><div class="t">${esc(t.title)}</div>${sub?`<div class="s">${esc(sub)}</div>`:''}</button>
    <button class="chk ${t.done?'on':''} ${just?'just-on':''}" data-act="toggleTask" data-id="${esc(t.id)}" aria-pressed="${t.done}" aria-label="${tr("Отметить:")} ${esc(t.title)}">${ic('check')}</button>
  </div>${open?`<div class="detail">${taskDetail(t,d)}</div>`:''}`;
}
function taskDetail(t, d){
  const pl = plan(), tg = targets();
  if (t.cat==='gym'){
    const k = workoutFor(d.date), w = pl.workouts[k]; if (!w) return tr('Тренировка не выбрана');
    return `<b>${esc(w.name)}</b>${w.ex.map(e=>{ const l = lastSets(e.id, d.date); return `<div>${setsFor(e, d.date)}×${e.lo}–${e.hi}${e.unit?' '+e.unit:''} · ${esc(e.name)}${l?` <span class="muted">${tr("(прошлый раз")} ${l.sets.map(s=>s.w?s.w+'×'+s.r:s.r).join(', ')})</span>`:''}</div>`; }).join('')}
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-act="goTrain">${tr("Записать подходы")}</button></div>`;
  }
  if (t.cat==='food'){
    const e = eaten(d);
    if (!tg.ok) return `${tr("Чтобы рассчитать КБЖУ, заполни рост, вес и возраст.")}<div class="btnrow"><button class="btn" data-act="profile">${tr("Заполнить профиль")}</button></div>`;
    return `<div><b>${tg.kcal} ${tr("ккал")}</b> ${tr("· Б")} ${tg.p} ${tr("г · Ж")} ${tg.f} ${tr("г · У")} ${tg.c} ${tr("г")}</div><div class="muted">${tr("Съедено:")} ${num(e.kcal)} ${tr("ккал · Б")} ${num(e.p)} ${tr("· Ж")} ${num(e.f)} ${tr("· У")} ${num(e.c)}${tr(". Осталось")} ${num(Math.max(0,tg.kcal-e.kcal))} ${tr("ккал и")} ${num(Math.max(0,tg.p-e.p))} ${tr("г белка.")}</div>
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-act="foodPhoto">${ic('camera')}${tr("Сфоткать еду")}</button><button class="btn ghost" data-act="goFood">${tr("Дневник")}</button></div>`;
  }
  if (t.cat==='supps'){ const s = pl.supps||[]; return s.length ? s.map(x=>`<div><b>${esc(x.name)}</b> · ${esc(x.dose||'')} · <span class="muted">${esc(x.timing||'')}</span></div>`).join('') + `<div class="btnrow"><button class="btn ghost" data-act="goSupps">${tr("Отметить по отдельности")}</button></div>` : tr('Список БАДов пуст. Добавь их во вкладке Здоровье → БАДы.'); }
  if (t.cat==='study'){ const c = (pl.classes||[]).filter(c=>Number(c.day)===dow(d.date)).sort((a,b)=>a.time.localeCompare(b.time)); return c.map(x=>`<div><b>${esc(x.time)}</b> · ${esc(x.title)}${x.room?' · <span class="muted">'+esc(x.room)+'</span>':''}</div>`).join(''); }
  if (t.cat==='content'){ return posts().filter(p=>p.date===d.date).map(p=>`<div><b>${esc(p.title)}</b> · ${(p.platforms||[]).map(x=>PL[x]?.name).join(', ')} · <span class="muted">${esc(tr(p.status||''))}${p.location?tr(' · где: ')+esc(p.location):''}</span></div>${p.hook?`<div class="muted">${tr("Хук:")} ${esc(p.hook)}</div>`:''}<div class="btnrow"><button class="btn ghost" data-act="openPost" data-id="${esc(p.id)}">${tr("Открыть сценарий")}</button></div>`).join(''); }
  if (t.cat==='posture'){ return (pl.posture||[]).map(x=>`<div>${esc(x.name)} · <span class="muted">${esc(x.dose)}</span></div>`).join('') + `<div class="muted">${tr("Укрепление средней и нижней трапеции плюс растяжка грудных улучшают сутулость и выдвинутую вперёд голову.")}</div>`; }
  if (t.cat==='steps'){ return `<div class="field"><label for="stepsIn">${tr("Шаги сегодня")}</label><input class="in" id="stepsIn" inputmode="numeric" data-ch="steps" value="${d.steps??''}" placeholder="${tr("например, 9500")}"></div><div class="muted">${tr("Цель")} ${num(tg.steps)}${tr(". Шаги — самый простой способ увеличить расход без удара по восстановлению.")}</div>`; }
  if (t.cat==='sleep'){ return `<div class="field"><label for="sleepIn">${tr("Сколько спал прошлой ночью, часов")}</label><input class="in" id="sleepIn" inputmode="decimal" data-ch="sleep" value="${d.sleep??''}" placeholder="7.5"></div>`; }
  if (t.cat==='prep'){ const m = pl.menu; return m ? `<div><b>${tr("Меню на завтра")}</b></div>${(m.meals||[]).map(x=>`<div>${esc(x.name)} · <span class="muted">${num(x.kcal)} ${tr("ккал, Б")} ${num(x.p)}</span></div>`).join('')}<div class="btnrow"><button class="btn ghost" data-act="goFood">${tr("Всё меню и заготовки")}</button></div>` : `${tr("Меню ещё нет.")}<div class="btnrow"><button class="btn" data-act="menu">${ic('spark')}${tr("Составить меню")}</button></div>`; }
  return `${t.qty?`<div>${tr("Сколько:")} <b>${esc(t.qty)}</b></div>`:''}${t.note?`<div>${esc(t.note)}</div>`:''}<div class="btnrow"><button class="btn danger" data-act="delTask" data-id="${esc(t.id)}">${ic('trash')}${tr("Удалить задачу")}</button></div>`;
}
function yesterdayBanner(){
  const y = addDays(todayISO(), -1), s = season();
  if (y < s.start) return '';
  const yd = getDay(y); if (yd.carried || yd.status==='sick') return '';
  const today = getDay(todayISO());
  const gymMiss = yd.tasks.find(t=>t.id==='gym' && !t.done);
  const custom = yd.tasks.filter(t=>!t.done && (t.cat==='custom' || t.moved) && t.id!=='gym');
  if (!gymMiss && !custom.length) return '';
  const w = workoutFor(y), todayGym = today.tasks.some(t=>t.id==='gym');
  let msg = '', btn = '';
  if (gymMiss && !todayGym) { msg = `${tr("Вчера пропущена тренировка")} ${tr(w)}${tr(". Сегодня по плану отдых, можно сделать её сегодня.")}`; btn = `<button class="btn" data-act="carry" data-w="${w}">${tr("Перенести на сегодня")}</button>`; }
  else if (gymMiss) { msg = `${tr("Вчера пропущена тренировка")} ${tr(w)}${tr(". Не делай две за день, просто продолжай по плану.")}`; }
  if (custom.length) { msg += (msg?' ':'') + `${tr("Не сделано вчера:")} ${custom.map(t=>t.title).join(', ')}.`; btn += `<button class="btn" data-act="carryTasks">${tr("Перенести задачи")}</button>`; }
  return `<div class="banner" role="status">${ic('alert')}<div><div>${esc(msg)}</div><div class="btnrow">${btn}<button class="btn ghost" data-act="dismissY">${tr("Понятно")}</button></div></div></div>`;
}
function lastSets(exId, before){
  const ks = dayKeys().filter(k=>k<before).reverse();
  for (const k of ks){ const s = S.docs['days/'+k]?.sets?.[exId]; if (s && s.some(x=>x && (x.r||x.w))) return {date:k, sets:s.filter(x=>x && (x.r||x.w))}; }
  return null;
}

/* ============ HEALTH ============ */
function viewHealth(){
  const tabs = [['food',tr('Питание'),'food'],['train',tr('Тренировки'),'gym'],['body',tr('Тело'),'scale'],['supps',tr('БАДы'),'pill']].filter(([id]) => id !== 'supps' || SUPPS_ON);
  if (S.sub.health === 'sleep') S.sub.health = 'body'; // sleep is a section of Body now, so three tabs fit on a phone
  if (!tabs.some(([id]) => id === S.sub.health)) S.sub.health = 'food';
  const cur = S.sub.health;
  return `<div class="pills" role="tablist">${tabs.map(([id,l,i])=>`<button class="pill ${cur===id?'on':''}" role="tab" aria-selected="${cur===id}" data-act="sub" data-k="health" data-v="${id}">${ic(i)}${l}</button>`).join('')}</div>` +
    ({food:hFood, train:hTrain, body:hBody, sleep:hSleep, supps:hSupps}[cur])();
}
function hFood(){
  const d = getDay(todayISO()), e = eaten(d), t = targets(), pl = plan();
  let h = '';
  if (!t.ok) h += `<div class="banner">${ic('alert')}<div>${t.implausible ? tr("Рост, вес или возраст в профиле выглядят как опечатка (рост нужен в сантиметрах). Пока они не исправлены, норму не считаю.") : tr("Норма КБЖУ считается из роста, веса и возраста. Заполни профиль, и я рассчитаю её под твою цель.")}<div class="btnrow"><button class="btn" data-act="profile">${t.implausible ? tr("Проверить профиль") : tr("Заполнить профиль")}</button></div></div></div>`;
  const target = t.kcal || 2200;
  const segs = [{v:e.p*4, c:'c1', label:tr('Белки')},{v:e.f*9, c:'c4', label:tr('Жиры')},{v:e.c*4, c:'c3', label:tr('Углеводы')},{v:Math.max(0,target-e.kcal), c:'track', label:tr('Осталось')}];
  h += `<section class="card"><div class="hero-row"><div class="grow"><div class="hero-num">${num(e.kcal)}</div><div class="hero-sub">${tr("из")} ${t.ok?num(t.kcal):'—'} ${tr("ккал сегодня")}</div></div>
    ${donut(segs, 104, 13)}</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
      ${[[tr('Белки'),'p','c1'],[tr('Жиры'),'f','c4'],[tr('Углеводы'),'c','c3']].map(([l,k,c])=>`<div class="macro"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--${c});margin-right:6px"></i>${l}</span><div class="bar"><i style="width:${t.ok?Math.min(100,e[k]/t[k]*100):0}%;background:var(--${c})"></i></div><span class="n"><b>${num(e[k])}</b> / ${t.ok?t[k]:'—'} ${tr("г")}</span></div>`).join('')}
    </div>
    <div class="actions"><button data-act="foodPhoto">${ic('camera')}${tr("Фото еды")}</button><button data-act="foodText">${ic('spark')}${tr("Описать")}</button><button data-act="foodManual">${ic('list')}${tr("Продукты")}</button></div></section>`;
  h += lowEatNote() + careNote(t) + quickMealsHTML();
  h += `<div class="sec-h"><h2>${tr("Съедено сегодня")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${(d.meals||[]).map((m,i)=>`<div class="row"><span class="ic">${ic('food')}</span><div class="mid"><div class="t">${esc(m.name)}</div><div class="s">${esc(m.time||'')} ${tr("· Б")} ${num(m.p)} ${tr("· Ж")} ${num(m.f)} ${tr("· У")} ${num(m.c)}${m.verdict?' · '+esc(m.verdict):''}</div></div><div class="r">${num(m.kcal)}<small>${tr("ккал")}</small></div><button class="iconbtn" data-act="delMeal" data-i="${i}" aria-label="${tr("Удалить")}" style="color:var(--text-3)">${ic('x')}</button></div>`).join('') || emptyState('food',tr('Пока ничего. Сфоткай первый приём пищи или выбери продукты.'))}</div></section>`;
  // 7 days
  const pts = [...Array(7)].map((_,i)=>addDays(todayISO(), i-6)).map(k=>({x:DOW[dow(k)], y: eaten(S.docs['days/'+k]||{meals:[]}).kcal, p: eaten(S.docs['days/'+k]||{meals:[]}).p}));
  if (!pts.some(p => p.y)) h += `<div class="sec-h"><h2>${tr("Неделя")}</h2></div><section class="card">${emptyState('activity', tr('Графики калорий и белка появятся, когда запишешь первую еду.'))}</section>`;
  else { const pro = S.sub.fw === 'p'; // one chart with a switch, instead of two stacked
    h += `<div class="sec-h"><h2>${tr("Неделя")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:10px"><div class="seg" role="tablist">${[['kcal', tr('Калории')], ['p', tr('Белок')]].map(([v, l]) => `<button class="${(pro ? 'p' : 'kcal') === v ? 'on' : ''}" role="tab" aria-selected="${(pro ? 'p' : 'kcal') === v}" data-act="sub" data-k="fw" data-v="${v}">${l}</button>`).join('')}</div>
    ${pro ? barChart(pts.map(p=>({x:p.x,y:p.p})), {target:t.ok?t.p:null, unit:tr('г'), c:'c1', label:tr('Белок за 7 дней')}) : barChart(pts, {target:t.ok?t.kcal:null, unit:tr('ккал'), c:'c1', label:tr('Калории за 7 дней')})}</section>`; }
  h += adaptiveCard();
  // menu
  const m = pl.menu;
  if (!m) h += `<button class="card navrow" data-act="menu"><span class="ic">${ic('spark')}</span><div class="mid"><div class="t">${tr("Меню и заготовки")}</div><div class="s">${tr("Меню на завтра из простых продуктов под твою норму")}</div></div>${ic('chevR')}</button>`;
  else h += `<div class="sec-h"><h2>${tr("Меню и заготовки")}</h2><button class="link" data-act="menu">${tr("Обновить")}</button></div><section class="card" style="display:flex;flex-direction:column;gap:12px">`;
  if (m) {
    h += (m.meals||[]).map(x=>`<div><div style="display:flex;justify-content:space-between;gap:10px"><b>${esc(x.name)}</b><span class="muted">${num(x.kcal)} ${tr("ккал · Б")} ${num(x.p)}</span></div><div class="hint">${esc((x.items||[]).join(', '))}</div></div>`).join('');
    if (m.prep?.length) h += `<div><b>${tr("Вечером приготовить")}</b><ol class="ai-list">${m.prep.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`;
    if (m.shop?.length) h += `<div><b>${tr("Список покупок на неделю")}</b><div class="hint">${esc(m.shop.join(', '))}</div></div>`;
    if (m.note) h += `<div class="note">${esc(m.note)}</div>`;
    h += `</section>`;
  }
  h += whyCard('food');
  h += `<div class="hint" style="padding:0 4px">${NOT_MED()}</div>`;
  return h;
}
function hTrain(){
  const pl = plan(), date = todayISO();
  const todayW = workoutFor(date);
  let sel = S.sub.w || todayW || nextWorkout(date).w || programKeys()[0];
  if (!pl.workouts[sel]) sel = programKeys()[0];
  const w = pl.workouts[sel];
  const nx = nextWorkout(addDays(date,1));
  let h = `<section class="card hero"><div class="hero-num" style="font-size:28px">${todayW?tr('Сегодня: тренировка ')+tr(todayW):tr('Сегодня отдых')}</div>
    <div class="hero-sub">${todayW?esc(pl.workouts[todayW].name):tr('Отдых и прогулка')} ${tr("· дальше")} ${nx.w?DOW[dow(nx.date)]+' — '+tr(nx.w):'—'}</div>
    <div class="seg" style="margin-top:14px" role="tablist">${programKeys().map(k=>`<button class="${sel===k?'on':''}" role="tab" aria-selected="${sel===k}" data-act="pickW" data-v="${k}">${tr(k)}${k===todayW?tr(' · сегодня'):''}</button>`).join('')}</div>${pl.programs?`<div class="progrow"><span class="hint">${esc(activeProgram()?.name||tr('Своя программа'))}</span><button class="link" data-act="programSheet">${tr("Сменить")}</button></div>`:''}</section>`;
  h += deloadNote();
  h += readyCard(todayW ? date : null);
  const logDate = sel===todayW ? date : date;
  const d = getDay(logDate);
  h += `<div class="sec-h"><h2>${esc(w.name)}</h2></div>`;
  h += w.ex.map(e => {
    const last = lastSets(e.id, logDate), cur = d.sets?.[e.id] || [], pb = bestBefore(e.id, logDate);
    let hint = '';
    if (last){ const top = last.sets.length>=setsFor(e, logDate) && last.sets.every(s=>(+s.r||0)>=e.hi); hint = top ? `<span class="hint good">${tr("Прошлый раз все подходы на")} ${e.hi}${isUS() ? tr(': добавь 5 фнт') : tr(": добавь 2.5 кг")}</span>` : `<span class="hint">${tr("Прошлый раз")} ${last.sets.map(s=>s.w?W(s.w)+'×'+s.r:s.r).join(', ')} ${tr("· добавь по повтору")}</span>`; }
    const open = S.open['ex_'+e.id];
    return `<section class="card" style="padding:14px 16px">
      <div style="display:flex;gap:10px;align-items:flex-start"><div style="flex:1;min-width:0"><div class="t" style="font-weight:700">${esc(e.name)}</div><div class="hint">${setsFor(e, logDate)} × ${e.lo}–${e.hi}${e.unit?' '+e.unit:tr(' повт.')} ${tr("· отдых")} ${esc(e.rest)}</div>${hint}</div>
      <div style="display:flex;gap:14px;align-items:center;flex:none"><button class="link" data-act="toggleOpen" data-k="ex_${e.id}">${open?tr('Скрыть'):tr('Как делать')}</button><button class="link" data-act="restStart" data-r="${esc(e.rest)}" data-n="${esc(e.name)}">${tr("Отдых")}</button></div></div>
      ${open?`<div class="note" style="margin-top:8px">${esc(e.how)}</div>`:''}
      <div class="srows"><div class="sr-h"><span>${tr("Подход")}</span><span>${tr("Прошлый раз")}</span><span>${e.unit||e.bw?'':isUS()?tr('Фнт'):tr('Кг')}</span><span>${e.unit?tr('Сек'):tr('Повт')}</span></div>${[...Array(setsFor(e, logDate))].map((_,i)=>{ const s = cur[i]||{}; const pl2 = last?.sets[i]||{}; const hasPrev = !!last?.sets[i]; const prev = hasPrev ? (pl2.w ? W(pl2.w)+' × '+pl2.r : String(pl2.r??'–')) : '–'; const isPR = pb > 0 && e1rm(s) > pb; return `<div class="sr ${isPR?'pr':''}"><span class="sn">${isPR?ic('trophy'):i+1}</span>${hasPrev?`<button class="sp" data-act="setPrev" data-ex="${e.id}" data-i="${i}" data-w="${pl2.w??''}" data-r="${pl2.r??''}" aria-label="${tr("Подставить прошлый раз:")} ${esc(prev)}">${esc(prev)}</button>`:'<span class="sp none">–</span>'}${e.unit||e.bw?'<span></span>':`<input aria-label="${tr("Вес, подход")} ${i+1}" inputmode="decimal" data-ch="set" data-ex="${e.id}" data-i="${i}" data-f="w" value="${W(s.w)??''}" placeholder="${W(pl2.w)??kgU()}">`}<input aria-label="${e.unit?tr('Секунды'):tr('Повторы')}${tr(", подход")} ${i+1}" inputmode="numeric" data-ch="set" data-ex="${e.id}" data-i="${i}" data-f="r" value="${s.r??''}" placeholder="${pl2.r??(e.unit?tr('сек'):tr('повт'))}"></div>`; }).join('')}</div>
    </section>`;
  }).join('');
  if (sel===todayW || !todayW) h += `<button class="btn block" data-act="finishW" data-v="${sel}">${ic('check')}${trf('Тренировка {w} выполнена', {w: tr(sel)})}</button>`;
  h += `<div class="hint" style="margin-top:-8px">${tr("Таймер отдыха запускается сам, когда вписываешь повторы подхода.")}</div>`;
  const main = h; h = '';
  const moreHead = [tr('Прогресс и подробности'), tr('Подходы по мышцам, рост силы, осанка, шаги')];
  if (!accOpen('trainMore')) return main + acc('trainMore', 'activity', ...moreHead, '', true); // folded: nothing to work out
  h += muscleCard();
  h += `<div class="sec-h"><h2>${tr("Осанка, 5 минут каждый день")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${(pl.posture||[]).map(x=>`<div class="row"><span class="ic">${ic('posture')}</span><div class="mid"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.dose)}</div></div></div>`).join('')}</div></section>`;
  // steps
  const tg = targets();
  const sp = [...Array(14)].map((_,i)=>addDays(date,i-13)).map(k=>({x:fmtShort(k).split(' ')[0], y:+(S.docs['days/'+k]?.steps||0)}));
  h += `<div class="sec-h"><h2>${tr("Шаги")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:12px"><div class="field"><label for="stepsIn2">${tr("Шаги сегодня")}</label><input class="in" id="stepsIn2" inputmode="numeric" data-ch="steps" value="${d.steps??''}" placeholder="${tr("из приложения Здоровье на iPhone")}"></div>${barChart(sp,{target:tg.steps, unit:tr('шагов'), c:'c3', label:tr('Шаги за 14 дней'), colorFn:p=>p.y>=tg.steps?'var(--c3)':'var(--good-bg)'})}</section>`;
  // progress
  const allEx = Object.values(pl.workouts).flatMap(w=>w.ex).filter(e=>!e.unit && !e.bw).filter((e, i, a) => a.findIndex(x => x.id === e.id) === i);
  const pe = S.sub.pe || allEx[0]?.id;
  const ex = allEx.find(e=>e.id===pe) || allEx[0];
  const pts = dayKeys().filter(k=>S.docs['days/'+k].sets?.[ex.id]?.some(s=>s&&s.w&&s.r)).map(k=>{ const best = Math.max(...S.docs['days/'+k].sets[ex.id].filter(s=>s&&s.w&&s.r).map(s=>(+s.w)*(1+(+s.r)/30))); return {x:fmtShort(k), y:Math.round(W(best)*10)/10}; });
  h += `<div class="sec-h"><h2>${tr("Прогресс в силе")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:10px">
    <div class="field"><label for="peSel">${tr("Упражнение")}</label><select class="in" id="peSel" data-ch="pe">${allEx.map(e=>`<option value="${e.id}" ${e.id===ex.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></div>
    <div class="hint">${tr("Расчётный максимум на 1 повтор (формула Эпли)")}, ${kgU()}</div>${lineChart(pts, {c:'c1', unit:kgU(), dec:1, id:'pe', label:tr('Прогресс силы'), empty:tr('Запиши подходы хотя бы на двух тренировках, и здесь появится график.')})}</section>`;
  h += whyCard('train');
  return main + acc('trainMore', 'activity', ...moreHead, `<div style="display:flex;flex-direction:column;gap:18px">${h}</div>`, true);
}
function nextWorkout(from){ for (let i=0;i<8;i++){ const k = addDays(from,i), w = workoutFor(k); if (w) return {date:k, w}; } return {}; }
function hBody(){
  const d = getDay(todayISO()), s = season();
  const ws = dayKeys().map(k=>({k, v:toNum(S.docs['days/'+k].weight)})).filter(x=>x.v);
  const first = ws.find(x=>x.k>=s.start), last = ws[ws.length-1];
  const avg7 = ws.slice(-7).reduce((a,b)=>a+b.v,0)/(ws.slice(-7).length||1);
  const waists = dayKeys().map(k=>({k, v:toNum(S.docs['days/'+k].waist)})).filter(x=>x.v);
  const photos = (S.docs['app/photos']?.list||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  let h = `<section class="card hero"><div class="hero-row"><div class="grow"><div class="hero-num">${last?num(W(last.v),1)+' '+kgU():'—'}</div><div class="hero-sub">${last?`${tr("среднее за 7 записей")} ${num(W(avg7),1)} ${kgU()}${first&&first!==last?` ${tr("· за сезон")} ${last.v-first.v>0?'+':''}${num(W(last.v-first.v),1)} ${kgU()}`:''}`:tr('Взвешивайся утром натощак, после туалета')}</div></div></div>
    <div class="fgrid" style="margin-top:14px"><div class="field"><label for="wIn">${tr("Вес сегодня")}, ${kgU()}</label><input class="in" id="wIn" inputmode="decimal" data-ch="weight" value="${W(d.weight)??''}" placeholder="${last?W(last.v):W(75)}"></div><div class="field"><label for="waIn">${tr("Талия")}, ${cmU()} ${tr("(раз в неделю)")}</label><input class="in" id="waIn" inputmode="decimal" data-ch="waist" value="${L(d.waist)??''}" placeholder="${waists.length?L(waists[waists.length-1].v):tr('на уровне пупка')}"></div></div></section>`;
  h += `<div class="sec-h"><h2>${tr("Вес")}</h2></div><section class="card"><div class="hint" style="margin-bottom:6px">${tr("Линия — среднее за 7 дней, точки — взвешивания")}</div>${lineChart(ws.slice(-60).map(x=>({x:fmtShort(x.k), y:W(x.v)})), {avg:true, c:'c1', unit:kgU(), dec:1, id:'w', label:tr('Вес')})}<div class="hint" style="margin-top:8px">${tr("Цель темпа: −0,5…0,7% веса в неделю")}${last?` (≈ ${num(W(last.v*0.005),1)}–${num(W(last.v*0.007),1)} ${kgU()})`:''}${tr(". Быстрее — растёт риск потерять мышцы.")}</div></section>`;
  // the calorie adjustment lives on the Food tab, where the target is used
  h += sleepSection();
  if (FACE_ON) h += faceCard(); // niche and about looks; switched off for now, entries already logged are kept
  if (waists.length >= 2) h += `<div class="sec-h"><h2>${tr("Талия")}</h2></div><section class="card">${lineChart(waists.slice(-30).map(x=>({x:fmtShort(x.k), y:x.v})), {c:'c3', unit:tr('см'), dec:1, id:'wa', label:tr('Талия')})}</section>`;
  h += `<div class="sec-h"><h2>${tr("Фото формы")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:12px">
    ${photoCompare()}
    <label class="btn ghost block">${ic('camera')}${tr("Добавить фото")}<input type="file" accept="image/*" hidden data-ch="bodyPhoto"></label>
    ${photos.length?`<div class="photos">${photos.map(p=>`<figure><img src="${blobURL('photo_'+p.id)}" alt="${tr("Фото формы")} ${fmtShort(p.date)}" loading="lazy"><figcaption>${fmtShort(p.date)}</figcaption></figure>`).join('')}</div>`:`<div class="hint">${tr("Фотографируйся раз в 2 недели: одно место, одно освещение, спереди, сбоку и сзади.")}</div>`}</section>`;
  return h;
}
function hSleep(){
  const d = getDay(todayISO());
  const pts = [...Array(14)].map((_,i)=>addDays(todayISO(),i-13)).map(k=>({x:fmtShort(k).split(' ')[0], y:toNum(S.docs['days/'+k]?.sleep)||0}));
  const got = pts.filter(p=>p.y>0), avg = got.reduce((a,b)=>a+b.y,0)/(got.length||1);
  return `<section class="card hero"><div class="hero-num">${got.length?num(avg,1)+tr(' ч'):'—'}</div><div class="hero-sub">${tr("средний сон за 14 дней · цель 7–9 ч")}</div>
    <div class="fgrid" style="margin-top:14px"><div class="field"><label for="slIn">${tr("Спал прошлой ночью, ч")}</label><input class="in" id="slIn" inputmode="decimal" data-ch="sleep" value="${d.sleep??''}" placeholder="7.5"></div>
    <div class="field"><label>${tr("Качество сна")}</label><div class="seg">${[1,2,3,4,5].map(n=>`<button class="${d.sleepQ===n?'on':''}" data-act="sleepQ" data-v="${n}" aria-label="${tr("Качество")} ${n}">${n}</button>`).join('')}</div></div></div></section>
    <section class="card">${barChart(pts,{target:7.5, unit:tr('ч'), dec:1, c:'c7', label:tr('Сон за 14 дней'), colorFn:p=>p.y>=7?'var(--c7)':'var(--sick-bg)'})}</section>
    <section class="card"><b>${tr("Почему сон в плане")}</b><div class="hint" style="margin-top:6px">${tr("При недосыпе на дефиците калорий больше теряется мышц и меньше жира, растёт аппетит и отёчность лица утром. Держи 7+ часов и одинаковое время подъёма.")}</div></section>`;
}
function sleepSection(){
  const d = getDay(todayISO());
  const pts = [...Array(14)].map((_,i)=>addDays(todayISO(),i-13)).map(k=>({x:fmtShort(k).split(' ')[0], y:toNum(S.docs['days/'+k]?.sleep)||0}));
  const got = pts.filter(p=>p.y>0), avg = got.reduce((a,b)=>a+b.y,0)/(got.length||1);
  return `<div class="sec-h"><h2>${tr("Сон")}</h2><span class="hint">${got.length ? trf('в среднем {h} ч · цель 7–9', {h: num(avg, 1)}) : tr('цель 7–9 ч')}</span></div>
    <section class="card" style="display:flex;flex-direction:column;gap:12px"><div class="fgrid"><div class="field"><label for="slIn">${tr("Спал прошлой ночью, ч")}</label><input class="in" id="slIn" inputmode="decimal" data-ch="sleep" value="${d.sleep??''}" placeholder="7.5"></div>
    <div class="field"><label>${tr("Качество сна")}</label><div class="seg">${[1,2,3,4,5].map(n=>`<button class="${d.sleepQ===n?'on':''}" data-act="sleepQ" data-v="${n}" aria-label="${tr("Качество")} ${n}">${n}</button>`).join('')}</div></div></div>
    ${got.length >= 2 ? barChart(pts,{target:7.5, unit:tr('ч'), dec:1, c:'c7', label:tr('Сон за 14 дней'), colorFn:p=>p.y>=7?'var(--c7)':'var(--sick-bg)'}) : ''}</section>`;
}
function hSupps(){
  const pl = plan(), d = getDay(todayISO()), list = pl.supps||[];
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Добавить БАД")}</b><div class="hint">${tr("Напиши название (можно с дозировкой с упаковки). ИИ подскажет, как и когда принимать, и насколько он доказан.")}</div>
    <div style="display:flex;gap:8px"><input class="in" id="suppName" placeholder="${tr("например, креатин моногидрат")}" aria-label="${tr("Название БАДа")}"><button class="btn" data-act="addSupp" aria-label="${tr("Добавить")}">${ic('plus')}</button></div><div id="suppOut"></div></section>
    ${suppPresetsHTML()}
    <div class="sec-h"><h2>${tr("Сегодня")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${list.map((s,i)=>{ const on = !!d.supps?.[s.name]; const open = S.open['s_'+i]; return `<div class="row"><button class="chk ${on?'on':''}" data-act="suppTake" data-n="${esc(s.name)}" aria-pressed="${on}" aria-label="${tr("Принял")} ${esc(s.name)}">${ic('check')}</button><button class="mid" data-act="toggleOpen" data-k="s_${i}" style="text-align:left"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.dose||'')} · ${esc(s.timing||'')}</div></button><span class="tag ${s.evidence==='сильная'?'good':s.evidence==='умеренная'?'warn':''}">${esc(tr(s.evidence||''))}</span></div>${open?`<div class="detail">${s.what?`<div>${esc(s.what)}</div>`:''}${s.withFood?`<div><b>${tr("С едой:")}</b> ${esc(s.withFood)}</div>`:''}${s.cautions?`<div><b>${tr("Осторожно:")}</b> ${esc(s.cautions)}</div>`:''}<div class="btnrow"><button class="btn danger" data-act="delSupp" data-i="${i}">${ic('trash')}${tr("Убрать")}</button></div></div>`:''}`; }).join('') || `<div class="empty">${tr("Список пуст. Добавь первый БАД выше.")}</div>`}</div></section>
    ${toNum(profile().age) && toNum(profile().age) < 18 ? `<div class="banner" role="status">${ic('alert')}<div>${tr("До 18 лет добавки и кофеин принимай только после разговора с врачом.")}</div></div>` : ''}
    <div class="note">${tr("Дозировку сверяй с упаковкой. Если принимаешь лекарства, уточни совместимость у врача.")}</div>`;
}
function whyCard(kind){
  const open = S.open['why_'+kind];
  const food = [
    [targets().aim === 'lose' ? tr('Белок 2 г на кг веса') : tr('Белок 1,6 г на кг веса'),tr('Метаанализ 49 исследований: рост мышц от силовых перестаёт увеличиваться примерно после 1,6 г/кг. На дефиците калорий берём с запасом, 2 г/кг.'),'https://pubmed.ncbi.nlm.nih.gov/28698222/'],
    targets().aim === 'lose' && [tr('Дефицит не больше ~500 ккал'),tr('Темп −0,7% веса в неделю у спортсменов на силовых сохранил и даже прибавил мышцы и силу, а −1,4% — нет. При дефиците больше ~500 ккал/день мышцы обычно перестают расти.'),'https://journals.humankinetics.com/view/journals/ijsnem/21/2/article-p97.xml'],
    [tr('Жиры 0,8 г/кг, остальное — углеводы'),tr('Углеводы дают энергию для тренировок; жиры ниже ~0,6 г/кг бьют по гормонам и сытости.'),''],
  ];
  const train = [
    [tr('8–12 подходов на мышцу в неделю'),tr('Крупнейший метаанализ объёма (Pelland, 2024): уже 4 подхода в неделю дают рост, дальше каждый подход добавляет, но всё меньше. Для 3 тренировок в неделю на дефиците 8–12 — рабочая середина.'),'https://link.springer.com/article/10.1007/s40279-025-02344-w'],
    [tr('Всё тело 3 раза в неделю'),tr('При равном объёме частота почти не влияет на рост мышц, зато каждая мышца получает стимул 2–3 раза в неделю, и пропуск одной тренировки не выбивает целую группу.'),''],
    [tr('Прогрессия: сначала повторы, потом вес'),tr('Держи 1–2 повтора в запасе. Когда во всех подходах дошёл до верха диапазона, добавь вес. Растущие цифры в зале на дефиците — главный признак, что мышцы сохраняются.'),''],
    [tr('Осанка: трапеции + растяжка грудных'),tr('Метаанализ 2024 года: упражнения на силу и растяжку уменьшают выдвинутую голову, сутулые плечи и кифоз.'),'https://pubmed.ncbi.nlm.nih.gov/38302926/'],
    [tr('8 000+ шагов'),tr('Ходьба увеличивает расход и почти не мешает восстановлению; удержание ~8 500 шагов помогает не набрать вес обратно.'),''],
  ];
  const items = (kind==='food' ? food : train).filter(Boolean);
  return `<section class="card"><button class="row" data-act="toggleOpen" data-k="why_${kind}" style="padding:0"><span class="ic">${ic('book')}</span><div class="mid"><div class="t">${tr("Почему план такой")}</div><div class="s">${tr("Коротко по исследованиям")}</div></div>${ic('chevR')}</button>
    ${open?`<ul class="src" style="margin:14px 0 0;padding-left:18px">${items.map(([t,x,u])=>`<li><b>${t}.</b> <span class="muted">${x}</span>${u?` <a href="${u}" target="_blank" rel="noopener">${tr("Источник")}</a>`:''}</li>`).join('')}</ul>`:''}</section>`;
}

/* ============ CONTENT ============ */
function viewContent(){
  const tabs = [['overview',tr('Обзор'),'activity'],['scripts',tr('Сценарии'),'edit'],['plan',tr('План'),'day'],['promo',tr('Продвижение'),'spark']];
  const cur = S.sub.content;
  return `<div class="pills" role="tablist">${tabs.map(([id,l,i])=>`<button class="pill ${cur===id?'on':''}" role="tab" aria-selected="${cur===id}" data-act="sub" data-k="content" data-v="${id}">${ic(i)}${l}</button>`).join('')}</div>` + ({overview:cOverview, scripts:cScripts, plan:cPlan, promo:cPromo}[cur])();
}
function followersOf(pid){ const f = content().platforms?.[pid]?.followers || []; return f.slice().sort((a,b)=>a.d.localeCompare(b.d)); }
function cOverview(){
  const c = content();
  const rows = PLATFORMS.map(p => { const f = followersOf(p.id), last = f[f.length-1]?.v || 0; const monthAgo = f.filter(x=>x.d<=addDays(todayISO(),-30)).pop() || f[0]; return {...p, nick:c.platforms?.[p.id]?.nick, last, delta: f.length>1 ? last-(monthAgo?.v||0) : null}; });
  const total = rows.reduce((a,r)=>a+r.last,0), dsum = rows.reduce((a,r)=>a+(r.delta||0),0);
  const weekStart = addDays(todayISO(), 1-dow(todayISO()));
  const thisWeek = posts().filter(p=>p.date>=weekStart && p.date<=addDays(weekStart,6));
  const published = thisWeek.filter(p=>p.status==='Опубликовано').length;
  let h = `<section class="card hero"><div class="hero-row"><div class="grow"><div class="hero-num">${num(total)}</div><div class="hero-sub">${tr("подписчиков всего")}${dsum?` · ${dsum>0?'+':''}${num(dsum)} ${tr("за 30 дней")}`:''}</div></div>${donut(rows.map(r=>({v:r.last, c:r.c, label:r.name, fmt:num(r.last)})), 96, 12)}</div>
    <div class="actions"><button data-act="statsUpload">${ic('image')}${tr("Статистика")}</button><button data-act="newScript">${ic('spark')}${tr("Сценарий")}</button><button data-act="sub" data-k="content" data-v="plan">${ic('day')}${tr("План")}</button></div></section>`;
  h += `<section class="card"><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px"><span>${tr("Ролики на этой неделе")}</span><span class="muted">${trf('{a} опубл. · {b} в плане · цель {c}', {a: published, b: thisWeek.length, c: c.weeklyTarget||4})}</span></div><div class="bar"><i style="width:${Math.min(100,published/(c.weeklyTarget||4)*100)}%;background:var(--accent)"></i></div></section>`;
  h += `<div class="sec-h"><h2>${tr("Площадки")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${rows.map(r=>`<button class="row" data-act="platform" data-id="${r.id}"><span class="pbadge" style="background:var(--${r.c})">${r.short}</span><div class="mid"><div class="t">${r.name}${total?` (${num(r.last/total*100,1)}%)`:''}</div><div class="s">${r.nick?'@'+esc(r.nick.replace(/^@/,'')):tr('ник не указан')}</div></div><div class="r">${num(r.last)}<small>${r.delta!=null?(r.delta>=0?'+':'')+num(r.delta)+tr(' за 30 дн'):tr('нет данных')}</small></div></button>`).join('')}</div></section>`;
  const an = analyses().slice(0,4);
  h += `<div class="sec-h"><h2>${tr("Последние разборы")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${an.map(a=>anRow(a)).join('') || `<div class="empty">${tr("Загрузи скриншоты статистики за 30 дней, и здесь появится разбор: что работает, где уходит зритель и что менять.")}</div>`}</div></section>`;
  return h;
}
function anRow(a){ const p = PL[a.platform]||PLATFORMS[0]; return `<button class="row" data-act="analysis" data-id="${a.id}"><span class="pbadge" style="background:var(--${p.c})">${p.short}</span><div class="mid"><div class="t">${a.kind==='reel'?tr('Ролик'):tr('Статистика 30 дней')} · ${fmtShort(a.date)}</div><div class="s">${esc((a.summary||'').slice(0,90))}${(a.summary||'').length>90?'…':''}</div></div>${ic('chevR')}</button>`; }
function cScripts(){
  const f = S.sub.ps || 'all';
  const list = posts().filter(p=>f==='all'||p.status===f).sort((a,b)=>(b.created||'').localeCompare(a.created||''));
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Новый сценарий")}</b><div class="hint">${tr("ИИ учитывает выводы из твоих разборов статистики, чтобы следующий ролик держал зрителя дольше.")}</div><div class="btnrow"><button class="btn" data-act="newScript">${ic('spark')}${tr("Сгенерировать")}</button><button class="btn ghost" data-act="newPost">${ic('plus')}${tr("Своя идея")}</button></div></section>
  <div class="pills">${['all',...POST_STATUS].map(s=>`<button class="pill ${f===s?'on':''}" data-act="psf" data-v="${s}">${s==='all'?tr('Все'):tr(s)}</button>`).join('')}</div>
  <section class="card" style="padding:4px 18px"><div class="list">${list.map(postRow).join('') || `<div class="empty">${tr("Сценариев пока нет")}</div>`}</div></section>`;
}
function postRow(p){ const pl = (p.platforms||[]).map(x=>PL[x]).filter(Boolean); const tone = {Идея:'',Сценарий:'warn',Снято:'sick',Опубликовано:'good'}[p.status]||''; return `<button class="row" data-act="openPost" data-id="${p.id}"><span class="ic">${ic('video')}</span><div class="mid"><div class="t">${esc(p.title||tr('Без названия'))}</div><div class="s">${p.date?fmtShort(p.date)+' · ':''}${pl.map(x=>x.name).join(', ')||tr('площадка не выбрана')}${p.location?' · '+esc(p.location):''}</div></div><span class="tag ${tone}">${esc(tr(p.status||'Идея'))}</span></button>`; }
function cPlan(){
  const t = todayISO(), ps = posts();
  let h = `<section class="card" style="display:flex;flex-direction:column;gap:10px"><div class="hint">${tr("Цель:")} ${content().weeklyTarget||4} ${tr("ролика в неделю. Нажми «+» у дня, чтобы поставить туда сценарий или идею. Ролики дня попадают в задачи на вкладке «День».")}</div></section>`;
  const unplanned = ps.filter(p=>!p.date && p.status!=='Опубликовано');
  h += `<section class="card" style="padding:6px 18px"><div class="list">${[...Array(14)].map((_,i)=>{ const k = addDays(t,i), dp = ps.filter(p=>p.date===k); return `<div class="row" style="align-items:flex-start"><div style="width:52px;flex:none"><div style="font-weight:800;font-size:18px">${new Date(k+'T12:00:00').getDate()}</div><div class="hint">${DOW[dow(k)]}</div></div><div class="mid" style="display:flex;flex-direction:column;gap:6px">${dp.map(p=>`<button data-act="openPost" data-id="${p.id}" style="text-align:left;background:#141416;border-radius:12px;padding:9px 11px"><div class="t" style="font-size:14.5px">${esc(p.title)}</div><div class="s">${(p.platforms||[]).map(x=>PL[x]?.short).join(' · ')} · ${esc(tr(p.status))}${p.location?' · '+esc(p.location):''}</div></button>`).join('') || '<span class="hint" style="padding-top:8px">—</span>'}</div><button class="iconbtn" data-act="planDay" data-d="${k}" aria-label="${tr("Добавить ролик на")} ${fmtShort(k)}" style="color:var(--accent)">${ic('plus')}</button></div>`; }).join('')}</div></section>`;
  if (unplanned.length) h += `<div class="sec-h"><h2>${tr("Без даты")}</h2></div><section class="card" style="padding:4px 18px"><div class="list">${unplanned.map(postRow).join('')}</div></section>`;
  return h;
}
function cPromo(){
  const c = content();
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("План продвижения")}</b><div class="hint">${tr("Собирается из твоих площадок, тем и разборов статистики. Обновляй после каждой новой статистики за 30 дней.")}</div><button class="btn" data-act="promo">${ic('spark')}${c.promo?tr('Обновить план'):tr('Составить план')}</button><div id="promoOut" class="ai-out">${c.promo?esc(c.promo):''}</div>${c.promoDate?`<div class="hint">${tr("Обновлён")} ${fmtShort(c.promoDate)}</div>`:''}</section>`;
}

/* ============ MONEY ============ */
function monthTx(m){ return (S.docs['money/'+m]?.tx || []); }
function viewMoney(){
  const m = S.moneyMonth, [yy, mm] = m.split('-').map(Number);
  const tx = monthTx(m).filter(t=>t.status!=='fail');
  const out = tx.filter(t=>t.type==='out'), inc = tx.filter(t=>t.type==='in');
  const so = out.reduce((a,t)=>a+ +t.amount,0), si = inc.reduce((a,t)=>a+ +t.amount,0);
  const group = (arr, type) => { const g = {}; arr.forEach(t=>{ const k = catInfo(type, t.cat)[0]; g[k] = g[k]||{sum:0,n:0}; g[k].sum += +t.amount; g[k].n += (+t.count||1); }); return Object.entries(g).map(([k,v])=>({cat:k, ...v, info:catInfo(type,k)})).sort((a,b)=>b.sum-a.sum); };
  const go = group(out,'out'), gi = group(inc,'in');
  const segsFor = (g, type) => { const cats = type==='in'?IN_CATS:OUT_CATS; const main = cats.filter(c=>c[1]!=='c0').map(c=>({v:g.find(x=>x.cat===c[0])?.sum||0, c:c[1], label:tr(c[0])})); const other = g.filter(x=>x.info[1]==='c0').reduce((a,x)=>a+x.sum,0); return [...main, {v:other, c:'c0', label:tr('Прочее')}]; };
  const sel = S.sub.money, G = sel==='in'?gi:go, SUM = sel==='in'?si:so;
  let h = `<div class="pills"><button class="pill" data-act="mPrev" aria-label="${tr("Предыдущий месяц")}">${ic('chevL').replace('<svg','<svg style="width:16px;height:16px;vertical-align:-3px"')}</button><span class="pill on">${MONTHS[mm-1][0].toUpperCase()+MONTHS[mm-1].slice(1)} ${yy}</span><button class="pill" data-act="mNext" aria-label="${tr("Следующий месяц")}">${ic('chevR').replace('<svg','<svg style="width:16px;height:16px;vertical-align:-3px"')}</button><button class="pill" data-act="txAdd">${tr("+ Операция")}</button><button class="pill" data-act="txShot">${tr("Скриншот из банка")}</button></div>
  <div class="grid2"><button class="mini ${sel==='out'?'on':''}" aria-pressed="${sel==='out'}" data-act="sub" data-k="money" data-v="out"><div style="flex:1;min-width:0"><div class="lbl">${tr("Расходы")}</div><div class="val">${money(so)}</div></div>${donut(segsFor(go,'out'),46,7)}</button>
  <button class="mini ${sel==='in'?'on':''}" aria-pressed="${sel==='in'}" data-act="sub" data-k="money" data-v="in"><div style="flex:1;min-width:0"><div class="lbl">${tr("Доходы")}</div><div class="val">${money(si)}</div></div>${donut(segsFor(gi,'in'),46,7)}</button></div>
  ${budgetCard(m, so)}
  ${!monthTx(m).length ? `<section class="card">${emptyState('wallet', tr('В этом месяце пока ничего не записано. Добавь операцию сам или просто скажи KAI, например «обед 12».'))}<div class="btnrow" style="justify-content:center"><button class="btn" data-act="txAdd">${ic('plus')}${tr('Операция')}</button><button class="btn ghost" data-act="tellEx" data-v="${esc(tr('Потратил 12 на обед'))}">${ic('mic')}${tr('Сказать KAI')}</button></div></section>` : `<section class="card"><div class="hint">${sel==='in'?tr("Доходы"):tr("Расходы")}</div>
    <div class="hero-num" style="margin-top:2px;font-size:34px">${money(SUM)}</div>
    <div class="hint">${si||so?`${tr("Остаток месяца:")} ${si-so>=0?'+':''}${money(si-so)}`:tr('Операций пока нет')}</div>
    <div style="display:grid;place-items:center;margin:14px 0">${donut(segsFor(G, sel), 140, 20)}</div>
    <div class="list">${G.map(g=>`<div class="row"><span class="ic" style="background:var(--${g.info[1]});color:#fff">${ic(g.info[2])}</span><div class="mid"><div class="t">${esc(tr(g.cat))} (${(x => num(x, x < 10 && x % 1 ? 1 : 0))(g.sum/(SUM||1)*100)}%)</div><div class="s">${money(g.sum)} · ${g.n} ${plural(g.n,tr('операция'),tr('операции'),tr('операций'))}</div></div></div>`).join('') || `<div class="empty">${tr("Добавь операцию или загрузи скриншот истории из банка.")}</div>`}</div></section>`}`;
  const byDate = {}; monthTx(m).forEach(t=>{ (byDate[t.date]=byDate[t.date]||[]).push(t); });
  const dates = Object.keys(byDate).sort().reverse();
  if (!dates.length) return h;
  h += `<div class="sec-h"><h2>${tr("История")}</h2></div>`;
  h += dates.length ? dates.map(k=>`<section class="card" style="padding:4px 18px"><div class="hint" style="padding:10px 0 2px">${fmtDay(k)}</div><div class="list">${byDate[k].map(t=>{ const inf = catInfo(t.type,t.cat); return `<button class="row" data-act="txEdit" data-id="${t.id}"><span class="ic" style="background:var(--${inf[1]});color:#fff">${ic(inf[2])}</span><div class="mid"><div class="t">${esc(t.note||tr(t.cat))}</div><div class="s" style="${t.status==='fail'?'color:var(--bad)':''}">${t.status==='fail'?tr('Неуспешно'):esc(tr(t.cat))}${t.count>1?' · '+t.count+tr(' операций'):''}</div></div><div class="r" style="color:${t.status==='fail'?'var(--bad)':t.type==='in'?'var(--good)':'var(--text)'}">${t.type==='in'?'+':'−'}${money(t.amount)}</div></button>`; }).join('')}</div></section>`).join('') : `<section class="card"><div class="empty">${tr("За этот месяц нет операций")}</div></section>`;
  return h;
}

/* ============ v2: offline coaching features ============ */

/* ---- product table, per 100 g (ориентировочно, по справочникам; сверяй с этикеткой) ---- */
const PRODUCTS = [
  // [название, ккал, Б, Ж, У, штука/ложка: [подпись, грамм]]
  [tr('Яйцо куриное'), 157, 12.7, 10.9, 0.7, [tr('шт'), 55]],
  [tr('Яичный белок'), 44, 11.1, 0, 0, [tr('белок'), 33]],
  [tr('Куриная грудка, сырая'), 113, 23.6, 1.9, 0.4],
  [tr('Куриная грудка, варёная'), 137, 29.8, 1.8, 0.5],
  [tr('Куриное бедро без кожи, сырое'), 121, 19.7, 4.1, 0],
  [tr('Индейка, филе сырое'), 84, 19.2, 0.7, 0],
  [tr('Говядина, мякоть сырая'), 187, 18.9, 12.4, 0],
  [tr('Говяжий фарш'), 254, 17.2, 20, 0],
  [tr('Тунец в собственном соку'), 96, 21, 1, 0],
  [tr('Творог 1,8%'), 101, 18, 1.8, 3.3],
  [tr('Творог 5%'), 121, 17.2, 5, 1.8],
  [tr('Творог 9%'), 159, 16.7, 9, 2],
  [tr('Греческий йогурт 2%'), 73, 9.9, 2, 3.9],
  [tr('Кефир 2,5%'), 53, 2.9, 2.5, 4],
  [tr('Молоко 2,5%'), 52, 2.8, 2.5, 4.7],
  [tr('Сметана 15%'), 158, 2.6, 15, 3, [tr('ст. л.'), 20]],
  [tr('Сметана 20%'), 206, 2.8, 20, 3.2, [tr('ст. л.'), 20]],
  [tr('Сыр твёрдый'), 363, 24.1, 29.5, 0.3],
  [tr('Протеин сывороточный (порошок)'), 380, 75, 6, 8, [tr('мерная ложка'), 30]],
  [tr('Гречка сухая'), 308, 12.6, 3.3, 57.1],
  [tr('Гречка варёная'), 92, 3.4, 0.6, 19.9],
  [tr('Рис белый сухой'), 344, 6.7, 0.7, 78.9],
  [tr('Рис варёный'), 130, 2.7, 0.3, 28.2],
  [tr('Овсяные хлопья (геркулес)'), 352, 12.3, 6.2, 61.8],
  [tr('Макароны твёрдых сортов, сухие'), 337, 10.4, 1.1, 69.7],
  [tr('Булгур сухой'), 342, 12.3, 1.3, 57.6],
  [tr('Чечевица сухая'), 295, 24, 1.5, 46.3],
  [tr('Нут сухой'), 309, 20.1, 4.3, 43.2],
  [tr('Фасоль сухая'), 298, 21, 2, 47],
  [tr('Картофель'), 77, 2, 0.4, 16.3],
  [tr('Хлеб пшеничный'), 242, 8.1, 1, 48.8, [tr('ломтик'), 30]],
  [tr('Лепёшка (нон), ориентир.'), 270, 8.5, 2.5, 53, [tr('четверть'), 80]],
  [tr('Огурец'), 15, 0.8, 0.1, 2.8],
  [tr('Помидор'), 20, 1.1, 0.2, 3.7],
  [tr('Морковь'), 35, 1.3, 0.1, 6.9],
  [tr('Капуста белокочанная'), 28, 1.8, 0.1, 4.7],
  [tr('Лук репчатый'), 41, 1.4, 0, 8.2],
  [tr('Перец болгарский'), 26, 1.3, 0.1, 5.3],
  [tr('Брокколи'), 28, 3, 0.4, 5.2],
  [tr('Банан'), 96, 1.5, 0.5, 21, [tr('шт'), 120]],
  [tr('Яблоко'), 47, 0.4, 0.4, 9.8, [tr('шт'), 150]],
  [tr('Апельсин'), 43, 0.9, 0.2, 8.1, [tr('шт'), 150]],
  [tr('Изюм'), 264, 2.9, 0.6, 66],
  [tr('Курага'), 232, 5.2, 0.3, 51],
  [tr('Грецкие орехи'), 654, 15.2, 65.2, 7],
  [tr('Арахис'), 552, 26.3, 45.2, 9.9],
  [tr('Масло подсолнечное'), 899, 0, 99.9, 0, [tr('ст. л.'), 14]],
  [tr('Масло оливковое'), 898, 0, 99.8, 0, [tr('ст. л.'), 14]],
  [tr('Масло сливочное 82,5%'), 748, 0.5, 82.5, 0.8],
  [tr('Мёд'), 329, 0.8, 0, 81.5, [tr('ч. л.'), 8]],
  [tr('Сахар'), 399, 0, 0, 99.8, [tr('ч. л.'), 5]],
  [tr('Лосось, сырой'), 208, 20, 13, 0],
  [tr('Треска, сырая'), 82, 18, 0.7, 0],
  [tr('Креветки, сырые'), 85, 20, 0.5, 0],
  [tr('Свинина, вырезка сырая'), 143, 21, 6, 0],
  [tr('Бекон'), 458, 12, 45, 1.5],
  [tr('Ветчина'), 145, 20, 6, 1.5, [tr('ломтик'), 30]],
  [tr('Колбаса варёная'), 260, 12, 23, 1.5],
  [tr('Сосиска'), 290, 11, 26, 2, [tr('шт'), 50]],
  [tr('Куриные наггетсы'), 296, 15, 19, 16, [tr('шт'), 18]],
  [tr('Тофу'), 144, 17, 9, 3],
  [tr('Темпе'), 192, 20, 11, 8],
  [tr('Эдамаме'), 121, 12, 5, 9],
  [tr('Чёрная фасоль, варёная'), 132, 8.9, 0.5, 23.7],
  [tr('Чечевица варёная'), 116, 9, 0.4, 20],
  [tr('Нут варёный'), 164, 8.9, 2.6, 27.4],
  [tr('Хумус'), 237, 7.8, 18, 15, [tr('ст. л.'), 15]],
  [tr('Макароны варёные'), 158, 5.8, 0.9, 31],
  [tr('Рис бурый варёный'), 123, 2.7, 1, 25.6],
  [tr('Киноа варёная'), 120, 4.4, 1.9, 21.3],
  [tr('Кускус варёный'), 110, 3.8, 0.2, 23.2],
  [tr('Рисовая лапша варёная'), 108, 1.8, 0.2, 24],
  [tr('Лапша быстрого приготовления, сухая'), 440, 10, 17, 62, [tr('пачка'), 80]],
  [tr('Овсянка на воде'), 71, 2.5, 1.5, 12],
  [tr('Кукурузные хлопья'), 357, 7.5, 0.4, 84],
  [tr('Гранола'), 471, 13, 20, 54],
  [tr('Хлеб цельнозерновой'), 252, 12.5, 3.5, 43, [tr('ломтик'), 30]],
  [tr('Пита'), 275, 9, 1.2, 56, [tr('шт'), 60]],
  [tr('Лаваш'), 277, 9, 1, 57],
  [tr('Тортилья пшеничная'), 312, 8, 8, 50, [tr('шт'), 45]],
  [tr('Наан'), 291, 9.6, 5.7, 50, [tr('шт'), 90]],
  [tr('Бублик (бейгл)'), 257, 10, 1.6, 50, [tr('шт'), 100]],
  [tr('Круассан'), 406, 8, 21, 46, [tr('шт'), 60]],
  [tr('Батат'), 86, 1.6, 0.1, 20],
  [tr('Картофель фри'), 312, 3.4, 15, 41],
  [tr('Авокадо'), 160, 2, 14.7, 8.5, [tr('шт'), 150]],
  [tr('Шпинат'), 23, 2.9, 0.4, 3.6],
  [tr('Грибы'), 22, 3.1, 0.3, 3.3],
  [tr('Кукуруза'), 86, 3.2, 1.2, 19],
  [tr('Зелёный горошек'), 81, 5.4, 0.4, 14.5],
  [tr('Салат листовой'), 15, 1.4, 0.2, 2.9],
  [tr('Кабачок'), 17, 1.2, 0.3, 3.1],
  [tr('Клубника'), 32, 0.7, 0.3, 7.7],
  [tr('Черника'), 57, 0.7, 0.3, 14.5],
  [tr('Виноград'), 69, 0.7, 0.2, 18],
  [tr('Манго'), 60, 0.8, 0.4, 15],
  [tr('Ананас'), 50, 0.5, 0.1, 13],
  [tr('Арбуз'), 30, 0.6, 0.2, 7.6],
  [tr('Финики'), 282, 2.5, 0.4, 75, [tr('шт'), 8]],
  [tr('Миндаль'), 579, 21, 50, 22],
  [tr('Кешью'), 553, 18, 44, 30],
  [tr('Арахисовая паста'), 598, 22, 51, 22, [tr('ст. л.'), 16]],
  [tr('Семечки подсолнуха'), 584, 21, 51, 20],
  [tr('Моцарелла'), 280, 28, 17, 3],
  [tr('Фета'), 265, 14, 21, 4],
  [tr('Рассыпчатый творог 2% (cottage cheese)'), 81, 10.4, 2.3, 4.8],
  [tr('Йогурт фруктовый'), 95, 4, 2, 16],
  [tr('Соевый напиток'), 45, 3, 1.8, 3.5],
  [tr('Овсяный напиток'), 48, 1, 1.5, 7],
  [tr('Мороженое'), 207, 3.5, 11, 24],
  [tr('Пицца с сыром'), 266, 11, 10, 33, [tr('кусок'), 107]],
  [tr('Гамбургер'), 254, 13, 11, 25, [tr('шт'), 110]],
  [tr('Шаурма с курицей, ориентир.'), 215, 11, 10, 20, [tr('шт'), 300]],
  [tr('Суши-ролл, ориентир.'), 150, 5, 2.5, 27, [tr('шт'), 30]],
  [tr('Пельмени'), 250, 11, 10, 29],
  [tr('Плов, ориентир.'), 180, 6, 7, 23],
  [tr('Тёмный шоколад'), 546, 5, 31, 61],
  [tr('Молочный шоколад'), 535, 7.6, 30, 59],
  [tr('Печенье'), 480, 5, 23, 65, [tr('шт'), 12]],
  [tr('Чипсы'), 536, 7, 35, 53],
  [tr('Майонез'), 680, 1, 75, 0.6, [tr('ст. л.'), 14]],
  [tr('Кетчуп'), 101, 1, 0.1, 27, [tr('ст. л.'), 17]],
  [tr('Кола'), 42, 0, 0, 10.6],
  [tr('Апельсиновый сок'), 45, 0.7, 0.2, 10.4],
  [tr('Пиво'), 43, 0.5, 0, 3.6],
  [tr('Вино'), 83, 0.1, 0, 2.6],
];
// each food's name in the other language too, so "rice" and "рис" both find it
const RU_OF = (() => { const ru = {}; Object.entries(window.I18N_EN || {}).forEach(([k, v]) => { ru[v] = ru[v] || k; }); return ru; })();
const otherLang = name => LANG === 'ru' ? (window.I18N_EN || {})[name] || '' : RU_OF[name] || '';
const PRODUCTS_ALT = PRODUCTS.map(p => otherLang(p[0]));

/* ---- supplements with solid evidence, usable without AI ---- */
const SUPP_PRESETS = [
  {adult:true, name:tr('Креатин моногидрат'), what:tr('Самая изученная спортивная добавка: при силовых тренировках даёт больше силы и мышечной массы.'), dose:tr('3–5 г в день'), timing:tr('Каждый день в любое время, без курсов и «загрузки»'), withFood:tr('Не важно, удобно с едой'), evidence:'сильная', cautions:tr('В первые недели вес может вырасти на 0,5–1,5 кг за счёт воды в мышцах — это не жир.')},
  {adult:true, name:tr('Кофеин'), what:tr('Повышает силу и выносливость на тренировке.'), dose:tr('3–6 мг на кг веса (начни с 3 мг/кг)'), timing:tr('За 30–60 минут до тренировки'), withFood:tr('Не важно'), evidence:'сильная', cautions:tr('Не позже чем за 8 часов до сна, иначе ухудшит сон. Не больше 400 мг в день из всех источников.')},
  {adult:true, name:tr('Сывороточный протеин'), what:tr('Удобно добрать дневную норму белка. Сам по себе не лучше белка из еды.'), dose:tr('20–40 г порошка, когда не хватает белка'), timing:tr('В любое время дня'), withFood:tr('Как перекус или вместе с едой'), evidence:'сильная', cautions:tr('Если важен халяль или кошер, проверь сертификат на банке.')},
  {name:tr('Витамин D3'), what:tr('Полезен при дефиците, без дефицита на мышцы и жир не влияет.'), dose:tr('Обычно 1000–2000 МЕ в день, лучше по анализу 25(OH)D'), timing:tr('Утром'), withFood:tr('С едой, в которой есть жир'), evidence:'умеренная', cautions:tr('Большие дозы без анализа не принимай.')},
  {name:tr('Омега-3'), what:tr('Польза для сердца и сосудов; на сжигание жира и рост мышц влияние слабое.'), dose:tr('1–2 г EPA+DHA в день'), timing:tr('С едой'), withFood:tr('С едой'), evidence:tr('слабая'), cautions:tr('Капсулы часто из желатина: если это важно, проверь состав.')},
];

/* ---- which muscles each exercise trains (1 — прямо, 0.5 — вспомогательно) ---- */
const MUSCLES = [tr('Грудь'),tr('Спина'),tr('Плечи'),tr('Бицепс'),tr('Трицепс'),tr('Квадрицепс'),tr('Ягодицы'),tr('Задняя бедра'),tr('Пресс')];
const EX_MUSCLES = {
  squat:{'Квадрицепс':1,'Ягодицы':.5}, bench:{'Грудь':1,'Трицепс':.5,'Плечи':.5}, pulldown:{'Спина':1,'Бицепс':.5},
  rdl:{'Задняя бедра':1,'Ягодицы':.5}, facepull:{'Плечи':1,'Спина':.5}, facepull2:{'Плечи':1,'Спина':.5}, plank:{'Пресс':1},
  legpress:{'Квадрицепс':1,'Ягодицы':.5}, incline:{'Грудь':1,'Плечи':.5,'Трицепс':.5}, row:{'Спина':1,'Бицепс':.5},
  ohp:{'Плечи':1,'Трицепс':.5}, yraise:{'Спина':1,'Плечи':.5}, legraise:{'Пресс':1}, hipthrust:{'Ягодицы':1,'Задняя бедра':.5},
  lunge:{'Квадрицепс':1,'Ягодицы':.5}, dips:{'Грудь':1,'Трицепс':1}, pullup:{'Спина':1,'Бицепс':.5}, curl:{'Бицепс':1}, pushdown:{'Трицепс':1},
};

/* ============ onboarding + backup reminder (Day tab) ============ */
const isStandalone = () => { if (isNative()) return true; try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; } };
function onboardSteps(){
  const m = meta();
  const all = [
    ['install', tr('Установить на экран «Домой»'), isStandalone(), tr('Safari → «Поделиться» → «На экран Домой». Только так приложение работает без сети и данные не удаляются.')],
    ['profile', tr('Возраст, рост и вес'), targets().ok, tr('Нужно для нормы КБЖУ')],
    ['classes', tr('Расписание пар'), (plan().classes||[]).length > 0, tr('Пары появятся в задачах дня')],
    ['ai', tr('Подключить ИИ'), PROV_LIST().some(provConfigured), cloudOn() ? tr('Войди в аккаунт, и ИИ заработает') : tr('Claude или ChatGPT: вставь один ключ')],
    isNative() ? ['ics', tr('Напоминания'), !!m.remindAsked, tr('Работают даже когда приложение закрыто')] : ['ics', tr('Напоминания в Календарь iPhone'), !!m.icsAt, tr('Работают даже когда приложение закрыто')],
    ['backup', tr('Первая резервная копия'), !!m.lastBackup, tr('Сохрани файл в «Файлы» или iCloud')],
  ];
  const student = (profile().role || 'study') === 'study' || (plan().classes || []).length;
  const mine = all.filter(s => s[0] !== 'classes' || student);
  return S.inClaude ? mine.filter(s => !['install','ics','ai'].includes(s[0])) : mine;
}
function onboardCard(){
  if (meta().onboardHidden) return '';
  const steps = onboardSteps(), left = steps.filter(s=>!s[2]).length;
  if (!left) return '';
  const done = steps.length - left;
  if (!S.open.onb) return `<button class="card onbc" data-act="toggleOpen" data-k="onb"><span class="ic">${ic('checkc')}</span><div class="mid"><div class="t">${tr("Настройка ·")} ${done} ${tr("из")} ${steps.length}</div><div class="s">${tr("Осталось")} ${left}: ${esc(steps.filter(x=>!x[2]).slice(0,2).map(x=>x[1].toLowerCase()).join(', '))}…</div><div class="bar" style="margin-top:8px"><i style="width:${done/steps.length*100}%;background:var(--accent)"></i></div></div>${ic('chevR')}</button>`;
  return `<div class="sec-h"><h2>${tr("Настройка ·")} ${done} ${tr("из")} ${steps.length}</h2><span><button class="link" data-act="toggleOpen" data-k="onb">${tr("Свернуть")}</button> <button class="link" data-act="onboardHide" style="margin-left:10px">${tr("Скрыть")}</button></span></div>
  <section class="card" style="padding:4px 18px"><div class="list">${steps.map(([id,t,ok,hint])=>`<button class="row" data-act="onboardGo" data-v="${id}"><span class="chk ${ok?'on':''}" aria-hidden="true">${ic('check')}</span><div class="mid"><div class="t" style="${ok?'color:var(--text-2)':''}">${t}</div>${ok?'':`<div class="s">${hint}</div>`}</div>${ok?'':ic('chevR')}</button>`).join('')}</div></section>`;
}
A.onboardHide = () => setMeta({onboardHidden:true});
A.onboardGo = el => {
  const v = el.dataset.v;
  if (v==='install') return openSheet(tr('Установка на iPhone'), `<ol class="ai-list"><li>${tr("Открой этот адрес в Safari (не в другом браузере).")}</li><li>${tr("Нажми «Поделиться» внизу экрана.")}</li><li>${tr("Выбери «На экран «Домой»» → «Добавить».")}</li><li>${tr("Дальше открывай приложение только с иконки.")}</li></ol><div class="note">${tr("С иконки приложение работает без интернета, а iOS не удаляет его данные.")}</div>`);
  if (v==='backup'){ A.profile(); S.open.acc_data = true; return render(); }
  if (v==='profile' || v==='classes'){ A.profile(); S.open['acc_'+v] = true; return render(); }
  if (v==='ai') return A.aiConnect();
  if (v==='ics') return A.ics();
};
function backupBanner(){
  const m = meta(); if (!meta().onboardHidden && onboardSteps().some(s=>!s[2])) return '';
  const last = m.lastBackup, days = last ? dayDiff(last, todayISO()) : null;
  if (dayKeys().length < 3 || (days !== null && days < 7)) return '';
  return `<div class="banner" role="status">${ic('alert')}<div><div>${last ? `${tr("Последняя резервная копия")} ${days} ${plural(days,tr('день'),tr('дня'),tr('дней'))} ${tr("назад.")}` : tr('Резервной копии ещё нет.')} ${tr("Если iOS очистит память, данные пропадут.")}</div><div class="btnrow"><button class="btn" data-act="exportData">${tr("Сделать копию")}</button></div></div></div>`;
}

/* ============ weekly numbers + AI review ============ */
function weekStats(end){
  const days = [...Array(7)].map((_,i)=>addDays(end, i-6));
  const ds = days.map(k=>S.docs['days/'+k]).filter(Boolean);
  const active = ds.filter(d=>d.status!=='sick');
  const done = active.length ? active.reduce((a,d)=>a+(dayScore(d)||0),0)/active.length : 0;
  const gymPlan = days.filter(k=>workoutFor(k)).length;
  const gym = ds.filter(d=>d.tasks?.some(t=>t.id==='gym'&&t.done)).length;
  const fed = ds.filter(d=>d.meals?.length);
  const kcal = fed.length ? fed.reduce((a,d)=>a+eaten(d).kcal,0)/fed.length : null;
  const prot = fed.length ? fed.reduce((a,d)=>a+eaten(d).p,0)/fed.length : null;
  const stepsD = ds.filter(d=>d.steps); const steps = stepsD.length ? stepsD.reduce((a,d)=>a+ +d.steps,0)/stepsD.length : null;
  const sleepD = ds.filter(d=>d.sleep); const sleep = sleepD.length ? sleepD.reduce((a,d)=>a+ +d.sleep,0)/sleepD.length : null;
  const avgW = ks => { const v = ks.map(k=>toNum(S.docs['days/'+k]?.weight)).filter(Boolean); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };
  const w1 = avgW(days), w0 = avgW(days.map(k=>addDays(k,-7)));
  const spent = days.reduce((a,k)=>a+monthTx(k.slice(0,7)).filter(t=>t.date===k && t.type==='out' && t.status!=='fail' && !t.summary).reduce((s,t)=>s+ +t.amount,0),0);
  return {days, logged: ds.length, sick: ds.length-active.length, done, gym, gymPlan, kcal, prot, fedDays: fed.length, steps, sleep, w1, w0, spent};
}
function weekCard(){
  const w = weekStats(todayISO()), t = targets();
  if (w.logged < 2) return '';
  const tone = (v, good, ok) => v==null ? '' : v >= good ? 'good' : v >= ok ? 'warn' : 'bad';
  const cells = [
    [tr('Выполнение'), Math.round(w.done*100)+'%', tone(w.done, .7, .4), 'checkc'],
    [tr('Тренировки'), `${w.gym} ${tr("из")} ${w.gymPlan}`, tone(w.gymPlan ? w.gym/w.gymPlan : 1, 1, .6), 'gym'],
    [tr('Белок в день'), w.prot!=null ? num(w.prot)+(t.ok?' / '+t.p:'')+tr(' г') : '—', t.ok && w.prot!=null ? tone(w.prot/t.p, .9, .75) : '', 'food'],
    [tr('Калории в день'), w.kcal!=null ? num(w.kcal)+(t.ok?' / '+t.kcal:'') : '—', '', 'flame'],
    [tr('Шаги в день'), w.steps!=null ? num(w.steps) : '—', w.steps!=null ? tone(w.steps/t.steps, 1, .75) : '', 'steps'],
    [tr('Сон'), w.sleep!=null ? num(w.sleep,1)+tr(' ч') : '—', w.sleep!=null ? tone(w.sleep, 7, 6.3) : '', 'moon'],
    [tr('Вес, среднее'), w.w1!=null ? num(W(w.w1),1)+' '+kgU() + (w.w0!=null ? ` (${w.w1-w.w0>0?'+':''}${num(W(w.w1-w.w0),1)})` : '') : '—', '', 'scale'],
    [tr('Потрачено'), money(w.spent), '', 'wallet'],
  ];
  return `<div class="sec-h"><h2>${tr("Итоги 7 дней")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="kv kv-ic">${cells.map(([l,v,c,i])=>`<div><span>${ic(i)}${l}</span><b class="${c?'t-'+c:''}">${v}</b></div>`).join('')}</div>
    ${w.fedDays < 5 ? `<div class="hint">${tr("Еда записана только за")} ${w.fedDays} ${plural(w.fedDays,tr('день'),tr('дня'),tr('дней'))} ${tr("из 7 — средние по питанию неточные.")}</div>` : ''}
    <button class="btn ghost" data-act="weekReview">${ic('spark')}${tr("Разбор недели от ИИ")}</button></section>`;
}
function weekReportText(){
  const days = [...Array(7)].map((_,i)=>addDays(todayISO(), i-6));
  const lines = [`${tr("Отчёт из KAI за")} ${fmtShort(days[0])}–${fmtShort(days[6])}.`, profileBrief(), ''];
  days.forEach(k => { const d = S.docs['days/'+k]; if (!d) { lines.push(`${fmtShort(k)}${tr(": нет записей")}`); return; } const e = eaten(d); lines.push(`${fmtShort(k)} (${DOW[dow(k)]}): ${d.status==='sick'?tr('болел; '):''}${tr("задачи")} ${d.tasks.filter(t=>t.done).length}/${d.tasks.length} ${tr("(не сделано:")} ${d.tasks.filter(t=>!t.done).map(t=>t.title).join(', ')||'—'}${tr("); еда")} ${d.meals?.length?num(e.kcal)+tr(' ккал, белок ')+num(e.p)+tr(' г'):tr('не записана')}${tr("; шаги")} ${d.steps||'—'}${tr("; сон")} ${d.sleep||'—'} ${tr("ч; вес")} ${d.weight||'—'}${d.face?tr('; отёк лица утром ')+d.face+'/3':''}${d.sets&&Object.keys(d.sets).length?tr('; подходы: ')+Object.entries(d.sets).map(([ex,s])=>ex+' '+s.filter(x=>x&&x.r).map(x=>(x.w?x.w+'×':'')+x.r).join(',')).join('; '):''}${d.note?tr('; заметка: ')+d.note:''}`); });
  const trend = weightTrend(14); if (trend) lines.push('', `${tr("Тренд веса за 14 дней:")} ${trend.rate>0?'+':''}${num(trend.rate,2)}${tr("% в неделю.")}`);
  const w = weekStats(todayISO()); lines.push(`${tr("Потрачено за неделю:")} ${money(w.spent)}.`);
  return lines.join('\n');
}
A.weekReview = async () => {
  const prompt = weekReportText() + `\n\nТы — личный тренер и нутрициолог. Разбери неделю по данным выше. Формат: простой текст без Markdown. Блоки: «Что получилось», «Что мешает» (с цифрами из данных), «3 изменения на следующую неделю» — конкретные действия с числами. Если данных мало, скажи, что записывать. Коротко, на «ты».`;
  const id = await submitJob('review', {prompt, json:false, label:tr('Разбор недели · ')+fmtShort(todayISO())});
  if (!id) return;
  openSheet(tr('Разбор недели'), `<div id="rvOut"></div>`); queueNow(id, 'rvOut');
};

/* ============ adaptive calories from the weight trend ============ */
function weightTrend(days){
  const pts = [...Array(days)].map((_,i)=>addDays(todayISO(), i-days+1)).map((k,i)=>({x:i, y:toNum(S.docs['days/'+k]?.weight)})).filter(p=>p.y);
  if (pts.length < 6 || pts[pts.length-1].x - pts[0].x < 7) return null;
  const n = pts.length, mx = pts.reduce((a,p)=>a+p.x,0)/n, my = pts.reduce((a,p)=>a+p.y,0)/n;
  const slope = pts.reduce((a,p)=>a+(p.x-mx)*(p.y-my),0) / pts.reduce((a,p)=>a+(p.x-mx)**2,0);
  return {n, avg: my, perWeek: slope*7, rate: slope*7/my*100};
}
function adaptiveAdvice(){
  const t = targets(); if (!t.ok || t.care) return null;
  const trend = weightTrend(14);
  if (!trend) return {state:'wait', text:tr('Взвешивайся каждое утро: через 2 недели здесь появится подсказка, правильная ли норма калорий.')};
  if (t.aim !== 'lose') return {state:'ok', rate:trend.rate, text:`${tr("Вес меняется на")} ${trend.rate>0?'+':''}${num(trend.rate,2)}${tr("% в неделю (")}${trend.perWeek>0?'+':''}${num(W(trend.perWeek),2)} ${kgU()}).`};
  const logged = [...Array(14)].map((_,i)=>addDays(todayISO(), -i)).filter(k=>S.docs['days/'+k]?.meals?.length).length;
  const since = dayDiff(season().start, todayISO());
  const rateTxt = `${tr("Вес меняется на")} ${trend.rate>0?'+':''}${num(trend.rate,2)}${tr("% в неделю (")}${trend.perWeek>0?'+':''}${num(W(trend.perWeek),2)} ${kgU()}${tr("). Цель: −0,5…−0,7%.")}`;
  if (trend.rate > -0.25){
    if (logged < 8) return {state:'log', rate:trend.rate, text: rateTxt + ` ${tr("Вес почти не снижается, но еда записана только за")} ${logged} ${tr("из 14 дней. Сначала 1–2 недели записывай всё, что ешь: часто лишние калории прячутся в перекусах и масле.")}`};
    const k = Math.max(t.bmr, KCAL_FLOOR, t.kcal - 150);
    // already at the floor: eating less is not the answer
    if (k >= t.kcal) return {state:'slow', rate:trend.rate, text: rateTxt + ` ${tr("Норма уже на нижней границе, ниже KAI не советует. Больше движения и сна помогут сильнее, а если вес стоит долго, стоит обсудить это с врачом.")}`};
    return {state:'slow', rate:trend.rate, kcal:k, text: rateTxt + ` ${tr("Снижение слишком медленное. Убери примерно 150 ккал в день, белок не трогай.")}`};
  }
  if (trend.rate < -1.0 && since >= 14){ const k = t.kcal + 150; return {state:'fast', rate:trend.rate, kcal:k, text: rateTxt + tr(' Худеешь слишком быстро: растёт риск терять мышцы. Добавь около 150 ккал в день, лучше из углеводов.')}; }
  return {state:'ok', rate:trend.rate, text: rateTxt + (trend.rate < -1.0 ? tr(' В первые 2 недели быстрый спад — это в основном вода, норму пока не меняем.') : tr(' Темп в норме, ничего не меняем.'))};
}
function adaptiveCard(){
  const a = adaptiveAdvice(), t = targets(); if (!a) return '';
  const tag = {ok:['good',tr('Темп в норме')], slow:['warn',tr('Медленно')], fast:['bad',tr('Слишком быстро')], log:['warn',tr('Мало данных о еде')], wait:['',tr('Копим данные')]}[a.state];
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${tr("Подстройка нормы по весу")}</b><span class="tag ${tag[0]}">${tag[1]}</span></div>
    <div class="hint">${esc(a.text)}</div>
    ${a.kcal ? `<button class="btn" data-act="applyKcal" data-v="${a.kcal}">${tr("Сделать норму")} ${a.kcal} ${tr("ккал")}</button>` : ''}
    ${t.adjusted ? `<div class="hint">${tr("Сейчас норма изменена вручную:")} ${t.kcal} ${tr("ккал вместо расчётных")} ${t.base}. <button class="link" data-act="resetKcal">${tr("Вернуть расчётную")}</button></div>` : ''}</section>`;
}
A.applyKcal = el => { haptic('medium'); const p = clone(profile()); p.override = {...(p.override||{}), kcal:+el.dataset.v, kcalDate:todayISO()}; save('app/profile', p); toast(tr('Новая норма: ')+el.dataset.v+tr(' ккал')); };
A.resetKcal = () => { const p = clone(profile()); if (p.override) delete p.override.kcal; save('app/profile', p); toast(tr('Норма рассчитана заново')); };

/* ============ care: numbers about food and weight can hurt, so the app steps back when they might ============ */
const HELP_URL = 'https://findahelpline.com';
const NOT_MED = () => tr('KAI не заменяет врача. Цифры здесь ориентировочные. При болезни, беременности или проблемах с едой обсуди цели со специалистом.');
function careNote(t){
  if (!t.ok || !t.care || goalOf(profile()) !== 'lose') return t.ok && t.care === 'minor' ? `<div class="hint">${tr('До 18 лет организм растёт, поэтому KAI не считает дефицит калорий. Вопросы о весе лучше обсудить с врачом.')}</div>` : '';
  return `<div class="banner" role="status">${ic('alert')}<div>${t.care === 'minor' ? tr('До 18 лет организм растёт, поэтому KAI не считает дефицит калорий. Вопросы о весе лучше обсудить с врачом.') : tr('По твоему росту и весу снижать вес не стоит, поэтому норма рассчитана на поддержание. Если вес снижается сам, покажись врачу.')}</div></div>`;
}
function careSignal(text){
  const s = String(text || '');
  if (/суицид|покончить с собой|не хочу жить|хочу умереть|убить себя|порезать себя|навредить себе|kill myself|suicid|end my life|want to die|don.?t want to live|hurt myself|self[- ]harm/i.test(s)) return 'crisis';
  if (/вызвать рвоту|вызываю рвоту|вызвал[аи]? рвоту|слабительн|голодаю|морю себя голодом|не ел[аи]? (\d+|несколько|два|две|три|четыре|пять) (дн|дня|дней|сут)|make myself (sick|throw up|vomit)|laxative|purg(e|ing)|starv(e|ing) myself|haven.?t eaten (in|for) (\d+|two|three|four|five|several|a few) days/i.test(s)) return 'eating';
  return null;
}
function careCard(kind){
  const body = kind === 'crisis'
    ? tr('С этим не нужно справляться в одиночку. Если есть риск, что ты можешь навредить себе, прямо сейчас позвони в местную экстренную службу или скажи близкому человеку. Бесплатную линию помощи в твоей стране можно найти здесь:')
    : tr('Это важнее любых цифр в приложении. Поговори с врачом или человеком, которому доверяешь: такое лечится, и помощь работает. Подсчёт еды можно выключить в разделе «Модули». Линию помощи в твоей стране можно найти здесь:');
  return `<section class="card" role="status" style="display:flex;flex-direction:column;gap:10px"><b>${kind === 'crisis' ? tr('Похоже, тебе сейчас очень тяжело') : tr('Похоже, с едой сейчас непросто')}</b><div>${body}</div><a class="btn" href="${HELP_URL}" target="_blank" rel="noopener">${tr('Найти линию помощи')}</a></section>`;
}
/* shows the card once, on the device, before anything goes to an AI; a second tap carries on */
function carePause(text, outId, act){
  const kind = careSignal(text), out = $('#' + outId);
  if (!kind || SH.careSeen === text || !out) return false;
  SH.careSeen = text;
  out.innerHTML = careCard(kind) + `<button class="btn ghost block" data-act="${act}">${tr('Всё равно разобрать')}</button>`;
  return true;
}
function lowEatNote(){
  const off = meta().lowEatOff;
  if (off && dayDiff(off, todayISO()) < 7) return '';
  const low = [1, 2, 3].every(i => { const d = S.docs['days/' + addDays(todayISO(), -i)]; return d?.meals?.length && eaten(d).kcal < 800; });
  if (!low) return '';
  return `<div class="banner" role="status">${ic('alert')}<div>${tr('Три дня подряд записано меньше 800 ккал. Если записано не всё, просто не обращай внимания. Если так и есть, организму этого мало: поговори с врачом или человеком, которому доверяешь.')}<div class="btnrow"><a class="btn ghost" href="${HELP_URL}" target="_blank" rel="noopener">${tr('Найти линию помощи')}</a><button class="btn ghost" data-act="lowEatOff">${tr('Скрыть')}</button></div></div></div>`;
}
A.lowEatOff = () => setMeta({lowEatOff: todayISO()});

/* ============ food without AI: product builder + frequent meals ============ */
function frequentMeals(){
  const count = {};
  dayKeys().slice(-45).forEach(k => (S.docs['days/'+k].meals||[]).forEach(m => { const key = m.name.trim().toLowerCase(); if (!count[key]) count[key] = {m, n:0}; count[key].n++; count[key].m = m; }));
  return Object.values(count).sort((a,b)=>b.n-a.n).slice(0,8).map(x=>x.m);
}
function quickMealsHTML(){
  const f = frequentMeals(); if (!f.length) return '';
  return `<div class="sec-h"><h2>${tr("Частые блюда")}</h2></div><div class="pills" style="flex-wrap:wrap;margin:0;padding:0">${f.map((m,i)=>`<button class="pill" data-act="quickMeal" data-i="${i}">${esc(m.name)} · ${num(m.kcal)}</button>`).join('')}</div>`;
}
A.quickMeal = el => { const m = frequentMeals()[+el.dataset.i]; if (!m) return; haptic('light'); burstAt(el, {n:10}); const now = new Date(); mutDay(todayISO(), d => d.meals.push({name:m.name, kcal:m.kcal, p:m.p, f:m.f, c:m.c, time:pad(now.getHours())+':'+pad(now.getMinutes())})); toast(tr('Добавлено: ')+m.name); };
const pbRowSub = r => { const p = PRODUCTS[r.i], k = (+r.g||0)/100; return `${num(p[1]*k)} ${tr("ккал · Б")} ${num(p[2]*k,1)}${p[5]?` · 1 ${p[5][0]} ≈ ${p[5][1]} ${tr("г")}`:''}`; };
const pbTotHTML = t => `<div><span>${tr("Ккал")}</span><b>${num(t.kcal)}</b></div><div><span>${tr("Белки")}</span><b>${num(t.p)} ${tr("г")}</b></div><div><span>${tr("Жиры")}</span><b>${num(t.f)} ${tr("г")}</b></div><div><span>${tr("Углеводы")}</span><b>${num(t.c)} ${tr("г")}</b></div>`;
function builderTotals(rows){ return rows.reduce((a,r)=>{ const p = PRODUCTS[r.i], k = (+r.g||0)/100; return {kcal:a.kcal+p[1]*k, p:a.p+p[2]*k, f:a.f+p[3]*k, c:a.c+p[4]*k}; }, {kcal:0,p:0,f:0,c:0}); }
function productBuilderHTML(){
  const rows = SH.rows || [], q = (SH.pq||'').toLowerCase(), tot = builderTotals(rows);
  const rank = n => { n = n.toLowerCase(); return n.startsWith(q) ? 0 : n.split(/[\s,(]+/).some(w=>w.startsWith(q)) ? 1 : 2; };
  const list = q ? PRODUCTS.map((p,i)=>({p,i})).filter(x=>x.p[0].toLowerCase().includes(q)).sort((a,b)=>rank(a.p[0])-rank(b.p[0]) || a.p[0].length-b.p[0].length).slice(0,8) : [];
  return `<div class="hint">${tr("Без интернета и ИИ: выбери продукты и граммы, КБЖУ посчитается по справочнику. Крупы лучше взвешивать сухими.")}</div>
    <div class="field"><label for="pbQ">${tr("Найти продукт")}</label><input class="in" id="pbQ" placeholder="${tr("гречка, яйцо, творог…")}" value="${esc(SH.pq||'')}" data-inp="pbQ" autocomplete="off"></div>
    <div id="pbList" style="display:flex;flex-direction:column;gap:6px">${list.map(({p,i})=>`<button class="row" data-act="pbAdd" data-i="${i}" style="padding:8px 0"><div class="mid"><div class="t">${esc(p[0])}</div><div class="s">${tr("на 100 г:")} ${p[1]} ${tr("ккал · Б")} ${p[2]} ${tr("· Ж")} ${p[3]} ${tr("· У")} ${p[4]}</div></div>${ic('plus')}</button>`).join('')}${q && !list.length ? `<div class="hint">${tr("Нет в справочнике: опиши блюдо через ИИ или введи КБЖУ вручную ниже.")}</div>` : ''}</div>
    ${rows.length ? `<section class="card" style="padding:4px 16px"><div class="list">${rows.map((r,j)=>{ const p = PRODUCTS[r.i]; const k = (+r.g||0)/100; return `<div class="row"><div class="mid"><div class="t">${esc(p[0])}</div><div class="s" id="pbRow${j}">${pbRowSub(r)}</div></div><input class="in" style="width:84px;text-align:center" inputmode="decimal" aria-label="${tr("Граммы:")} ${esc(p[0])}" value="${esc(r.g)}" data-inp="pbG" data-j="${j}"><span class="hint">${tr("г")}</span><button class="iconbtn" data-act="pbDel" data-j="${j}" aria-label="${tr("Убрать")}" style="color:var(--text-3)">${ic('x')}</button></div>`; }).join('')}</div></section>
    <div class="kv" id="pbTot">${pbTotHTML(tot)}</div>
    <div class="field"><label for="pbN">${tr("Название")}</label><input class="in" id="pbN" value="${esc(SH.pbName || rows.map(r=>PRODUCTS[r.i][0].split(',')[0].split(' (')[0]).join(' + '))}"></div>
    <button class="btn block" data-act="pbSave">${ic('plus')}${tr("Добавить в дневник")}</button>` : ''}
    <button class="link" data-act="toggleOpen" data-k="fmManual" style="text-align:left">${S.open.fmManual?tr('Скрыть ручной ввод'):tr('Ввести КБЖУ вручную')}</button>
    ${S.open.fmManual ? `<div class="field"><label for="fmN">${tr("Что")}</label><input class="in" id="fmN" placeholder="${tr("Гречка с курицей")}"></div>
      <div class="fgrid">${[['fmK',tr('Ккал')],['fmP',tr('Белки, г')],['fmF',tr('Жиры, г')],['fmC',tr('Углеводы, г')]].map(([id,l])=>`<div class="field"><label for="${id}">${l}</label><input class="in" id="${id}" inputmode="decimal"></div>`).join('')}</div>
      <button class="btn block" data-act="foodManualSave">${tr("Добавить")}</button>` : ''}`;
}
document.addEventListener('input', e => {
  if (e.target.dataset?.inp === 'pbG' && SH?.rows){ const j = +e.target.dataset.j; SH.rows[j].g = toNum(e.target.value) || 0; const r = $('#pbRow'+j); if (r) r.textContent = pbRowSub(SH.rows[j]); const t = $('#pbTot'); if (t) t.innerHTML = pbTotHTML(builderTotals(SH.rows)); return; }
  if (e.target.dataset?.inp === 'pbQ'){ SH.pq = e.target.value; const box = $('#pbList'); if (box){ const tmp = document.createElement('div'); tmp.innerHTML = productBuilderHTML(); box.innerHTML = $('#pbList', tmp).innerHTML; } }
});
A.pbAdd = el => { const i = +el.dataset.i, p = PRODUCTS[i]; SH.rows = [...(SH.rows||[]), {i, g: p[5] ? p[5][1] : 100}]; SH.pq = ''; SH.pbName = null; drawSheet(); const inp = $$('[data-inp=pbG]').pop(); if (inp){ inp.focus(); inp.select(); } };
A.pbDel = el => { SH.rows.splice(+el.dataset.j, 1); SH.pbName = null; drawSheet(); };
A.pbSave = () => { haptic('light'); const tot = builderTotals(SH.rows||[]); const name = val('pbN') || tr('Блюдо'); const now = new Date(); mutDay(todayISO(), d => d.meals.push({name, kcal:Math.round(tot.kcal), p:Math.round(tot.p), f:Math.round(tot.f), c:Math.round(tot.c), time:pad(now.getHours())+':'+pad(now.getMinutes())})); closeSheet(); toast(tr('Добавлено: ')+name); };

/* ============ training: sets per muscle, rest timer, deload ============ */
function weekMuscleSets(){
  const mon = addDays(todayISO(), 1-dow(todayISO()));
  const done = Object.fromEntries(MUSCLES.map(m=>[m,0])), planned = Object.fromEntries(MUSCLES.map(m=>[m,0]));
  for (let i=0;i<7;i++){
    const k = addDays(mon,i), d = S.docs['days/'+k];
    Object.entries(d?.sets||{}).forEach(([ex, arr]) => { const n = (arr||[]).filter(s=>s && +s.r>0).length; Object.entries(EX_MUSCLES[ex]||{}).forEach(([m,f]) => done[m] += n*f); });
    const w = plan().schedule?.[dow(k)]; if (w) (plan().workouts[w]?.ex||[]).forEach(e => Object.entries(EX_MUSCLES[e.id]||{}).forEach(([m,f]) => planned[m] += e.sets*f));
  }
  return {done, planned};
}
function muscleCard(){
  const {done, planned} = weekMuscleSets(), max = 16;
  return `<div class="sec-h"><h2>${tr("Подходы на мышцу за неделю")}</h2></div><section class="card" style="display:flex;flex-direction:column;gap:9px">
    <div class="hint">${tr("Зелёная зона — 8–12 подходов, где рост мышц идёт лучше всего. Вспомогательная работа считается за полподхода. Серая метка — сколько даёт план.")}</div>
    ${MUSCLES.filter(m=>planned[m]>0 || done[m]>0).map(m=>{ const v = done[m], p = planned[m]; return `<div class="macro" style="grid-template-columns:110px 1fr 70px"><span>${m}</span><div class="mbar"><i class="zone" style="left:${8/max*100}%;width:${4/max*100}%"></i><i class="fill" style="width:${Math.min(100,v/max*100)}%;background:${v>=8?'var(--good)':'var(--c1)'}"></i><i class="plan" style="left:${Math.min(99,p/max*100)}%"></i></div><span class="n"><b>${num(v,v%1?1:0)}</b> / ${num(p,p%1?1:0)}</span></div>`; }).join('')}
  </section>`;
}
function deloadNote(){
  const wk = Math.floor(dayDiff(activeProgram()?.start || season().start, todayISO())/7) + 1;
  if (wk < 6 || wk % 6 !== 0) return '';
  return `<div class="banner" role="status">${ic('alert')}<div>${tr("Неделя")} ${wk} ${tr("сезона — разгрузочная. Делай те же упражнения, но веса на 10–20% меньше и на один подход меньше. Это даёт суставам и нервной системе восстановиться перед следующим блоком.")}</div></div>`;
}
const TIMER = {end:0, total:0, label:'', iv:null, wake:null};
let AUDIO = null;
['touchend','click'].forEach(ev => document.addEventListener(ev, () => { try { if (!AUDIO) AUDIO = new (window.AudioContext||window.webkitAudioContext)(); if (AUDIO.state === 'suspended') AUDIO.resume(); } catch {} }, {passive:true, capture:true}));
function beep(){ try { if (!AUDIO) return; [0, .35, .7].forEach(t => { const o = AUDIO.createOscillator(), g = AUDIO.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.001, AUDIO.currentTime+t); g.gain.exponentialRampToValueAtTime(.4, AUDIO.currentTime+t+.02); g.gain.exponentialRampToValueAtTime(.001, AUDIO.currentTime+t+.25); o.connect(g).connect(AUDIO.destination); o.start(AUDIO.currentTime+t); o.stop(AUDIO.currentTime+t+.3); }); } catch {} }
function restSeconds(rest){ const t = String(rest||'').replace(',', '.'), m = t.match(/[\d.]+/); if (!m) return 90; return Math.round(parseFloat(m[0]) * (/сек|sec/.test(t) ? 1 : 60)); }
async function startRest(sec, label){
  TIMER.end = Date.now() + sec*1000; TIMER.total = sec; TIMER.label = label;
  clearInterval(TIMER.iv); TIMER.iv = setInterval(tickRest, 500); document.body.classList.add('resting'); tickRest();
  try { if (!TIMER.wake && navigator.wakeLock) TIMER.wake = await navigator.wakeLock.request('screen'); } catch {}
}
function tickRest(){
  const bar = $('#restBar'); if (!bar) return;
  const left = Math.ceil((TIMER.end - Date.now())/1000);
  if (left <= 0){ stopRest(); beep(); toast(tr('Отдых окончен: следующий подход')); return; }
  bar.hidden = false;
  bar.innerHTML = `<div class="rb-in"><div style="flex:1;min-width:0"><div class="rb-t">${Math.floor(left/60)}:${pad(left%60)}</div><div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tr("Отдых ·")} ${esc(TIMER.label)}</div></div><button class="btn ghost" data-act="restAdd">${tr("+30 с")}</button><button class="btn ghost" data-act="restStop">${tr("Стоп")}</button></div><div class="bar" style="height:4px;margin-top:8px"><i style="width:${(1-left/TIMER.total)*100}%;background:var(--accent)"></i></div>`;
}
function stopRest(){ document.body.classList.remove('resting'); clearInterval(TIMER.iv); TIMER.iv = null; TIMER.end = 0; const bar = $('#restBar'); if (bar) bar.hidden = true; try { TIMER.wake?.release(); } catch {} TIMER.wake = null; }
A.restAdd = () => { TIMER.end += 30000; TIMER.total += 30; tickRest(); };
A.restStop = () => stopRest();
A.restStart = el => startRest(restSeconds(el.dataset.r), el.dataset.n);

/* ============ face puffiness log + personal insight ============ */
function faceInsight(){
  const ks = dayKeys().filter(k=>S.docs['days/'+k].face);
  if (ks.length < 8) return `${tr("Отмечай отёк каждое утро. После 8 отметок здесь появится, что влияет на него у тебя: сон или поздняя еда.")}`;
  const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
  const shortS = [], longS = [], late = [], early = [];
  ks.forEach(k => { const d = S.docs['days/'+k], f = +d.face; if (d.sleep){ (+d.sleep < 7 ? shortS : longS).push(f); } const prev = S.docs['days/'+addDays(k,-1)]; if (prev?.meals?.length){ const lateMeal = prev.meals.some(m => (m.time||'') >= '21:00'); (lateMeal ? late : early).push(f); } });
  const out = [];
  if (shortS.length >= 3 && longS.length >= 3) out.push(`${tr("После сна меньше 7 ч отёк в среднем")} ${num(avg(shortS),1)}${tr(", после 7+ ч —")} ${num(avg(longS),1)}.`);
  if (late.length >= 3 && early.length >= 3) out.push(`${tr("После еды позже 21:00 —")} ${num(avg(late),1)}${tr(", если ужинал раньше —")} ${num(avg(early),1)}.`);
  return out.length ? out.join(' ') + tr(' Шкала: 1 — нет отёка, 3 — заметный.') : tr('Пока мало пар «сон/еда + отёк» для сравнения. Продолжай отмечать и записывать сон и время еды.');
}
function faceCard(){
  const d = getDay(todayISO());
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Отёк лица утром")}</b>
    <div class="seg">${[[1,tr('Нет')],[2,tr('Лёгкий')],[3,tr('Заметный')]].map(([n,l])=>`<button class="${d.face===n?'on':''}" data-act="setFace" data-v="${n}">${l}</button>`).join('')}</div>
    <div class="hint">${esc(faceInsight())}</div>
    <div class="hint">${tr("Локально жир с лица не сжигается: он уходит вместе с общим процентом жира. Быстрее всего на припухлость влияют соль и еда поздно вечером, недосып и алкоголь. Если припухлость с одной стороны, болит или держится неделями — покажись врачу.")}</div></section>`;
}
A.setFace = el => { haptic('selection'); mutDay(todayISO(), d => { d.face = +el.dataset.v; }); };
function photoCompare(){
  const ps = (S.docs['app/photos']?.list||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  if (ps.length < 2) return '';
  const a = ps[0], b = ps[ps.length-1];
  return `<div class="grid2">${[[tr('Было'),a],[tr('Сейчас'),b]].map(([l,p])=>`<figure style="margin:0;position:relative"><img src="${blobURL('photo_'+p.id)}" alt="${l}: ${fmtShort(p.date)}" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:12px;display:block"><figcaption style="position:absolute;left:8px;bottom:8px;font-size:12px;background:rgba(0,0,0,.65);padding:3px 8px;border-radius:8px">${l} · ${fmtShort(p.date)}</figcaption></figure>`).join('')}</div>`;
}

/* ============ supplements: evidence-based presets ============ */
const isMinor = () => { const a = toNum(profile().age); return !!a && a < 18; };
function suppPresetsHTML(){
  const have = new Set((plan().supps||[]).map(s=>s.name)), minor = isMinor();
  const rest = SUPP_PRESETS.filter(s=>!have.has(s.name) && !(minor && s.adult)); // sports supplements are for adults
  if (!rest.length) return '';
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("С доказанной пользой")}</b><div class="hint">${tr("Справка уже внутри, интернет не нужен. Нажми, чтобы добавить в список.")}</div>${minor ? `<div class="note">${tr('До 18 лет спортивные добавки вроде креатина и кофеина не советуют. Любые добавки лучше обсудить с врачом.')}</div>` : ''}
    ${rest.map(s=>`<button class="row" data-act="suppPreset" data-n="${esc(s.name)}" style="padding:8px 0"><div class="mid"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.dose)} · ${esc(s.what)}</div></div><span class="tag ${s.evidence==='сильная'?'good':s.evidence==='умеренная'?'warn':''}">${esc(tr(s.evidence))}</span></button>`).join('')}</section>`;
}
A.suppPreset = el => { const s = SUPP_PRESETS.find(x=>x.name===el.dataset.n); if (!s) return; const p = clone(plan()); p.supps = p.supps||[]; p.supps.push({...s}); if (!p.dailyTasks.some(t=>t.cat==='supps')) p.dailyTasks.push({id:'supps', title:tr('Принять БАДы'), cat:'supps'}); save('app/plan', p); toast(s.name+tr(' добавлен')); };

/* ============ money: monthly budget ============ */
function budgetCard(m, spentMonth){
  const b = S.docs['app/budget']?.monthly;
  const isCur = m === todayISO().slice(0,7);
  if (!b) return isCur ? `<button class="btn ghost block" data-act="budgetSet">${tr("Задать бюджет на месяц")}</button>` : '';
  const [y, mm] = m.split('-').map(Number), daysIn = new Date(y, mm, 0).getDate();
  const left = b - spentMonth, daysLeft = isCur ? daysIn - new Date().getDate() + 1 : 0;
  const pct = Math.min(100, spentMonth/b*100), over = left < 0;
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${tr("Бюджет")} ${money(b)}</b><button class="link" data-act="budgetSet">${tr("Изменить")}</button></div>
    <div class="bar"><i style="width:${pct}%;background:${over?'var(--bad)':pct>85?'var(--warn)':'var(--accent)'}"></i></div>
    <div class="hint">${over ? `${tr("Перерасход:")} ${money(-left)}` : `${tr("Осталось:")} ${money(left)}${isCur && daysLeft ? ` ${tr("· в день можно")} ${money(Math.floor(left/daysLeft))} ${tr("до конца месяца")}` : ''}`}</div></section>`;
}
A.budgetSet = () => openSheet(tr('Бюджет на месяц'), `<div class="field"><label for="bgV">${tr("Сколько можно тратить в месяц")}</label><input class="in" id="bgV" inputmode="decimal" value="${esc(S.docs['app/budget']?.monthly||'')}"></div><button class="btn block" data-act="budgetSave">${tr("Сохранить")}</button>`, b => $('#bgV', b).focus());
A.budgetSave = () => { const v = toNum(val('bgV')); save('app/budget', {monthly: v || null}); closeSheet(); };

/* ============ reminders → iPhone Calendar (.ics) ============ */
const ICS_ITEMS = [
  ['gym', tr('Тренировки (по дням плана)'), '18:00'],
  ['classes', tr('Пары (за 15 минут)'), ''],
  ...(SUPPS_ON ? [['supps', tr('Принять БАДы'), '09:00']] : []),
  ['weigh', tr('Взвеситься натощак'), '07:30'],
  ['prep', tr('Приготовить еду на завтра'), '21:00'],
  ['bed', tr('Готовиться ко сну'), '23:00'],
  ['week', tr('Воскресенье: итоги недели, копия, статистика соцсетей'), '20:00'],
  ['posts', tr('Запланированные ролики'), '17:00'],
];
A.ics = () => openSheet(tr('Напоминания в Календарь'), () => `<div class="hint">${tr("Приложение создаст файл календаря. Напоминания будут приходить от Календаря iPhone, даже когда приложение закрыто и нет интернета.")}</div>
  <section class="card" style="padding:4px 16px"><div class="list">${ICS_ITEMS.map(([id,l,t])=>`<label class="row"><input type="checkbox" data-ics="${id}" ${id!=='posts'||posts().some(p=>p.date>=todayISO())?'checked':''} style="width:20px;height:20px"><div class="mid"><div class="t">${l}</div></div>${t?`<input class="in" type="time" id="icsT_${id}" value="${t}" style="width:110px" aria-label="${tr("Время:")} ${l}">`:''}</label>`).join('')}</div></section>
  <button class="btn block" data-act="icsGo">${ic('day')}${tr("Создать файл календаря")}</button>
  <div class="note">${tr("Открой файл и нажми «Добавить все». Совет: сначала создай в Календаре отдельный календарь «KAI» и выбери его — тогда при обновлении расписания старые напоминания легко удалить одним действием.")}</div>`);
function icsText(){
  const on = id => $(`[data-ics="${id}"]`)?.checked;
  const tm = id => (val('icsT_'+id) || '09:00').split(':').map(Number);
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const dt = (date, h, m) => date.replace(/-/g,'') + 'T' + pad(h) + pad(m) + '00';
  const escI = s => String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  const BYDAY = ['', 'MO','TU','WE','TH','FR','SA','SU'];
  const ev = [];
  const add = (id, title, date, h, m, dur, rule, alarm=0, desc='') => ev.push(['BEGIN:VEVENT', `UID:${id}@kai-reminders`, `DTSTAMP:${stamp}`, `DTSTART:${dt(date,h,m)}`, `DURATION:PT${dur}M`, `SUMMARY:${escI(title)}`, desc?`DESCRIPTION:${escI(desc)}`:'', rule?`RRULE:${rule}`:'', 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escI(title)}`, `TRIGGER:-PT${alarm}M`, 'END:VALARM', 'END:VEVENT'].filter(Boolean).join('\r\n'));
  const nextDow = n => { for (let i=0;i<7;i++){ const k = addDays(todayISO(), i); if (dow(k)===n) return k; } return todayISO(); };
  const today = todayISO(), pl = plan();
  if (on('gym')) { const [h,m] = tm('gym'); Object.entries(pl.schedule||{}).forEach(([n,w]) => add('gym-'+n, `${tr("Зал · тренировка")} ${tr(w)}`, nextDow(+n), h, m, 75, `FREQ=WEEKLY;BYDAY=${BYDAY[n]}`, 30, (pl.workouts[w]?.ex||[]).map(e=>`${e.sets}×${e.lo}–${e.hi} ${e.name}`).join('\n'))); }
  if (on('classes')) (pl.classes||[]).forEach((c,i) => { const [h,m] = (c.time||'08:00').split(':').map(Number); add('class-'+i, c.title, nextDow(+c.day), h, m, 80, `FREQ=WEEKLY;BYDAY=${BYDAY[c.day]}`, 15); });
  if (on('supps')) { const [h,m] = tm('supps'); add('supps', tr('Принять БАДы'), today, h, m, 5, 'FREQ=DAILY', 0, (pl.supps||[]).map(s=>`${s.name}: ${s.dose||''}`).join('\n')); }
  if (on('weigh')) { const [h,m] = tm('weigh'); add('weigh', tr('Взвеситься натощак и записать вес'), today, h, m, 5, 'FREQ=DAILY', 0); }
  if (on('prep')) { const [h,m] = tm('prep'); add('prep', tr('Приготовить еду на завтра'), today, h, m, 45, 'FREQ=DAILY', 0); }
  if (on('bed')) { const [h,m] = tm('bed'); add('bed', tr('Через 30 минут спать: экран прочь'), today, h, m, 30, 'FREQ=DAILY', 0); }
  if (on('week')) { const [h,m] = tm('week'); add('week', tr('Итоги недели: разбор, резервная копия, статистика соцсетей'), nextDow(7), h, m, 30, 'FREQ=WEEKLY;BYDAY=SU', 0); }
  if (on('posts')) { const [h,m] = tm('posts'); posts().filter(p=>p.date>=today && p.status!=='Опубликовано').forEach(p => add('post-'+p.id, tr('Ролик: ')+p.title, p.date, h, m, 60, '', 60, [p.location?tr('Где: ')+p.location:'', p.hook?tr('Хук: ')+p.hook:''].filter(Boolean).join('\n'))); }
  const enc = new TextEncoder();
  const fold = line => { let out = '', cur = '', bytes = 0; for (const ch of line){ const b = enc.encode(ch).length; if (bytes + b > 73){ out += cur + '\r\n '; cur = ''; bytes = 1; } cur += ch; bytes += b; } return out + cur; };
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KAI//RU','CALSCALE:GREGORIAN','X-WR-CALNAME:KAI', ...ev, 'END:VCALENDAR'].join('\r\n').split('\r\n').map(fold).join('\r\n');
}
A.icsGo = async () => {
  const text = icsText();
  const ok = await shareOrDownload('kai-reminders.ics', new Blob([text], {type:'text/calendar'}));
  if (ok){ setMeta({icsAt: todayISO()}); toast(tr('Файл готов: открой его и нажми «Добавить все»')); }
};

/* ============ sheets ============ */
let SH = null;
function openSheet(title, body, after){ const wasOpen = !!$('#sheetRoot .scrim'); SH = {title, body, after, enter: !wasOpen, opener: wasOpen ? SH?.opener : focusKey(document.activeElement)}; drawSheet(); }
function drawSheet(){
  const root = $('#sheetRoot');
  if (!SH){ root.innerHTML = ''; document.body.style.overflow=''; return; }
  document.body.style.overflow='hidden';
  const prevScroll = $('.sheet')?.scrollTop || 0;
  const fresh = SH.enter, enter = fresh && !reduceMotion(); SH.enter = false;
  root.innerHTML = `<div class="scrim${enter?' enter':''}" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="shT" tabindex="-1"><div class="grab"></div><div class="sh-h"><h2 id="shT">${esc(SH.title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="${tr("Закрыть")}">${ic('x')}</button></div><div class="sh-b" style="display:flex;flex-direction:column;gap:16px">${typeof SH.body==='function'?SH.body():SH.body}</div></div></div>`;
  $('.sheet').scrollTop = prevScroll;
  if (fresh) $('.sheet').focus({preventScroll: true}); // screen readers start at the sheet, not behind it
  SH.after && SH.after($('.sh-b'));
  animateUI($('.sheet'));
}
function closeSheet(){
  const back = SH?.opener;
  SH = null;
  if (back) setTimeout(() => refocus(back), reduceMotion() ? 30 : 230);
  const sc = $('#sheetRoot .scrim');
  if (sc && !reduceMotion()){ sc.classList.add('leave'); document.body.style.overflow=''; setTimeout(()=>{ if (!SH) drawSheet(); }, 200); }
  else drawSheet();
  scheduleRender();
}
const busy = (el, on, label) => { if (!el) return; if (on){ el.dataset.l = el.innerHTML; el.innerHTML = `<span class="spin"></span>${label||tr('Думаю…')}`; el.disabled = true; } else { el.innerHTML = el.dataset.l || el.innerHTML; el.disabled = false; } };
const val = id => $('#'+id)?.value?.trim() ?? '';

/* ============ actions ============ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act==='scrim' && e.target!==el) return;
  const f = A[el.dataset.act]; if (f){ e.preventDefault(); const t0 = performance.now(); f(el, e); if (HAP_AT < t0){ const k = hapDefault(el.dataset.act); if (k) haptic(k); } }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-ch]'); if (!el || !CH[el.dataset.ch]) return;
  const t0 = performance.now(); CH[el.dataset.ch](el, e);
  if (HAP_AT < t0 && (el.tagName === 'SELECT' || ['checkbox', 'radio', 'range'].includes(el.type))) haptic('selection');
});
document.addEventListener('keydown', e => { if (e.key==='Escape' && SH) closeSheet(); });
/* a sheet keeps Tab inside it; closing it returns focus to what opened it, even after the screen redraws */
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !SH) return;
  const sh = $('.sheet'); if (!sh) return;
  const f = $$('button:not([disabled]),a[href],input:not([type=hidden]):not([disabled]),select,textarea,[tabindex="0"]', sh).filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1], a = document.activeElement;
  if (!sh.contains(a) || a === sh){ e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  else if (e.shiftKey && a === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last){ e.preventDefault(); first.focus(); }
});
function focusKey(el){
  if (!el || el === document.body || !el.closest) return null;
  const d = el.dataset || {};
  return {el, sel: d.act ? `[data-act="${d.act}"]` + ['v', 'id', 'k'].filter(k => d[k] != null).map(k => `[data-${k}="${CSS.escape(d[k])}"]`).join('') : el.id ? '#' + CSS.escape(el.id) : null};
}
function refocus(k){
  if (SH) return;
  const el = k.el?.isConnected ? k.el : k.sel && $(k.sel);
  try { el?.focus?.({preventScroll: true}); } catch {}
}

A.tab = el => { if (S.tab !== el.dataset.v){ haptic('selection'); S.animIn = true; } S.tab = el.dataset.v; window.scrollTo(0,0); render(); };
A.sub = el => { if (S.sub[el.dataset.k] !== el.dataset.v){ haptic('selection'); S.animIn = true; } S.sub[el.dataset.k] = el.dataset.v; if (el.dataset.k==='health' || el.dataset.k==='content') window.scrollTo(0,0); if (['health', 'content', 'money'].includes(el.dataset.k)) S.tab = el.dataset.k; render(); /* other keys (prog, fw) switch a card, not the tab */ };
A.closeSheet = closeSheet; A.scrim = closeSheet;
A.toggleOpen = el => { const k = el.dataset.k; S.open[k] = !S.open[k]; if (SH && el.closest('.sheet')) drawSheet(); else render(); };
A.openTask = el => { const k = 't_'+el.dataset.id; S.open[k] = !S.open[k]; render(); };
A.toggleTask = el => {
  const t0 = getDay(todayISO()).tasks.find(x=>x.id===el.dataset.id); if (!t0) return;
  if (!t0.done){ S.fx = {...(S.fx||{}), task: t0.id, t: Date.now()}; burstAt(el); haptic('light'); sound('pop'); }
  else haptic('selection');
  mutDay(todayISO(), d => { const t = d.tasks.find(x=>x.id===el.dataset.id); if (t) t.done = !t.done; });
};
A.goTrain = () => { closeSheetQuiet(); S.tab='health'; S.sub.health='train'; S.sub.w = null; window.scrollTo(0,0); render(); };
A.goFood = () => { closeSheetQuiet(); S.tab='health'; S.sub.health='food'; window.scrollTo(0,0); render(); };
A.goSupps = () => { S.tab='health'; S.sub.health='supps'; window.scrollTo(0,0); render(); };
function closeSheetQuiet(){ if (SH){ SH = null; drawSheet(); } }
A.sick = () => { haptic('medium'); mutDay(todayISO(), d => { d.status = d.status==='sick' ? 'ok' : 'sick'; }); toast(getDay(todayISO()).status==='sick' ? tr('Отметил: болеешь. Серия не сгорит.') : tr('Рад, что ты здоров')); };
A.delTask = el => { mutDay(todayISO(), d => { d.tasks = d.tasks.filter(t=>t.id!==el.dataset.id); }); };
A.dismissY = () => mutDay(addDays(todayISO(),-1), d => { d.carried = true; });
A.carry = el => {
  const w = el.dataset.w;
  mutDay(todayISO(), d => { d.workout = w; if (!d.tasks.some(t=>t.id==='gym')) d.tasks.unshift({id:'gym', title:tr('Зал · Тренировка ')+w+tr(' (перенос)'), cat:'gym', done:false, moved:true}); });
  mutDay(addDays(todayISO(),-1), d => { d.carried = true; });
  toast(tr('Тренировка ')+w+tr(' перенесена на сегодня'));
};
A.carryTasks = () => {
  const y = addDays(todayISO(),-1), yd = getDay(y);
  const list = yd.tasks.filter(t=>!t.done && (t.cat==='custom'||t.moved) && t.id!=='gym');
  mutDay(todayISO(), d => { list.forEach(t => d.tasks.push({...t, id:uid(), done:false, moved:true})); });
  mutDay(y, d => { d.carried = true; });
};
A.addTask = () => openSheet(tr('Новая задача'), `
  <div class="field"><label for="ntT">${tr("Что сделать")}</label><input class="in" id="ntT" placeholder="${tr("например, 100 отжиманий")}"></div>
  <div class="fgrid"><div class="field"><label for="ntQ">${tr("Сколько (необязательно)")}</label><input class="in" id="ntQ" placeholder="${tr("2 ролика, 20 страниц")}"></div>
  <div class="field"><label for="ntD">${tr("Когда")}</label><select class="in" id="ntD"><option value="0">${tr("Сегодня")}</option><option value="1">${tr("Завтра")}</option></select></div></div>
  <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="ntR"> ${tr("Повторять каждый день")}</label>
  <button class="btn block" data-act="saveTask">${tr("Добавить")}</button>`, b => $('#ntT', b).focus());
A.saveTask = () => {
  const title = val('ntT'); if (!title) return toast(tr('Напиши, что сделать'));
  const t = {id:uid(), title, qty:val('ntQ'), cat:'custom'};
  if ($('#ntR').checked){ const p = clone(plan()); p.dailyTasks.push({id:t.id, title: t.qty?`${title} · ${t.qty}`:title, cat:'custom'}); save('app/plan', p); }
  const date = addDays(todayISO(), +val('ntD'));
  mutDay(date, d => { if (!d.tasks.some(x=>x.id===t.id)) d.tasks.push({...t, done:false}); });
  closeSheet(); toast(tr('Задача добавлена'));
};
A.rate = () => { const d = getDay(todayISO()); openSheet(tr('Оценка дня'), `
  <div class="seg" role="radiogroup" aria-label="${tr("Оценка")}">${[1,2,3,4,5].map(n=>`<button class="${d.rating===n?'on':''}" data-act="setRate" data-v="${n}" role="radio" aria-checked="${d.rating===n}">${'★'.repeat(n)}</button>`).join('')}</div>
  <div class="field"><label for="rtN">${tr("Что получилось и что нет")}</label><textarea class="in" id="rtN" placeholder="${tr("Коротко о дне")}">${esc(d.note||'')}</textarea></div>
  <button class="btn block" data-act="saveRate">${tr("Сохранить")}</button>`); };
A.setRate = el => { haptic('selection'); $$('[data-act=setRate]').forEach(b=>b.classList.toggle('on', b===el)); SH.rate = +el.dataset.v; };
A.saveRate = () => { mutDay(todayISO(), d => { if (SH.rate) d.rating = SH.rate; d.note = val('rtN'); }); closeSheet(); toast(tr('День оценён')); };
A.pickW = el => { S.sub.w = el.dataset.v; render(); };
A.finishW = el => {
  const w = el.dataset.v, already = getDay(todayISO()).tasks.some(x=>x.id==='gym' && x.done);
  mutDay(todayISO(), d => { if (!workoutFor(todayISO())) d.workout = w; let t = d.tasks.find(x=>x.id==='gym'); if (!t){ t = {id:'gym', title:tr('Зал · Тренировка ')+w, cat:'gym'}; d.tasks.unshift(t); } t.done = true; });
  if (already) return toast(tr('Тренировка ')+w+tr(' уже засчитана'));
  const sets = Object.values(getDay(todayISO()).sets||{}).flat().filter(s=>s && +s.r>0);
  const vol = sets.reduce((a,s)=>a+(+s.w||0)*(+s.r||0),0), prs = (getDay(todayISO()).prs||[]).length;
  burstAt(el, {n:18});
  celebrate('workout', {text:`${tr("Тренировка")} ${tr(w)} ${tr("засчитана")}${sets.length?`: ${sets.length} ${plural(sets.length,tr('подход'),tr('подхода'),tr('подходов'))}${vol?tr(', объём ')+num(vol)+tr(' кг'):''}`:''}${prs?`${tr(", рекордов:")} ${prs}`:''}`});
};
A.sleepQ = el => mutDay(todayISO(), d => { d.sleepQ = +el.dataset.v; });
A.suppTake = el => { if (!getDay(todayISO()).supps?.[el.dataset.n]){ haptic('light'); burstAt(el, {n:10}); } else haptic('selection'); mutDay(todayISO(), d => { d.supps = d.supps||{}; d.supps[el.dataset.n] = !d.supps[el.dataset.n]; const all = (plan().supps||[]).every(s=>d.supps[s.name]); const t = d.tasks.find(x=>x.id==='supps'); if (t) t.done = all; }); };
A.delSupp = el => { const p = clone(plan()); p.supps.splice(+el.dataset.i,1); save('app/plan', p); };
A.delMeal = el => mutDay(todayISO(), d => { d.meals.splice(+el.dataset.i,1); });
A.mPrev = () => { const [y,m] = S.moneyMonth.split('-').map(Number); const d = new Date(y, m-2, 1); S.moneyMonth = d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };
A.mNext = () => { const [y,m] = S.moneyMonth.split('-').map(Number); const d = new Date(y, m, 1); S.moneyMonth = d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };
A.psf = el => { S.sub.ps = el.dataset.v; render(); };

// a typo like 750 kg or 80 hours of sleep would bend every chart and the calorie advice, so it is not saved
const DAY_LIMITS = {weight: [25, 300], waist: [30, 250], sleep: [0, 16], steps: [0, 100000]};
const dayField = (f, parse=toNum) => el => { const v = parse(el.value), lim = DAY_LIMITS[f];
  if (v != null && lim && (v < lim[0] || v > lim[1])){ toast(tr('Похоже на опечатку, не сохранил:') + ' ' + el.value, {ms: 4000}); el.value = ''; return; }
  return dayFieldSave(f, parse, el); };
const okMeal = m => !!m && !!m.name && +m.kcal >= 0 && +m.kcal <= 5000 && ['p', 'f', 'c'].every(k => !(+m[k] < 0) && !(+m[k] > 500)); // one meal, not a week of food
const okBody = (f, v) => !!v && +v >= DAY_LIMITS[f][0] && +v <= DAY_LIMITS[f][1];
const dayFieldSave = (f, parse, el) => mutDay(todayISO(), d => { d[f] = parse(el.value); if (f==='steps'){ const t = d.tasks.find(x=>x.id==='steps'); if (t && d.steps>=targets().steps) t.done = true; } if (f==='sleep'){ const t = d.tasks.find(x=>x.id==='sleep'); if (t && d.sleep>=7) t.done = true; } });
CH.steps = dayField('steps'); CH.sleep = dayField('sleep'); CH.weight = dayField('weight', v => wIn(toNum(v))); CH.waist = dayField('waist', v => lIn(toNum(v)));
CH.set = el => {
  mutDay(todayISO(), d => { d.sets = d.sets||{}; const a = d.sets[el.dataset.ex] = d.sets[el.dataset.ex]||[]; const i = +el.dataset.i; a[i] = a[i]||{}; a[i][el.dataset.f] = el.dataset.f === 'w' ? wIn(toNum(el.value)) : toNum(el.value); for (let k=0;k<a.length;k++) if (!a[k]) a[k] = {}; });
  if (el.dataset.f === 'r' && toNum(el.value)){ haptic('selection'); const e = Object.values(plan().workouts).flatMap(w=>w.ex).find(x=>x.id===el.dataset.ex); if (e && +el.dataset.i < setsFor(e, todayISO())-1) startRest(restSeconds(e.rest), e.name); }
  checkPR(el.dataset.ex, +el.dataset.i, el);
};
CH.pe = el => { S.sub.pe = el.value; render(); };
CH.fxToggle = el => { setMeta({fx: {...FX(), [el.dataset.k]: el.checked}}); if (el.checked){ if (el.dataset.k === 'sound') sound('pop'); else haptic('success'); } };
CH.bodyPhoto = async el => {
  const f = el.files?.[0]; if (!f) return;
  try { const b = await imageToBlob(f); const id = uid(); await blobPut('photo_'+id, b); const cur = clone(S.docs['app/photos'] || {list:[]}); cur.list.push({id, date:todayISO()}); save('app/photos', cur); toast(tr('Фото сохранено в телефоне')); }
  catch(e){ toast(tr('Фото не сохранилось: мало места?')); }
};

/* ============ TELL ============ */
A.tell = () => { openSheet(tr('Скажи KAI'), () => `
  <div class="hint">${tr("Одним сообщением: что сделал, что съел, что потратил или что изменить в планах. Я покажу, прежде чем что-то менять.")}</div>
  <button class="link" style="align-self:flex-start" data-act="tellHelp" aria-expanded="${!!SH?.tellHelp}">${SH?.tellHelp ? tr('Скрыть примеры') : tr('Что можно написать?')}</button>
  ${SH?.tellHelp ? tellHelpHTML() : ''}
  ${connectNudge(true)}
  <textarea class="in" id="tellT" style="min-height:150px" placeholder="${tr("Что сделал, что съел, что нужно добавить или перенести…")}">${esc(SH?.tellText||'')}</textarea>
  ${provPicker(false)}
  <button class="btn block" data-act="tellGo">${ic('send')}${tr("Разобрать")}</button>
  <div id="tellOut" style="display:flex;flex-direction:column;gap:12px"></div>`, b => { if (!SH.jobId) $('#tellT', b).focus(); }); };
A.tellGo = async () => {
  const text = val('tellT'); if (!text) return toast(tr('Сначала напиши, что было'));
  SH.tellText = text;
  if (carePause(text, 'tellOut', 'tellGo')) return;
  const date = todayISO();
  if (!aiStatus().ok && tellLocal(text, date)) return; // no AI yet: the common things are understood on the phone
  const id = await submitJob('tell', {prompt: tellPrompt(text, date), meta:{date, text}, provider: SH.prov||'auto', label:tr('Разбор · ')+fmtShort(date)});
  queueNow(id, 'tellOut');
};
/* separate from the button so server/eval can test the exact prompt the app sends */
function tellPrompt(text, date){
  const d = getDay(date), pl = plan();
  const w = workoutFor(date), wk = w ? pl.workouts[w] : null;
  const allEx = Object.values(pl.workouts).flatMap(x=>x.ex);
  return `Ты — ассистент в личном приложении-трекере. Пользователь пишет, что сделал, или просит изменить планы. Разбери текст и верни ТОЛЬКО JSON. Отвечай на языке пользователя.
Дата: ${date}, ${DOW_FULL[dow(date)]}, сейчас ${nowHM()}.
${profileBrief()}
Задачи дня (id: название): ${d.tasks.map(t=>t.id+': '+t.title).join('; ')}
Тренировка сегодня: ${wk?wk.name:'по плану нет'}. Упражнения (id: название): ${allEx.map(e=>e.id+': '+e.name).join('; ')}
БАДы в списке: ${(pl.supps||[]).map(s=>s.name).join(', ')||'нет'}
Категории расходов: ${OUT_CATS.map(c=>c[0]).join(', ')}. Категории доходов: ${IN_CATS.map(c=>c[0]).join(', ')}.
${planContext(date)}
Текст пользователя: """${text.slice(0,4000)}"""
Формат ответа:
{"tasks_done":["id"],"tasks_undone":["id"],"new_tasks":[{"title":"","date":"YYYY-MM-DD или null","time":"HH:MM или null"}],"events":[{"title":"","date":"YYYY-MM-DD","from":"HH:MM или null","until":"HH:MM или null","kind":"exam|deadline|event","note":""}],"update_events":[{"id":"","date":null,"from":null,"until":null,"title":null}],"cancel_events":["id"],"move_workouts":[{"from":"YYYY-MM-DD","to":"YYYY-MM-DD или null"}],"time_log":[{"kind":"walk|gym|study","min":0}],"meals":[{"name":"","kcal":0,"p":0,"f":0,"c":0}],"steps":null,"sleep_h":null,"weight":null,"supps_taken":["название из списка"],"sets":[{"ex":"id","w":0,"r":0}],"money":[{"type":"out|in","amount":0,"cat":"категория из списка","note":""}],"sick":null,"rating":null,"warnings":[""],"reply":""}
${isUS() ? 'Пользователь считает в фунтах: если единицы не названы, weight и w в sets — это фунты; в ответе всегда переводи их в килограммы, а в reply пиши фунты. ' : ''}Правила: задача выполнена, только если это прямо сказано (подходы в зале = задача gym). Сказал, что не сделал, — в tasks_undone. Каждый подход — отдельный элемент sets. Еду оцени реалистично для обычных порций (p — белки, f — жиры, c — углеводы в граммах). Неизвестное — null или пустой массив.
Планы: что-то с датой и временем, куда нужно прийти, — events; дело без привязки к месту — new_tasks. Даты бери из календаря выше, «в пятницу» значит ближайшая пятница. Меняй и отменяй только существующие события по их id и только если об этом прямо просят; move_workouts — только по просьбе, to:null значит убрать. Ничего не выдумывай.
warnings — коротко о том, что мешает плану и не видно по времени: тяжёлая нагрузка перед важным днём, мало сна, слишком плотный день. Пересечения по времени проверит приложение, их не пиши. Если всё хорошо, оставь пустым. time_log — только если названо время занятия. reply — 2–3 коротких предложения на «ты»: что понял и один совет.`;
}
function tellLines(r, date){
  const d = getDay(date), allEx = Object.values(plan().workouts).flatMap(x=>x.ex), lines = [];
  const tname = id => d.tasks.find(t=>t.id===id)?.title || id;
  (r.tasks_done||[]).forEach(id=>lines.push('✓ '+tname(id)));
  (r.tasks_undone||[]).forEach(id=>lines.push(tr('✗ не сделано: ')+tname(id)));
  lines.push(...tellPlanLines(r));
  (r.meals||[]).filter(okMeal).forEach(m=>lines.push(`${tr("Еда:")} ${m.name} — ${num(m.kcal)} ${tr("ккал, Б")} ${num(m.p)} ${tr("Ж")} ${num(m.f)} ${tr("У")} ${num(m.c)}`));
  if (okBody('steps', r.steps)) lines.push(tr('Шаги: ')+num(r.steps)); if (okBody('sleep', r.sleep_h)) lines.push(tr('Сон: ')+r.sleep_h+tr(' ч')); if (okBody('weight', r.weight)) lines.push(tr('Вес: ')+W(r.weight)+' '+kgU());
  (r.supps_taken||[]).forEach(s=>lines.push(tr('БАД принят: ')+s));
  (r.sets||[]).forEach(s=>lines.push(`${tr("Подход:")} ${allEx.find(e=>e.id===s.ex)?.name||s.ex} ${s.w?W(s.w)+' '+kgU()+' × ':''}${s.r}`));
  (r.money||[]).forEach(m=>lines.push(`${m.type==='in'?tr('Доход'):tr('Расход')}: ${money(m.amount)} · ${tr(m.cat)}${m.note?' · '+m.note:''}`));
  if (r.sick) lines.push(tr('Статус: болеешь')); if (r.rating) lines.push(tr('Оценка дня: ')+r.rating);
  return lines;
}
function tellView(it){
  const r = it.result, lines = tellLines(r, it.meta.date), alerts = it.done ? [] : [...previewWarnings(r).map(w => w.text), ...(r.warnings||[]).filter(Boolean).map(String)];
  return `<section class="card" style="background:var(--card);display:flex;flex-direction:column;gap:10px"><div class="ai-out">${esc(r.reply||'')}</div>${alerts.length?`<div class="banner" role="status">${ic('alert')}<div>${alerts.map(esc).join('<br>')}</div></div>`:''}${lines.length?`<ul class="ai-list">${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:`<div class="hint">${tr("Не нашёл, что отметить. Опиши подробнее.")}</div>`}</section>${lines.length && !it.done?`<button class="btn block" data-act="tellApply" data-id="${it.id}">${ic('check')}${tr("Применить всё")}</button>`:''}`;
}
A.tellApply = el => {
  const it = S.docs['inbox/'+el.dataset.id]; if (!it || it.done) return; // a second tap before the screen redraws must not log it twice
  const r = it.result, date = it.meta.date, now = new Date();
  // everything this answer can change, kept so one tap can undo it
  const touched = new Set(['days/' + date, 'app/plan', 'app/tasks', 'inbox/' + it.id, 'money/' + date.slice(0, 7)]);
  (r.move_workouts || []).forEach(m => { if (DATE_RE.test(m?.from || '')) touched.add('days/' + m.from); if (DATE_RE.test(m?.to || '')) touched.add('days/' + m.to); });
  UNDO = [...touched].map(p => [p, S.docs[p] === undefined ? undefined : clone(S.docs[p])]);
  mutDay(date, d => {
    (r.tasks_done||[]).forEach(id => { const t = d.tasks.find(x=>x.id===id); if (t) t.done = true; });
    (r.tasks_undone||[]).forEach(id => { const t = d.tasks.find(x=>x.id===id); if (t) t.done = false; });
    (r.meals||[]).filter(okMeal).forEach(m => d.meals.push({name:m.name, kcal:+m.kcal||0, p:+m.p||0, f:+m.f||0, c:+m.c||0, time:pad(now.getHours())+':'+pad(now.getMinutes())}));
    if (okBody('steps', r.steps)) d.steps = +r.steps; if (okBody('sleep', r.sleep_h)) d.sleep = +r.sleep_h; if (okBody('weight', r.weight)) d.weight = +r.weight; // an answer's typo is dropped, like a typed one
    d.supps = d.supps||{}; (r.supps_taken||[]).forEach(s => { const m = (plan().supps||[]).find(x=>x.name.toLowerCase()===String(s).toLowerCase()); if (m) d.supps[m.name] = true; });
    d.sets = d.sets||{}; (r.sets||[]).forEach(s => { const a = d.sets[s.ex] = d.sets[s.ex]||[]; let i = a.findIndex(x=>!x || (!x.r && !x.w)); if (i<0) i = a.length; a[i] = {w:toNum(s.w), r:toNum(s.r)}; });
    if (r.sick) d.status = 'sick'; if (r.rating) d.rating = +r.rating;
    d.log = (d.log||[]).concat([{t:now.toISOString(), text:(it.meta.text||'').slice(0,2000)}]).slice(-20);
  });
  tellPlanApply(r);
  if ((r.money||[]).length) addTx(r.money.map(m=>({id:uid(), date, type:m.type==='in'?'in':'out', amount:Math.abs(+m.amount||0), cat:m.cat, note:m.note||m.cat})));
  save('inbox/'+it.id, {...it, done:true});
  if (SH?.jobId === it.id) closeSheet(); else drawSheet();
  haptic('success'); toast(tr('Готово, всё отмечено'), {icon:'checkc', tone:'good', ms: 6000, action: {label: tr('Вернуть'), act: 'undoApply'}});
};
let UNDO = null;
A.undoApply = () => {
  if (!UNDO) return;
  UNDO.forEach(([p, v]) => { if (v === undefined){ if (S.docs[p] !== undefined) remove(p); } else save(p, v); });
  UNDO = null; hideToast(); haptic('selection'); toast(tr('Отменено, всё как было'));
};

/* ============ FOOD ============ */
function foodSheet(mode){
  openSheet(mode==='photo'?tr('Фото еды'):mode==='text'?tr('Опиши, что ешь'):tr('Из продуктов'), () => {
    if (mode==='manual') return productBuilderHTML();
    return `${mode==='photo' ? `<label class="btn block">${ic('camera')}${tr("Сфоткать или выбрать фото")}<input type="file" accept="image/*" hidden id="fpF" data-ch="foodFile"></label><div id="fpPrev"></div>${imgCapable()?'':`<div class="note">${tr("Фото может разобрать только Claude или ИИ на компьютере с поддержкой картинок. Настрой их в разделе ИИ, а пока фото подождёт в очереди. Или опиши еду текстом.")}</div>`}` : ''}
      <div class="field"><label for="fpC">${mode==='photo'?tr('Комментарий (необязательно)'):tr('Что и сколько')}</label><textarea class="in" id="fpC" placeholder="${mode==='photo'?tr('например, курица 150 г, соус не ел'):tr('например, 2 яйца, 150 г гречки, огурец, кусок хлеба')}"></textarea></div>
      ${provPicker(mode==='photo')}
      <button class="btn block" data-act="foodGo">${ic('spark')}${tr("Посчитать КБЖУ")}</button><div id="fpOut"></div>`;
  });
  SH.mode = mode; SH.needImg = mode==='photo'; SH.rows = []; SH.pq = '';
}
A.foodPhoto = () => foodSheet('photo');
A.foodText = () => foodSheet('text');
A.foodManual = () => foodSheet('manual');
CH.foodFile = el => { const f = el.files?.[0]; if (!f) return; SH.file = f; $('#fpPrev').innerHTML = `<img src="${URL.createObjectURL(f)}" alt="${tr("Выбранное фото")}" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px">`; };
A.foodGo = async () => {
  const comment = val('fpC'); if (!SH.file && !comment) return toast(tr('Добавь фото или описание'));
  if (carePause(comment, 'fpOut', 'foodGo')) return;
  const date = todayISO(), d = getDay(date), e = eaten(d);
  if (!SH.file && !aiStatus().ok && foodLocal(comment, date)) return; // no AI: foods with an amount from the built-in table
  const prompt = `Ты нутрициолог. ${SH.file?'На фото еда, которую пользователь ест или собирается съесть.':'Пользователь описал еду.'} ${comment?`Комментарий/описание: ${tr('«')}${comment}${tr('»')}.`:''}
Определи продукты и реалистичный вес порций в граммах, посчитай КБЖУ по стандартным таблицам. Если видна этикетка — бери цифры с неё.
${profileBrief()}
Уже съедено сегодня: ${num(e.kcal)} ккал, Б ${num(e.p)}, Ж ${num(e.f)}, У ${num(e.c)}.
Верни только JSON: {"name":"короткое название","items":[{"name":"","g":0,"kcal":0,"p":0,"f":0,"c":0}],"kcal":0,"p":0,"f":0,"c":0,"confidence":"низкая|средняя|высокая","verdict":"3–6 слов: вписывается ли в норму","tip":"один конкретный совет, одно предложение"}`;
  const id = await submitJob('food', {prompt, images: SH.file?[SH.file]:[], meta:{date, mult:1}, provider: SH.prov||'auto', label:tr('КБЖУ · ')+(comment.slice(0,30)||tr('фото еды'))});
  queueNow(id, 'fpOut');
};
function foodView(it){
  const r = it.result, k = it.meta.mult || 1;
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><b style="font-size:17px">${esc(r.name)}</b><span class="tag ${r.confidence==='высокая'?'good':r.confidence==='низкая'?'warn':''}">${tr("точность:")} ${esc(tr(r.confidence||'—'))}</span></div>
    <div class="kv"><div><span>${tr("Ккал")}</span><b>${num(r.kcal*k)}</b></div><div><span>${tr("Белки")}</span><b>${num(r.p*k)} ${tr("г")}</b></div><div><span>${tr("Жиры")}</span><b>${num(r.f*k)} ${tr("г")}</b></div><div><span>${tr("Углеводы")}</span><b>${num(r.c*k)} ${tr("г")}</b></div></div>
    <div class="hint">${(r.items||[]).map(i=>`${esc(i.name)} ~${num(i.g*k)} ${tr("г")}`).join(' · ')}</div>
    ${r.verdict?`<div><b>${esc(r.verdict)}.</b> <span class="muted">${esc(r.tip||'')}</span></div>`:''}
    ${it.done?'':`<div class="field"><label>${tr("Порция")}</label><div class="seg">${[0.5,1,1.5,2].map(m=>`<button class="${k===m?'on':''}" data-act="foodMult" data-id="${it.id}" data-v="${m}">×${String(m).replace('.',',')}</button>`).join('')}</div></div>
    <button class="btn block" data-act="foodAdd" data-id="${it.id}">${ic('plus')}${tr("Добавить в дневник")}${it.meta.date!==todayISO()?tr(' за ')+fmtShort(it.meta.date):''}</button>`}</section>`;
}
function rerenderItem(it){ if (SH?.jobId === it.id && $('#'+SH.outId)) $('#'+SH.outId).innerHTML = jobView(it); else drawSheet(); }
A.foodMult = el => { const it = clone(S.docs['inbox/'+el.dataset.id]); it.meta.mult = +el.dataset.v; save('inbox/'+it.id, it); rerenderItem(it); };
A.foodAdd = el => { const it = S.docs['inbox/'+el.dataset.id]; if (!it || it.done) return; UNDO = ['days/' + it.meta.date, 'inbox/' + it.id].map(p => [p, S.docs[p] === undefined ? undefined : clone(S.docs[p])]); const r = it.result, k = it.meta.mult||1, now = new Date(); mutDay(it.meta.date, d => d.meals.push({name:r.name, kcal:Math.round(r.kcal*k), p:Math.round(r.p*k), f:Math.round(r.f*k), c:Math.round(r.c*k), verdict:r.verdict||'', time:pad(now.getHours())+':'+pad(now.getMinutes())})); save('inbox/'+it.id, {...it, done:true}); if (SH?.jobId===it.id) closeSheet(); else drawSheet(); toast(tr('Добавлено в дневник'), {ms: 6000, action: {label: tr('Вернуть'), act: 'undoApply'}}); };
A.foodManualSave = () => { const n = val('fmN'); if (!n) return toast(tr('Напиши, что съел')); const now = new Date(); mutDay(todayISO(), d => d.meals.push({name:n, kcal:toNum(val('fmK'))||0, p:toNum(val('fmP'))||0, f:toNum(val('fmF'))||0, c:toNum(val('fmC'))||0, time:pad(now.getHours())+':'+pad(now.getMinutes())})); closeSheet(); toast(tr('Добавлено')); };

A.menu = () => {
  const t = targets();
  if (!t.ok) return A.profile();
  openSheet(tr('Меню на завтра'), () => `<div class="hint">${tr("Меню на день под твою норму из простых продуктов, с заготовкой вечером и списком покупок.")}</div>
    <div class="field"><label for="mnW">${tr("Пожелания (необязательно)")}</label><input class="in" id="mnW" placeholder="${tr("например, без рыбы, недорого")}"></div>
    ${provPicker(false)}<button class="btn block" data-act="menuGo">${ic('spark')}${tr("Составить")}</button><div id="mnOut"></div>`);
};
A.menuGo = async () => {
  const t = targets();
  const prompt = `Составь меню на 1 день: ${{lose: 'сброс жира с сохранением мышц', keep: 'поддержание веса и сытная простая еда', gain: 'постепенный набор массы'}[t.aim] || 'поддержание веса и сытная простая еда'}.
${profileBrief()}
Норма: ${t.kcal} ккал, белок ${t.p} г, жиры ${t.f} г, углеводы ${t.c} г (суммы в пределах ±5%). 3–5 приёмов пищи.
Только простые доступные продукты, с учётом ограничений из профиля, например: яйца, курица, говядина, гречка, рис, овсянка, картофель, творог, греческий йогурт, сметана, кефир, овощи, фрукты, хлеб, бобовые. Всё готовится вечером за 40–60 минут и хранится в контейнерах; утром только разогреть или взять с собой. Бюджет студента.
Пожелания: ${val('mnW')||'нет'}.
Верни только JSON: {"meals":[{"name":"Завтрак: …","items":["150 г творога 5%","…"],"kcal":0,"p":0,"f":0,"c":0}],"prep":["шаг заготовки вечером"],"shop":["продукт — сколько на 7 дней"],"note":"одно предложение: что поменять, если голоден"}`;
  const id = await submitJob('menu', {prompt, provider: SH.prov||'auto', label:tr('Меню на день')});
  queueNow(id, 'mnOut');
};

/* ============ SUPPS ============ */
A.addSupp = async () => {
  const name = val('suppName'); if (!name) return toast(tr('Напиши название'));
  const prompt = `Пользователь добавляет БАД в трекер: ${tr('«')}${name}${tr('»')}. Дай краткую справку по общепринятым данным (инструкции производителей, обзоры исследований).
${profileBrief()}
Верни только JSON: {"name":"нормализованное название на русском","what":"зачем он и работает ли по исследованиям, 1–2 предложения","dose":"типичная доза","timing":"когда принимать","withFood":"с едой или натощак","evidence":"сильная|умеренная|слабая","cautions":"с чем осторожно, 1 предложение"}`;
  if (!(await submitJob('supp', {prompt, label:tr('БАД: ')+name}))) return;
  $('#suppName').value = '';
  $('#suppOut').innerHTML = `<div class="note">${tr("Запрос про «")}${esc(name)}${tr("» отправлен. Если ИИ сейчас недоступен, справка придёт позже. Добавить без справки можно кнопкой ниже.")}</div><button class="btn ghost" data-act="addSuppPlain" data-n="${esc(name)}">${tr("Добавить без справки")}</button>`;
};
A.addSuppPlain = el => { const name = el.dataset.n; if (!name) return; const p = clone(plan()); p.supps = p.supps||[]; if (!p.supps.some(s=>s.name===name)) p.supps.push({name, dose:'', timing:''}); save('app/plan', p); };

/* ============ PROFILE / SEASON / BACKUP ============ */
A.profile = () => openSheet(tr('Профиль и план'), profileBody, showStorage);
async function showStorage(){
  const el = $('#storeInfo'); if (!el || !navigator.storage?.estimate) return;
  try { const e = await navigator.storage.estimate(); const persisted = await navigator.storage.persisted?.(); const gb = v => (v/1073741824).toFixed(v > 1073741824 ? 1 : 2); el.textContent = `${tr("Занято")} ${gb(e.usage||0)} ${tr("ГБ из доступных")} ${gb(e.quota||0)} ${tr("ГБ")}${persisted ? tr(' · iOS не удалит данные сама') : ''}.`; } catch {}
}
function profileBody(){
  const p = profile(), t = targets(), pl = plan(), c = content();
  return `${modulesCard()}${programCard()}<section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Данные для расчёта нормы")}</b>
    <div class="fgrid">
      <div class="field"><label for="pfN">${tr("Имя")}</label><input class="in" id="pfN" value="${esc(p.name||'')}"></div>
      <div class="field"><label for="pfA">${tr("Возраст")}</label><input class="in" id="pfA" inputmode="numeric" value="${esc(p.age||'')}"></div>
      <div class="field"><label for="pfH">${tr("Рост, см")}</label><input class="in" id="pfH" inputmode="decimal" value="${esc(p.height||'')}"></div>
      <div class="field"><label for="pfW">${tr("Вес, кг")}</label><input class="in" id="pfW" inputmode="decimal" value="${esc(p.weight||'')}"></div>
      <div class="field"><label for="pfWa">${tr("Талия, см")}</label><input class="in" id="pfWa" inputmode="decimal" value="${esc(p.waist||'')}"></div>
      <div class="field"><label for="pfAc">${tr("Активность")}</label><select class="in" id="pfAc">${[[1.35,tr('Учёба сидя + 3 тренировки')],[1.45,tr('+ 8–10 тыс. шагов')],[1.6,tr('+ 12 тыс. шагов и больше')]].map(([v,l])=>`<option value="${v}" ${(+p.activity||1.45)===v?'selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    ${t.ok?`<div class="note">${tr("Норма сейчас:")} <b>${t.kcal} ${tr("ккал")}</b> ${tr("· белок")} ${t.p} ${tr("г · жиры")} ${t.f} ${tr("г · углеводы")} ${t.c} ${tr("г. Расход ~")}${t.tdee} ${tr("ккал, дефицит")} ${t.deficit} ${tr("ккал (≈0,5% веса в неделю).")}</div>`:`<div class="hint">${tr("После сохранения норма рассчитается сама.")}</div>`}
  </section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Дни тренировок")}</b>
    <div class="fgrid" style="grid-template-columns:repeat(auto-fit,minmax(90px,1fr))">${[1,2,3,4,5,6,7].map(n=>`<div class="field"><label for="sch${n}">${DOW[n]}</label><select class="in" id="sch${n}"><option value="">${tr("отдых")}</option>${Object.keys(pl.workouts).map(k=>`<option ${pl.schedule?.[n]===k?'selected':''}>${k}</option>`).join('')}</select></div>`).join('')}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Расписание пар")}</b>
    <div id="clsList" style="display:flex;flex-direction:column;gap:8px">${(pl.classes||[]).map((c,i)=>clsRow(c,i)).join('')}</div>
    <button class="btn ghost" data-act="clsAdd">${ic('plus')}${tr("Добавить пару")}</button></section>
  <section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Задачи каждый день")}</b>
    ${(pl.dailyTasks||[]).map((t,i)=>`<div style="display:flex;gap:8px;align-items:center"><span style="flex:1">${esc(t.title)}</span><button class="iconbtn" data-act="dtDel" data-i="${i}" aria-label="${tr("Убрать")} ${esc(t.title)}" style="color:var(--text-3)">${ic('trash')}</button></div>`).join('')}
    <div style="display:flex;gap:8px"><input class="in" id="dtNew" placeholder="${tr("Новая ежедневная задача")}"><button class="btn" data-act="dtAdd" aria-label="${tr("Добавить")}">${ic('plus')}</button></div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr("Контент")}</b><div class="field"><label for="pfWT">${tr("Цель роликов в неделю")}</label><input class="in" id="pfWT" inputmode="numeric" value="${c.weeklyTarget||4}"></div></section>
  <button class="btn block" data-act="profileSave">${tr("Сохранить")}</button>
  <section class="card" style="display:flex;flex-direction:column;gap:4px"><b>${tr("Отклик")}</b>
    ${[['haptics',tr('Вибрация при действиях'),tr('На iPhone нужна iOS 18 или новее')],['sound',tr('Звуки'),tr('Короткий звук при отметке и наградах')]].map(([k,l,h])=>`<label class="row" style="padding:10px 0"><div class="mid"><div class="t">${l}</div><div class="s">${h}</div></div><input type="checkbox" switch class="sw" data-ch="fxToggle" data-k="${k}" ${FX()[k]?'checked':''}></label>`).join('')}</section>
  <section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Данные и резервная копия")}</b>
    <div class="hint">${tr("Всё хранится в этом телефоне. Раз в неделю сохраняй копию в «Файлы» или iCloud: если iOS очистит память, данные можно будет вернуть.")}</div>
    <div id="storeInfo" class="hint"></div>
    <div class="btnrow"><button class="btn ghost" data-act="exportData">${tr("Сохранить копию")}</button><label class="btn ghost">${tr("Загрузить копию")}<input type="file" accept="application/json,.json" hidden data-ch="importData"></label></div>
    <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="expPhotos"> ${tr("Включить фото формы в копию")}</label>
    <button class="btn ghost" data-act="chatReport">${tr("Скопировать отчёт для чата с Claude")}</button>
    <button class="btn ghost" data-act="ics">${ic('day')}${tr("Напоминания в Календарь iPhone")}</button></section>`;
}
function clsRow(c, i){ return `<div class="fgrid cls" data-i="${i}" style="grid-template-columns:70px 90px 1fr 40px;gap:6px;align-items:center"><select class="in" aria-label="${tr("День")}" data-f="day">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${+c.day===n?'selected':''}>${DOW[n]}</option>`).join('')}</select><input class="in" aria-label="${tr("Время")}" type="time" data-f="time" value="${esc(c.time||'08:00')}"><input class="in" aria-label="${tr("Предмет и аудитория")}" data-f="title" value="${esc(c.title||'')}" placeholder="${tr("Предмет, ауд.")}"><button class="iconbtn" data-act="clsDel" data-i="${i}" aria-label="${tr("Удалить пару")}" style="color:var(--text-3)">${ic('trash')}</button></div>`; }
function readClasses(){ return $$('.cls').map(r=>({day:+$('[data-f=day]',r).value, time:$('[data-f=time]',r).value, title:$('[data-f=title]',r).value.trim()})).filter(c=>c.title); }
A.clsAdd = () => { const list = $('#clsList'); list.insertAdjacentHTML('beforeend', clsRow({day:1,time:'08:00',title:''}, list.children.length)); };
A.clsDel = el => el.closest('.cls').remove();
A.dtDel = el => { const p = clone(plan()); p.dailyTasks.splice(+el.dataset.i,1); save('app/plan', p); drawSheet(); };
A.dtAdd = () => { const t = val('dtNew'); if (!t) return; const p = clone(plan()); p.dailyTasks.push({id:uid(), title:t, cat:'custom'}); save('app/plan', p); drawSheet(); };
A.profileSave = () => {
  const p = {...clone(profile()), name:val('pfN'), age:toNum(val('pfA')), height:toNum(val('pfH')), weight:toNum(val('pfW')), waist:toNum(val('pfWa')), activity:toNum(val('pfAc'))};
  save('app/profile', p);
  const pl = clone(plan()); pl.schedule = {}; [1,2,3,4,5,6,7].forEach(n=>{ const v = $('#sch'+n).value; if (v) pl.schedule[n] = v; }); pl.classes = readClasses(); if (pl.programs?.[pl.program]) pl.programs[pl.program].schedule = clone(pl.schedule); save('app/plan', pl);
  const c = clone(content()); c.weeklyTarget = toNum(val('pfWT'))||4; save('app/content', c);
  if (p.weight) mutDay(todayISO(), d => { if (d.weight==null) d.weight = p.weight; if (d.waist==null && p.waist) d.waist = p.waist; });
  closeSheet(); toast(tr('Сохранено'));
};
async function shareOrDownload(name, blob){
  if (isNative()){
    try {
      const {uri} = await plug('Filesystem').writeFile({path: name, data: await blobToB64(blob), directory: 'CACHE'});
      await plug('Share').share({title: name, url: uri});
      return true;
    } catch(e){ if (!/cancel/i.test(String(e?.message))) toast(tr('Файл не сохранился')); return false; }
  }
  if (S.inClaude){
    if (!DL_CAP){ toast(tr('Сохранение файлов здесь недоступно. Сделай это в установленной версии.')); return false; }
    try { await DL_CAP.save({filename: name, data: blob}); return true; }
    catch(e){ if (e?.code === 'rejected_extension' || e?.code === 'extension_not_enabled') toast(tr('Такой файл здесь не сохранить. Сделай это в установленной версии приложения.')); else if (e?.code !== 'declined') toast(tr('Файл не сохранился')); return false; }
  }
  try { const file = new File([blob], name, {type: blob.type}); if (navigator.canShare && navigator.canShare({files:[file]})) { await navigator.share({files:[file], title:name}); return true; } }
  catch(e){ if (e && e.name === 'AbortError') return false; }
  downloadFile(name, blob); return true;
}
function downloadFile(name, blob){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
A.exportData = async () => {
  const docs = {}; Object.entries(S.docs).forEach(([k,v]) => { if (!k.startsWith('jobs/')) docs[k] = v; });
  if (docs['app/ai']) docs['app/ai'] = {...docs['app/ai'], claude:{...docs['app/ai'].claude, key:''}, openai:{...(docs['app/ai'].openai||{}), key:''}};
  const blobs = {};
  if ($('#expPhotos')?.checked) for (const p of (S.docs['app/photos']?.list||[])) { const b = await blobGet('photo_'+p.id); if (b) blobs['photo_'+p.id] = {type:b.type, b64: await blobToB64(b)}; }
  const ok = await shareOrDownload(`kai-backup-${todayISO()}.json`, new Blob([JSON.stringify({app:'kai', version:1, exported:new Date().toISOString(), docs, blobs})], {type:'application/json'}));
  if (ok){ setMeta({lastBackup: todayISO()}); toast(tr('Копия готова: сохрани её в «Файлы» или iCloud')); }
};
CH.importData = async el => {
  const f = el.files?.[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const docs = d.docs || d; let n = 0;
    for (const [k, v] of Object.entries(docs)) { if (!/^[a-z]+\/[^/]+$/.test(k) || k.startsWith('jobs/')) continue; if (k === 'app/ai' && S.docs['app/ai']) { const cur = S.docs['app/ai']; save(k, {...v, claude:{...v.claude, key: cur.claude?.key||''}}); } else save(k, langDoc(k, v)); n++; }
    for (const [k, v] of Object.entries(d.blobs||{})) { const bin = Uint8Array.from(atob(v.b64), c=>c.charCodeAt(0)); await blobPut(k, new Blob([bin], {type:v.type})); }
    setMeta({imported:true}); initBadges(); toast(tr('Загружено записей: ')+n); closeSheet();
  } catch(e){ toast(tr('Файл не подошёл: это не копия этого приложения')); }
};
A.chatReport = async () => {
  const text = weekReportText() + tr('\n\nРазбери неделю: что получилось, что нет, что изменить в плане. Если что-то меняешь в плане — пришли обновление файлом для импорта в приложение.');
  try { await navigator.clipboard.writeText(text); toast(tr('Отчёт скопирован: вставь его в чат с Claude')); } catch { shareOrDownload('report.txt', new Blob([text], {type:'text/plain'})); }
};
A.season = () => openSheet(tr('Сезон'), seasonBody);
function seasonBody(){
  const s = season(), keys = dayKeys().filter(k=>k>=s.start);
  const sick = keys.filter(k=>S.docs['days/'+k].status==='sick').length;
  const scored = keys.map(k=>S.docs['days/'+k]).filter(d=>d.status!=='sick' && dayScore(d)!=null);
  const avg = scored.length ? scored.reduce((a,d)=>a+dayScore(d),0)/scored.length : 0;
  const end = addDays(s.start, (s.length||90) + sick - 1);
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="field"><label for="snT">${tr("Название")}</label><input class="in" id="snT" value="${esc(s.title)}"></div>
    <div class="fgrid"><div class="field"><label for="snS">${tr("Начало")}</label><input class="in" type="date" id="snS" value="${esc(s.start)}"></div><div class="field"><label for="snL">${tr("Длина, дней")}</label><input class="in" id="snL" inputmode="numeric" value="${s.length||90}"></div></div>
    <div class="field"><label for="snG">${tr("Цели (по одной в строке)")}</label><textarea class="in" id="snG">${esc((s.goals||[]).join('\n'))}</textarea></div>
    <div class="note">${tr("Конец сезона:")} ${fmtDay(end)}${sick?` ${tr("(продлён на")} ${sick} ${plural(sick,tr('день'),tr('дня'),tr('дней'))} ${tr("болезни)")}`:''}${tr(". Выполнение в среднем")} ${Math.round(avg*100)}%.</div>
    <button class="btn block" data-act="seasonSave">${tr("Сохранить")}</button></section>
  <section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Завершить сезон")}</b><div class="hint">${tr("Итоги сохранятся в архив, дневник дней очистится, и начнётся новый сезон с сегодняшнего дня. Деньги, контент и база знаний останутся.")}</div>
    <button class="btn danger" data-act="seasonEnd" id="snEnd">${tr("Завершить и начать новый")}</button></section>
  ${Object.keys(S.docs).some(k=>k.startsWith('seasons/'))?`<section class="card"><b>${tr("Архив")}</b>${Object.entries(S.docs).filter(([k])=>k.startsWith('seasons/')).map(([k,v])=>`<div class="row"><div class="mid"><div class="t">${esc(v.title)}</div><div class="s">${fmtShort(v.start)} — ${fmtShort(v.end)} ${tr("· выполнение")} ${v.avg}${tr("% · тренировок")} ${v.gym}${v.w0&&v.w1?` ${tr("· вес")} ${v.w0} → ${v.w1} ${tr("кг")}`:''}</div></div></div>`).join('')}</section>`:''}`;
}
A.seasonSave = () => { save('app/season', {...season(), title:val('snT'), start:val('snS')||season().start, length:toNum(val('snL'))||90, goals:val('snG').split('\n').map(x=>x.trim()).filter(Boolean)}); closeSheet(); toast(tr('Сезон сохранён')); };
A.seasonEnd = async el => {
  if (!SH.confirmEnd){ SH.confirmEnd = true; el.textContent = tr('Точно? Нажми ещё раз — дни сезона удалятся'); return; }
  const s = season(), keys = dayKeys();
  const ds = keys.map(k=>S.docs['days/'+k]);
  const scored = ds.filter(d=>d.status!=='sick' && dayScore(d)!=null);
  const ws = ds.filter(d=>toNum(d.weight));
  save('seasons/'+uid(), {title:s.title, start:s.start, end:todayISO(), goals:s.goals||[], avg: scored.length?Math.round(scored.reduce((a,d)=>a+dayScore(d),0)/scored.length*100):0, gym: ds.filter(d=>d.tasks?.some(t=>t.id==='gym'&&t.done)).length, w0: ws[0]?.weight||null, w1: ws[ws.length-1]?.weight||null});
  busy(el, true, tr('Архивирую…'));
  for (const k of keys) remove('days/'+k);
  const n = Object.keys(S.docs).filter(k=>k.startsWith('seasons/')).length + 1;
  save('app/season', {title:tr('Сезон ')+n, start:todayISO(), length:90, goals:s.goals||[]});
  closeSheet(); toast(tr('Новый сезон начался'));
};

/* ============ CONTENT ============ */
A.platform = el => { const id = el.dataset.id; openSheet(PL[id].name, () => platformBody(id)); SH.pid = id; };
function platformBody(id){
  const c = content(), p = c.platforms?.[id] || {}, f = followersOf(id), an = analyses().filter(a=>a.platform===id);
  return `<div class="fgrid"><div class="field"><label for="plN">${tr("Ник")}</label><input class="in" id="plN" value="${esc(p.nick||'')}" placeholder="@nick"></div><div class="field"><label for="plG">${tr("Цель и срок")}</label><input class="in" id="plG" value="${esc(p.goal||'')}" placeholder="${tr("10 000 к марту")}"></div></div>
  <div class="field"><label for="plT">${tr("Тема канала")}</label><input class="in" id="plT" value="${esc(p.topic||'')}" placeholder="${tr("о чём ты там снимаешь")}"></div>
  <div class="field"><label for="plF">${tr("Подписчиков сейчас")}</label><div style="display:flex;gap:8px"><input class="in" id="plF" inputmode="numeric" placeholder="${f.length?f[f.length-1].v:'0'}"><button class="btn" data-act="plSave">${tr("Сохранить")}</button></div></div>
  <section class="card">${lineChart(f.map(x=>({x:fmtShort(x.d), y:x.v})), {c:PL[id].c, id:'pf', label:tr('Подписчики'), empty:tr('Внеси число подписчиков хотя бы дважды, чтобы увидеть рост.')})}</section>
  <button class="btn block" data-act="statsUpload" data-p="${id}">${ic('image')}${tr("Загрузить статистику")}</button>
  ${an.length?`<section class="card" style="padding:4px 18px"><div class="list">${an.map(anRow).join('')}</div></section>`:''}`;
}
A.plSave = () => {
  const id = SH.pid, c = clone(content()); c.platforms = c.platforms||{}; const p = c.platforms[id] = c.platforms[id]||{followers:[]};
  p.nick = val('plN'); p.topic = val('plT'); p.goal = val('plG');
  const f = toNum(val('plF')); if (f!=null){ p.followers = (p.followers||[]).filter(x=>x.d!==todayISO()); p.followers.push({d:todayISO(), v:f}); }
  save('app/content', c); drawSheet(); toast(tr('Сохранено'));
};
A.statsUpload = el => {
  const pre = el.dataset.p || 'instagram';
  openSheet(tr('Разбор статистики'), () => `
    <div class="field"><label>${tr("Площадка")}</label><div class="seg">${PLATFORMS.map(p=>`<button class="${p.id===SH.stP?'on':''}" data-act="stP" data-v="${p.id}">${p.short}</button>`).join('')}</div></div>
    <div class="field"><label>${tr("Что загружаешь")}</label><div class="seg"><button class="${SH.stK==='30d'?'on':''}" data-act="stK" data-v="30d">${tr("Статистика 30 дней")}</button><button class="${SH.stK==='reel'?'on':''}" data-act="stK" data-v="reel">${tr("Один ролик")}</button></div></div>
    <label class="btn ghost block">${ic('image')}${tr("Выбрать скриншоты")}<input type="file" accept="image/*" multiple hidden data-ch="stFiles"></label><div id="stPrev" class="hint">${SH.files?.length?tr('Выбрано скриншотов: ')+SH.files.length:''}</div>
    <div class="field"><label for="stC">${tr("Комментарий или цифры")}</label><textarea class="in" id="stC" placeholder="${tr("например, ролик про утреннюю рутину, снимал дома")}"></textarea></div>
    ${provPicker(!!SH.files?.length)}
    <button class="btn block" data-act="stGo">${ic('spark')}${tr("Разобрать")}</button><div id="stOut" style="display:flex;flex-direction:column;gap:12px"></div>`);
  SH.stP = pre; SH.stK = '30d'; SH.files = []; drawSheet();
};
A.stP = el => { SH.stP = el.dataset.v; $$('[data-act=stP]').forEach(b=>b.classList.toggle('on', b===el)); };
A.stK = el => { SH.stK = el.dataset.v; $$('[data-act=stK]').forEach(b=>b.classList.toggle('on', b===el)); };
CH.stFiles = el => { SH.files = [...(el.files||[])]; SH.needImg = SH.files.length>0; $('#stPrev').textContent = SH.files.length ? tr('Выбрано скриншотов: ')+SH.files.length : ''; const f = $('[data-act=pickProv]')?.closest('.field'); if (f) f.outerHTML = provPicker(SH.needImg); };
A.stGo = async () => {
  const pid = SH.stP, kind = SH.stK, cm = val('stC');
  if (!SH.files.length && !cm) return toast(tr('Добавь скриншоты или цифры'));
  const c = content(), p = c.platforms?.[pid] || {};
  const prev = analyses().filter(a=>a.platform===pid).slice(0,3);
  const prompt = `Ты — аналитик соцсетей и продюсер коротких видео. ${SH.files.length?'На скриншотах':'В тексте'} статистика ${PL[pid].name}: ${kind==='reel'?'одного ролика':'аккаунта за 30 дней'}.
Автор: студент, фитнес и личное развитие, снимает и монтирует сам, публикует 1–2 раза в неделю, хочет 3–4. Ник: ${p.nick||'не указан'}. Тема: ${p.topic||'не указана'}. Цель: ${p.goal||'не указана'}.
Комментарий автора: ${cm||'нет'}
Прошлые выводы по этой площадке: ${prev.map(a=>a.date+': '+a.summary+' Менять: '+(a.change||[]).join('; ')).join(' | ')||'нет'}
Извлеки цифры и дай разбор. Не выдумывай цифр, которых нет. Верни только JSON:
{"followers":число или null,"metrics":{"Название метрики":"значение"},"summary":"2 предложения","good":["что работает"],"bad":["что плохо"],"retention":"где уходит зритель и почему, если есть данные об удержании, иначе пустая строка","change":["конкретное изменение для следующих роликов"],"ideas":[{"title":"идея ролика","hook":"первая фраза"}]}
До 8 метрик, по 2–4 пункта в списках, 3 идеи.`;
  const id = await submitJob('stats', {prompt, images: SH.files.slice(0,8), meta:{platform:pid, kind, note:cm}, provider: SH.prov||'auto', label:tr('Статистика ')+PL[pid].name});
  queueNow(id, 'stOut');
};
function analysisHTML(a){
  const L = (t, arr) => arr?.length ? `<div><b>${t}</b><ul class="ai-list">${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="ai-out">${esc(a.summary||'')}</div>
    ${a.metrics&&Object.keys(a.metrics).length?`<div class="kv">${Object.entries(a.metrics).map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`:''}
    ${L(tr('Что работает'), a.good)}${L(tr('Что плохо'), a.bad)}
    ${a.retention?`<div><b>${tr("Где уходит зритель")}</b><div class="muted" style="margin-top:4px">${esc(a.retention)}</div></div>`:''}
    ${L(tr('Что меняем'), a.change)}
    ${a.ideas?.length?`<div><b>${tr("Идеи следующих роликов")}</b>${a.ideas.map(i=>`<div style="display:flex;gap:10px;align-items:center;margin-top:8px"><div style="flex:1"><div>${esc(i.title)}</div><div class="hint">${tr("Хук:")} ${esc(i.hook)}</div></div><button class="btn ghost" data-act="ideaToScript" data-t="${esc(i.title)}" data-h="${esc(i.hook)}" data-p="${a.platform}">${tr("В сценарий")}</button></div>`).join('')}</div>`:''}
  </section>`;
}
A.analysis = el => { const a = analyses().find(x=>x.id===el.dataset.id); if (!a) return; openSheet(`${PL[a.platform]?.name||''} · ${fmtShort(a.date)}`, analysisHTML(a) + `<button class="btn danger" data-act="anDel" data-id="${a.id}">${ic('trash')}${tr("Удалить разбор")}</button>`); };
A.anDel = el => { remove('analyses/'+el.dataset.id); closeSheet(); };
A.ideaToScript = el => { A.newScript(el); setTimeout(()=>{ $('#scT').value = el.dataset.t + (el.dataset.h ? tr('. Хук: ')+el.dataset.h : ''); SH.scP = [el.dataset.p]; $$('[data-act=scP]').forEach(b=>b.classList.toggle('on', b.dataset.v===el.dataset.p)); }); };
A.newScript = () => {
  const pd = SH?.planDate || '';
  openSheet(tr('Новый сценарий'), () => `
    <div class="field"><label>${tr("Площадки")}</label><div class="pills" style="margin:0;padding:0">${PLATFORMS.map(p=>`<button class="pill ${(SH.scP||[]).includes(p.id)?'on':''}" data-act="scP" data-v="${p.id}">${p.name}</button>`).join('')}</div></div>
    <div class="field"><label for="scT">${tr("Тема или идея")}</label><textarea class="in" id="scT" placeholder="${tr("Оставь пустым — ИИ предложит сам, исходя из твоих тем и статистики")}"></textarea></div>
    <div class="fgrid"><div class="field"><label for="scL">${tr("Длина")}</label><select class="in" id="scL"><option>${tr("15–30 секунд")}</option><option selected>${tr("30–60 секунд")}</option><option>${tr("1–3 минуты")}</option><option>${tr("8–12 минут (YouTube)")}</option></select></div>
    <div class="field"><label for="scW">${tr("Где снимать")}</label><input class="in" id="scW" placeholder="${tr("дома, зал, улица")}"></div></div>
    ${provPicker(false)}
    <button class="btn block" data-act="scGo">${ic('spark')}${tr("Написать сценарий")}</button><div id="scOut"></div>`);
  SH.scP = ['instagram','tiktok']; SH.planDate = pd; drawSheet();
};
A.scP = el => { const v = el.dataset.v; SH.scP = SH.scP.includes(v) ? SH.scP.filter(x=>x!==v) : [...SH.scP, v]; el.classList.toggle('on'); };
A.scGo = async () => {
  const c = content(), an = analyses().slice(0,6);
  const prompt = `Ты — продюсер коротких вертикальных видео. Напиши сценарий ролика на русском.
Автор: ${profile().name||'без имени'}. ${profile().about||''} Снимает и монтирует сам на телефон, снимает где придётся (дома, в гостях, в зале, на улице).
Площадки: ${(SH.scP||[]).map(id=>`${PL[id].name} (тема: ${c.platforms?.[id]?.topic||'не указана'})`).join(', ')}.
Идея: ${val('scT')||'предложи сам, исходя из тем и выводов ниже'}. Длина: ${val('scL')}. Где снимать: ${val('scW')||'на выбор'}.
Выводы из статистики автора: ${an.map(a=>`[${PL[a.platform]?.name}] работает: ${(a.good||[]).join('; ')}; менять: ${(a.change||[]).join('; ')}`).join(' | ')||'статистики пока нет'}
Сценарий должен удерживать с первой секунды и быть реалистичным для съёмки одному на телефон.
Верни только JSON: {"title":"","hook":"первые 1–2 секунды: фраза и что в кадре","beats":[{"t":"0–3 с","shot":"что в кадре","say":"текст или титр"}],"caption":"описание к посту","hashtags":["#…"],"location":"где снимать","props":"что понадобится","cta":"призыв в конце","why":"почему это удержит зрителя, одно предложение"}`;
  const id = await submitJob('script', {prompt, meta:{platforms:SH.scP, planDate:SH.planDate||''}, provider: SH.prov||'auto', label:tr('Сценарий: ')+(val('scT').slice(0,30)||tr('новая идея'))});
  queueNow(id, 'scOut');
};
A.newPost = () => { const id = uid(); save('posts/'+id, {title:tr('Новая идея'), status:'Идея', platforms:['instagram'], date:SH?.planDate||'', created:new Date().toISOString()}); openPostSheet(id); };
A.planDay = el => {
  const d = el.dataset.d, free = posts().filter(p=>!p.date && p.status!=='Опубликовано');
  openSheet(tr('Ролик на ')+fmtShort(d), `${free.length?`<div class="hint">${tr("Выбери готовый сценарий или идею:")}</div><section class="card" style="padding:4px 18px"><div class="list">${free.map(p=>`<button class="row" data-act="assignPost" data-id="${p.id}" data-d="${d}"><span class="ic">${ic('video')}</span><div class="mid"><div class="t">${esc(p.title)}</div><div class="s">${esc(tr(p.status))}</div></div>${ic('plus')}</button>`).join('')}</div></section>`:''}
    <div class="btnrow"><button class="btn" data-act="newScript">${ic('spark')}${tr("Новый сценарий")}</button><button class="btn ghost" data-act="newPost">${tr("Своя идея")}</button></div>`);
  SH.planDate = d;
};
A.assignPost = el => { const p = clone(S.docs['posts/'+el.dataset.id]); p.date = el.dataset.d; save('posts/'+el.dataset.id, p); closeSheet(); toast(tr('Поставлено на ')+fmtShort(el.dataset.d)); };
A.openPost = el => openPostSheet(el.dataset.id);
function openPostSheet(id){
  const p = S.docs['posts/'+id]; if (!p) return toast(tr('Сценарий ещё не готов'));
  openSheet(p.title||tr('Ролик'), `
    <div class="field"><label for="poT">${tr("Название")}</label><input class="in" id="poT" value="${esc(p.title||'')}"></div>
    <div class="fgrid"><div class="field"><label for="poD">${tr("Дата публикации")}</label><input class="in" type="date" id="poD" value="${esc(p.date||'')}"></div>
    <div class="field"><label for="poS">${tr("Статус")}</label><select class="in" id="poS">${POST_STATUS.map(s=>`<option value="${s}" ${p.status===s?'selected':''}>${tr(s)}</option>`).join('')}</select></div>
    <div class="field"><label for="poL">${tr("Где снимать")}</label><input class="in" id="poL" value="${esc(p.location||'')}"></div></div>
    <div class="field"><label>${tr("Площадки")}</label><div class="pills" style="margin:0;padding:0">${PLATFORMS.map(x=>`<button class="pill ${(p.platforms||[]).includes(x.id)?'on':''}" data-act="poP" data-v="${x.id}">${x.name}</button>`).join('')}</div></div>
    ${p.hook?`<section class="card" style="display:flex;flex-direction:column;gap:8px"><b>${tr("Хук")}</b><div>${esc(p.hook)}</div>${p.why?`<div class="hint">${esc(p.why)}</div>`:''}</section>`:''}
    ${p.beats?.length?`<section class="card"><b>${tr("Раскадровка")}</b><div style="margin-top:8px">${p.beats.map(b=>`<div class="step"><span class="tm">${esc(b.t)}</span><div><div>${esc(b.shot)}</div><div class="muted">${tr('«')}${esc(b.say)}${tr('»')}</div></div></div>`).join('')}</div>${p.cta?`<div class="hint" style="margin-top:8px">${tr("Призыв:")} ${esc(p.cta)}</div>`:''}${p.props?`<div class="hint">${tr("Понадобится:")} ${esc(p.props)}</div>`:''}</section>`:''}
    <div class="field"><label for="poC">${tr("Описание к посту")}</label><textarea class="in" id="poC">${esc((p.caption||'') + (p.hashtags?.length && !(p.caption||'').includes('#') ? '\n\n'+p.hashtags.join(' ') : ''))}</textarea></div>
    <div class="field"><label for="poN">${tr("Заметки")}</label><textarea class="in" id="poN" placeholder="${tr("что изменить, идеи для кадров")}">${esc(p.notes||'')}</textarea></div>
    <div class="btnrow"><button class="btn" data-act="poSave">${tr("Сохранить")}</button><button class="btn danger" data-act="poDel">${ic('trash')}${tr("Удалить")}</button></div>`);
  SH.post = id; SH.poP = [...(p.platforms||[])];
}
A.poP = el => { const v = el.dataset.v; SH.poP = SH.poP.includes(v) ? SH.poP.filter(x=>x!==v) : [...SH.poP, v]; el.classList.toggle('on'); };
A.poSave = () => { const p = {...clone(S.docs['posts/'+SH.post]), title:val('poT'), date:val('poD'), status:val('poS'), location:val('poL'), platforms:SH.poP, caption:val('poC'), hashtags:[], notes:val('poN')}; save('posts/'+SH.post, p); closeSheet(); toast(tr('Сохранено')); };
A.poDel = el => { if (!SH.confirmDel){ SH.confirmDel = true; el.textContent = tr('Точно удалить?'); return; } remove('posts/'+SH.post); closeSheet(); };
A.promo = async () => {
  const c = content(), an = analyses().slice(0,8);
  const prompt = `Составь план продвижения на 30 дней для автора коротких видео.
${profileBrief()}
Снимает и монтирует сам, сейчас 1–2 публикации в неделю, цель ${c.weeklyTarget||4} в неделю.
Площадки: ${PLATFORMS.map(p=>{ const x = c.platforms?.[p.id]||{}; const f = followersOf(p.id); return `${p.name}: ник ${x.nick||'—'}, тема ${x.topic||'—'}, подписчиков ${f[f.length-1]?.v??'нет данных'}, цель ${x.goal||'—'}`; }).join('; ')}.
Разборы статистики: ${an.map(a=>`[${PL[a.platform]?.name} ${a.date}] ${a.summary} Менять: ${(a.change||[]).join('; ')}`).join(' | ')||'пока нет'}
Формат: простой текст без Markdown-разметки (без #, без **). Короткие блоки с заголовком в отдельной строке: «Цели на 30 дней», «Роль каждой площадки», «Рубрики и частота», «Неделя 1–4», «Как переупаковывать один ролик на все площадки», «Что измерять». Пункты начинай с «— ». Конкретно, с цифрами, без воды.`;
  const id = await submitJob('promo', {prompt, json:false, label:tr('План продвижения')});
  if (!id) return;
  openSheet(tr('План продвижения'), `<div id="prOut"></div>`); queueNow(id, 'prOut');
};

/* ============ MONEY ============ */
function addTx(list){
  const byM = {}; list.forEach(t => { const m = t.date.slice(0,7); (byM[m] = byM[m]||[]).push(t); });
  Object.entries(byM).forEach(([m, arr]) => { const doc = clone(S.docs['money/'+m] || {tx:[]}); arr.forEach(t => { if (!doc.tx.some(x=>x.date===t.date && +x.amount===+t.amount && x.type===t.type && (x.note||'')===(t.note||''))) doc.tx.push(t); }); save('money/'+m, doc); });
}
function txForm(t={}){
  const type = t.type||'out', cats = type==='in'?IN_CATS:OUT_CATS;
  return `<div class="seg"><button class="${type==='out'?'on':''}" data-act="txType" data-v="out">${tr("Расход")}</button><button class="${type==='in'?'on':''}" data-act="txType" data-v="in">${tr("Доход")}</button></div>
    <div class="fgrid"><div class="field"><label for="txA">${tr("Сумма")}</label><input class="in" id="txA" inputmode="decimal" value="${t.amount??''}"></div><div class="field"><label for="txD">${tr("Дата")}</label><input class="in" type="date" id="txD" value="${esc(t.date||todayISO())}"></div></div>
    <div class="field"><label for="txC">${tr("Категория")}</label><select class="in" id="txC">${cats.map(c=>`<option value="${c[0]}" ${t.cat===c[0]?'selected':''}>${tr(c[0])}</option>`).join('')}</select></div>
    <div class="field"><label for="txN">${tr("Описание")}</label><input class="in" id="txN" value="${esc(t.note||'')}" placeholder="${tr("кафе, такси, перевод…")}"></div>`;
}
A.txAdd = () => { SH = null; openSheet(tr('Новая операция'), () => txForm(SH.tx) + `<button class="btn block" data-act="txSave">${tr("Добавить")}</button>`); SH.tx = {type:'out'}; drawSheet(); };
A.txType = el => { SH.tx = {...SH.tx, type:el.dataset.v, amount:val('txA'), date:val('txD'), note:val('txN')}; drawSheet(); };
A.txSave = () => { const a = toNum(val('txA')); if (!a) return toast(tr('Введи сумму')); const t = {id:SH.tx.id||uid(), type:SH.tx.type, amount:Math.abs(a), date:val('txD')||todayISO(), cat:val('txC'), note:val('txN')}; if (SH.tx.id) removeTx(SH.tx.id, SH.tx.date); addTx([t]); closeSheet(); toast(tr('Сохранено')); };
function removeTx(id, date){ const m = (date||'').slice(0,7) || S.moneyMonth; const doc = clone(S.docs['money/'+m] || {tx:[]}); doc.tx = doc.tx.filter(x=>x.id!==id); save('money/'+m, doc); }
A.txEdit = el => { const t = monthTx(S.moneyMonth).find(x=>x.id===el.dataset.id); if (!t) return; SH = null; openSheet(tr('Операция'), () => txForm(SH.tx) + `<div class="btnrow"><button class="btn" data-act="txSave">${tr("Сохранить")}</button><button class="btn danger" data-act="txDel">${ic('trash')}${tr("Удалить")}</button></div>`); SH.tx = {...t}; drawSheet(); };
A.txDel = () => { removeTx(SH.tx.id, SH.tx.date); closeSheet(); };
A.txShot = () => {
  openSheet(tr('Скриншот из банка'), () => `<div class="hint">${tr("Загрузи скриншоты «Истории» или «Анализа финансов» из банка. ИИ перепишет операции, а ты отметишь, что добавить.")}</div>
    <label class="btn ghost block">${ic('image')}${tr("Выбрать скриншоты")}<input type="file" accept="image/*" multiple hidden data-ch="bkFiles"></label><div id="bkPrev" class="hint"></div>
    ${imgCapable()?'':`<div class="note">${tr("Скриншоты может прочитать только Claude или ИИ на компьютере с поддержкой картинок. Пока их нет, запрос подождёт в очереди.")}</div>`}
    ${provPicker(true)}
    <button class="btn block" data-act="bkGo">${ic('spark')}${tr("Распознать")}</button>
    <div id="bkOut" style="display:flex;flex-direction:column;gap:12px"></div>`);
  SH.files = []; SH.needImg = true;
};
CH.bkFiles = el => { SH.files = [...(el.files||[])]; $('#bkPrev').textContent = tr('Выбрано: ')+SH.files.length; };
A.bkGo = async () => {
  if (!SH.files.length) return toast(tr('Выбери скриншоты'));
  const prompt = `На скриншотах — банковское приложение. Сегодня ${todayISO()}; если год не указан — текущий.
Категории расходов: ${OUT_CATS.map(c=>c[0]).join(', ')}. Категории доходов: ${IN_CATS.map(c=>c[0]).join(', ')}.
Если на скриншоте список операций — перепиши каждую. Если на скриншоте сводка по категориям за месяц («Анализ финансов») — верни её в summary.
Верни только JSON: {"tx":[{"date":"YYYY-MM-DD","type":"out|in","amount":число без знака,"cat":"категория из списка","note":"получатель или название","status":"ok|fail"}],"summary":null или {"month":"YYYY-MM","out":[{"cat":"","sum":0,"count":0}],"in":[{"cat":"","sum":0,"count":0}]}}`;
  const id = await submitJob('bank', {prompt, images: SH.files.slice(0,8), provider: SH.prov||'auto', label:tr('Операции из банка')});
  queueNow(id, 'bkOut');
};
function bankView(it){
  const r = it.result, tx = r.tx||[];
  if (it.done) return `<div class="note">${tr("Операции добавлены.")}</div>`;
  return `${tx.length?`<section class="card" style="padding:4px 18px"><div class="list">${tx.map((t,i)=>`<label class="row"><input type="checkbox" ${t.status==='fail'?'':'checked'} data-bk="${it.id}:${i}" style="width:20px;height:20px"><div class="mid"><div class="t">${esc(t.note||tr(t.cat))}</div><div class="s">${fmtShort(t.date)} · ${esc(tr(t.cat))}${t.status==='fail'?tr(' · неуспешно'):''}</div></div><div class="r" style="color:${t.type==='in'?'var(--good)':'var(--text)'}">${t.type==='in'?'+':'−'}${money(t.amount)}</div></label>`).join('')}</div></section><button class="btn block" data-act="bkAdd" data-id="${it.id}">${tr("Добавить отмеченные")}</button>`:''}
    ${r.summary?`<div class="note">${tr("Найдена сводка за")} ${esc(r.summary.month)}${tr(": расходы")} ${money((r.summary.out||[]).reduce((a,x)=>a+ +x.sum,0))}${tr(", доходы")} ${money((r.summary.in||[]).reduce((a,x)=>a+ +x.sum,0))}${tr(". Её можно внести целиком вместо отдельных операций.")}</div><button class="btn ghost block" data-act="bkSummary" data-id="${it.id}">${tr("Внести сводку за месяц")}</button>`:''}`;
}
A.bkAdd = el => { const it = S.docs['inbox/'+el.dataset.id]; if (!it || it.done) return; const tx = it.result.tx||[]; const pick = $$(`[data-bk^="${it.id}:"]`).filter(c=>c.checked).map(c=>tx[+c.dataset.bk.split(':')[1]]).map(t=>({id:uid(), date:t.date, type:t.type==='in'?'in':'out', amount:Math.abs(+t.amount||0), cat:t.cat, note:t.note||'', status:t.status==='fail'?'fail':'ok'})); addTx(pick); save('inbox/'+it.id, {...it, done:true}); if (SH?.jobId===it.id) closeSheet(); else drawSheet(); toast(tr('Добавлено операций: ')+pick.length); };
A.bkSummary = el => {
  const it = S.docs['inbox/'+el.dataset.id], s = it.result.summary, m = s.month, doc = clone(S.docs['money/'+m] || {tx:[]});
  doc.tx = doc.tx.filter(t=>!t.summary);
  const day = m===todayISO().slice(0,7) ? todayISO() : m+'-28';
  (s.out||[]).forEach(x=>doc.tx.push({id:uid(), date:day, type:'out', amount:+x.sum, cat:x.cat, note:tr('Сводка: ')+x.cat, count:+x.count||1, summary:true}));
  (s.in||[]).forEach(x=>doc.tx.push({id:uid(), date:day, type:'in', amount:+x.sum, cat:x.cat, note:tr('Сводка: ')+x.cat, count:+x.count||1, summary:true}));
  save('money/'+m, doc); save('inbox/'+it.id, {...it, done:true}); if (SH?.jobId===it.id) closeSheet(); else drawSheet(); toast(tr('Сводка внесена'));
};

/* ============ KNOWLEDGE BASE ============ */
A.kb = () => openSheet(tr('База знаний'), kbBody);
function kbSearch(q){
  const words = q.toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(w=>w.length>3).map(w=>w.slice(0, Math.max(4, w.length-2)));
  return kbItems().map(k => { const t = ((k.title||'')+' '+(k.summary||'')+' '+(k.tags||[]).join(' ')+' '+(k.text||'')).toLowerCase(); return {k, score: words.reduce((a,w)=>a+(t.split(w).length-1),0)}; }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
}
function kbBody(){
  const items = kbItems(), q = SH?.kbq || '';
  const found = q ? kbSearch(q) : null;
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Спросить")}</b>
    <textarea class="in" id="kbQ" placeholder="${tr("например, что убрать из питания, чтобы лицо было менее отёчным?")}">${esc(q)}</textarea>
    ${provPicker(false)}
    <div class="btnrow"><button class="btn" data-act="kbAsk">${ic('spark')}${tr("Ответить по моей базе")}</button><button class="btn ghost" data-act="kbFind">${tr("Найти без ИИ")}</button></div><div id="kbA"></div>
    ${found?`<div class="hint">${tr("Найдено записей:")} ${found.length}</div>${found.slice(0,5).map(({k})=>`<button class="row" data-act="kbOpen" data-id="${k.id}" style="padding:8px 0"><div class="mid"><div class="t">${esc(k.title)}</div><div class="s">${esc((k.summary||k.text||'').slice(0,100))}</div></div></button>`).join('')}`:''}</section>
  <section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Добавить в базу")}</b>
    <input class="in" id="kbT" placeholder="${tr("Название (блогер, статья, продукт)")}" aria-label="${tr("Название")}">
    <input class="in" id="kbU" placeholder="${tr("Ссылка (необязательно)")}" aria-label="${tr("Ссылка")}">
    <textarea class="in" id="kbX" placeholder="${tr("Вставь текст, конспект или свои заметки")}" aria-label="${tr("Текст")}"></textarea>
    <label class="btn ghost">${ic('image')}${tr("Скриншоты или PDF")}<input type="file" accept="image/*,application/pdf" multiple hidden data-ch="kbFiles"></label><div id="kbF" class="hint"></div>
    <button class="btn" data-act="kbAdd">${tr("Сохранить в базу")}</button>
    <div class="hint">${tr("Ссылку приложение само не открывает: вставь текст статьи или сделай скриншоты. Скриншоты расшифрует ИИ, когда будет доступен.")}</div></section>
  <div class="sec-h"><h2>${tr("Записи ·")} ${items.length}</h2></div>
  <section class="card" style="padding:4px 18px"><div class="list">${items.map(k=>`<button class="row" data-act="kbOpen" data-id="${k.id}"><span class="ic">${ic('book')}</span><div class="mid"><div class="t">${esc(k.title)}${k.pending?` <span class="tag warn">${tr("ждёт ИИ")}</span>`:''}</div><div class="s">${fmtShort(k.date)} · ${esc((k.summary||k.text||'').slice(0,80))}</div></div></button>`).join('') || `<div class="empty">${tr("Пока пусто")}</div>`}</div></section>`;
}
A.kbFind = () => { SH.kbq = val('kbQ'); drawSheet(); };
CH.kbFiles = el => { SH.kbFiles = [...(el.files||[])]; $('#kbF').textContent = SH.kbFiles.map(f=>f.name).join(', '); };
async function pdfText(file){
  if (!window.pdfjsLib){ await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); }); window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }
  const pdf = await window.pdfjsLib.getDocument({data: await file.arrayBuffer()}).promise;
  let out = ''; for (let i=1; i<=Math.min(pdf.numPages, 200); i++){ const pg = await pdf.getPage(i); const tc = await pg.getTextContent(); out += tc.items.map(x=>x.str).join(' ') + '\n'; if (out.length > 400000) break; }
  return out;
}
A.kbAdd = async el => {
  let title = val('kbT'), text = val('kbX'); const url = val('kbU'); const files = SH.kbFiles||[];
  if (!title && !text && !files.length) return toast(tr('Добавь текст, скриншот или PDF'));
  busy(el, true, tr('Сохраняю…'));
  const pdfs = files.filter(f=>f.type==='application/pdf'), imgs = files.filter(f=>f.type.startsWith('image/'));
  for (const f of pdfs) { try { text += (text?'\n\n':'') + await pdfText(f); if (!title) title = f.name.replace(/\.pdf$/i,''); } catch { toast('PDF «'+f.name+tr('» не прочитался (нужен интернет в первый раз или это скан). Сделай скриншоты.')); } }
  const kbId = uid();
  save('kb/'+kbId, {title: title||'Заметка', url, text: S.inClaude ? text.slice(0, 100000) : text, summary:'', tags:[], date: todayISO(), pending: imgs.length>0 || text.length>400});
  if (imgs.length || text.length > 400){
    await submitJob('kbExtract', {prompt: {head:`Это материал для личной базы знаний (питание, тренировки, здоровье, соцсети, блогеры). ${imgs.length?'Перепиши весь полезный текст со скриншотов.':''}\nНазвание от пользователя: ${title||'нет'}.\nТекст: """`, body: text.slice(0,50000), tail:`"""\nВерни только JSON: {"title":"короткое название","text":"${imgs.length?'полный текст со скриншотов':''}","summary":"главное в 2 предложениях","tags":["3–5 тегов"]}`}, images: imgs.slice(0,8), meta:{kbId}, label:tr('База: ')+(title||tr('новая запись'))});
  }
  SH.kbFiles = []; busy(el, false); drawSheet(); toast(tr('Сохранено в базу'));
};
A.kbOpen = el => { const k = kbItems().find(x=>x.id===el.dataset.id); if (!k) return; openSheet(k.title, `${k.summary?`<div class="note">${esc(k.summary)}</div>`:''}${k.url?`<a class="link" href="${esc(k.url)}" target="_blank" rel="noopener">${tr("Открыть ссылку")}</a>`:''}${k.tags?.length?`<div class="btnrow">${k.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}<div class="ai-out">${esc((k.text||'').slice(0,30000))}${(k.text||'').length>30000?'\n…':''}</div><div class="btnrow"><button class="btn ghost" data-act="kb">${tr("Назад")}</button><button class="btn danger" data-act="kbDel" data-id="${k.id}">${ic('trash')}${tr("Удалить")}</button></div>`); };
A.kbDel = el => { remove('kb/'+el.dataset.id); A.kb(); };
A.kbAsk = async () => {
  const q = val('kbQ'); if (!q) return toast(tr('Напиши вопрос'));
  const ranked = kbSearch(q).map(x=>x.k); const rest = kbItems().filter(k=>!ranked.includes(k));
  const items = [...ranked, ...rest];
  const body = items.map((k,i) => `[${i+1}] ${k.title} (${k.date})${k.summary?' — '+k.summary:''}\n${(k.text||'').slice(0,8000)}`).join('\n\n');
  const head = `Ты — личный консультант пользователя по здоровью, тренировкам, питанию и соцсетям. Ответь на вопрос, опираясь в первую очередь на его базу знаний.\n${profileBrief()}\nВопрос: ${q}\nБаза знаний:\n`;
  const tail = `\n\nВопрос ещё раз: ${q}\nФормат: простой текст без Markdown. Коротко. Блок «Из твоей базы:» — что говорят записи, со ссылками на номера [1], [2]; если в базе ничего нет, так и скажи. Блок «Дополнительно:» — общепринятые научные данные, где база не покрывает вопрос; отметь, где доказательства слабые. В конце «Что делать:» — 2–3 конкретных действия.`;
  const id = await submitJob('kbAsk', {prompt:{head, body: body || '(пусто)', tail}, json:false, meta:{q}, provider: SH.prov||'auto', label:tr('Вопрос: ')+q.slice(0,40)});
  queueNow(id, 'kbA');
};

/* ============ v2: modules, day timeline from the routine, easy 4-day program ============ */
const MODULES = [
  ['timeline',tr('Расписание дня'),tr('Лента по часам на экране «День»'), true],
  ['tasks',tr('Задачи и вопросы'),tr('Список дел с напоминаниями и вопросами в течение дня'), true],
  ['screentime',tr('Экранное время'),tr('Скриншот из iPhone: приложения и минуты за день'), true],
  ['money',tr('Деньги'),tr('Расходы и бюджет месяца'), true],
  ['content',tr('Контент'),tr('Сценарии, план роликов, продвижение. Данные остаются в телефоне'), false],
];
const modOn = id => { const m = (meta().modules || {})[id]; if (m !== undefined) return !!m; const d = MODULES.find(x => x[0] === id); return d ? d[3] : true; };
function modulesCard(){
  return `<section class="card" style="display:flex;flex-direction:column;gap:4px"><b>${tr("Модули")}</b>
    ${MODULES.map(([k,l,h]) => `<label class="row" style="padding:10px 0"><div class="mid"><div class="t">${l}</div><div class="s">${h}</div></div><input type="checkbox" switch class="sw" data-ch="modToggle" data-k="${k}" aria-label="${l}" ${modOn(k)?'checked':''}></label>`).join('')}
    <div class="hint">${tr("Выключенный модуль прячется, но его данные не удаляются.")}</div></section>`;
}
CH.modToggle = el => {
  const k = el.dataset.k;
  setMeta({modules: {...(meta().modules || {}), [k]: el.checked}});
  if (!el.checked && S.tab === k) S.tab = 'day';
  haptic('selection'); toast(MODULES.find(m => m[0] === k)[1] + (el.checked ? tr(': включено') : tr(': выключено')));
};

/* --- easy 4-day program (Mon Tue Thu Fri) --- */
const EASY_WORKOUTS = {
  'Верх': { name:tr('Верх тела · жим, тяга, плечи'), note:tr('Усилие 6 из 10: заканчивай подход, когда осталось 3–4 повтора. Опускай вес за 2 секунды. Отдых 60–90 сек.'), ex:[
    {id:'chestpress', name:tr('Жим в тренажёре или отжимания'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Лопатки сведены, локти под углом около 45°. Опускай за 2 секунды, вверх без рывка. Если тяжело, отжимайся от скамьи.')},
    {id:'seatrow', name:tr('Тяга блока сидя'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Спина ровная, тяни рукоятку к низу живота, лопатки сводятся в конце. Назад возвращай медленно.')},
    {id:'ohp', name:tr('Жим гантелей сидя (лёгкий)'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Спина прижата к спинке. Гантели лёгкие: должно остаться 3–4 повтора в запасе.')},
    {id:'pulldown', name:tr('Тяга верхнего блока'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Тяни к верху груди, локти вниз. Если нет блока, возьми резинку.')},
    {id:'armsuper', name:tr('Бицепс и трицепс подряд'), sets:3, lo:10, hi:12, rest:tr('60 сек'), how:tr('Сгибание на бицепс, сразу разгибание на трицепс, потом отдых. Локти неподвижны.')},
    {id:'plank', name:tr('Планка'), sets:2, lo:30, hi:30, rest:tr('45 сек'), unit:tr('сек'), how:tr('Два раунда по 30 секунд. Таз подкручен, тело прямое.')},
  ]},
  'Низ': { name:tr('Низ тела · ноги и ягодицы'), note:tr('Усилие 6 из 10: оставляй 3–4 повтора в запасе. Опускайся за 2 секунды, без медленных тяжёлых негативов. Отдых 60–90 сек.'), ex:[
    {id:'goblet', name:tr('Гоблет-приседания или жим ногами'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Гантель у груди, стопы на ширине плеч, садись до комфортной глубины. Колени идут по линии носков.')},
    {id:'bridge', name:tr('Ягодичный мост или hip thrust'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Лопатки на скамье или пол, вверху пауза 1 секунду и сжатие ягодиц.')},
    {id:'revlunge', name:tr('Выпады назад или шаги на платформу'), sets:3, lo:10, hi:12, rest:tr('60–90 сек'), how:tr('Шаг назад, корпус прямой. Без веса или с лёгкими гантелями. Это на каждую ногу.')},
    {id:'calf', name:tr('Подъёмы на носки'), sets:3, lo:12, hi:15, rest:tr('60 сек'), how:tr('Вверху пауза, вниз 2 секунды.')},
    {id:'deadbug', name:tr('Dead bug (мёртвый жук)'), sets:2, lo:8, hi:10, rest:tr('45 сек'), how:tr('Поясница прижата к полу. Опускай противоположные руку и ногу медленно. Повторы на каждую сторону.')},
  ]},
};
const EASY_SCHEDULE = {1:'Верх', 2:'Низ', 4:'Верх', 5:'Низ'};
/* switches a plan copy to a program and starts its two easier weeks today */
function useProgram(pl, k){
  const pr = pl.programs?.[k]; if (!pr) return false;
  pl.program = k; pl.schedule = clone(pr.schedule); if (k !== 'abc') pr.start = todayISO();
  return true;
}
const gymWord = () => plan().program === 'home3' ? tr('Тренировка · ') : tr('Зал · ');
/* --- at home, no equipment: a floor, a chair and a wall; full body three times a week --- */
const HOME_WORKOUTS = {
  'Дом 1': { name:tr('Дом 1 · всё тело'), note:tr('Без инвентаря: нужны пол, стул и стена. Усилие 6 из 10: заканчивай подход, когда осталось 3–4 повтора. Отдых 60–90 сек.'), ex:[
    {id:'hsquat', bw:true, name:tr('Приседания до стула'), sets:3, lo:8, hi:12, rest:tr('60–90 сек'), how:tr('Сядь на край стула и встань, не помогая руками. Стопы на ширине плеч, колени идут по линии носков. Когда станет легко, только касайся стула.')},
    {id:'hpush', bw:true, name:tr('Отжимания от стола или стены'), sets:3, lo:6, hi:12, rest:tr('60–90 сек'), how:tr('Чем выше опора, тем легче. Тело прямое, локти под углом около 45°. Когда 12 повторов даются легко, опора ниже: стол, потом пол с колен, потом пол.')},
    {id:'hbridge', bw:true, name:tr('Ягодичный мост на полу'), sets:3, lo:10, hi:15, rest:tr('60 сек'), how:tr('Лёжа на спине, стопы у таза. Поднимай таз, вверху пауза 1 секунду. Когда станет легко, делай на одной ноге.')},
    {id:'hsuper', bw:true, name:tr('Супермен лёжа'), sets:2, lo:8, hi:12, rest:tr('60 сек'), how:tr('Лёжа на животе, руки буквой Y. Подними руки и грудь на пару сантиметров, лопатки вниз и назад, пауза 2 секунды. Для спины и осанки.')},
    {id:'hplank', name:tr('Планка'), sets:2, lo:20, hi:30, rest:tr('45 сек'), unit:tr('сек'), how:tr('Можно с колен. Таз подкручен, тело прямое. Остановись, если провисает поясница.')},
  ]},
  'Дом 2': { name:tr('Дом 2 · всё тело'), note:tr('Без инвентаря: нужны пол, стул и стена. Усилие 6 из 10: заканчивай подход, когда осталось 3–4 повтора. Отдых 60–90 сек.'), ex:[
    {id:'hlunge', bw:true, name:tr('Выпады назад с опорой'), sets:3, lo:6, hi:10, rest:tr('60–90 сек'), how:tr('Держись за стену или спинку стула. Шаг назад, корпус прямой, колено опускается к полу. Повторы на каждую ногу.')},
    {id:'hpush', bw:true, name:tr('Отжимания от стола или стены'), sets:3, lo:6, hi:12, rest:tr('60–90 сек'), how:tr('Чем выше опора, тем легче. Тело прямое, локти под углом около 45°. Когда 12 повторов даются легко, опора ниже: стол, потом пол с колен, потом пол.')},
    {id:'hcalf', bw:true, name:tr('Подъёмы на носки'), sets:3, lo:12, hi:20, rest:tr('45 сек'), how:tr('Держись за стену. Вверху пауза, вниз 2 секунды. Когда станет легко, на одной ноге.')},
    {id:'hside', name:tr('Боковая планка с колен'), sets:2, lo:15, hi:25, rest:tr('45 сек'), unit:tr('сек'), how:tr('На каждую сторону. Колени согнуты, локоть под плечом, таз поднят. Тело от головы до колен в одну линию.')},
    {id:'deadbug', name:tr('Dead bug (мёртвый жук)'), sets:2, lo:8, hi:10, rest:tr('45 сек'), how:tr('Поясница прижата к полу. Опускай противоположные руку и ногу медленно. Повторы на каждую сторону.')},
  ]},
};
const HOME_SCHEDULE = {1:'Дом 1', 3:'Дом 2', 5:'Дом 1'};
const PROGRAM_DEFS = {
  easy4: {name:tr('Лёгкий старт · 4 дня'), info:tr('Пн Вт Чт Пт. Две недели по 2 подхода, потом 3. Усилие 6 из 10, крепатуры почти нет.'), keys:['Верх','Низ'], schedule:EASY_SCHEDULE},
  home3: {name:tr('Дома без инвентаря · 3 дня'), info:tr('Пн Ср Пт, всё тело с весом своего тела: нужны только пол, стул и стена. Две недели по 2 подхода, потом 3. Усилие 6 из 10.'), keys:['Дом 1','Дом 2'], schedule:HOME_SCHEDULE},
  abc: {name:tr('Силовая · 3 дня (A/B/C)'), info:tr('Пн Ср Пт, тяжёлые базовые, 1–2 повтора в запасе. Для тех, кто уже тренируется регулярно.'), keys:['A','B','C'], schedule:{1:'A',3:'B',5:'C'}},
};
function migratePlan(p){
  if (p.programs && (p.version||1) >= 3) return null;
  const n = clone(p);
  if (!(p.programs && (p.version||1) >= 2)){
    n.workouts = {...(n.workouts||{})};
    Object.entries(EASY_WORKOUTS).forEach(([k,w]) => { if (!n.workouts[k]) n.workouts[k] = clone(w); });
    const old = n.schedule || {};
    const abc = Object.keys(old).length && Object.values(old).every(v => ['A','B','C'].includes(v)) ? clone(old) : {1:'A',3:'B',5:'C'};
    n.programs = {easy4: {...clone(PROGRAM_DEFS.easy4), start: todayISO()}, abc: {...clone(PROGRAM_DEFS.abc), schedule: abc}};
    n.program = 'easy4';
    n.schedule = clone(EASY_SCHEDULE);
    n.routine = n.routine || clone(DEFAULT_ROUTINE);
    n.dailyTasks = (n.dailyTasks || []).map(t => t.cat === 'sleep' && /23:30/.test(t.title) ? {...t, title:tr('Лечь до 23:00, 7+ часов сна')} : t);
  }
  // v3: a no-equipment program sits next to the others; whatever the person uses now stays selected
  Object.entries(HOME_WORKOUTS).forEach(([k, w]) => { if (!n.workouts[k]) n.workouts[k] = clone(w); });
  n.programs = {home3: clone(PROGRAM_DEFS.home3), ...n.programs};
  n.version = 3;
  return n;
}
function ensureMigrated(){
  const p = S.docs['app/plan']; if (!S.ready || !p) return;
  const mp = migratePlan(p); if (mp) save('app/plan', mp);
}
const activeProgram = () => { const pl = plan(); return pl.programs?.[pl.program] || null; };
function programKeys(){
  const pl = plan(), pr = activeProgram();
  const ks = (pr?.keys || [...new Set(Object.values(pl.schedule || {}))]).filter(k => pl.workouts[k]);
  return ks.length ? ks : Object.keys(pl.workouts);
}
function programCard(){
  const pl = plan(), pr = activeProgram();
  if (!pl.programs) return '';
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("Программа тренировок")}</b>
    <div class="t">${esc(pr?.name || tr('Своя'))}</div><div class="hint">${esc(pr?.info || '')}</div>
    <button class="btn ghost" data-act="programSheet">${ic('swap')}${tr("Сменить программу")}</button></section>`;
}
A.programSheet = () => openSheet(tr('Программа тренировок'), () => {
  const pl = plan();
  return Object.entries(pl.programs || {}).map(([k,p]) => `<button class="card prog ${pl.program===k?'on':''}" data-act="setProgram" data-k="${k}" style="text-align:left"><b>${esc(p.name)}</b><div class="hint" style="margin-top:4px">${esc(p.info||'')}</div>${pl.program===k?`<div class="tag good" style="margin-top:8px">${tr("Сейчас")}</div>`:''}</button>`).join('') + `<div class="hint">${tr("Смена меняет только расписание тренировок. История подходов сохраняется.")}</div>`;
});
A.setProgram = el => {
  const pl = clone(plan()), pr = pl.programs?.[el.dataset.k]; if (!pr) return;
  pl.program = el.dataset.k; pl.schedule = clone(pr.schedule);
  if (el.dataset.k === 'home3' && !pr.start) pr.start = todayISO(); // two easier weeks to start
  save('app/plan', pl);
  S.sub.w = null; closeSheet(); toast(tr('Программа: ') + pr.name);
};
A.setPrev = el => {
  const {ex, i, w, r} = el.dataset;
  mutDay(todayISO(), d => { d.sets = d.sets || {}; const a = d.sets[ex] = d.sets[ex] || []; a[+i] = {w: w === '' ? null : +w, r: r === '' ? null : +r}; for (let k = 0; k < a.length; k++) if (!a[k]) a[k] = {}; });
  haptic('selection');
};

/* --- the starting routine; first-run setup fits it to the person (routineFor) --- */
// block: [id, start, end, title, kind, note, walking minutes]
const DEFAULT_ROUTINE = {
  walkGoal: 60,
  school: [
    ['wake','07:00',null,tr('Подъём'),'wake',tr('Вода и 5 минут растяжки.')],
    ['walk1','07:15','07:45',tr('Прогулка · 30 мин'),'walk',tr('Спокойный старт дня.'),30],
    ['breakfast','07:45','08:30',tr('Душ и завтрак'),'meal',tr('Добавь белок.')],
    ['class','09:00','15:00',tr('Занятия и обед'),'class',''],
    ['study','15:30','17:00',tr('Учёба'),'study',tr('Задания и повторение, пока всё свежо.')],
    ['gym','17:15','18:05',tr('Тренировка'),'gym',tr('45–50 минут.')],
    ['dinner','18:05','19:00',tr('Душ и ужин'),'meal',''],
    ['walk2','19:00','19:30',tr('Прогулка · 30 мин'),'walk',tr('После ужина.'),30],
    ['project','19:30','21:30',tr('Своё время'),'project',tr('Хобби, проект или отдых.')],
    ['shutdown','21:30','22:30',tr('Завершение дня'),'rest',tr('План на завтра, собрать сумку.')],
    ['winddown','22:30','23:00',tr('Спокойный вечер'),'rest',tr('Чтение, без экранов.')],
    ['sleep','23:00',null,tr('Сон'),'sleep',''],
  ],
  sat: [
    ['wake','08:00',null,tr('Подъём'),'wake',''],
    ['walk1','08:15','09:00',tr('Прогулка · 45 мин'),'walk','',45],
    ['breakfast','09:00','09:45',tr('Завтрак'),'meal',''],
    ['project','09:45','12:30',tr('Своё время'),'project',''],
    ['lunch','12:30','14:00',tr('Обед и отдых'),'meal',''],
    ['free','14:00','18:00',tr('Свободное время'),'free',tr('Друзья, дела, стирка.')],
    ['evening','18:30','23:00',tr('Ужин и свободный вечер'),'free',''],
    ['sleep','23:30',null,tr('Сон'),'sleep',''],
  ],
  sun: [
    ['wake','08:00',null,tr('Подъём'),'wake',''],
    ['walk1','08:15','09:00',tr('Прогулка · 45 мин'),'walk','',45],
    ['breakfast','09:00','09:45',tr('Завтрак'),'meal',''],
    ['plan','09:45','10:15',tr('План на неделю'),'study',tr('Расписание, дедлайны и главное на неделю.')],
    ['dayoff','10:15','18:00',tr('Выходной'),'free',tr('Еда, звонки, друзья, отдых.')],
    ['evening','19:00','22:00',tr('Вечер'),'free',tr('Сумка и одежда на завтра.')],
    ['sleep','23:00',null,tr('Сон'),'sleep',''],
  ],
  events: [],
};
const KIND = {wake:['sun','c4'], walk:['steps','c3'], meal:['food','c2'], class:['cap','c1'], study:['cap','c1'], gym:['gym','c1'], project:['laptop','c5'], free:['coffee','c0'], rest:['moon','c7'], sleep:['moon','c7'], event:['star','c6']};
const hm = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
const hmStr = n => { n = ((Math.round(n) % 1440) + 1440) % 1440; return pad(Math.floor(n / 60)) + ':' + pad(n % 60); };
function eventsFor(date){
  const R = plan().routine; if (!R) return [];
  return (R.events || []).filter(ev => ev.date <= date && date <= (ev.toDate || ev.date));
}
function dayBlocks(date){
  const pl = plan(), R = pl.routine; if (!R) return [];
  const n = dow(date), key = n <= 5 ? 'school' : n === 6 ? 'sat' : 'sun';
  const gymKey = workoutFor(date), gymW = gymKey ? pl.workouts[gymKey] : null;
  let bl = R[key].map(([id, s, e, title, kind, note, walk]) => ({id, s: hm(s), e: e ? hm(e) : null, title, kind, note: note || '', walk: walk || 0}));
  if (key === 'school'){
    bl = bl.map(b => {
      if (b.id === 'class'){
        if (R.classesStart && date < R.classesStart) return {...b, title:tr('Свободно · занятия ещё не начались'), kind:'free', note:''};
        const cls = (pl.classes || []).filter(c => Number(c.day) === n).sort((a, b2) => a.time.localeCompare(b2.time));
        return cls.length ? {...b, note: cls.map(c => c.time + ' ' + c.title).join(' · ')} : b;
      }
      if (b.id === 'gym'){
        if (gymW) return {...b, title:gymWord() + gymW.name.split(' · ')[0], gym:true, note: gymW.ex.length + tr(' упражнений. Усилие 6 из 10.')};
        return {...b, title:tr('Свободное время или общество'), kind:'free', note:tr('Без силовой.')};
      }
      if (b.id === 'project' && !gymW) return {...b, e: hm('21:00'), title:tr('Проект · 1 ч 15 мин')};
      return b;
    });
  } else if (gymW){
    bl.push({id:'gym', s: hm(key === 'sat' ? '14:00' : '11:00'), e: hm(key === 'sat' ? '15:00' : '12:00'), title:gymWord() + gymW.name.split(' · ')[0], kind:'gym', gym:true, note: gymW.ex.length + tr(' упражнений.'), walk:0});
  }
  eventsFor(date).forEach(ev => {
    if (ev.wake){ const w = bl.find(b => b.id === 'wake'); if (w) w.s = hm(ev.wake); }
    if (ev.bed){
      const sl = bl.find(b => b.id === 'sleep');
      if (sl){ const d = hm(ev.bed) - sl.s; sl.s += d; const wd = bl.find(b => b.id === 'winddown'), sd = bl.find(b => b.id === 'shutdown'); if (wd){ wd.s += d; wd.e += d; } if (sd) sd.e += d; }
    }
    if (ev.drop) bl = bl.filter(b => !ev.drop.includes(b.kind));
    if (ev.from){
      const s = hm(ev.from), e2 = ev.until ? hm(ev.until) : s + 60;
      bl = bl.filter(b => !(['project','free','class','study'].includes(b.kind) && b.s < e2 && (b.e ?? b.s + 1) > s));
      bl.push({id:'ev_' + ev.id, s, e: e2, title: ev.title, kind:'event', note: ev.note || '', walk:0, evId: ev.id});
    }
  });
  return bl.sort((a, b) => a.s - b.s);
}
function timelineCard(){
  if (!modOn('timeline') || !plan().routine) return '';
  const date = todayISO(), d = getDay(date), R = plan().routine;
  const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
  const bl = applyShifts(dayBlocks(date), d);
  const endOf = b => b.e ?? b.s + 30;
  const st = b => b.gym ? (d.tasks.find(t => t.id === 'gym')?.done ? 'done' : d.tl?.[b.id]) : d.tl?.[b.id];
  const walked = bl.filter(b => b.walk && st(b) === 'done').reduce((a, b) => a + b.walk, 0) + (d.walkExtra || 0);
  const week7 = [...Array(7)].reduce((a, _, i) => a + walkedOn(addDays(date, -i)), 0);
  const adj = Object.keys(d.shift || {}).length + Object.keys(d.ext || {}).length + Object.keys(d.trim || {}).length + Object.keys(d.auto || {}).length;
  const goal = R.walkGoal || 120;
  const past = bl.filter(b => endOf(b) <= nowM), rest = bl.filter(b => endOf(b) > nowM);
  const showPast = S.open.tl_past;
  const row = b => {
    const s = st(b), isNow = !s && b.s <= nowM && nowM < endOf(b), open = S.open['tb_' + b.id];
    const [icn, col] = KIND[b.kind] || KIND.free;
    return `<div class="tl-row ${s === 'done' ? 'done' : ''} ${s === 'skip' ? 'skip' : ''} ${isNow ? 'now' : ''}">
      <div class="tl-time">${hmStr(b.s)}<small>${b.e != null ? hmStr(b.e) : ''}</small></div>
      <span class="tic" style="--tc:var(--${col})">${ic(icn)}</span>
      <button class="mid" data-act="tlOpen" data-id="${esc(b.id)}" aria-expanded="${!!open}"><div class="t">${esc(b.title)}${isNow ? ` <span class="tag good">${tr("сейчас")}</span>` : ''}${b.sh ? ` <span class="tag warn">+${b.sh} ${tr("мин")}</span>` : ''}${d.ext?.[b.id] ? ` <span class="tag">${tr("продлено +")}${d.ext[b.id]}</span>` : ''}${d.trim?.[b.id] ? ` <span class="tag">${tr("короче на")} ${d.trim[b.id]}</span>` : ''}${d.lock?.[b.id] ? ` <span class="tag">${tr("закреплено")}</span>` : ''}${s === 'skip' ? (d.auto?.[b.id] ? ` <span class="tag warn">${tr("убрано: сон важнее")}</span>` : ` <span class="tag">${tr("пропущено")}</span>`) : ''}</div>${!open && b.note ? `<div class="s tl-note">${esc(b.note)}</div>` : ''}</button>
      <button class="chk ${s === 'done' ? 'on' : ''}" data-act="tlToggle" data-id="${esc(b.id)}" aria-pressed="${s === 'done'}" aria-label="${tr("Отметить:")} ${esc(b.title)}">${ic('check')}</button>
    </div>${open ? `<div class="tl-det">${b.note ? `<div>${esc(b.note)}</div>` : ''}<div class="btnrow">${b.gym ? `<button class="btn" data-act="goTrain">${tr("Открыть тренировку")}</button>` : ''}${b.kind !== 'sleep' ? [15, 30, 60].map(m => `<button class="btn ghost" data-act="tlShift" data-id="${esc(b.id)}" data-m="${m}">+${m} ${tr("мин")}</button>`).join('') : ''}${b.sh || d.ext?.[b.id] || d.trim?.[b.id] || d.auto?.[b.id] ? `<button class="btn ghost" data-act="tlShift" data-id="${esc(b.id)}" data-m="0">${tr("Вернуть время")}</button>` : ''}${!BARRIER_KINDS.includes(b.kind) ? `<button class="btn ghost" data-act="tlLock" data-id="${esc(b.id)}">${d.lock?.[b.id] ? tr('Открепить') : tr('Закрепить время')}</button>` : ''}${b.kind !== 'sleep' && !b.gym ? `<button class="btn ghost" data-act="tlSkip" data-id="${esc(b.id)}">${s === 'skip' ? tr('Вернуть') : tr('Пропустить')}</button>` : ''}${b.evId ? `<button class="btn danger" data-act="evDel" data-id="${esc(b.evId)}">${ic('trash')}${tr("Удалить событие")}</button>` : ''}</div></div>` : ''}`;
  };
  const evs = eventsFor(date).filter(ev => !ev.from);
  return `<div class="sec-h"><h2>${tr("Расписание дня")}</h2><button class="link" data-act="evSheet">${tr("События")}</button></div>
  <section class="card" style="padding:14px 18px 6px">
    ${evs.map(ev => `<div class="tl-ev">${ic('star')}<div><b>${esc(ev.title)}</b>${ev.note ? `<div class="s">${esc(ev.note)}</div>` : ''}</div></div>`).join('')}
    <div class="tl-walk"><div class="tl-walk-h"><span>${ic('steps')}${tr("Прогулки")}</span><b>${walked} / ${goal} ${tr("мин")}</b></div><div class="bar"><i style="width:${Math.min(100, walked / goal * 100)}%;background:var(--c3)"></i></div>
      <div class="walkq"><span>${tr("Ещё ходил?")}</span>${[10, 20, 30].map(m => `<button data-act="walkAdd" data-m="${m}">+${m}</button>`).join('')}${d.walkExtra ? `<button data-act="walkAdd" data-m="0" aria-label="${tr("Сбросить добавленное")}">${d.walkExtra} ${tr("мин ×")}</button>` : ''}${week7 ? `<span class="walk7">${tr("неделя:")} ${Math.round(week7 / 6) / 10} ${tr("из")} ${Math.round(goal * 7 / 6) / 10} ${tr("ч")}</span>` : ''}</div></div>
    <div style="margin:6px 0 0"></div>${adj ? `<button class="link" style="font-size:13px;padding:2px 0 6px" data-act="tlResetDay">${tr("Сбросить сдвиги дня")}</button>` : ''}
    ${past.length ? `<button class="link tl-past" data-act="toggleOpen" data-k="tl_past" style="padding:6px 0">${showPast ? tr('Скрыть прошедшее') : `${tr("Прошедшее:")} ${past.length} ${plural(past.length, tr('блок'), tr('блока'), tr('блоков'))} ${tr("· отмечено")} ${past.filter(b => st(b) === 'done').length}`}</button>` : ''}
    ${showPast ? past.map(row).join('') : ''}
    ${rest.length ? (S.open.tl_all ? rest : rest.slice(0, 3)).map(row).join('') : `<div class="hint" style="padding:10px 0">${tr("На сегодня всё. Хорошего сна.")}</div>`}
    ${rest.length > 3 ? `<button class="link" data-act="toggleOpen" data-k="tl_all" style="padding:6px 0">${S.open.tl_all ? tr('Свернуть') : trf('Весь день: ещё {n}', {n: rest.length - 3})}</button>` : ''}
  </section>`;
}
A.tlOpen = el => { const k = 'tb_' + el.dataset.id; S.open[k] = !S.open[k]; render(); };
A.tlToggle = el => {
  const id = el.dataset.id;
  if (id === 'gym') return A.toggleTask(el);
  const date = todayISO(), was = getDay(date).tl?.[id];
  if (was !== 'done'){ burstAt(el); haptic('light'); sound('pop'); } else haptic('selection');
  mutDay(date, d => { d.tl = d.tl || {}; if (d.tl[id] === 'done') delete d.tl[id]; else d.tl[id] = 'done'; });
};
A.tlSkip = el => { haptic('selection'); mutDay(todayISO(), d => { d.tl = d.tl || {}; if (d.tl[el.dataset.id] === 'skip') delete d.tl[el.dataset.id]; else d.tl[el.dataset.id] = 'skip'; }); };

/* events */
function evBody(){
  const R = plan().routine || {}, today = todayISO(), cur = (R.events || []).find(e => e.id === SH?.evEdit) || {};
  const list = (R.events || []).filter(e => (e.toDate || e.date) >= today).sort((a, b) => a.date.localeCompare(b.date));
  return `<section class="card" style="padding:4px 18px"><div class="list">${list.length ? list.map(e => `<div class="row"><button class="mid" data-act="evEdit" data-id="${esc(e.id)}" style="text-align:left"><div class="t">${esc(e.title)}${EV_KIND[e.kind]?.[2] ? ` <span class="tag ${EV_KIND[e.kind][2]}">${EV_KIND[e.kind][0]}</span>` : ''}</div><div class="s">${fmtShort(e.date)}${e.toDate && e.toDate !== e.date ? ' – ' + fmtShort(e.toDate) : ''}${e.from ? ' · ' + e.from + (e.until ? '–' + e.until : '') : ''}${e.note ? ' · ' + esc(e.note) : ''}</div></button><button class="iconbtn" data-act="evDel" data-id="${esc(e.id)}" aria-label="${tr("Удалить")} ${esc(e.title)}" style="color:var(--text-3)">${ic('trash')}</button></div>`).join('') : emptyState('day', tr('Событий нет'))}</div></section>
  <section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${cur.id ? tr("Изменить событие") : tr("Новое событие")}</b>
    <div class="seg">${Object.entries(EV_KIND).map(([k, v]) => `<button class="${(SH?.evKind || cur.kind || 'event') === k ? 'on' : ''}" data-act="evKind" data-v="${k}">${v[0]}</button>`).join('')}</div>
    <div class="field"><label for="evT">${tr("Название")}</label><input class="in" id="evT" placeholder="${tr("Например, фест")}" value="${esc(cur.title || '')}"></div>
    <div class="fgrid"><div class="field"><label for="evD">${tr("Дата")}</label><input class="in" type="date" id="evD" value="${esc(cur.date || today)}"></div><div class="field"><label for="evDe">${tr("До даты (если несколько дней)")}</label><input class="in" type="date" id="evDe" value="${esc(cur.toDate || '')}"></div>
    <div class="field"><label for="evF">${tr("Начало")}</label><input class="in" type="time" id="evF" value="${esc(cur.from || '')}"></div><div class="field"><label for="evU">${tr("Конец")}</label><input class="in" type="time" id="evU" value="${esc(cur.until || '')}"></div></div>
    <div class="field"><label for="evN">${tr("Заметка")}</label><input class="in" id="evN" value="${esc(cur.note || '')}"></div>
    <div class="hint">${tr("Если указать время, событие встанет в ленту и вытеснит проект, свободное время и учёбу на этот отрезок.")}</div>
    <button class="btn" data-act="evSave">${ic(cur.id ? 'check' : 'plus')}${cur.id ? tr("Сохранить") : tr("Добавить")}</button>${cur.id ? `<button class="btn ghost" data-act="evEditCancel">${tr("Отменить")}</button>` : ''}</section>`;
}
A.evSheet = () => openSheet(tr('События'), evBody);
A.evEdit = el => { SH.evEdit = el.dataset.id; SH.evKind = null; drawSheet(); $('.sheet').scrollTop = 1e6; };
A.evEditCancel = () => { SH.evEdit = null; SH.evKind = null; drawSheet(); };
A.evSave = () => {
  const title = val('evT'), date = val('evD'); if (!title || !date) return toast(tr('Впиши название и дату'));
  const pl = clone(plan()); pl.routine = pl.routine || clone(DEFAULT_ROUTINE);
  const old = (pl.routine.events || []).find(e => e.id === SH?.evEdit);
  const ev = {...(old ? {prepMin: old.prepMin, studyPlan: old.studyPlan} : {}), id: old?.id || uid(), date, title, note: val('evN'), kind: SH?.evKind || old?.kind || 'event'};
  if (val('evDe') && val('evDe') > date) ev.toDate = val('evDe');
  if (val('evF')){ ev.from = val('evF'); if (val('evU')){ if (badSpan(ev.from, val('evU'))) return toast(tr('Конец раньше начала: проверь время')); ev.until = val('evU'); } }
  pl.routine.events = [...(pl.routine.events || []).filter(e => e.id !== ev.id), ev];
  const fresh = previewWarnings(old ? {cancel_events: [old.id], events: [ev]} : {events: [ev]});
  save('app/plan', pl);
  if (old && old.date !== ev.date && ev.studyPlan){ // the exam moved, so its open topics move with it
    const open = planTasks(ev.id).filter(t => !t.done && t.topic).map(t => t.topic);
    if (open.length && ev.date > todayISO()) applyStudyPlan(ev, buildStudyPlan(open, ev, ev.studyPlan.perTopic));
  }
  SH.evEdit = null; SH.evKind = null; drawSheet();
  if (fresh.length) toast(fresh[0].text, {icon:'alert', tone:'warn', ms:6000}); else toast(old ? tr('Сохранено') : tr('Событие добавлено'));
};
A.evDel = el => { const pl = clone(plan()); if (!pl.routine) return; pl.routine.events = (pl.routine.events || []).filter(e => e.id !== el.dataset.id); save('app/plan', pl); if (planTasks(el.dataset.id).length) saveTasks(smartTasks().filter(t => t.examId !== el.dataset.id || t.done)); if (SH) { if (SH.evEdit === el.dataset.id) SH.evEdit = null; drawSheet(); } };

setInterval(() => { if (S.tab === 'day' && !document.hidden && !SH) scheduleRender(); }, 60000);

/* ============ v3: Ещё hub with unfolding settings, one-step AI connect, Now/Next ============ */

/* ---- accordion ---- */
const accOpen = id => !!S.open['acc_' + id];
function acc(id, icon, title, summary, body, bare){
  const o = accOpen(id);
  const head = `<button class="acc-h ${bare ? 'card bare' : ''}" data-act="accToggle" data-k="${id}" aria-expanded="${o}"><span class="ic">${ic(icon)}</span><div class="mid"><div class="t">${title}</div><div class="s">${summary}</div></div><span class="acc-c">${ic('chevR')}</span></button>`;
  if (bare) return head + (o ? body : '');
  return `<section class="card acc ${o ? 'open' : ''}">${head}${o ? `<div class="acc-b">${body}</div>` : ''}</section>`;
}
A.accToggle = el => {
  haptic('selection');
  const k = 'acc_' + el.dataset.k, was = S.open[k];
  if (!el.classList.contains('bare')) Object.keys(S.open).forEach(x => { if (x.startsWith('acc_') && x !== 'acc_stats') delete S.open[x]; });
  S.open[k] = !was;
  const inSheet = !!el.closest('.sheet');
  if (inSheet) drawSheet(); else render();
  if (S.open[k]){ if (el.dataset.k === 'data') showStorage(); setTimeout(() => { const h = $(`[data-act=accToggle][data-k=${el.dataset.k}]`); if (h) h.scrollIntoView({block:'nearest', behavior: reduceMotion() ? 'auto' : 'smooth'}); }, 30); }
};

/* ---- AI: status + one-step connect ---- */
function aiStatus(){
  if (S.inClaude) return {ok: !!SAMPLE_CAP, text: tr('Claude в приложении Claude')};
  const c = aiCfg(), p = c.order.find(x => provConfigured(x));
  return p ? {ok:true, p, text: PROV[p].short + tr(' · основной')} : {ok:false, text:tr('Не подключён')};
}
function connectNudge(forTell){
  if (aiStatus().ok) return '';
  // Tell KAI half-works without AI, so it says what does
  if (forTell) return `<div class="note" style="display:flex;flex-direction:column;gap:10px"><div>${tr('Без ИИ я понимаю сон, шаги, прогулки, вес, расходы, подходы в зале, отметки задач, дела с датой и еду с граммами или штуками. Для остального подключи ИИ.')}</div><button class="btn ghost" data-act="${cloudOn() ? 'accountSheet' : 'aiConnect'}">${ic('spark')}${cloudOn() ? tr('Войти') : tr("Подключить Claude или ChatGPT")}</button></div>`;
  if (cloudOn()) return `<div class="note" style="display:flex;flex-direction:column;gap:10px"><div>${tr('Войди, чтобы пользоваться ИИ: без него разбор сообщений и фото еды не работает.')}</div><button class="btn" data-act="accountSheet">${ic('spark')}${tr('Войти')}</button></div>`;
  return `<div class="note" style="display:flex;flex-direction:column;gap:10px"><div>${tr("ИИ ещё не подключён. Без него не работают фото еды и скриншоты, а сообщения я понимаю только простые. Подключение занимает минуту.")}</div><button class="btn" data-act="aiConnect">${ic('spark')}${tr("Подключить Claude или ChatGPT")}</button></div>`;
}
const SVC = {
  claude: {name:'Claude', url:'https://console.anthropic.com/settings/keys', host:'console.anthropic.com', hint:'sk-ant-…'},
  openai: {name:'ChatGPT', url:'https://platform.openai.com/api-keys', host:'platform.openai.com', hint:'sk-…'},
};
const detectSvc = k => /^sk-ant-/.test(k) ? 'claude' : /^sk-/.test(k) ? 'openai' : null;
function aiConnectBody(){
  const svc = SH.svc || 'claude', s = SVC[svc];
  if (SH.done) return `<div class="wlogo" style="padding:18px 0 6px"><span class="okbig">${ic('check')}</span><b style="font-size:20px">${SVC[SH.done].name} ${tr("подключён")}</b><div class="hint">${tr("Он стал основным ИИ. Теперь можно пользоваться кнопкой «Рассказать» и фото еды.")}</div></div><button class="btn block" data-act="closeSheet">${tr("Готово")}</button>`;
  return `<div class="hint">${tr("ИИ разбирает сообщения, фото еды и скриншоты. Выбери сервис, получи ключ и вставь его сюда.")}</div>
  <div class="seg" role="tablist">${Object.entries(SVC).map(([k, v]) => `<button class="${svc === k ? 'on' : ''}" role="tab" aria-selected="${svc === k}" data-act="svcPick" data-v="${k}">${v.name}</button>`).join('')}</div>
  <ol class="steps">
    <li><span>1</span><div>${tr("Открой страницу ключей. Войди в аккаунт")} ${s.name} ${tr("и нажми «Create key».")}<div style="margin-top:8px"><a class="btn ghost" href="${s.url}" target="_blank" rel="noopener">${ic('send')}${tr("Открыть")} ${s.host}</a></div></div></li>
    <li><span>2</span><div>${tr("Скопируй ключ. Он начинается с")} <b style="white-space:nowrap">${s.hint}</b> ${tr("и показывается один раз.")}</div></li>
    <li><span>3</span><div>${tr("Вставь его сюда:")}<div class="field" style="margin-top:8px"><input class="in" id="acKey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${s.hint}" aria-label="${tr("Ключ API")}"></div></div></li>
  </ol>
  <div class="btnrow"><button class="btn" data-act="aiConnectGo">${tr("Подключить")}</button><button class="btn ghost" data-act="aiPaste">${ic('plus')}${tr("Вставить из буфера")}</button></div>
  <div id="acOut"></div>
  <div class="hint">${tr("Нужен именно ключ API, а не подписка Claude Pro или ChatGPT Plus: подписка в приложениях не работает. Платишь только за запросы, лимит расходов можно поставить в кабинете сервиса. Ключ хранится только в этом телефоне и не попадает в резервные копии.")}</div>`;
}
A.aiConnect = () => { if (cloudOn() && !signedIn()) return A.accountSheet(); if (!ownKeysAllowed()) return A.aiSheet(); if (!meta().welcomed) setMeta({welcomed: true}); openSheet(tr('Подключить ИИ'), aiConnectBody); SH.svc = 'claude'; };
A.svcPick = el => { SH.svc = el.dataset.v; drawSheet(); };
A.aiPaste = async el => {
  try {
    const t = (await navigator.clipboard.readText() || '').trim();
    if (!t) return toast(tr('В буфере пусто'));
    const inp = $('#acKey'); if (inp) inp.value = t;
    const d = detectSvc(t); if (d && d !== SH.svc){ SH.svc = d; drawSheet(); $('#acKey').value = t; }
    if (d) return A.aiConnectGo($('[data-act=aiConnectGo]'));
    toast(tr('Это не похоже на ключ: он начинается с sk-'));
  } catch { toast(tr('Не удалось прочитать буфер. Вставь ключ в поле вручную.')); }
};
async function openaiModels(key){
  let r; try { r = await fetch('https://api.openai.com/v1/models', {headers:{Authorization:'Bearer ' + key}}); } catch { throw new AIError(tr('Нет связи с ChatGPT'), false); }
  if (r.status === 401) throw new AIError(tr('ChatGPT не принял ключ. Проверь, что скопировал его целиком.'), true);
  if (!r.ok) throw new AIError(tr('ChatGPT временно недоступен (') + r.status + ')', false);
  const d = await r.json(); return (d.data || []).map(m => m.id);
}
function bestOpenAI(ids){
  const pref = ['gpt-5-mini', 'gpt-5', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini', 'gpt-4o'];
  return pref.find(p => ids.includes(p)) || ids.filter(i => /^gpt-/.test(i) && !/(audio|realtime|image|transcribe|tts|search|instruct|codex|nano)/.test(i)).sort()[0] || null;
}
A.aiConnectGo = async el => {
  const key = val('acKey').replace(/\s+/g, ''), out = $('#acOut');
  if (!key) return toast(tr('Вставь ключ'));
  const svc = detectSvc(key);
  if (!svc){ out.innerHTML = `<div class="note">${tr("Это не похоже на ключ API: он начинается с sk-. Проверь, что скопировал именно ключ.")}</div>`; return; }
  const prev = clone(S.docs['app/ai'] || DEFAULT_AI);
  const c = clone(aiCfg());
  busy(el, true, tr('Проверяю…'));
  try {
    if (svc === 'claude'){ c.claude = {...c.claude, key}; save('app/ai', c); await callClaude(tr('Ответь одним словом: работает'), [], false); }
    else { const ids = await openaiModels(key); const model = bestOpenAI(ids); if (!model) throw new AIError(tr('В этом аккаунте ChatGPT нет доступных моделей для чата.'), true); c.openai = {...c.openai, key, model, models: ids.filter(i => /^gpt-/.test(i)).sort()}; save('app/ai', c); await callOpenAI(tr('Ответь одним словом: работает'), [], false); }
    const c2 = clone(aiCfg()); c2.order = [svc, ...c2.order.filter(x => x !== svc)]; save('app/ai', c2);
    AI.downUntil = {}; processQueue(); haptic('success');
    SH.done = svc; drawSheet();
  } catch(e){
    save('app/ai', prev);
    const msg = e instanceof AIError ? e.message : tr('Не получилось подключиться. Проверь интернет и ключ.');
    if (out) out.innerHTML = `<div class="note">${esc(msg)}</div>`;
    busy(el, false);
  }
};
async function callOpenAI(prompt, imgs, json){
  const c = aiCfg().openai;
  let content = prompt + (json ? '\n\nОтветь только JSON, без пояснений.' : '');
  if (imgs.length){ content = [{type:'text', text: content}]; for (const b of imgs) content.push({type:'image_url', image_url:{url:'data:' + (b.type || 'image/jpeg') + ';base64,' + await blobToB64(b)}}); }
  const body = {model: c.model || 'gpt-4o-mini', messages:[{role:'user', content}]};
  if (json) body.response_format = {type:'json_object'};
  const t = withTimeout(180000); let r;
  try { r = await fetch('https://api.openai.com/v1/chat/completions', {method:'POST', signal:t.signal, headers:{'content-type':'application/json', Authorization:'Bearer ' + c.key}, body: JSON.stringify(body)}); }
  catch { throw new AIError(tr('Нет связи с ChatGPT'), false); } finally { t.done(); }
  if (r.status === 401) throw new AIError(tr('ChatGPT не принял ключ. Проверь ключ в настройках ИИ.'), true);
  if (r.status === 429){ const e = await r.json().catch(() => ({})); throw new AIError(/quota|billing/i.test(JSON.stringify(e)) ? tr('В аккаунте ChatGPT закончился баланс. Пополни его на platform.openai.com.') : tr('ChatGPT: слишком много запросов, попробую позже.'), /quota|billing/i.test(JSON.stringify(e))); }
  if (r.status === 400 || r.status === 404){ const e = await r.json().catch(() => ({})); throw new AIError(tr('ChatGPT не принял запрос: ') + (e.error?.message || tr('ошибка ') + r.status), true); }
  if (!r.ok) throw new AIError(tr('ChatGPT временно недоступен (') + r.status + ')', false);
  const d = await r.json();
  return d.choices?.[0]?.message?.content || '';
}
/* in the iPhone app with KAI's own AI, paying another company for a key could read as buying features outside in-app purchase (App Review 3.1.1); the web keeps it */
const ownKeysAllowed = () => !(isNative() && cloudOn()) || !!CFG.ownKeys;
function aiSettings(){
  if (!ownKeysAllowed()) return `<section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${tr('ИИ от KAI')}</b><div class="hint">${signedIn() ? tr('ИИ работает через твой аккаунт, ключи не нужны.') : tr('Войди, чтобы пользоваться ИИ без ключей.')}</div>${signedIn() ? `<button class="btn ghost" data-act="usageSheet">${ic('activity')}${tr('Расход ИИ')}</button>` : `<button class="btn" data-act="accountSheet">${tr('Войти')}</button>`}</section>`;
  if (S.inClaude) return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr("ИИ здесь — это Claude")}</b><div class="hint">${tr("Внутри приложения Claude запросы идут через твой аккаунт Claude: ключ API не нужен. При первом запросе Claude попросит разрешение.")}</div></section>`;
  const c = aiCfg(), st = aiStatus();
  const row = p => { const ok = provConfigured(p); return `<div class="row"><span class="ic">${ic(PROV[p].icon)}</span><div class="mid"><div class="t">${PROV[p].name}</div><div class="s">${ok ? (st.p === p ? tr('основной') : tr('подключён')) : tr('не подключён')}</div></div>${ok ? `<span class="tag good">${st.p === p ? tr('по умолчанию') : tr('запасной')}</span>` : ''}</div>`; };
  return `<section class="card" style="display:flex;flex-direction:column;gap:12px"><b>${st.ok ? tr('ИИ подключён') : tr('Подключи ИИ')}</b>
    <div class="hint">${st.ok ? tr('Основной отвечает первым. Если он недоступен, запрос уйдёт запасному или подождёт в очереди.') : tr('Claude или ChatGPT: вставь ключ API, дальше всё само.')}</div>
    <div class="list">${c.order.filter(p => provConfigured(p) || p === 'claude' || p === 'openai').map(row).join('')}</div>
    <button class="btn" data-act="aiConnect">${ic('spark')}${st.ok ? tr('Подключить другой или заменить ключ') : tr('Подключить Claude или ChatGPT')}</button></section>
  ${acc('aiadv', 'sliders', tr('Дополнительно'), tr('Порядок, модели, свой компьютер, ИИ в телефоне'), aiSettingsFull(), true)}`;
}
A.aiSaveOpenAI = () => { const c = clone(aiCfg()); c.openai = {...c.openai, key: val('oaKey'), model: val('oaModel') || c.openai.model}; save('app/ai', c); AI.downUntil = {}; toast(tr('Сохранено')); processQueue(); };

/* ---- the Ещё hub ---- */
function viewMore(){
  const p = profile(), t = targets(), pl = plan(), m = meta(), s = season(), di = Math.max(1, dayDiff(s.start, todayISO()) + 1), st = aiStatus();
  const pr = activeProgram();
  const days = (pl.schedule ? Object.keys(pl.schedule).map(Number).sort().map(n => DOW[n]).join(' ') : '');
  const lastB = m.lastBackup ? dayDiff(m.lastBackup, todayISO()) : null;
  const fx = FX();
  let h = `<section class="card profhead"><button class="ava big" data-act="season" aria-label="${tr("Сезон")}">${esc((p.name || 'K')[0])}</button><div class="mid"><div class="t" style="font-size:19px">${esc(p.name || tr('Профиль'))}</div><div class="s">${esc(s.title)} ${tr("· день")} ${di} ${tr("из")} ${s.length || 90}</div></div><button class="link" data-act="season">${tr("Сезон")}</button></section>`;
  if (!st.ok && !cloudOn()) h += `<section class="card nudge"><span class="ic">${ic('spark')}</span><div class="mid"><div class="t">${tr("Подключи ИИ")}</div><div class="s">${tr("Claude или ChatGPT. Одна минута, один ключ.")}</div></div><button class="btn" data-act="aiConnect">${tr("Начать")}</button></section>`;
  if (cloudOn()) h += accountCard(); // signing in unlocks AI without keys, so it sits near the top
  if (modOn('content')) h += `<button class="card navrow" data-act="tab" data-v="content"><span class="ic">${ic('video')}</span><div class="mid"><div class="t">${tr("Контент")}</div><div class="s">${tr("Сценарии, план роликов, продвижение")}</div></div>${ic('chevR')}</button>`;
  h += acc('profile', 'user', tr('Профиль и норма питания'), t.ok ? `${W(p.weight)} ${kgU()} · ${heightShow(p.height)}${isUS() ? '' : ' ' + cmU()} · ${tr("норма")} ${num(t.kcal)} ${tr("ккал")}` : tr('Укажи рост, вес и возраст: нужны для нормы КБЖУ'), `<div class="fgrid">
      <div class="field"><label for="pfN">${tr("Имя")}</label><input class="in" id="pfN" data-ch="pf" data-k="name" value="${esc(p.name || '')}"></div>
      <div class="field"><label for="pfA">${tr("Возраст")}</label><input class="in" id="pfA" inputmode="numeric" data-ch="pf" data-k="age" value="${esc(p.age || '')}"></div>
      <div class="field"><label for="pfH">${isUS() ? tr('Рост, футы и дюймы') : tr("Рост, см")}</label><input class="in" id="pfH" ${isUS() ? 'placeholder="5\'10"' : 'inputmode="decimal"'} data-ch="pf" data-k="height" value="${esc(heightShow(p.height))}"></div>
      <div class="field"><label for="pfW">${tr('Вес')}, ${kgU()}</label><input class="in" id="pfW" inputmode="decimal" data-ch="pf" data-k="weight" value="${esc(W(p.weight) || '')}"></div>
      <div class="field"><label for="pfWa">${tr('Талия')}, ${cmU()}</label><input class="in" id="pfWa" inputmode="decimal" data-ch="pf" data-k="waist" value="${esc(L(p.waist) || '')}"></div>
      <div class="field"><label for="pfUn">${tr('Единицы')}</label><select class="in" id="pfUn" data-ch="pf" data-k="units">${[['metric', tr('Килограммы и сантиметры')], ['us', tr('Фунты и дюймы')]].map(([v, l]) => `<option value="${v}" ${(p.units || 'metric') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="pfGo">${tr("Цель по весу")}</label><select class="in" id="pfGo" data-ch="pf" data-k="goal">${[['keep', tr('Держать вес')], ['lose', tr('Снизить вес')], ['gain', tr('Набрать массу')]].map(([v, l]) => `<option value="${v}" ${goalOf(p) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="pfSx">${tr("Пол (для расчёта нормы)")}</label><select class="in" id="pfSx" data-ch="pf" data-k="sex">${[['', tr('Не указывать')], ['f', tr('Женский')], ['m', tr('Мужской')]].map(([v, l]) => `<option value="${v}" ${(p.sex || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="pfCur">${tr("Валюта")}</label><input class="in" id="pfCur" data-ch="pf" data-k="currency" value="${esc(p.currency || '')}" placeholder="₽, $, €, RM"></div>
      <div class="field"><label for="pfAb">${tr("О себе: это учитывает ИИ")}</label><input class="in" id="pfAb" data-ch="pf" data-k="about" value="${esc(p.about || '')}" placeholder="${tr("Питание, ограничения, чем занимаешься")}"></div>
      <div class="field"><label for="pfAc">${tr("Активность")}</label><select class="in" id="pfAc" data-ch="pf" data-k="activity">${[[1.35, tr('Учёба сидя + 3 тренировки')], [1.45, tr('+ 8–10 тыс. шагов')], [1.6, tr('+ 12 тыс. шагов и больше')]].map(([v, l]) => `<option value="${v}" ${(+p.activity || 1.45) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    ${t.ok ? `<div class="note">${tr("Норма:")} <b>${t.kcal} ${tr("ккал")}</b> ${tr("· белок")} ${t.p} ${tr("г · жиры")} ${t.f} ${tr("г · углеводы")} ${t.c} ${tr("г.")}</div>${careNote(t)}` : `<div class="hint">${tr("Сохраняется само, когда выходишь из поля.")}</div>`}<div class="hint">${NOT_MED()}</div>`);
  h += acc('train', 'gym', tr('Тренировки'), esc((pr?.name || tr('Своя программа')) + (days ? ' · ' + days : '')), `${pl.programs ? `<div class="hint">${esc(pr?.info || '')}</div><button class="btn ghost" data-act="programSheet">${ic('swap')}${tr("Сменить программу")}</button>` : ''}
    <div class="hint">${tr("Дни недели")}</div><div class="fgrid" style="grid-template-columns:repeat(auto-fit,minmax(88px,1fr))">${[1, 2, 3, 4, 5, 6, 7].map(n => `<div class="field"><label for="sch${n}">${DOW[n]}</label><select class="in" id="sch${n}" data-ch="sch" data-n="${n}"><option value="">${tr("отдых")}</option>${programKeys().map(k => `<option value="${k}" ${pl.schedule?.[n] === k ? 'selected' : ''}>${tr(k)}</option>`).join('')}</select></div>`).join('')}</div>`);
  h += acc('day', 'day', tr('Расписание дня'), trf('Прогулки {m} мин в день · событий впереди: {n}', {m: pl.routine?.walkGoal || 120, n: (pl.routine?.events || []).filter(e => (e.toDate || e.date) >= todayISO()).length}), `<div class="field"><label for="walkGoal">${tr("Цель по прогулкам, минут в день")}</label><input class="in" id="walkGoal" inputmode="numeric" data-ch="walkGoal" value="${pl.routine?.walkGoal || 120}"></div>
    <button class="btn ghost" data-act="evSheet">${ic('star')}${tr("События: фест, экзамены, поездки")}</button>`);
  const cls = (pl.classes || []).map((c, i) => ({...c, i})).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  h += acc('tasks', 'list', tr('Ежедневные задачи'), shownDaily(pl).length + ' ' + plural(shownDaily(pl).length, tr('задача'), tr('задачи'), tr('задач')), `<div class="list">${(pl.dailyTasks || []).map((tk, i) => `<div class="row"><div class="mid"><div class="t">${esc(tk.title)}</div></div><button class="iconbtn" data-act="dtDel" data-i="${i}" aria-label="${tr("Убрать")} ${esc(tk.title)}" style="color:var(--text-3)">${ic('trash')}</button></div>`).join('')}</div>
    <div style="display:flex;gap:8px"><input class="in" id="dtNew" placeholder="${tr("Новая ежедневная задача")}"><button class="btn" data-act="dtAdd" aria-label="${tr("Добавить")}">${ic('plus')}</button></div>`);
  h += isNative() ? acc('remind', 'bell', tr('Напоминания'), m.remindAsked ? tr('Включены') : tr('Не настроены'), `<button class="btn" data-act="notifSheet">${ic('bell')}${tr('Настроить напоминания')}</button>`) + healthRow() : acc('remind', 'bell', tr('Напоминания'), m.icsAt ? tr('Календарь iPhone настроен') : tr('Не настроены'), `<div class="hint">${tr("Календарь iPhone напомнит о тренировке, еде и сне, даже когда приложение закрыто.")}</div><button class="btn" data-act="ics">${ic('day')}${tr("Настроить напоминания в Календарь")}</button>`);
  if (cls.length || (p.role || 'study') === 'study') h += acc('classes', 'cap', tr('Расписание пар'), cls.length ? cls.length + ' ' + plural(cls.length, tr('пара'), tr('пары'), tr('пар')) : tr('Пока пусто. Впиши, когда придёт расписание'), `<div class="list">${cls.map(c => `<div class="row"><div class="mid"><div class="t">${esc(c.title)}</div><div class="s">${DOW[c.day]} · ${esc(c.time)}${c.end ? '–' + esc(c.end) : ''}</div></div><button class="iconbtn" data-act="clsDel2" data-i="${c.i}" aria-label="${tr("Удалить")} ${esc(c.title)}" style="color:var(--text-3)">${ic('trash')}</button></div>`).join('')}</div>
    <div class="fgrid" style="grid-template-columns:1fr 1fr;gap:8px"><select class="in" id="clD" style="grid-column:1/-1" aria-label="${tr("День")}">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}">${DOW[n]}</option>`).join('')}</select><div class="field" style="min-width:0"><label for="clT">${tr("Начало")}</label><input class="in" id="clT" type="time" value="09:00"></div><div class="field" style="min-width:0"><label for="clE">${tr("Конец")}</label><input class="in" id="clE" type="time"></div><input class="in" id="clN" style="grid-column:1/-1" placeholder="${tr("Предмет, ауд.")}" aria-label="${tr("Предмет")}"></div>
    <button class="btn" data-act="clsAdd2">${ic('plus')}${tr("Добавить пару")}</button>`);
  h += acc('ai', 'spark', tr('ИИ'), esc(st.text), `<div class="hint">${tr("Разбирает сообщения, фото еды и скриншоты.")}</div><div class="btnrow"><button class="btn" data-act="aiConnect">${ic('spark')}${st.ok ? tr('Сменить или добавить') : tr('Подключить')}</button><button class="btn ghost" data-act="aiSettingsOpen">${tr("Все настройки ИИ")}</button></div>`);
  h += acc('modules', 'sliders', tr('Модули'), MODULES.filter(x => !modOn(x[0])).length ? tr('Выключено: ') + MODULES.filter(x => !modOn(x[0])).map(x => x[1]).join(', ') : tr('Всё включено'), modulesRows() + `<div class="hint">${tr("Выключенный модуль прячется, но его данные не удаляются.")}</div>` + (modOn('content') ? `<div class="field"><label for="pfWT">${tr("Цель роликов в неделю")}</label><input class="in" id="pfWT" inputmode="numeric" data-ch="wt" value="${content().weeklyTarget || 4}"></div>` : ''));
  h += `<button class="card navrow" data-act="kb"><span class="ic">${ic('book')}</span><div class="mid"><div class="t">${tr("База знаний")}</div><div class="s">${tr("Твои статьи и заметки, ответы ИИ по ним")}</div></div>${ic('chevR')}</button>`;
  h += acc('fx', 'zap', tr('Отклик'), (fx.haptics ? tr('Вибрация вкл') : tr('Вибрация выкл')) + ' · ' + (fx.sound ? tr('звуки вкл') : tr('звуки выкл')), [['haptics', tr('Вибрация при действиях'), tr('На iPhone нужна iOS 18 или новее')], ['sound', tr('Звуки'), tr('Короткий звук при отметке и наградах')]].map(([k, l, hh]) => `<label class="row" style="padding:10px 0"><div class="mid"><div class="t">${l}</div><div class="s">${hh}</div></div><input type="checkbox" switch class="sw" data-ch="fxToggle" data-k="${k}" aria-label="${l}" ${fx[k] ? 'checked' : ''}></label>`).join(''));
  h += `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('Язык')}</b>${langSeg()}<b id="themeL">${tr('Оформление')}</b>${themeSeg()}</section>`;
  h += acc('data', 'shield', tr('Данные и копия'), lastB == null ? tr('Копии ещё нет') : lastB === 0 ? tr('Копия сегодня') : `${tr("Копия")} ${lastB} ${plural(lastB, tr('день'), tr('дня'), tr('дней'))} ${tr("назад")}`, `<div class="hint">${tr("Всё хранится в этом телефоне. Раз в неделю сохраняй копию в «Файлы» или iCloud: если iOS очистит память, данные можно вернуть.")}</div><div id="storeInfo" class="hint"></div>
    <div class="btnrow"><button class="btn" data-act="exportData">${tr("Сохранить копию")}</button><label class="btn ghost">${tr("Загрузить копию")}<input type="file" accept="application/json,.json" hidden data-ch="importData"></label></div>
    <label class="row" style="padding:6px 0"><input type="checkbox" id="expPhotos" style="width:20px;height:20px"><div class="mid"><div class="t">${tr("Включить фото формы в копию")}</div></div></label>
    <button class="btn ghost" data-act="chatReport">${tr("Скопировать отчёт для чата с Claude")}</button>
    <div class="hint">${tr("Удаление стирает всё, что KAI хранит на этом телефоне. Облачная копия, если ты входил в аккаунт, остаётся: её удаляют в разделе «Аккаунт».")}</div>
    <button class="btn danger" data-act="wipeLocal">${ic('trash')}${tr("Удалить все данные на этом телефоне")}</button>`);
  if (!cloudOn()) h += accountCard(); // without a server it is privacy and legal links: last
  return h;
}
function modulesRows(){
  return MODULES.map(([k, l, hh]) => `<label class="row" style="padding:10px 0"><div class="mid"><div class="t">${l}</div><div class="s">${hh}</div></div><input type="checkbox" switch class="sw" data-ch="modToggle" data-k="${k}" aria-label="${l}" ${modOn(k) ? 'checked' : ''}></label>`).join('');
}
CH.pf = el => {
  const k = el.dataset.k, p = clone(profile());
  p[k] = ['name', 'about', 'currency', 'goal', 'sex', 'units'].includes(k) ? el.value.trim() : k === 'height' ? heightIn(el.value) : k === 'weight' ? wIn(toNum(el.value)) : k === 'waist' ? lIn(toNum(el.value)) : toNum(el.value);
  save('app/profile', p);
  if ((k === 'weight' || k === 'waist') && p[k]) mutDay(todayISO(), d => { if (d[k] == null) d[k] = p[k]; });
};
CH.sch = el => {
  const pl = clone(plan()), n = el.dataset.n; pl.schedule = pl.schedule || {};
  if (el.value) pl.schedule[n] = el.value; else delete pl.schedule[n];
  if (pl.programs?.[pl.program]) pl.programs[pl.program].schedule = clone(pl.schedule);
  save('app/plan', pl); toast(tr('Дни тренировок сохранены'));
};
CH.walkGoal = el => { const pl = clone(plan()); pl.routine = pl.routine || clone(DEFAULT_ROUTINE); pl.routine.walkGoal = Math.max(10, toNum(el.value) || 120); save('app/plan', pl); };
CH.wt = el => { const c = clone(content()); c.weeklyTarget = toNum(el.value) || 4; save('app/content', c); };
A.clsAdd2 = () => {
  const title = val('clN'); if (!title) return toast(tr('Впиши предмет'));
  const pl = clone(plan()); const time = val('clT') || '09:00', end = val('clE'); pl.classes = [...(pl.classes || []), {day: +val('clD'), time, title, ...(end && end > time ? {end} : {})}]; save('app/plan', pl); toast(tr('Пара добавлена'));
};
A.clsDel2 = el => { const pl = clone(plan()); pl.classes.splice(+el.dataset.i, 1); save('app/plan', pl); };
A.aiSettingsOpen = () => { A.aiSheet(); SH.aiTab = 'set'; drawSheet(); };
A.profile = () => { closeSheetQuiet(); S.tab = 'more'; S.animIn = true; window.scrollTo(0, 0); render(); };

/* ---- Now / Next ---- */
function tlState(date){
  const d = getDay(date), now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
  const bl = applyShifts(dayBlocks(date), d);
  const st = b => b.gym ? (d.tasks.find(t => t.id === 'gym')?.done ? 'done' : d.tl?.[b.id]) : d.tl?.[b.id];
  return {d, nowM, bl, st, endOf: b => b.e ?? b.s + 30};
}
const inMin = n => n < 60 ? n + tr(' мин') : Math.floor(n / 60) + tr(' ч') + (n % 60 ? ' ' + (n % 60) + tr(' мин') : '');
/* ============ v4: smart tasks, check-ins, scheduler, adaptive training, walking, screen time ============ */
const nowHM = () => { const n = new Date(); return pad(n.getHours()) + ':' + pad(n.getMinutes()); };
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

/* ---- smart tasks ---- */
const smartTasks = () => S.docs['app/tasks']?.items || [];
const saveTasks = items => save('app/tasks', {items});
const WD_RU = [['понедельник[а-яё]*', 1], ['вторник[а-яё]*', 2], ['сред(?:а|у|ы|е|ой)', 3], ['четверг[а-яё]*', 4], ['пятниц(?:а|у|ы|е|ей)', 5], ['суббот(?:а|у|ы|е|ой)', 6], ['воскресень(?:е|я|ю)', 7], ['monday', 1], ['tuesday', 2], ['wednesday', 3], ['thursday', 4], ['friday', 5], ['saturday', 6], ['sunday', 7]];
/* "25 января", "January 20", "20 Jan": this year, or next year once the day has passed */
const MONTHS_RU = ['январ', 'феврал', 'март', 'апрел', 'ма[яй]', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
const MONTHS_EN = ['jan(?:uary)?', 'feb(?:ruary)?', 'mar(?:ch)?', 'apr(?:il)?', 'may', 'june?', 'july?', 'aug(?:ust)?', 'sep(?:t(?:ember)?)?', 'oct(?:ober)?', 'nov(?:ember)?', 'dec(?:ember)?'];
const MONTH_ALT = [...MONTHS_RU.map(m => '(' + m + ')[а-яё]*'), ...MONTHS_EN.map(m => '(' + m + ')\\.?(?![a-z])')].join('|'); // English names whole, so "market" isn't March
const MONTH_DATE = new RegExp('(?:^|\\s)(?:(?:до|к|на|by|on|until)\\s+)?(?:(\\d{1,2})\\s+(?:' + MONTH_ALT + ')|(?:' + MONTH_ALT + ')\\s+(\\d{1,2})(?:st|nd|rd|th)?)(?![\\d:])', 'i');
function monthDate(m){
  const g = m.slice(1), day = +(g[0] || g[g.length - 1]), mi = g.slice(1, -1).findIndex(x => x) % 12;
  const today = todayISO(), y = +today.slice(0, 4);
  let k = `${y}-${pad(mi + 1)}-${pad(day)}`;
  if (k < today) k = `${y + 1}-${pad(mi + 1)}-${pad(day)}`;
  return k;
}
function parseQuick(raw, defDue){
  let t = ' ' + String(raw).trim() + ' ', due = null, time = null, pri = 2, parsed = false;
  const today = todayISO();
  if (/!/.test(t) || /срочно|\burgent\b/i.test(t)){ pri = 1; t = t.replace(/!+/g, ' ').replace(/срочно|\burgent\b/ig, ' '); }
  let m = t.match(/(^|[^\d])([01]?\d|2[0-3])[:.]([0-5]\d)(?!\d)(?:\s*(am|pm)\b)?/i);
  if (m){ let h = +m[2]; if (/pm/i.test(m[4] || '') && h < 12) h += 12; if (/am/i.test(m[4] || '') && h === 12) h = 0; time = pad(h) + ':' + m[3]; t = t.replace(m[0], m[1] + ' '); parsed = true; } /* "9:30pm" is 21:30 */
  else if ((m = t.match(/(?:\bin|через)\s+(?:(\d{1,3})\s*)?(hours?|hrs?|час(?:а|ов)?|minutes?|mins?|минут[уы]?|мин)(?![a-zа-яё])|(?:\bin\s+half an hour|через полчаса)/i))){
    const n = +(m[1] || 1), mins = /^(?:h|час)/i.test(m[2] || '') ? n * 60 : m[2] ? n : 30, at = new Date(Date.now() + mins * 60000); /* "in 2 hours", "через полчаса" */
    time = pad(at.getHours()) + ':' + pad(at.getMinutes()); due = at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate()); t = t.replace(m[0], ' '); parsed = true;
  }
  else if ((m = t.match(/\s(?:в|к)\s+(\d{1,2})\s*(?:час[а-яё]*|ч)(?![а-яё])/i)) && +m[1] < 24){ time = pad(+m[1]) + ':00'; t = t.replace(m[0], ' '); parsed = true; }
  else if ((m = t.match(/\s(?:в|к)\s+(\d{1,2})(?=[\s,.!?]|$)(?!\s*(?:мин|ч|час|раз|кг|км|г\s|%|класс|кабинет|аудитор|корпус))/i)) && +m[1] >= 1 && +m[1] < 24){ const h = +m[1] <= 6 ? +m[1] + 12 : +m[1]; time = pad(h) + ':00'; t = t.replace(m[0], ' '); parsed = true; } // "в 12": an hour of the day; "в 5" is the afternoon
  else if ((m = t.match(/\b(?:at\s+)?(\d{1,2})\s*(am|pm)\b|\bat\s+(\d{1,2})(?![\d:.])/i))){ let h = +(m[1] || m[3]); if (/pm/i.test(m[2] || '') && h < 12) h += 12; if (/am/i.test(m[2] || '') && h === 12) h = 0; if (!m[2] && h >= 1 && h <= 6) h += 12; /* "at 5" means the afternoon */ if (h < 24){ time = pad(h) + ':00'; t = t.replace(m[0], ' '); parsed = true; } }
  if (/послезавтра(?![а-яё])|\bday after tomorrow\b/i.test(t)){ due = addDays(today, 2); t = t.replace(/послезавтра(?![а-яё])|\bday after tomorrow\b/ig, ' '); }
  else if (/завтра(?![а-яё])|\btomorrow\b/i.test(t)){ due = addDays(today, 1); t = t.replace(/завтра(?![а-яё])|\btomorrow\b/ig, ' '); } // not "завтрак", breakfast
  else if (/сегодня|\btoday\b/i.test(t)){ due = today; t = t.replace(/сегодня|\btoday\b/ig, ' '); }
  else if ((m = t.match(MONTH_DATE))){ due = monthDate(m); t = t.replace(m[0], ' '); }
  else for (const [w, n] of WD_RU){
    const re = new RegExp('(?:^|\\s)(?:(?:в|во|до|к|на|on|by|next)\\s+)?' + w + '(?![а-яёa-z])', 'i');
    if (re.test(t)){ due = addDays(today, ((n - dow(today) + 7) % 7) || 7); t = t.replace(re, ' '); break; }
  }
  // parts of the day: "tonight", "tomorrow morning", "в субботу утром", "at noon"
  if (!time){
    const PART = [[/\btonight\b|\bthis evening\b|(?:сегодня\s+)?вечером(?![а-яё])/i, '19:00', true], [/\b(?:in the )?morning\b|утром(?![а-яё])/i, '09:00'], [/\b(?:in the )?afternoon\b|дн[её]м(?![а-яё])/i, '14:00'], [/\b(?:at )?(?:noon|midday)\b|(?:в\s+)?полдень(?![а-яё])/i, '12:00']];
    for (const [re, hm0, tonight] of PART) if (re.test(t)){ time = hm0; if (tonight && !due) due = today; t = t.replace(re, ' '); parsed = true; break; }
  }
  // "на следующей неделе" / "next week" pushes a weekday that would fall this week to the next one
  if (/(?:на\s+)?следующей\s+неделе|\bnext\s+week\b/i.test(t)){ if (due && dayDiff(today, due) < 7 && dow(due) > dow(today)) due = addDays(due, 7); t = t.replace(/(?:на\s+)?следующей\s+неделе|\bnext\s+week\b/ig, ' '); }
  if (due) parsed = true;
  if (parsed){ t = t.replace(/^\s*(?:в|во|к|на|до|at|on|by)\s+/i, ' ').replace(/\s+(?:в|к|на|до|at|on|by)\s*$/i, ' '); }
  if (time && !due) due = time <= nowHM() ? addDays(today, 1) : today;
  if (!due && defDue) due = defDue;
  const title = t.replace(/\s+/g, ' ').trim();
  if (!title) return null;
  return {id: uid(), title: title[0].toUpperCase() + title.slice(1), due, time, pri, done:false, created: today};
}
function dueLabel(t){
  if (!t.due) return tr('без срока');
  const today = todayISO();
  const d = t.due === today ? tr('сегодня') : t.due === addDays(today, 1) ? tr('завтра') : t.due < today ? tr('просрочено · ') + fmtShort(t.due) : fmtShort(t.due);
  return d + (t.time ? ' ' + t.time : '');
}
const isOverdue = t => !t.done && !!t.due && (t.due < todayISO() || (t.due === todayISO() && !!t.time && t.time < nowHM()));
function taskCard(){
  if (!modOn('tasks')) return '';
  const today = todayISO(), items = smartTasks().filter(t => !t.done);
  const rank = t => isOverdue(t) ? 0 : t.due === today ? 1 : !t.due ? 2 : 3;
  const sorted = [...items].sort((a, b) => rank(a) - rank(b) || (a.time || '99').localeCompare(b.time || '99') || a.pri - b.pri);
  const now = sorted.filter(t => rank(t) <= 2), later = sorted.filter(t => rank(t) === 3);
  const row = t => {
    const open = S.open['tk_' + t.id], late = isOverdue(t);
    return `<div class="row task ${late ? 'late' : ''}"><span class="tic" style="--tc:var(--${late ? 'bad' : t.pri === 1 ? 'warn' : t.time ? 'c3' : 'c0'})">${ic(t.time ? 'bell' : 'list')}</span>
      <button class="mid" data-act="tkOpen" data-id="${t.id}" aria-expanded="${!!open}" style="text-align:left"><div class="t">${esc(t.title)}${t.pri === 1 ? ` <span class="tag warn">${tr("срочно")}</span>` : ''}</div><div class="s ${late ? 'bad' : ''}">${esc(dueLabel(t))}</div></button><button class="chk" data-act="tkDone" data-id="${t.id}" aria-label="${tr("Выполнено:")} ${esc(t.title)}">${ic('check')}</button></div>
    ${open ? `<div class="detail"><div class="hint">${tr("Перенести")}</div><div class="btnrow">${[['h1', tr('+1 час')], ['eve', tr('Вечером')], ['tom', tr('Завтра')], ['wk', tr('В выходные')], ['none', tr('Без срока')]].map(([w, l]) => `<button class="btn ghost" data-act="tkMove" data-id="${t.id}" data-w="${w}">${l}</button>`).join('')}</div>
      <div class="btnrow"><button class="btn ghost" data-act="tkPri" data-id="${t.id}">${t.pri === 1 ? tr('Не срочно') : tr('Срочно')}</button>${t.due && t.time ? `<button class="btn ghost" data-act="tkIcs" data-id="${t.id}">${ic('bell')}${tr("В Календарь")}</button>` : ''}<button class="btn danger" data-act="tkDel" data-id="${t.id}">${ic('trash')}${tr("Удалить")}</button></div></div>` : ''}`;
  };
  const doneToday = smartTasks().filter(t => t.done && t.doneAt === today).length;
  return `<div class="sec-h"><h2>${tr("Задачи")}</h2><span class="hint">${now.length ? now.length + ' ' + plural(now.length, tr('открыта'), tr('открыты'), tr('открыто')) + (doneToday ? tr(' · готово ') + doneToday : '') : doneToday ? tr('всё сделано') : ''}</span></div>
  <section class="card" style="padding:12px 16px 6px">
    <div class="qadd"><input class="in" id="qa" placeholder="${tr("Что нужно сделать?")}" enterkeyhint="done" aria-label="${tr("Новая задача")}" autocomplete="off"><button class="btn" data-act="qaAdd" aria-label="${tr("Добавить задачу")}">${ic('plus')}</button></div>
    <div class="list">${now.map(row).join('') || `<div class="hint" style="padding:12px 0">${tr("Пока пусто. Пиши как удобно, например «позвонить маме завтра в 18:30»: срок и время я пойму сам.")}</div>`}</div>
    ${later.length ? `<div class="hint" style="padding:10px 0 0;font-weight:700">${tr("Позже")}</div><div class="list">${(S.open.tk_later ? later : later.slice(0, 3)).map(row).join('')}</div>${later.length > 3 ? `<button class="link" data-act="toggleOpen" data-k="tk_later" style="padding:6px 0">${S.open.tk_later ? tr('Свернуть') : tr('Ещё ') + (later.length - 3)}</button>` : ''}` : ''}
    ${smartTasks().some(t => !t.done && t.due && t.time && t.due >= today) ? `<button class="link" data-act="tasksIcs" style="padding:6px 0">${ic('bell')} ${tr("Напомнить через Календарь")}</button>` : ''}
  </section>`;
}
const isDayNote = raw => { const lp = localTellParse(raw, todayISO()).r; return !lp.new_tasks.length && !lp.events.length && tellLines(lp, todayISO()).length > 0 && !careSignal(raw); };
A.qaAdd = () => {
  const el = $('#qa'); const raw = el?.value || ''; if (!raw.trim()) return;
  // "slept 7 hours" is a note about the day, not a to-do: it goes to Tell KAI, shown before anything changes
  if (isDayNote(raw)){
    el.value = ''; A.tell(); SH.tellText = raw; drawSheet();
    if (!aiStatus().ok) tellLocal(raw, todayISO()); // with an AI, the person sends it as usual
    return;
  }
  const t = parseQuick(raw); if (!t) return toast(tr('Впиши, что сделать'));
  saveTasks([...smartTasks(), t]); haptic('light'); el.value = ''; render();
  toast(tr('Добавлено · ') + dueLabel(t));
  if (t.time && !meta().tkHint){ setMeta({tkHint: true}); setTimeout(() => toast(tr('Пока приложение открыто, я напомню. Чтобы звонило и в кармане, нажми «Напомнить через Календарь».'), {ms: 5000}), 2700); }
  setTimeout(() => $('#qa')?.focus(), 80);
};
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target?.id === 'qa'){ e.preventDefault(); A.qaAdd(); } if (e.key === 'Enter' && e.target?.id === 'ciPlan'){ e.preventDefault(); A.ciPlan(); } });
A.tkOpen = el => { const k = 'tk_' + el.dataset.id; S.open[k] = !S.open[k]; render(); };
A.tkDone = el => {
  creditStudy(smartTasks().find(t => t.id === el.dataset.id && !t.done));
  burstAt(el); haptic('light'); sound('pop');
  saveTasks(smartTasks().map(t => t.id === el.dataset.id ? {...t, done:true, doneAt: todayISO()} : t));
};
A.tkDel = el => saveTasks(smartTasks().filter(t => t.id !== el.dataset.id));
A.tkPri = el => saveTasks(smartTasks().map(t => t.id === el.dataset.id ? {...t, pri: t.pri === 1 ? 2 : 1} : t));
function moveTask(t, w){
  const today = todayISO(), n = nowMin();
  if (w === 'h1'){ const m = Math.min(n + 60, 23 * 60 + 30); return {...t, due: today, time: hmStr(Math.ceil(m / 5) * 5)}; }
  if (w === 'eve') return {...t, due: n < 19 * 60 ? today : addDays(today, 1), time: '19:00'};
  if (w === 'tom') return {...t, due: addDays(today, 1), time: t.time || null};
  if (w === 'wk') return {...t, due: addDays(today, ((6 - dow(today) + 7) % 7) || 7), time: null};
  return {...t, due: null, time: null};
}
A.tkMove = el => { saveTasks(smartTasks().map(t => t.id === el.dataset.id ? moveTask(t, el.dataset.w) : t)); toast(tr('Перенесено')); };
function icsText2(events){
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KAI//RU', 'CALSCALE:GREGORIAN'];
  events.forEach(e => {
    const s = e.date.replace(/-/g, '') + 'T' + e.time.replace(':', '') + '00', end = hmStr(Math.min(hm(e.time) + (e.min || 15), 23 * 60 + 59));
    const esc2 = x => String(x).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    L.push('BEGIN:VEVENT', 'UID:' + e.id + '@kai', 'DTSTAMP:' + stamp, 'DTSTART:' + s, 'DTEND:' + e.date.replace(/-/g, '') + 'T' + end.replace(':', '') + '00', 'SUMMARY:' + esc2(e.title),
      'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc2(e.title), 'END:VALARM', 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc2(e.title), 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR'); return L.join('\r\n');
}
async function exportTasksIcs(list){
  const ev = list.filter(t => t.due && t.time && t.due >= todayISO()).map(t => ({id: t.id, title: t.title, date: t.due, time: t.time}));
  if (!ev.length) return toast(tr('Нужны задачи с датой и временем'));
  const ok = await shareOrDownload('kai-zadachi.ics', new Blob([icsText2(ev)], {type: 'text/calendar'}));
  if (ok) toast(tr('Файл готов: открой его и нажми «Добавить»'));
}
A.tkIcs = el => exportTasksIcs(smartTasks().filter(t => t.id === el.dataset.id));
A.tasksIcs = () => exportTasksIcs(smartTasks().filter(t => !t.done));

/* ---- check-in questions ---- */
function checkins(){
  const date = todayISO(), d = getDay(date), asked = d.asked || {}, out = [], n = nowMin(), hr = new Date().getHours();
  const open = k => !(typeof asked[k] === 'string') && !(asked[k] > Date.now());
  const q = (k, o) => { if (open(k)) out.push({k, ...o}); };
  if (modOn('tasks')){
    if (hr >= 6 && hr < 12 && !smartTasks().some(t => !t.done && t.due === date) && !d.planDone) q('plan', {type: 'plan', text: tr('Что нужно сделать сегодня?')});
    smartTasks().filter(t => isOverdue(t)).slice(0, 3).forEach(t => q('t_' + t.id, {type: 'task', id: t.id, text: `${tr('«')}${t.title}${tr('»')} — ${t.due < date ? tr('просрочено, сделал?') : tr('пора. Сделал?')}`}));
    smartTasks().filter(t => !t.done && !t.due && t.askedWhen !== date && t.created !== date).slice(0, 1).forEach(t => q('w_' + t.id, {type: 'when', id: t.id, text: `${tr("Когда сделаешь «")}${t.title}${tr('»')}?`}));
  }
  if (modOn('timeline') && plan().routine){
    const {bl, st, endOf} = tlState(date);
    const from = meta().startedOn === date ? meta().startedAt : 0;
    bl.filter(b => ['walk', 'gym', 'project', 'study'].includes(b.kind) && !st(b) && endOf(b) <= n - 20 && b.s > 6 * 60 && endOf(b) > from).slice(-2).reverse().forEach(b => q('b_' + b.id, {type: 'block', id: b.id, text: b.gym ? tr('Тренировка была?') : `${b.title}${tr(": сделал?")}`}));
  }
  const dwk = dow(date), wkKey = 'wk_' + addDays(date, 1 - dwk);
  if (dwk >= 6 && activeProgram()?.start && date >= activeProgram().start && !meta().weeklyChecks?.[wkKey] && dayKeys().some(k => k > addDays(date, -7) && S.docs['days/' + k].tasks?.some(t => t.id === 'gym' && t.done))) out.push({k: wkKey, type: 'weekly', text: tr('Недельная проверка усталости. Отметь то, что про тебя')});
  if (hr >= 21 && !d.rating) q('rate', {type: 'rate', text: tr('Как прошёл день?')});
  return out;
}
const WEEKLY_Q = [tr('Сплю хуже обычного'), tr('Не хочется идти на тренировку'), tr('Суставы или мышцы болят не от самой тренировки'), tr('Веса или повторы стали падать'), tr('Усталость или раздражительность не проходят')];
function checkinCard(){
  const qs = checkins(); if (!qs.length) return '';
  const c = qs[0], more = qs.length - 1, b = (a, l, cls = '') => `<button class="btn ${cls}" data-act="ciAns" data-k="${esc(c.k)}" data-a="${a}" data-id="${esc(c.id || '')}">${l}</button>`;
  let body = '';
  if (c.type === 'plan') body = `<div class="qadd"><input class="in" id="ciPlan" placeholder="${tr("Дела через запятую")}" aria-label="${tr("Дела на сегодня")}" autocomplete="off"><button class="btn" data-act="ciPlan" aria-label="${tr("Добавить")}">${ic('plus')}</button></div><div class="btnrow">${b('none', tr('Дел нет'), 'ghost')}</div>`;
  else if (c.type === 'task') body = `<div class="btnrow">${b('yes', tr('Сделал'))}${b('later', tr('Через час'), 'ghost')}${b('tom', tr('Завтра'), 'ghost')}${b('del', tr('Убрать'), 'ghost')}</div>`;
  else if (c.type === 'when') body = `<div class="btnrow">${b('eve', tr('Сегодня вечером'), 'ghost')}${b('tom', tr('Завтра'), 'ghost')}${b('wk', tr('В выходные'), 'ghost')}${b('none', tr('Без срока'), 'ghost')}</div>`;
  else if (c.type === 'block') body = `<div class="btnrow">${b('yes', tr('Да'))}${b('no', tr('Нет'), 'ghost')}</div><button class="link" style="align-self:center" data-act="ciAns" data-k="${esc(c.k)}" data-a="later" data-id="${esc(c.id || '')}">${tr('Позже')}</button>`;
  else if (c.type === 'rate') body = `<div class="rate5">${[1, 2, 3, 4, 5].map(i => `<button data-act="ciAns" data-k="rate" data-a="${i}" aria-label="${i} ${tr("из 5")}">${'★'}<small>${i}</small></button>`).join('')}</div><div class="btnrow">${b('later', tr('Не сейчас'), 'ghost')}</div>`;
  else if (c.type === 'weekly') body = `<div class="list">${WEEKLY_Q.map((x, i) => `<button class="row" data-act="wkTog" data-i="${i}"><span class="chk ${S.open['wq_' + i] ? 'on' : ''}" aria-hidden="true">${ic('check')}</span><div class="mid"><div class="t" style="font-weight:500">${x}</div></div></button>`).join('')}</div><div class="hint">${tr("Если отмечено 2 и больше, следующая неделя пойдёт с меньшим объёмом: на подход меньше, вес прежний.")}</div><div class="btnrow"><button class="btn" data-act="wkDone" data-k="${esc(c.k)}">${tr("Готово")}</button></div>`;
  return `<section class="card ci"><div class="nc-l">${tr("Вопрос")}${more ? tr(' · ещё ') + more : ''}</div><div class="t" style="font-weight:700;font-size:17px">${esc(c.text)}</div>${body}</section>`;
}
A.wkTog = el => { const k = 'wq_' + el.dataset.i; S.open[k] = !S.open[k]; haptic('selection'); render(); };
A.wkDone = el => {
  const n = WEEKLY_Q.filter((_, i) => S.open['wq_' + i]).length;
  WEEKLY_Q.forEach((_, i) => delete S.open['wq_' + i]);
  const checks = {...(meta().weeklyChecks || {}), [el.dataset.k]: n}, patch = {weeklyChecks: checks};
  if (n >= 2){ const mon = addDays(todayISO(), 8 - dow(todayISO())); patch.deload = {from: mon, until: addDays(mon, 6)}; toast(tr('Со следующей недели разгрузка: на подход меньше, вес тот же'), {ms: 4000}); }
  else toast(tr('Всё в порядке, идём по плану'));
  setMeta(patch);
};
A.ciPlan = () => {
  const raw = $('#ciPlan')?.value || ''; const parts = raw.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
  if (!parts.length) return toast(tr('Впиши хотя бы одно дело'));
  const items = parts.map(p => parseQuick(p, todayISO())).filter(Boolean);
  saveTasks([...smartTasks(), ...items]); mutDay(todayISO(), d => { d.planDone = true; d.asked = {...(d.asked || {}), plan: 'yes'}; });
  haptic('success'); toast(tr('Добавлено дел: ') + items.length); $('#ciPlan').value = ''; render();
};
A.ciAns = el => {
  const k = el.dataset.k, a = el.dataset.a, id = el.dataset.id, date = todayISO();
  haptic('selection');
  const mark = v => mutDay(date, d => { d.asked = {...(d.asked || {}), [k]: v}; });
  if (a === 'later') return mark(Date.now() + 3600000);
  if (k === 'plan') return mutDay(date, d => { d.planDone = true; d.asked = {...(d.asked || {}), plan: 'no'}; });
  if (k === 'rate') return mutDay(date, d => { d.rating = +a; d.asked = {...(d.asked || {}), rate: 'yes'}; });
  if (k.startsWith('b_')){
    if (a === 'yes'){
      if (id === 'gym'){ const t = getDay(date).tasks.find(x => x.id === 'gym'); if (t && !t.done) mutDay(date, d => { const tt = d.tasks.find(x => x.id === 'gym'); if (tt) tt.done = true; }); }
      mutDay(date, d => { d.tl = {...(d.tl || {}), [id]: 'done'}; d.asked = {...(d.asked || {}), [k]: 'yes'}; });
    } else mutDay(date, d => { d.tl = {...(d.tl || {}), [id]: 'skip'}; d.asked = {...(d.asked || {}), [k]: 'no'}; });
    if (a === 'no' && id === 'gym') toast(tr('Ничего страшного. Не делай две подряд, просто продолжай по плану.'), {ms: 4000});
    return;
  }
  if (k.startsWith('t_')){
    if (a === 'yes'){ creditStudy(smartTasks().find(t => t.id === id && !t.done)); saveTasks(smartTasks().map(t => t.id === id ? {...t, done:true, doneAt: date} : t)); }
    else if (a === 'tom') saveTasks(smartTasks().map(t => t.id === id ? moveTask(t, 'tom') : t));
    else if (a === 'del') saveTasks(smartTasks().filter(t => t.id !== id));
    return mark('answered');
  }
  if (k.startsWith('w_')){
    saveTasks(smartTasks().map(t => t.id === id ? {...moveTask(t, a), askedWhen: date} : t));
    return mark('answered');
  }
};

/* ---- flexible scheduler ---- */
const BARRIER_KINDS = ['class', 'event', 'sleep', 'wake', 'rest'];
function applyShifts(bl, d){
  return bl.map(b => { const sh = d.shift?.[b.id] || 0, ex = (d.ext?.[b.id] || 0) - (d.trim?.[b.id] || 0); return {...b, sh, s: b.s + sh, e: b.e != null ? b.e + sh + ex : null}; }).sort((a, b) => a.s - b.s);
}
function reflowDay(date, d, fromId){
  d.shift = d.shift || {}; d.ext = d.ext || {}; d.trim = d.trim || {}; d.tl = d.tl || {}; d.auto = d.auto || {};
  const base = dayBlocks(date), gymDone = d.tasks.some(t => t.id === 'gym' && t.done);
  const status = b => b.gym ? (gymDone ? 'done' : d.tl[b.id]) : d.tl[b.id];
  const barrier = b => BARRIER_KINDS.includes(b.kind) || !!d.lock?.[b.id];
  const open = b => { const s = status(b); return s !== 'done' && s !== 'skip'; };
  const span = b => { const sh = d.shift[b.id] || 0; if (b.kind === 'sleep') return [b.s + sh, 30 * 60]; return [b.s + sh, b.e == null ? b.s + sh : b.e + sh + (d.ext[b.id] || 0) - (d.trim[b.id] || 0)]; };
  const bars = base.filter(b => b.id !== fromId && barrier(b) && open(b));
  const soft = b => b.kind === 'meal' || b.gym;
  const minLen = b => b.kind === 'project' ? 30 : 15;
  const len = b => ((b.e ?? b.s + 30) - b.s) + (d.ext[b.id] || 0);
  const NIGHT = ['rest', 'sleep', 'wake'];
  const fit = (b, s) => {
    const L = len(b);
    for (let g = 0; g < 12; g++){
      const hit = bars.find(x => { const [bs, be] = span(x); return bs < s + L && be > s; });
      if (!hit) return [s, s + L];
      const [bs, be] = span(hit);
      if (bs > s && bs - s >= minLen(b)) return [s, bs];
      if (NIGHT.includes(hit.kind)) return null;
      s = be;
    }
    return null;
  };
  const dropped = [];
  const put = (b, [s, e]) => {
    d.shift[b.id] = s - b.s; if (!d.shift[b.id]) delete d.shift[b.id];
    if (b.e != null){ const nat = b.e + s - b.s + (d.ext[b.id] || 0); if (e < nat) d.trim[b.id] = nat - e; else delete d.trim[b.id]; }
    return e;
  };
  const drop = b => { d.tl[b.id] = 'skip'; d.auto[b.id] = true; delete d.shift[b.id]; delete d.trim[b.id]; dropped.push(b); };
  const i0 = base.findIndex(b => b.id === fromId); if (i0 < 0) return [];
  const o = base[i0]; let cursor;
  if (barrier(o)) cursor = span(o)[1];
  else {
    const s = o.s + (d.shift[o.id] || 0), r = soft(o) ? [s, s + len(o)] : fit(o, s);
    if (r) cursor = put(o, r); else { drop(o); cursor = o.s + (o.e ?? o.s + 30) - o.s; }
  }
  for (let i = i0 + 1; i < base.length; i++){
    const b = base[i]; if (barrier(b) || !open(b)) continue;
    const s0 = b.s + (d.shift[b.id] || 0);
    if (s0 >= cursor){ cursor = Math.max(cursor, span(b)[1]); continue; }
    const r = soft(b) ? [cursor, cursor + len(b)] : fit(b, cursor);
    if (r) cursor = put(b, r); else drop(b);
  }
  return dropped;
}
function schedToast(dropped){ if (dropped.length) toast(dropped.map(b => b.title).join(', ') + tr(': не хватило времени, сон важнее'), {ms: 4000}); }
A.tlShift = el => {
  const id = el.dataset.id, m = +el.dataset.m; haptic('selection'); let dropped = [];
  mutDay(todayISO(), d => {
    d.shift = d.shift || {}; d.ext = d.ext || {}; d.trim = d.trim || {};
    if (!m){ delete d.shift[id]; delete d.ext[id]; delete d.trim[id]; if (d.auto?.[id]){ delete d.auto[id]; delete d.tl?.[id]; } return; }
    d.shift[id] = (d.shift[id] || 0) + m; dropped = reflowDay(todayISO(), d, id);
  });
  schedToast(dropped);
};
A.tlExtend = el => {
  const id = el.dataset.id, m = +el.dataset.m; haptic('light'); let dropped = [];
  mutDay(todayISO(), d => { d.ext = d.ext || {}; d.ext[id] = (d.ext[id] || 0) + m; dropped = reflowDay(todayISO(), d, id); });
  toast(tr('Продлено на ') + m + tr(' мин, следующие блоки подвинулись')); schedToast(dropped);
};
A.tlLock = el => mutDay(todayISO(), d => { d.lock = d.lock || {}; if (d.lock[el.dataset.id]) delete d.lock[el.dataset.id]; else d.lock[el.dataset.id] = true; });
A.tlResetDay = () => { haptic('medium'); mutDay(todayISO(), d => { Object.keys(d.auto || {}).forEach(id => { if (d.tl) delete d.tl[id]; }); d.shift = {}; d.ext = {}; d.trim = {}; d.auto = {}; }); toast(tr('Расписание дня сброшено')); };
A.walkAdd = el => { const m = +el.dataset.m; haptic('light'); mutDay(todayISO(), d => { d.walkExtra = m ? (d.walkExtra || 0) + m : 0; }); if (m) toast('+' + m + tr(' мин прогулки')); };
function walkedOn(date){
  const d = S.docs['days/' + date]; if (!d) return 0;
  return dayBlocks(date).filter(b => b.walk && d.tl?.[b.id] === 'done').reduce((a, b) => a + b.walk, 0) + (d.walkExtra || 0);
}
function nowCard(){
  if (!modOn('timeline') || !plan().routine) return '';
  const {nowM, bl, st, endOf} = tlState(todayISO());
  const cur = bl.find(b => b.kind !== 'sleep' && b.kind !== 'wake' && b.s <= nowM && nowM < endOf(b) && st(b) !== 'skip');
  const next = bl.find(b => b.s > nowM && st(b) !== 'skip');
  if (!cur && !next) return `<section class="card nowc"><div class="nc-l">${tr("Сейчас")}</div><div class="t">${tr("День закончен")}</div><div class="s">${tr("Отдыхай. Завтра всё сначала.")}</div></section>`;
  // the small hours before wake-up are for sleep, not a "free slot"
  if (!cur && next?.kind === 'wake' && nowM < next.s - 60) return `<section class="card nowc"><div class="nc-l">${tr("Ночь")}</div><div class="nc-row"><span class="tic" style="--tc:var(--c7)">${ic('moon')}</span><div class="mid"><div class="t">${tr("Время сна")}</div><div class="s">${tr("Подъём в")} ${hmStr(next.s)} · ${tr("через")} ${inMin(next.s - nowM)}</div></div></div></section>`;
  const [icn, col] = KIND[(cur || next).kind] || KIND.free;
  return `<section class="card nowc">
    ${cur ? `<div class="nc-l">${tr("Сейчас")}</div><div class="nc-row"><span class="tic" style="--tc:var(--${col})">${ic(icn)}</span><div class="mid"><div class="t">${esc(cur.title)}</div><div class="s">${tr("до")} ${hmStr(endOf(cur))} ${tr("· ещё")} ${inMin(endOf(cur) - nowM)}</div></div><button class="chk ${st(cur) === 'done' ? 'on' : ''}" data-act="tlToggle" data-id="${esc(cur.id)}" aria-pressed="${st(cur) === 'done'}" aria-label="${tr("Отметить:")} ${esc(cur.title)}">${ic('check')}</button></div>
      ${st(cur) !== 'done' && !['sleep', 'wake', 'rest'].includes(cur.kind) ? `<div class="nc-ext"><span>${tr("Задержался?")}</span>${[15, 30].map(m => `<button data-act="tlExtend" data-id="${esc(cur.id)}" data-m="${m}">+${m} ${tr("мин")}</button>`).join('')}</div>` : ''}`
    : `<div class="nc-l">${tr("Свободное окно")}</div><div class="t">${tr("Ничего не запланировано")}</div>`}
    ${next ? `<div class="nc-next">${tr("Дальше ·")} <b>${hmStr(next.s)}</b> ${esc(next.title)} <span>${tr("через")} ${inMin(next.s - nowM)}</span></div>` : ''}
  </section>`;
}

/* ---- adaptive training ---- */
const EFFORT = {easy4: 6, home3: 6, abc: 8};
function daysSinceGym(date){
  const ks = dayKeys().filter(k => k < date && S.docs['days/' + k].tasks?.some(t => t.id === 'gym' && t.done));
  return ks.length ? dayDiff(ks[ks.length - 1], date) : null;
}
const sleepBand = d => { const r = d.ready?.sleep; if (r) return r; const h = toNum(d.sleep); return h == null ? null : h < 6 ? 'low' : h < 7 ? 'ok' : 'good'; };
/* asked several times per exercise on every redraw; the answer only changes when data does */
const ADAPT = new Map();
function adaptInfo(date){
  const key = date + '|' + todayISO();
  if (!ADAPT.has(key)) ADAPT.set(key, adaptInfoFresh(date));
  return ADAPT.get(key);
}
function adaptInfoFresh(date){
  const reasons = []; let delta = 0, rpe = 0;
  if (date === todayISO()){
    const d = getDay(date), r = d.ready || {};
    if (sleepBand(d) === 'low'){ rpe -= 1; reasons.push(tr('Спал меньше 6 часов: усилие на 1 ниже.')); }
    if (r.sore === 'high'){ delta -= 1; rpe -= 1; reasons.push(tr('Сильная крепатура: на 1 подход меньше и усилие ниже. Тренировку не пропускай, сделай её мягче.')); }
    if (r.energy === 'low'){ delta -= 1; reasons.push(tr('Мало сил: на 1 подход меньше.')); }
    const gap = daysSinceGym(date);
    if (gap != null && gap >= 10){ delta -= 1; reasons.push(`${tr("Перерыв")} ${gap} ${plural(gap, tr('день'), tr('дня'), tr('дней'))}${tr(": возвращаемся с меньшим объёмом.")}`); }
  }
  const dl = meta().deload;
  const rampPr = activeProgram();
  if (dl && dl.from <= date && date <= dl.until && !(rampPr?.start && rampPr.ramp !== false && dayDiff(rampPr.start, date) < 14)){ delta -= 1; reasons.push(tr('Неделя разгрузки: на подход меньше, вес прежний.')); }
  return {delta: Math.max(-2, delta), rpe, reasons};
}
function setsFor(e, date){
  const pr = activeProgram(); let n = e.sets;
  if (pr?.start && pr.ramp !== false){ const wk = Math.floor(dayDiff(pr.start, date) / 7); if (wk < 2) n = Math.min(n, 2); }
  const a = adaptInfo(date).delta; if (a) n = Math.max(1, n + a);
  return n;
}
function readyCard(date){
  const dl = meta().deload, today = todayISO();
  const dlBanner = dl && dl.from <= today && today <= dl.until ? `<div class="banner" role="status">${ic('alert')}<div>${tr("Неделя разгрузки до")} ${fmtShort(dl.until)}${tr(": на подход меньше, вес прежний. Так организм успевает восстановиться.")}</div></div>` : '';
  if (!date) return dlBanner;
  const d = getDay(date), r = d.ready || {}, info = adaptInfo(date);
  const cur = {...r, sleep: sleepBand(d)};
  const grp = (k, label, opts) => `<div class="field"><label>${label}</label><div class="seg">${opts.map(([v, l]) => `<button class="${cur[k] === v ? 'on' : ''}" data-act="rdy" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  const eff = (EFFORT[plan().program] ?? 7) + info.rpe;
  const effort = `${tr("Усилие сегодня:")} <b>${eff} ${tr("из 10")}</b>${tr(". Оставляй")} ${Math.max(1, 9 - eff)}–${Math.max(2, 10 - eff)} ${tr("повтора в запасе.")}`;
  // folded to one line: the workout comes first, adjusting it is a tap away
  if (!S.open.ready) return dlBanner + `<button class="card navrow" data-act="toggleOpen" data-k="ready" aria-expanded="false"><span class="ic">${ic('heart')}</span><div class="mid"><div class="t">${tr("Как самочувствие?")}</div><div class="s">${effort}</div></div>${ic('chevR')}</button>`;
  return dlBanner + `<section class="card" style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;justify-content:space-between;gap:10px"><div><b>${tr("Как самочувствие?")}</b><div class="hint">${tr("Две секунды, и тренировка подстроится под тебя.")}</div></div><button class="link" data-act="toggleOpen" data-k="ready" aria-expanded="true">${tr('Свернуть')}</button></div>
    ${grp('sleep', tr('Сон'), [['low', tr('меньше 6 ч')], ['ok', tr('6–7 ч')], ['good', tr('7+ ч')]])}${grp('sore', tr('Крепатура'), [['none', tr('нет')], ['mild', tr('лёгкая')], ['high', tr('сильная')]])}${grp('energy', tr('Силы'), [['low', tr('мало')], ['ok', tr('норма')], ['high', tr('много')]])}
    ${info.reasons.length ? `<div class="note">${info.reasons.map(esc).join('<br>')}</div>` : ''}<div class="hint">${effort}</div></section>`;
}
A.rdy = el => { haptic('selection'); mutDay(todayISO(), d => { d.ready = {...(d.ready || {}), [el.dataset.k]: el.dataset.v}; }); };

/* ---- screen time ---- */
const fmtMin = n => n < 60 ? Math.round(n) + tr(' мин') : Math.floor(n / 60) + tr(' ч') + (Math.round(n) % 60 ? ' ' + (Math.round(n) % 60) + tr(' мин') : '');
function parseDur(s){
  s = String(s).toLowerCase();
  let m = s.match(/(\d+)\s*:\s*(\d{1,2})/); if (m) return +m[1] * 60 + +m[2];
  const h = s.match(/(\d+(?:[.,]\d+)?)\s*(?:ч|час|h)/), mi = s.match(/(\d+)\s*(?:м|мин|m)/);
  if (h || mi) return Math.round((h ? parseFloat(h[1].replace(',', '.')) * 60 : 0) + (mi ? +mi[1] : 0));
  m = s.match(/(\d+)\s*$/); return m ? +m[1] : null;
}
function parseScreenText(txt){
  let total = null; const apps = [];
  String(txt).split(/\n+/).forEach(line => {
    const l = line.trim(), i = l.search(/\d/); if (!l || i < 0) return;
    const name = l.slice(0, i).replace(/[:\-–—\s]+$/, '').trim(), dur = parseDur(l.slice(i)); if (!dur) return;
    if (/^(всего|итого|total)/i.test(name)) total = dur; else if (name) apps.push({name, min: dur});
  });
  apps.sort((a, b) => b.min - a.min);
  return {total: total ?? apps.reduce((a, b) => a + b.min, 0), apps};
}
function screenCard(){
  if (!modOn('screentime')) return '';
  const date = todayISO(), ks = [...Array(7)].map((_, i) => addDays(date, i - 6));
  const get = k => S.docs['days/' + k]?.screen;
  const pts = ks.map(k => ({x: fmtShort(k).split(' ')[0], y: get(k)?.total || 0}));
  const last = [...ks].reverse().find(k => get(k));
  const goal = meta().screenGoal || null;
  const head = `<div class="sec-h"><h2>${tr('Экранное время')}</h2><button class="link" data-act="screenAdd">${tr('+ Скриншот')}</button></div>`;
  if (!last) return `<button class="card navrow" data-act="screenAdd"><span class="ic">${ic('phone')}</span><div class="mid"><div class="t">${tr('Экранное время')}</div><div class="s">${tr('Добавь скриншот, и увидишь, на что уходит день')}</div></div>${ic('chevR')}</button>`;
  const s = get(last), apps = (s.apps || []).slice(0, 5), mx = Math.max(1, ...apps.map(a => a.min));
  const prev = ks.map(k => get(k)?.total).filter(Boolean), avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
  const p0 = [...Array(7)].map((_, i) => get(addDays(date, i - 13))?.total).filter(Boolean), avg0 = p0.length ? p0.reduce((a, b) => a + b, 0) / p0.length : 0;
  const trend = avg0 && avg ? Math.round((avg - avg0) / avg0 * 100) : null;
  return head + `<section class="card" style="display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div><div class="hero-num" style="font-size:28px">${fmtMin(s.total)}</div><div class="hint">${last === date ? tr('сегодня') : last === addDays(date, -1) ? tr('вчера') : fmtShort(last)}${s.pickups ? ' · ' + s.pickups + ' ' + plural(s.pickups, tr('подъём'), tr('подъёма'), tr('подъёмов')) : ''}${goal ? tr(' · цель ') + fmtMin(goal) + (s.total > goal ? tr(', выше на ') + fmtMin(s.total - goal) : '') : ''}</div></div>${goal ? `<span class="tag ${s.total <= goal ? 'good' : 'bad'}" style="white-space:nowrap">${s.total <= goal ? tr('в цели') : tr('выше цели')}</span>` : ''}</div>
    <div class="sapps">${apps.map(a => `<div class="sapp"><div class="sa-h"><span>${esc(a.name)}</span><b>${fmtMin(a.min)}</b></div><div class="bar"><i style="width:${a.min / mx * 100}%;background:var(--c5)"></i></div></div>`).join('')}</div>
    ${pts.filter(p => p.y).length > 1 ? barChart(pts, {target: goal || undefined, unit: tr('мин'), c: 'c5', label: tr('Экранное время за 7 дней')}) : ''}
    ${trend != null ? `<div class="hint">${tr("Среднее за 7 дней:")} ${fmtMin(avg)} · ${trend === 0 ? tr('как неделей раньше') : (trend < 0 ? tr('на ') + Math.abs(trend) + tr('% меньше') : tr('на ') + trend + tr('% больше')) + tr(' недели ранее')}</div>` : ''}
  </section>`;
}
function screenBody(){
  const sd = SH.sd || (SH.sd = todayISO()), files = SH.files || [];
  return `<div class="hint">${tr("Настройки → Экранное время → «Посмотреть всю активность». Сделай скриншот за нужный день (можно 2–3, если приложения не влезли) и выбери ниже.")}</div>
  <div class="seg">${[[todayISO(), tr('Сегодня')], [addDays(todayISO(), -1), tr('Вчера')]].map(([v, l]) => `<button class="${sd === v ? 'on' : ''}" data-act="scDay" data-v="${v}">${l}</button>`).join('')}</div>
  <label class="btn block">${ic('image')}${files.length ? tr('Выбрано: ') + files.length + tr('. Заменить') : tr('Выбрать скриншоты')}<input type="file" accept="image/*" multiple hidden data-ch="screenFiles"></label>
  ${imgCapable() ? '' : `<div class="note">${tr("Скриншоты читает Claude или ChatGPT. Подключи ИИ в «Ещё», а пока впиши данные вручную ниже.")}</div>`}
  ${provPicker(true)}
  <button class="btn block" data-act="screenGo">${ic('spark')}${tr("Разобрать скриншот")}</button><div id="scOut"></div>
  <details class="manual"><summary>${tr("Или впиши вручную")}</summary><div class="field"><textarea class="in" id="scTxt" placeholder="${tr("Всего 3ч 20м&#10;Instagram 1ч 5м&#10;YouTube 45 мин&#10;Telegram 40")}"></textarea></div><button class="btn ghost block" data-act="screenManual">${tr("Сохранить")}</button></details>
  <div class="field"><label for="scGoal">${tr("Цель на день, часов (необязательно)")}</label><input class="in" id="scGoal" inputmode="decimal" data-ch="screenGoal" value="${meta().screenGoal ? meta().screenGoal / 60 : ''}" placeholder="${tr("например, 3")}"></div>`;
}
A.screenAdd = () => { openSheet(tr('Экранное время'), screenBody); SH.needImg = true; SH.files = []; };
A.scDay = el => { SH.sd = el.dataset.v; drawSheet(); };
CH.screenFiles = el => { SH.files = [...(el.files || [])].slice(0, 3); drawSheet(); };
CH.screenGoal = el => { const h = toNum(el.value); setMeta({screenGoal: h ? Math.round(h * 60) : null}); toast(h ? tr('Цель: ') + fmtMin(h * 60) : tr('Цель убрана')); };
A.screenGo = async () => {
  if (!SH.files?.length) return toast(tr('Сначала выбери скриншот'));
  const prompt = `На скриншоте экран «Экранное время» iPhone (или аналог на Android). Найди общее время за день и время по приложениям. Переводи часы и минуты в минуты. Бери только то, что реально видно, ничего не придумывай. Если на скриншоте неделя, а не день, укажи period "неделя".
Верни только JSON: {"total_min":0,"apps":[{"name":"","min":0}],"pickups":null,"period":"день","note":""}`;
  const id = await submitJob('screen', {prompt, images: SH.files, meta: {date: SH.sd}, provider: SH.prov || 'auto', label: tr('Экранное время · ') + fmtShort(SH.sd)});
  queueNow(id, 'scOut');
};
A.screenManual = () => {
  const r = parseScreenText(val('scTxt')); if (!r.total) return toast(tr('Не вижу минут. Пример: Instagram 1ч 5м'));
  const date = SH.sd; mutDay(date, d => { d.screen = {total: r.total, apps: r.apps, pickups: null, src: 'manual'}; }); closeSheet(); toast(tr('Сохранено: ') + fmtMin(r.total));
};
function screenView(it){
  const r = it.result || {}, apps = (r.apps || []).filter(a => a && a.name && +a.min > 0).sort((a, b) => b.min - a.min), total = +r.total_min || apps.reduce((a, b) => a + +b.min, 0);
  if (/недел|week/i.test(r.period || '')) return `<div class="note">${tr("На скриншоте неделя. Нужен экран за один день: открой нужный день в «Экранном времени» и сделай новый скриншот.")}</div>`;
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between"><b>${tr("Всего")} ${fmtMin(total)}</b><span class="hint">${fmtShort(it.meta.date)}</span></div>
    <div class="list">${apps.slice(0, 8).map(a => `<div class="row" style="padding:8px 0"><div class="mid"><div class="t" style="font-weight:600">${esc(a.name)}</div></div><div class="r">${fmtMin(+a.min)}</div></div>`).join('')}</div>
    ${r.note ? `<div class="hint">${esc(r.note)}</div>` : ''}
    ${it.done ? '' : `<button class="btn block" data-act="screenSave" data-id="${it.id}">${ic('check')}${tr("Сохранить за")} ${fmtShort(it.meta.date)}</button>`}</section>`;
}
A.screenSave = el => {
  const it = S.docs['inbox/' + el.dataset.id]; if (!it) return;
  const r = it.result, apps = (r.apps || []).filter(a => a && a.name && +a.min > 0).map(a => ({name: String(a.name), min: Math.round(+a.min)})).sort((a, b) => b.min - a.min);
  const total = Math.round(+r.total_min || apps.reduce((a, b) => a + b.min, 0));
  mutDay(it.meta.date, d => { d.screen = {total, apps, pickups: r.pickups || null, src: 'ai'}; });
  save('inbox/' + it.id, {...it, done: true}); if (SH?.jobId === it.id) closeSheet(); else drawSheet(); toast(tr('Сохранено: ') + fmtMin(total));
};

/* ============ v5: exams and events, conflict warnings, hours, AI schedule changes, first-run setup ============ */
const HM_RE = /^([01]\d|2[0-3]):[0-5]\d$/, DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EV_KIND = {exam:[tr('Экзамен'), 'cap', 'bad'], deadline:[tr('Дедлайн'), 'alert', 'warn'], event:[tr('Событие'), 'star', '']};
const allEvents = () => plan().routine?.events || [];
const examsAhead = (days = 45) => { const t = todayISO(), end = addDays(t, days); return allEvents().filter(e => (e.kind === 'exam' || e.kind === 'deadline') && e.date >= t && e.date <= end).sort((a, b) => a.date.localeCompare(b.date) || (a.from || '').localeCompare(b.from || '')); };
const badSpan = (from, until) => { const s = hm(from), e = hm(until); return e === s || (e < s && e + 1440 - s > 720); };
const evEnd = e => { const s = hm(e.from); let n = e.until ? hm(e.until) : s + 60; if (n <= s) n += 1440; return n; };

/* ---- conflict rules: plain code, so they work offline and on every tier ---- */
function timedOn(date){
  const out = [], R = plan().routine;
  eventsFor(date).filter(e => e.from).forEach(e => out.push({k:'ev', id:e.id, title:e.title, s:hm(e.from), e:evEnd(e)}));
  if (!(R?.classesStart && date < R.classesStart)) (plan().classes || []).filter(c => Number(c.day) === dow(date)).forEach((c, i) => out.push({k:'cls', id:'c' + i + '_' + c.time, title:c.title, s:hm(c.time), e:c.end ? hm(c.end) : hm(c.time) + 90}));
  smartTasks().filter(t => !t.done && t.due === date && t.time).forEach(t => out.push({k:'task', id:t.id, title:t.title, s:hm(t.time), e:hm(t.time) + 1}));
  return out;
}
function gymFreeDay(after){
  for (let i = 1; i <= 7; i++){
    const k = addDays(after, i);
    if (!workoutFor(k) && !workoutFor(addDays(k, -1)) && !allEvents().some(e => e.kind === 'exam' && (e.date === k || e.date === addDays(k, 1)))) return k;
  }
  return null;
}
function warningsFor(date){
  const out = [], items = timedOn(date), next = addDays(date, 1), gym = dayBlocks(date).find(b => b.gym);
  const gymOpen = !!workoutFor(date) && !getDay(date).tasks.some(t => t.id === 'gym' && t.done);
  const moveFix = examDate => { const to = gymFreeDay(examDate); return {act:'gymMove', label: to ? tr('Перенести на ') + fmtShort(to) : tr('Убрать тренировку'), data:{from:date, to:to || ''}}; };
  items.forEach((a, i) => items.slice(i + 1).forEach(b => {
    if (a.k === 'task' && b.k === 'task') return;
    if (a.s < b.e && b.s < a.e) out.push({id:['ov', date, a.id, b.id].join('_'), date, level:a.k === 'task' || b.k === 'task' ? 'warn' : 'bad', text:`${tr('«')}${a.title}${tr('»')} (${hmStr(a.s)}${tr(") и «")}${b.title}${tr('»')} (${hmStr(b.s)}${tr(") пересекаются по времени.")}`});
  }));
  if (gym && gymOpen) eventsFor(date).filter(e => e.from && e.kind !== 'exam').forEach(e => { if (hm(e.from) < gym.e && gym.s < evEnd(e)) out.push({id:['gymev', date, e.id].join('_'), date, level:'warn', text:`${tr("Тренировка в")} ${hmStr(gym.s)} ${tr("попадает на «")}${e.title}${tr('»')}.`, fix:moveFix(date)}); });
  if (gym && gymOpen) items.filter(x => x.k === 'cls').forEach(c => { if (c.s < gym.e && gym.s < c.e) out.push({id:['gymcls', date, c.id].join('_'), date, level:'warn', text:`${tr("Тренировка в")} ${hmStr(gym.s)} ${tr("попадает на «")}${c.title}${tr('»')}.`, fix:moveFix(date)}); });
  allEvents().filter(e => e.kind === 'exam' && e.date === next).forEach(ex => {
    if (gymOpen) out.push({id:['gymeve', date, ex.id].join('_'), date, level:'warn', text:`${tr("Тренировка накануне экзамена «")}${ex.title}${tr("». Лучше отдохнуть и выспаться.")}`, fix:moveFix(ex.date)});
    eventsFor(date).filter(e => e.from && evEnd(e) >= 22 * 60).forEach(e => out.push({id:['lateeve', date, e.id, ex.id].join('_'), date, level:'warn', text:`${tr('«')}${e.title}${tr("» закончится в")} ${hmStr(evEnd(e))}${tr(", а завтра экзамен «")}${ex.title}${tr('»')}.`}));
  });
  allEvents().filter(e => e.kind === 'exam' && e.date === date).forEach(ex => {
    if (gymOpen && (!ex.from || !gym || gym.s < evEnd(ex))) out.push({id:['gymday', date, ex.id].join('_'), date, level:'warn', text:`${tr("В день экзамена «")}${ex.title}${tr("» стоит тренировка. Лучше сохранить силы для экзамена.")}`, fix:moveFix(date)});
    allEvents().filter(o => o.kind === 'exam' && o.id !== ex.id && (o.date === next || (o.date === date && o.id > ex.id))).forEach(o => out.push({id:['exams', ex.id, o.id].join('_'), date, level:'warn', text:`${tr("Экзамены «")}${ex.title}${tr("» и «")}${o.title}${tr("» идут почти подряд. Начни готовиться к обоим заранее.")}`}));
  });
  const wake = dayBlocks(next).find(b => b.kind === 'wake');
  if (wake && !allEvents().some(x => x.kind === 'exam' && x.date === next)) eventsFor(date).filter(e => e.from).forEach(e => {
    const h = (wake.s + 1440 - evEnd(e)) / 60;
    if (h < 7) out.push({id:['sleep', date, e.id].join('_'), date, level:'warn', text: trf('После «{e}» на сон останется всего {h} ч: подъём в {w}.', {e: e.title, h: num(Math.max(0, h), h % 1 ? 1 : 0), w: hmStr(wake.s)})});
  });
  return out;
}
function upcomingWarnings(days = 21, all = false){
  const off = meta().warnOff || {}, out = [], t = todayISO();
  for (let i = 0; i <= days; i++) out.push(...warningsFor(addDays(t, i)));
  return all ? out : out.filter(w => !off[w.id]);
}
function warnCard(){
  const list = upcomingWarnings(); if (!list.length) return '';
  const shown = S.open.warn_all ? list : list.slice(0, 3), today = todayISO();
  return `<div class="sec-h"><h2>${tr("Обрати внимание")}</h2><span class="hint">${list.length}</span></div><section class="card warnc">${shown.map(w => `<div class="wrow ${w.level}"><span class="wi">${ic('alert')}</span><div class="mid"><div class="s">${w.date === today ? tr('Сегодня') : w.date === addDays(today, 1) ? tr('Завтра') : fmtShort(w.date)}</div><div class="t">${esc(w.text)}</div><div class="btnrow">${w.fix ? `<button class="btn" data-act="${w.fix.act}" ${Object.entries(w.fix.data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${esc(w.fix.label)}</button>` : ''}<button class="btn ghost" data-act="warnOff" data-id="${esc(w.id)}">${tr("Понятно")}</button></div></div></div>`).join('')}${list.length > 3 ? `<button class="link" data-act="toggleOpen" data-k="warn_all" style="padding:8px 0 0">${S.open.warn_all ? tr('Свернуть') : tr('Ещё ') + (list.length - 3)}</button>` : ''}</section>`;
}
A.warnOff = el => setMeta({warnOff: {...(meta().warnOff || {}), [el.dataset.id]: true}});
A.gymMove = el => {
  const {from, to} = el.dataset, key = workoutFor(from);
  mutDay(from, d => { d.workout = null; });
  if (to) mutDay(to, d => { d.workout = key; });
  haptic('success'); toast(to ? tr('Тренировка перенесена на ') + fmtShort(to) : tr('Тренировка убрана'), {icon:'checkc', tone:'good'});
};

/* ---- exam countdown ---- */
function examStage(n, kind){
  if (kind === 'deadline') return n === 0 ? tr('Сегодня последний день. Сдай и выдохни.') : n === 1 ? tr('Завтра сдавать. Проверь, что всё готово.') : n <= 3 ? tr('Заканчивай основную часть, оставь время на проверку.') : n <= 7 ? tr('Самое время сделать большую часть.') : tr('Разбей работу на маленькие шаги и начни с первого.');
  if (n === 0) return tr('Сегодня экзамен. Поешь, возьми всё нужное, выйди заранее. У тебя получится.');
  if (n === 1) return tr('Завтра экзамен. Только лёгкое повторение, без тяжёлой тренировки, и ложись пораньше.');
  if (n <= 3) return tr('Финальный круг: решай задания и повторяй слабые темы.');
  if (n <= 7) return tr('Повторяй каждый день хотя бы понемногу.');
  if (n <= 14) return tr('Пора начинать: составь список тем и бери по одной в день.');
  return tr('Времени достаточно. Запиши темы и раздели их по неделям.');
}
function examCard(){
  const list = examsAhead(); if (!list.length) return '';
  const t = todayISO();
  return `<div class="sec-h"><h2>${tr("Экзамены и дедлайны")}</h2><button class="link" data-act="evSheet">${tr("+ Добавить")}</button></div>${list.slice(0, 3).map(e => {
    const n = dayDiff(t, e.date), k = EV_KIND[e.kind];
    return `<section class="card examc ${n <= 1 ? 'soon' : ''}"><div class="ex-n"><b>${n === 0 ? '!' : n}</b><span>${n === 0 ? tr('сегодня') : plural(n, tr('день'), tr('дня'), tr('дней'))}</span></div><div class="mid"><div class="t">${esc(e.title)} <span class="tag ${k[2]}">${k[0]}</span></div><div class="s">${fmtShort(e.date)}${e.from ? ' · ' + e.from : ''}${e.prepMin ? tr(' · подготовка ') + fmtMin(e.prepMin) : ''}</div><div class="ex-tip">${esc(examStage(n, e.kind))}</div>${e.kind === 'exam' && planTasks(e.id).length ? `<div class="hint" style="margin-bottom:10px">${tr('Темы:')} ${planTasks(e.id).filter(t => t.done).length} ${tr('из')} ${planTasks(e.id).length}</div>` : ''}<div class="btnrow">${e.kind === 'exam' && n > 0 ? `<button class="btn ghost" data-act="studyPlan" data-id="${esc(e.id)}">${ic('list')}${planTasks(e.id).length ? tr('Изменить план') : tr('План подготовки')}</button>` : ''}<button class="btn ghost" data-act="examPrep" data-id="${esc(e.id)}">${tr("+30 мин подготовки")}</button>${isNative() ? '' : `<button class="btn ghost" data-act="examIcs" data-id="${esc(e.id)}">${ic('bell')}${tr("В Календарь")}</button>`}</div></div></section>`;
  }).join('')}`;
}
A.examPrep = el => {
  const pl = clone(plan()), e = pl.routine?.events?.find(x => x.id === el.dataset.id); if (!e) return;
  e.prepMin = (e.prepMin || 0) + 30; save('app/plan', pl);
  mutDay(todayISO(), d => { d.timeExtra = {...(d.timeExtra || {}), study: (d.timeExtra?.study || 0) + 30}; });
  burstAt(el); haptic('light'); toast(tr('Всего подготовки: ') + fmtMin(e.prepMin));
};
/* a calendar event with several alarms: the only reminder that fires while the web app is closed */
function examIcsText(e){
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), t = e.from || '09:00', fold = x => String(x).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const alarms = [['-P14D', tr('через 2 недели')], ['-P7D', tr('через неделю')], ['-P3D', tr('через 3 дня')], ['-P1D', tr('завтра')], ['-PT2H', tr('через 2 часа')]];
  const end = hmStr(Math.min(e.from ? evEnd(e) : hm(t) + 120, 23 * 60 + 59));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KAI//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + e.id + '@kai', 'DTSTAMP:' + stamp, 'DTSTART:' + e.date.replace(/-/g, '') + 'T' + t.replace(':', '') + '00', 'DTEND:' + e.date.replace(/-/g, '') + 'T' + end.replace(':', '') + '00', 'SUMMARY:' + fold(e.title),
    ...alarms.flatMap(([tr, l]) => ['BEGIN:VALARM', 'TRIGGER:' + tr, 'ACTION:DISPLAY', 'DESCRIPTION:' + fold(e.title + ': ' + l), 'END:VALARM']), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
A.examIcs = async el => {
  const e = allEvents().find(x => x.id === el.dataset.id); if (!e) return;
  const ok = await shareOrDownload('kai-' + e.date + '.ics', new Blob([examIcsText(e)], {type:'text/calendar'}));
  if (ok) toast(tr('Открой файл и нажми «Добавить»: напомню за 2 недели, неделю, 3 дня, день и 2 часа'), {ms:5000});
};
A.evKind = el => { SH.evKind = el.dataset.v; $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); };

/* ---- time totals: the part of the effort you normally cannot see ---- */
/* a day's minutes depend only on that day and the plan; both are replaced, never changed in place, on save */
const TIME_ON = new WeakMap();
function timeOn(date){
  const d = S.docs['days/' + date]; if (!d) return {walk:0, gym:0, study:0, sleep:null};
  const pl = S.docs['app/plan'], hit = TIME_ON.get(d);
  if (hit && hit.pl === pl && hit.date === date) return hit.v;
  const v = timeOnFresh(date, d);
  TIME_ON.set(d, {pl, date, v});
  return v;
}
function timeOnFresh(date, d){
  const bl = dayBlocks(date), g = bl.find(b => b.gym), gymDone = d.tasks?.some(t => t.id === 'gym' && t.done);
  const study = bl.filter(b => ['study', 'class'].includes(b.kind) && d.tl?.[b.id] === 'done').reduce((a, b) => a + ((b.e ?? b.s) - b.s), 0);
  return {walk: walkedOn(date), gym: (gymDone ? (g?.e ? g.e - g.s : 50) : 0) + (d.timeExtra?.gym || 0), study: study + (d.timeExtra?.study || 0), sleep: toNum(d.sleep)};
}
function timeSum(dates){
  const r = {walk:0, gym:0, study:0, active:0, sleepSum:0, sleepN:0};
  dates.forEach(k => { const t = timeOn(k), dd = S.docs['days/' + k]; r.walk += t.walk; r.gym += t.gym; r.study += t.study; if (t.walk + t.gym + t.study > 0 || (dd && dayScore(dd) >= .7)) r.active++; if (t.sleep){ r.sleepSum += t.sleep; r.sleepN++; } });
  r.total = r.walk + r.gym + r.study;
  return r;
}
function progressCard(){
  const per = S.sub.prog || 'week', len = {day:1, week:7, month:30}[per], t = todayISO();
  const span = (end, n) => [...Array(n)].map((_, i) => addDays(end, i - n + 1));
  const cur = timeSum(span(t, len)), prev = timeSum(span(addDays(t, -len), len));
  const tile = (i, c, v, l) => `<div class="ptile"><span style="color:var(--${c})">${ic(i)}</span><b>${v}</b><small>${l}</small></div>`;
  const delta = prev.total ? Math.round((cur.total - prev.total) / prev.total * 100) : null;
  const pts = len > 1 ? span(t, len).map(k => { const x = timeSum([k]); return {x: fmtShort(k).split(' ')[0], y: Math.round(x.total / 6) / 10}; }) : [];
  const seasonTotal = dayKeys().filter(k => k >= season().start && k <= t).reduce((a, k) => a + timeSum([k]).total, 0);
  if (!seasonTotal && firstWeek()) return '';
  return `<div class="sec-h"><h2>${tr("Мой прогресс")}</h2><button class="link" data-act="recap">${tr("Итоги недели")}</button></div><section class="card" style="display:flex;flex-direction:column;gap:14px">${levelRow()}
    <div class="seg">${[['day', tr('Сегодня')], ['week', tr('7 дней')], ['month', tr('30 дней')]].map(([v, l]) => `<button class="${per === v ? 'on' : ''}" data-act="sub" data-k="prog" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="ptiles">${tile('steps', 'c3', fmtMin(cur.walk), tr('ходьба'))}${tile('gym', 'c1', fmtMin(cur.gym), tr('зал'))}${tile('cap', 'c4', fmtMin(cur.study), tr('учёба'))}${tile('flame', 'warn', len > 1 ? cur.active + tr(' из ') + len : (cur.active ? tr('да') : tr('пока нет')), tr('активных дней'))}</div>
    ${pts.some(p => p.y) ? barChart(pts, {unit:tr('ч'), c:'c3', dec:1, label:tr('Часы по дням')}) : ''}
    <div class="hint">${delta != null && len > 1 ? (delta === 0 ? tr('Столько же, сколько в прошлый период. ') : delta > 0 ? `${tr("На")} ${delta}${tr("% больше, чем в прошлый период.")} ` : `${tr("На")} ${-delta}${tr("% меньше, чем в прошлый период.")} `) : ''}${cur.sleepN ? `${tr("Сон в среднем")} ${num(cur.sleepSum / cur.sleepN, 1)} ${tr("ч.")} ` : ''}${tr("За сезон вложено")} ${fmtMin(seasonTotal)}.</div>
    <div class="walkq"><span>${tr("Добавить:")}</span><button data-act="timeAdd" data-k="study" data-m="30">${tr("учёба +30")}</button><button data-act="timeAdd" data-k="gym" data-m="30">${tr("зал +30")}</button><button data-act="walkAdd" data-m="30">${tr("ходьба +30")}</button></div>
  </section>`;
}
A.timeAdd = el => { const {k} = el.dataset, m = +el.dataset.m; haptic('light'); mutDay(todayISO(), d => { d.timeExtra = {...(d.timeExtra || {}), [k]: (d.timeExtra?.[k] || 0) + m}; }); toast('+' + m + tr(' мин')); };

/* ---- what the AI may change: checked here, previewed with the rules above, applied only after a tap ---- */
function cleanEv(x){
  if (!x || !x.title || !DATE_RE.test(x.date || '')) return null;
  const ev = {id: uid(), date: x.date, title: String(x.title).slice(0, 120), note: String(x.note || '').slice(0, 300), kind: EV_KIND[x.kind] ? x.kind : 'event'};
  if (HM_RE.test(x.from || '')){ ev.from = x.from; if (HM_RE.test(x.until || '') && !badSpan(x.from, x.until)) ev.until = x.until; }
  return ev;
}
function cleanTask(x){
  if (!x || !x.title) return null;
  const today = todayISO(), due = x.date === 'today' ? today : x.date === 'tomorrow' ? addDays(today, 1) : DATE_RE.test(x.date || '') ? x.date : null;
  return {id: uid(), title: String(x.title).slice(0, 160), due, time: due && HM_RE.test(x.time || '') ? x.time : null, pri: 2, done: false, created: today};
}
function tellPlan(r){
  const pl = clone(plan()); pl.routine = pl.routine || clone(DEFAULT_ROUTINE);
  const cancel = new Set(r.cancel_events || []);
  let evs = (pl.routine.events || []).filter(e => !cancel.has(e.id));
  (r.update_events || []).forEach(u => { const e = evs.find(x => x.id === u?.id); if (!e) return; if (DATE_RE.test(u.date || '')) e.date = u.date; if (HM_RE.test(u.from || '')){ e.from = u.from; delete e.until; } if (HM_RE.test(u.until || '')) e.until = u.until; if (u.title) e.title = String(u.title).slice(0, 120); });
  evs = evs.concat((r.events || []).map(cleanEv).filter(Boolean));
  pl.routine.events = evs;
  const tasks = (r.new_tasks || []).map(cleanTask).filter(Boolean);
  const moves = (r.move_workouts || []).filter(m => DATE_RE.test(m?.from || '') && workoutFor(m.from) && (!m.to || DATE_RE.test(m.to)));
  return {pl, tasks, moves};
}
function previewWarnings(r){
  const before = new Set(upcomingWarnings(60, true).map(w => w.id)), {pl, tasks, moves} = tellPlan(r);
  const keys = ['app/plan', 'app/tasks', ...moves.flatMap(m => ['days/' + m.from, ...(m.to ? ['days/' + m.to] : [])])], saved = {};
  const days = moves.map(m => [m, getDay(m.from), m.to ? getDay(m.to) : null, workoutFor(m.from)]);
  keys.forEach(k => { saved[k] = S.docs[k]; });
  try {
    S.docs['app/plan'] = pl; S.docs['app/tasks'] = {items: [...smartTasks(), ...tasks]};
    days.forEach(([m, a, b, w]) => { S.docs['days/' + m.from] = {...a, workout: null}; if (b) S.docs['days/' + m.to] = {...b, workout: w}; });
    return upcomingWarnings(60, true).filter(w => !before.has(w.id));
  } finally { keys.forEach(k => { if (saved[k] === undefined) delete S.docs[k]; else S.docs[k] = saved[k]; }); }
}
function tellPlanLines(r){
  const lines = [], {tasks, moves} = tellPlan(r), name = id => allEvents().find(e => e.id === id)?.title || id;
  (r.events || []).map(cleanEv).filter(Boolean).forEach(e => lines.push(`+ ${EV_KIND[e.kind][0].toLowerCase()}: ${e.title}, ${fmtShort(e.date)}${e.from ? tr(' в ') + e.from : ''}`));
  (r.update_events || []).filter(u => allEvents().some(e => e.id === u?.id)).forEach(u => lines.push(`${tr("Изменить «")}${name(u.id)}${tr('»')}: ${[u.date && DATE_RE.test(u.date) ? fmtShort(u.date) : '', u.from || ''].filter(Boolean).join(tr(' в '))}`));
  (r.cancel_events || []).filter(id => allEvents().some(e => e.id === id)).forEach(id => lines.push(`${tr("Отменить «")}${name(id)}${tr('»')}`));
  tasks.forEach(t => lines.push(`${tr("+ задача:")} ${t.title}${t.due ? ', ' + dueLabel(t) : ''}`));
  moves.forEach(m => lines.push(m.to ? `${tr("Перенести тренировку:")} ${fmtShort(m.from)} → ${fmtShort(m.to)}` : `${tr("Убрать тренировку")} ${fmtShort(m.from)}`));
  const tn = {walk:tr('Ходьба'), gym:tr('Зал'), study:tr('Учёба')};
  (r.time_log || []).filter(x => tn[x?.kind] && +x.min > 0).forEach(x => lines.push(`${tn[x.kind]}: ${fmtMin(+x.min)}`));
  return lines;
}
function tellPlanApply(r){
  const {pl, tasks, moves} = tellPlan(r), keys = moves.map(m => [m, workoutFor(m.from)]);
  save('app/plan', pl);
  if (tasks.length) saveTasks([...smartTasks(), ...tasks]);
  keys.forEach(([m, w]) => { mutDay(m.from, d => { d.workout = null; }); if (m.to) mutDay(m.to, d => { d.workout = w; }); });
  const log = (r.time_log || []).filter(x => ['walk', 'gym', 'study'].includes(x?.kind) && +x.min > 0);
  if (log.length) mutDay(todayISO(), d => { log.forEach(x => { if (x.kind === 'walk') d.walkExtra = (d.walkExtra || 0) + Math.round(+x.min); else d.timeExtra = {...(d.timeExtra || {}), [x.kind]: (d.timeExtra?.[x.kind] || 0) + Math.round(+x.min)}; }); });
}
function planContext(today){
  const pl = plan(), days = [...Array(21)].map((_, i) => addDays(today, i));
  return `Календарь: ${days.slice(0, 14).map(k => k + ' ' + DOW[dow(k)]).join(', ')}.
События (id | дата | время | тип | название): ${allEvents().filter(e => (e.toDate || e.date) >= today).map(e => [e.id, e.date, e.from ? e.from + (e.until ? '-' + e.until : '') : 'без времени', e.kind || 'event', e.title].join(' | ')).join('; ') || 'нет'}
Занятия по дням недели: ${(pl.classes || []).map(c => DOW[c.day] + ' ' + c.time + (c.end ? '-' + c.end : '') + ' ' + c.title).join('; ') || 'нет'}
Дни с тренировкой: ${days.filter(k => workoutFor(k)).join(', ') || 'нет'}
Открытые задачи со сроком: ${smartTasks().filter(t => !t.done && t.due).slice(0, 30).map(t => t.title + ' ' + t.due + (t.time ? ' ' + t.time : '')).join('; ') || 'нет'}`;
}

/* ---- first run: a few questions, then a plan that fits this person ---- */
const OB_GOALS = [['study', tr('Учёба'), 'cap'], ['gym', tr('Тренировки'), 'gym'], ['food', tr('Питание и вес'), 'food'], ['walk', tr('Прогулки и шаги'), 'steps'], ['sleep', tr('Сон'), 'moon'], ['money', tr('Деньги'), 'wallet'], ['screen', tr('Экранное время'), 'phone'], ['content', tr('Контент'), 'video']];
function routineFor(o){
  const R = clone(DEFAULT_ROUTINE), wake = hm(o.wake || '07:00'), sleep = hm(o.sleep || '23:00');
  const MORN = new Set(['wake', 'walk1', 'breakfast']), EVE = new Set(['shutdown', 'winddown', 'sleep']);
  ['school', 'sat', 'sun'].forEach(key => {
    let bl = R[key];
    const w0 = hm(bl.find(b => b[0] === 'wake')[1]), s0 = hm(bl.find(b => b[0] === 'sleep')[1]), dW = wake - w0, dS = sleep - s0;
    const mv = (b, d) => { b[1] = hmStr(hm(b[1]) + d); if (b[2]) b[2] = hmStr(hm(b[2]) + d); };
    bl.forEach(b => { if (MORN.has(b[0])) mv(b, dW); else if (EVE.has(b[0])) mv(b, dS); });
    const cls = bl.find(b => b[0] === 'class'), cut = hm(bl.find(b => b[0] === 'shutdown')?.[1] || bl.find(b => b[0] === 'sleep')[1]);
    const brk = bl.find(b => b[0] === 'breakfast');
    if (cls && brk && hm(brk[2]) > hm(cls[1])){ brk[1] = hmStr(wake + 15); brk[2] = hmStr(wake + 45); bl = bl.filter(b => b[0] !== 'walk1'); } // a late start: breakfast matters more than the walk
    bl = bl.filter(b => !(MORN.has(b[0]) && b[0] !== 'wake' && cls && hm(b[2]) > hm(cls[1])));
    bl = bl.filter(b => {
      if (EVE.has(b[0]) || b[0] === 'wake' || !b[2]) return true;
      if (!MORN.has(b[0]) && hm(b[1]) < wake) return false;
      if (hm(b[2]) > cut) b[2] = hmStr(cut);
      return hm(b[2]) - hm(b[1]) >= 15;
    });
    if (cls){
      if (o.role === 'work'){ cls[3] = tr('Работа'); cls[5] = ''; }
      else if (o.role !== 'study'){ cls[3] = tr('Свободное время'); cls[4] = 'free'; cls[5] = ''; }
    }
    if (!o.goals.includes('walk')) bl = bl.filter(b => b[4] !== 'walk');
    if (!o.goals.includes('study')) bl = bl.filter(b => b[4] !== 'study');
    R[key] = bl;
  });
  return R;
}
function obBody(){
  const o = SH.ob;
  const dots = `<div class="ob-dots">${[0, 1, 2].map(i => `<i class="${i <= o.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (o.step === 0) return `<div class="wlogo"><img src="logo.png" alt="KAI" width="96"><div class="hint">${tr("Твоя жизнь в одном месте: пиши как есть, а план и подсчёты я возьму на себя")}</div></div>${langSeg()}${dots}
    <div class="field"><label for="obN">${tr("Как тебя зовут?")}</label><input class="in" id="obN" value="${esc(o.name)}" autocomplete="given-name"></div>
    <div class="field"><label>${tr("Чем занимаешься?")}</label><div class="seg">${[['study', tr('Учусь')], ['work', tr('Работаю')], ['other', tr('Другое')]].map(([v, l]) => `<button class="${o.role === v ? 'on' : ''}" data-act="obRole" data-v="${v}">${l}</button>`).join('')}</div></div>
    <button class="btn block" data-act="obNext">${tr("Дальше")}</button>`;
  if (o.step === 1) return `${dots}<div class="t" style="font-weight:700;font-size:17px">${tr("Что хочешь отслеживать?")}</div><div class="hint">${tr("Выбери всё нужное. Изменить можно в любой момент.")}</div>
    <div class="ob-goals">${OB_GOALS.map(([k, l, i]) => `<button class="pill ${o.goals.includes(k) ? 'on' : ''}" data-act="obGoal" data-v="${k}" aria-pressed="${o.goals.includes(k)}">${ic(i)}${l}</button>`).join('')}</div>
    ${o.goals.includes('gym') ? `<div class="field"><label id="obWhereL">${tr('Где будешь тренироваться?')}</label><div class="seg" role="group" aria-labelledby="obWhereL">${[['home', tr('Дома, без инвентаря')], ['gym', tr('В зале')]].map(([v, l]) => `<button class="${o.where === v ? 'on' : ''}" aria-pressed="${o.where === v}" data-act="obWhere" data-v="${v}">${l}</button>`).join('')}</div></div>` : ''}
    <div class="btnrow"><button class="btn ghost" data-act="obBack">${tr("Назад")}</button><button class="btn" data-act="obNext">${tr("Дальше")}</button></div>`;
  return `${dots}<div class="t" style="font-weight:700;font-size:17px">${tr("Твой обычный день")}</div>
    <div class="fgrid"><div class="field"><label for="obW">${tr("Встаю в")}</label><input class="in" type="time" id="obW" value="${esc(o.wake)}"></div><div class="field"><label for="obS">${tr("Ложусь в")}</label><input class="in" type="time" id="obS" value="${esc(o.sleep)}"></div></div>
    ${o.goals.includes('money') ? `<div class="field"><label for="obC">${tr("Валюта")}</label><input class="in" id="obC" value="${esc(o.cur)}" placeholder="${tr("например, ₽, $, €, RM")}"></div>` : ''}
    <div class="field"><label for="obA">${tr("О себе (необязательно)")}</label><textarea class="in" id="obA" style="min-height:80px" placeholder="${tr("Например: не ем свинину, учусь на медицинском, больное колено. ИИ будет это учитывать.")}">${esc(o.about)}</textarea></div>
    <div class="hint">${NOT_MED()}</div>
    <div class="btnrow"><button class="btn ghost" data-act="obBack">${tr("Назад")}</button><button class="btn" data-act="obDone">${tr("Готово")}</button></div>`;
}
const obRead = () => { const o = SH.ob; [['obN', 'name'], ['obW', 'wake'], ['obS', 'sleep'], ['obC', 'cur'], ['obA', 'about']].forEach(([id, k]) => { if ($('#' + id)) o[k] = val(id); }); };
A.welcome = () => openSheet(tr('Добро пожаловать'), () => { SH.ob = SH.ob || {step: 0, name: '', role: 'study', goals: ['study', 'gym', 'food', 'walk', 'sleep', 'money'], wake: '07:00', sleep: '23:00', cur: '', about: '', where: 'home'}; return obBody(); });
A.obWhere = el => { SH.ob.where = el.dataset.v; drawSheet(); };
A.obRole = el => { obRead(); SH.ob.role = el.dataset.v; drawSheet(); };
A.obGoal = el => { const o = SH.ob, v = el.dataset.v; o.goals = o.goals.includes(v) ? o.goals.filter(x => x !== v) : [...o.goals, v]; drawSheet(); };
A.obNext = () => { obRead(); SH.ob.step++; drawSheet(); };
A.obBack = () => { obRead(); SH.ob.step--; drawSheet(); };
A.obDone = () => {
  obRead();
  const o = SH.ob, g = o.goals, pl = clone(plan());
  pl.routine = routineFor(o);
  pl.dailyTasks = [g.includes('walk') && {id:'steps', title:tr('8 000+ шагов'), cat:'steps'}, g.includes('food') && {id:'food', title:tr('Питание по норме КБЖУ'), cat:'food'}, g.includes('sleep') && {id:'sleep', title:tr('Лечь вовремя, 7+ часов сна'), cat:'sleep'}].filter(Boolean);
  if (!g.includes('gym')){ pl.schedule = {}; pl.program = null; }
  else useProgram(pl, o.where === 'gym' ? 'easy4' : 'home3');
  save('app/plan', pl);
  save('app/profile', {...clone(profile()), name: o.name, role: o.role, about: [{study:tr('Студент.'), work:tr('Работает.'), other:''}[o.role], o.about].filter(Boolean).join(' '), currency: o.cur});
  setMeta({welcomed: true, startedOn: todayISO(), startedAt: nowMin(), modules: {money: g.includes('money'), content: g.includes('content'), screentime: g.includes('screen')}});
  haptic('success'); toast(o.name ? o.name + tr(', всё готово') : tr('Всё готово'), {icon:'checkc', tone:'good'});
  if (isNative() && plug('LocalNotifications')) A.permSheet(); else closeSheet();
};

/* ---- language: default texts saved in the plan follow the app language, the person's own text does not ---- */
const langSeg = () => `<div class="seg" role="group" aria-label="Language">${[['ru', 'Русский'], ['en', 'English']].map(([v, l]) => `<button class="${LANG === v ? 'on' : ''}" data-act="setLang" data-v="${v}">${l}</button>`).join('')}</div>`;
const LANG_KEEP = new Set(['id', 'cat', 'kind', 'schedule', 'keys', 'program', 'status', 'evidence']);
function langWalk(x, map){
  if (typeof x === 'string') return map[x] ?? x;
  if (Array.isArray(x)) return x.map(v => langWalk(v, map));
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, LANG_KEEP.has(k) ? v : langWalk(v, map)]));
  return x;
}
let LANG_USE = null;
function langUse(){
  if (LANG_USE) return LANG_USE;
  const map = window.I18N_EN || {}, back = {}; Object.entries(map).forEach(([k, v]) => { if (!(v in back)) back[v] = k; });
  return LANG_USE = LANG === 'en' ? map : back;
}
/* puts a stored document's default texts into this device's language; text already in it is left as is */
function langDoc(path, doc){
  if (!doc) return doc;
  if (path === 'app/plan' || path === 'app/season') return langWalk(doc, langUse());
  if (path === 'app/meta') return {...doc, planLang: LANG};
  if (path.startsWith('days/') && doc.tasks) return {...doc, tasks: doc.tasks.map(t => ({...t, title: langUse()[t.title] ?? t.title}))};
  return doc;
}
function langSync(hadPlan){
  const was = meta().planLang || (hadPlan ? 'ru' : LANG);
  if (was !== LANG){
    ['app/plan', 'app/season'].forEach(p => { if (S.docs[p]) save(p, langDoc(p, S.docs[p])); });
    Object.entries(S.docs).forEach(([k, v]) => { if (k.startsWith('days/')) save(k, langDoc(k, v)); });
  }
  if (meta().planLang !== LANG) setMeta({planLang: LANG});
}
A.setLang = el => { if (el.dataset.v === LANG) return; try { localStorage.setItem('kai_lang', el.dataset.v); } catch {} location.reload(); };

/* ============ v6: account, KAI's own AI, AI consent, cloud sync ============ */
const CFG = window.KAI_CONFIG || {};
const cloudOn = () => !!(CFG.supabaseUrl && CFG.supabaseKey) && !S.inClaude;
const lsGet = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch {} };
let AUTH = lsGet('kai_auth'), KAI_USE = lsGet('kai_use');
const signedIn = () => cloudOn() && !!AUTH?.refresh;

/* ---- signing in: plain calls to Supabase Auth ---- */
const apiUrl = p => CFG.supabaseUrl.replace(/\/+$/, '') + p;
async function authCall(path, body){
  const r = await fetch(apiUrl('/auth/v1' + path), {method:'POST', headers:{'content-type':'application/json', apikey:CFG.supabaseKey}, body: JSON.stringify(body)});
  const d = await r.json().catch(() => ({}));
  return {ok: r.ok, status: r.status, d};
}
function setSession(d){
  const id = d.user?.id; if (!id || !d.access_token) return false;
  const st = syncState();
  if (st.owner && st.owner !== id){ toast(tr('На этом телефоне данные другого аккаунта. Войди в него или удали данные.'), {ms:5000}); return false; }
  AUTH = {access: d.access_token, refresh: d.refresh_token, exp: Date.now() + (d.expires_in || 3600) * 1000, id, email: d.user.email || ''};
  lsSet('kai_auth', AUTH);
  if (st.owner !== id) syncSave({owner: id, cursor: 0, dirty: {}, first: true});
  return true;
}
function clearSession(){ AUTH = null; KAI_USE = null; lsSet('kai_auth', null); lsSet('kai_use', null); }
async function accessToken(){
  if (!signedIn()) return null;
  if (AUTH.exp - Date.now() > 60000) return AUTH.access;
  const r = await authCall('/token?grant_type=refresh_token', {refresh_token: AUTH.refresh});
  if (r.ok && r.d.access_token){ AUTH = {...AUTH, access: r.d.access_token, refresh: r.d.refresh_token || AUTH.refresh, exp: Date.now() + (r.d.expires_in || 3600) * 1000}; lsSet('kai_auth', AUTH); return AUTH.access; }
  if (r.status === 400 || r.status === 401){ clearSession(); scheduleRender(); toast(tr('Вход истёк: войди снова')); }
  return null;
}
async function apiFetch(path, opts = {}){
  const token = await accessToken(); if (!token) throw new AIError(tr('Войди в аккаунт'), true);
  return fetch(apiUrl(path), {...opts, headers:{'content-type':'application/json', apikey:CFG.supabaseKey, authorization:'Bearer ' + token, ...(opts.headers || {})}});
}
/* Apple and Google come back to this page with the session in the address */
async function authFromUrl(){
  if (!cloudOn() || !/access_token=|error_description=/.test(location.hash)) return;
  const h = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname + location.search);
  if (h.get('error_description')) return toast(tr('Не получилось войти'));
  const access = h.get('access_token');
  const r = await fetch(apiUrl('/auth/v1/user'), {headers:{apikey:CFG.supabaseKey, authorization:'Bearer ' + access}});
  const user = await r.json().catch(() => null);
  if (r.ok && setSession({access_token: access, refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in'), user})) toast(tr('Ты вошёл в аккаунт'), {icon:'checkc', tone:'good'});
}
function accountBody(){
  const step = SH.authStep || 'start';
  if (step === 'code') return `<div class="hint">${tr('Мы отправили код на')} ${esc(SH.authEmail)}.</div><div class="field"><label for="auC">${tr('Код из письма')}</label><input class="in" id="auC" inputmode="numeric" autocomplete="one-time-code"></div><button class="btn block" data-act="authVerify">${tr('Войти')}</button><button class="link" data-act="authBack">${tr('Назад')}</button>`;
  const prov = isNative() ? (plug('SignInWithApple') ? `<button class="btn block sso apple" data-act="authApple">${tr('Продолжить через')} Apple</button>` : '') : (CFG.providers || []).map(p => `<button class="btn block sso ${p === 'apple' || p === 'google' ? p : ''}" data-act="authOAuth" data-v="${esc(p)}">${tr('Продолжить через')} ${p === 'apple' ? 'Apple' : p === 'google' ? 'Google' : esc(p)}</button>`).join('');
  return `<div class="hint">${tr('Аккаунт включает ИИ без ключей и хранит копию данных в облаке, чтобы они не потерялись при смене телефона.')}</div>${prov}
    <div class="field"><label for="auE">${tr('Эл. почта')}</label><input class="in" id="auE" type="email" autocomplete="email" autocapitalize="off" value="${esc(SH.authEmail || '')}"></div>
    <button class="btn block" data-act="authEmail">${tr('Получить код')}</button>`;
}
A.accountSheet = () => openSheet(tr('Вход в аккаунт'), accountBody);
A.authBack = () => { SH.authStep = 'start'; drawSheet(); };
A.authOAuth = el => { location.href = apiUrl('/auth/v1/authorize?provider=' + encodeURIComponent(el.dataset.v) + '&redirect_to=' + encodeURIComponent(location.origin + location.pathname)); };
A.authEmail = async el => {
  const email = val('auE'); if (!/^\S+@\S+\.\S+$/.test(email)) return toast(tr('Впиши свою почту'));
  busy(el, true);
  try {
    const r = await authCall('/otp', {email, create_user: true});
    if (!r.ok) return toast(r.status === 429 ? tr('Слишком много попыток, подожди минуту') : tr('Не получилось отправить код'));
    SH.authEmail = email; SH.authStep = 'code'; drawSheet();
  } catch { toast(tr('Нет связи с сервером')); } finally { busy(el, false); }
};
A.authVerify = async el => {
  const token = val('auC').replace(/\s/g, ''); if (!token) return toast(tr('Впиши код из письма'));
  busy(el, true);
  try {
    const r = await authCall('/verify', {type: 'email', email: SH.authEmail, token});
    if (!r.ok) return toast(tr('Код не подошёл'));
    if (setSession(r.d)){ closeSheet(); haptic('success'); toast(tr('Ты вошёл в аккаунт'), {icon:'checkc', tone:'good'}); syncSoon(0); processQueue(); }
  } catch { toast(tr('Нет связи с сервером')); } finally { busy(el, false); }
};
A.authOut = async () => {
  try { const t = await accessToken(); if (t) await fetch(apiUrl('/auth/v1/logout'), {method:'POST', headers:{apikey:CFG.supabaseKey, authorization:'Bearer ' + t}}); } catch {}
  clearSession(); render(); toast(tr('Ты вышел. Данные остались на телефоне.'));
};
A.authDelete = async el => {
  if (!el.dataset.sure){ el.dataset.sure = '1'; el.textContent = tr('Точно? Нажми ещё раз, это не отменить'); return; }
  busy(el, true);
  try {
    const r = await apiFetch('/functions/v1/delete-account', {method:'POST', body: JSON.stringify({confirm: true})});
    if (!r.ok) return toast(tr('Не получилось удалить аккаунт, попробуй позже'));
    clearSession(); syncSave(null); render(); toast(tr('Аккаунт и данные в облаке удалены. На телефоне данные остались.'), {ms:5000});
  } catch { toast(tr('Нет связи с сервером')); } finally { busy(el, false); }
};
function accountCard(){
  const consent = meta().aiConsent;
  const privacy = `<div class="hint">${consent ? tr('Ты разрешил отправлять данные ИИ.') : tr('Отправка данных ИИ не разрешена.')} ${consent ? `<button class="link" data-act="consentOff">${tr('Отозвать')}</button>` : ''}</div>`;
  const usageBtn = `<div class="btnrow"><button class="btn ghost" data-act="usageSheet">${ic('activity')}${tr('Расход ИИ')}</button>${cloudOn() && CFG.plans ? `<button class="btn ghost" data-act="planSheet">${ic('star')}${tr('Тарифы')}</button>` : ''}</div>`;
  if (!cloudOn()) return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('Конфиденциальность')}</b>${privacy}${usageBtn}${legalLinks()}</section>`;
  if (!signedIn()) return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('Аккаунт')}</b><div class="hint">${tr('Войди, чтобы пользоваться ИИ без ключей и хранить копию данных в облаке.')}</div><button class="btn" data-act="accountSheet">${tr('Войти')}</button>${privacy}${legalLinks()}${usageBtn}</section>`;
  const st = syncState(), left = Object.keys(st.dirty || {}).length;
  const sync = S.syncErr ? tr('Не удалось синхронизировать, повторю позже') : st.at ? tr('Синхронизировано в') + ' ' + new Date(st.at).toTimeString().slice(0, 5) : tr('Синхронизация…');
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('Аккаунт')}</b><div class="t">${esc(AUTH.email)}</div>
    ${KAI_USE ? `<div class="hint">${tr('ИИ сегодня:')} ${KAI_USE.used} ${tr('из')} ${KAI_USE.limit}</div>` : ''}${usageBtn}
    <div class="hint">${esc(sync)}${left ? ' · ' + tr('ждёт отправки:') + ' ' + left : ''}. ${tr('Фото пока хранятся только на телефоне.')}</div>${Object.keys(st.stuck || {}).length ? `<div class="note">${trf('Сервер не принял записей: {n}, обычно из-за размера. Они сохранены на телефоне и попадут в облако после следующего изменения.', {n: Object.keys(st.stuck).length})}</div>` : ''}${privacy}
    <div class="btnrow"><button class="btn ghost" data-act="authOut">${tr('Выйти')}</button><button class="btn danger" data-act="authDelete">${tr('Удалить аккаунт')}</button></div>${legalLinks()}</section>`;
}

/* ---- KAI's own AI: the server holds the key, picks the model and counts the limit ---- */
async function callKai(prompt, imgs, json, kind){
  const images = [];
  for (const b of imgs) images.push({type: b.type || 'image/jpeg', data: await blobToB64(b)});
  const t = withTimeout(180000);
  let r;
  try { r = await apiFetch('/functions/v1/ai', {method:'POST', signal: t.signal, body: JSON.stringify({prompt: prompt + (json ? '\n\nОтветь только JSON, без пояснений.' : ''), images, kind})}); }
  catch(e){ if (e instanceof AIError) throw e; throw new AIError(tr('Нет связи с сервером'), false); } finally { t.done(); }
  const d = await r.json().catch(() => ({}));
  if (d.limit != null){ KAI_USE = {used: d.used, limit: d.limit, tier: d.tier}; lsSet('kai_use', KAI_USE); }
  if (r.ok) return d.text;
  if (r.status === 401) throw new AIError(tr('Войди в аккаунт'), true);
  if (d.code === 'daily_limit') throw new AIError(`${tr('На сегодня запросы к ИИ закончились:')} ${d.used} ${tr('из')} ${d.limit}. ${tr('Завтра лимит обновится. Остальное работает как обычно.')}`, true);
  if (d.code === 'plus_required') throw new AIError(tr('Разбор фото доступен в платной версии. Пока опиши это текстом.'), true);
  if (d.code === 'refused') throw new AIError(tr('ИИ не стал отвечать на этот запрос.'), true);
  if (d.code === 'bad_request') throw new AIError(tr('Запрос слишком большой или с неподходящим файлом.'), true);
  throw new AIError(tr('ИИ сейчас недоступен, попробую позже'), false);
}

/* ---- consent: nothing leaves the phone for an AI service until the person agrees (App Store rule 5.1.2) ---- */
const REMOTE_AI = ['kai', 'claude', 'openai'];
const aiAgreed = () => S.inClaude || !!meta().aiConsent;
let consentDone = null;
function askConsent(){
  if (aiAgreed()) return Promise.resolve(true);
  if (consentDone) return consentDone.p;
  const root = document.createElement('div'); root.id = 'consentRoot';
  root.innerHTML = `<div class="scrim" style="z-index:1000"><div class="sheet" role="dialog" aria-modal="true" aria-label="${tr('Отправка данных ИИ')}"><div class="sh-h"><h3>${tr('Отправка данных ИИ')}</h3></div><div class="sh-b" style="display:flex;flex-direction:column;gap:14px">
    <div>${tr('Чтобы ИИ понимал твои сообщения, они отправляются внешнему сервису ИИ.')}</div>
    <div class="hint"><b>${tr('Что отправляется:')}</b> ${tr('текст сообщения, фото и скриншоты, которые ты выбрал, а также твой профиль, цели и расписание, чтобы ответ подходил именно тебе.')}</div>
    <div class="hint"><b>${tr('Кому:')}</b> ${tr('Anthropic (Claude), или OpenAI, если ты сам подключил ChatGPT.')}</div>
    <div class="hint">${tr('Текст запросов не хранится на серверах KAI. Без согласия работает всё, кроме ИИ. Разрешение можно отозвать в разделе «Ещё».')}</div>
    <button class="btn block" data-act="consentYes">${tr('Разрешаю')}</button><button class="btn ghost block" data-act="consentNo">${tr('Не сейчас')}</button></div></div></div>`;
  document.body.append(root);
  let done; const p = new Promise(r => { done = r; });
  consentDone = {p, done: v => { root.remove(); consentDone = null; done(v); }};
  return p;
}
A.consentYes = () => { setMeta({aiConsent: new Date().toISOString()}); consentDone?.done(true); setTimeout(processQueue, 50); };
A.consentNo = () => { consentDone?.done(false); toast(tr('Запрос не отправлен: ИИ не получит данные без твоего разрешения.'), {ms:4000}); };
A.consentOff = () => { setMeta({aiConsent: null}); toast(tr('Разрешение отозвано')); };

/* ---- cloud sync: one row per document, the newest edit wins, the server keeps recent versions ---- */
const NO_SYNC = new Set(['jobs', 'inbox']);
const syncable = p => /^[a-z]+\/[^/]+$/.test(p) && p !== 'app/ai' && !NO_SYNC.has(p.split('/')[0]);
let SYNC = null, syncTimer = null, syncBusy = false;
const syncState = () => SYNC || (SYNC = lsGet('kai_sync') || {});
function syncSave(st){ SYNC = st || {}; lsSet('kai_sync', st); }
/* the app already knows which documents changed: called from save() and remove() */
function syncMark(path){
  if (S.fromCloud || S.inClaude || !syncable(path)) return;
  const st = syncState(); if (!st.owner) return;
  st.dirty = {...(st.dirty || {}), [path]: Date.now()};
  if (st.stuck?.[path]){ st.stuck = {...st.stuck}; delete st.stuck[path]; } // changed since: worth another try
  syncSave(st);
  syncSoon();
}
function syncSoon(ms = 4000){
  if (!signedIn()) return;
  clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, ms);
}
function applyCloud(row){
  S.fromCloud = true;
  try { if (row.deleted) { if (S.docs[row.path]) remove(row.path); } else { const d = langDoc(row.path, row.data); if (JSON.stringify(S.docs[row.path]) !== JSON.stringify(d)) save(row.path, d); } }
  finally { S.fromCloud = false; }
}
async function syncPull(after){
  const rows = [];
  for (let cur = after;;){
    const r = await apiFetch(`/rest/v1/docs?select=path,data,deleted,rev,client_ts&rev=gt.${cur}&order=rev.asc&limit=500`);
    if (!r.ok) throw new Error('pull ' + r.status);
    const page = await r.json(); rows.push(...page);
    if (page.length < 500) return rows;
    cur = page[page.length - 1].rev;
  }
}
async function syncPush(){
  const st = syncState(), paths = Object.keys(st.dirty || {});
  for (let i = 0; i < paths.length; i += 50){
    const batch = paths.slice(i, i + 50), stamps = batch.map(p => st.dirty[p]);
    const items = batch.map((path, k) => { const data = S.docs[path]; return {path, data: data ?? null, deleted: data === undefined, ts: stamps[k]}; });
    const r = await apiFetch('/rest/v1/rpc/sync_push', {method:'POST', body: JSON.stringify({p_items: items})});
    if (r.status === 400 && items.length > 1){ await syncOneByOne(items); continue; } // one bad document must not hold back the rest
    if (r.status === 400){ syncStuck(items[0]); continue; }
    if (!r.ok) throw new Error('push ' + r.status);
    const cur = syncState(), dirty = {...cur.dirty};
    batch.forEach((p, k) => { if (dirty[p] === stamps[k]) delete dirty[p]; }); // an edit made during the upload stays queued
    syncSave({...cur, dirty});
  }
}
async function syncOneByOne(items){
  for (const it of items){
    const r = await apiFetch('/rest/v1/rpc/sync_push', {method:'POST', body: JSON.stringify({p_items: [it]})});
    if (r.status === 400){ syncStuck(it); continue; }
    if (!r.ok) throw new Error('push ' + r.status);
    const cur = syncState(), dirty = {...cur.dirty}; if (dirty[it.path] === it.ts) delete dirty[it.path]; syncSave({...cur, dirty});
  }
}
/* the server refused this document (too large, for one): it stays on the phone and is tried again after its next change */
function syncStuck(it){
  const cur = syncState(), dirty = {...cur.dirty};
  if (dirty[it.path] === it.ts) delete dirty[it.path];
  syncSave({...cur, dirty, stuck: {...(cur.stuck || {}), [it.path]: it.ts}});
}
/* first sync on a device: the cloud copy wins, anything only here is uploaded, and what would be replaced is kept in a local backup */
async function syncFirst(){
  const rows = await syncPull(0), st = syncState();
  const cloud = new Map(rows.map(r => [r.path, r]));
  const differs = rows.filter(r => !r.deleted && S.docs[r.path] && JSON.stringify(S.docs[r.path]) !== JSON.stringify(r.data) && r.path.startsWith('days/'));
  if (differs.length){
    const copy = Object.fromEntries(Object.entries(S.docs).filter(([k]) => syncable(k)));
    await blobPut('presync_' + Date.now(), new Blob([JSON.stringify({app:'kai', version:1, exported:new Date().toISOString(), docs: copy})], {type:'application/json'}));
    toast(tr('В облаке уже есть данные. Они загружены, а копия с этого телефона сохранена.'), {ms:5000});
  }
  rows.forEach(applyCloud);
  const dirty = {}, now = Date.now();
  Object.keys(S.docs).forEach(p => { if (syncable(p) && !cloud.has(p)) dirty[p] = now; });
  syncSave({...st, dirty, first: false, cursor: rows.reduce((a, r) => Math.max(a, r.rev), 0)});
  if (rows.length && meta().welcomed && SH?.ob) closeSheet();
}
async function syncNow(){
  if (syncBusy || !signedIn() || !S.online || !S.ready) return;
  syncBusy = true;
  try {
    if (syncState().first) await syncFirst();
    else {
      const rows = await syncPull(syncState().cursor || 0);
      const st = syncState(), dirty = {...st.dirty};
      rows.forEach(r => { if (dirty[r.path] > r.client_ts) return; delete dirty[r.path]; applyCloud(r); });
      syncSave({...st, dirty, cursor: rows.reduce((a, r) => Math.max(a, r.rev), st.cursor || 0)});
    }
    await syncPush();
    const st = syncState(); syncSave({...st, at: Date.now()});
    S.syncErr = false;
  } catch(e){ if (!S.syncErr) S.syncErrSince = Date.now(); S.syncErr = true; }
  finally { syncBusy = false; if (S.tab === 'more') scheduleRender(); }
}
setInterval(() => syncSoon(0), 300000);
// shown on screen only after half an hour of failures, so a short outage stays quiet
const syncBehind = () => S.syncErr && Date.now() - (S.syncErrSince || 0) > 30 * 60000 ? Object.keys(syncState().dirty || {}).length : 0;
window.addEventListener('online', () => syncSoon(500));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncSoon(500); });

/* ============ v7: study plans, levels, weekly recap ============ */
/* ---- study plan: topics spread over the days before an exam, within the time the day really has ---- */
const STUDY_KINDS = ['study', 'free', 'project'];
function dayFreeMin(date){
  const bl = dayBlocks(date);
  if (!bl.length) return 120;
  return bl.filter(b => STUDY_KINDS.includes(b.kind) && b.e != null).reduce((a, b) => a + b.e - b.s, 0);
}
function buildStudyPlan(topics, ex, perTopic, from = todayISO()){
  const days = [];
  for (let k = from; k < ex.date; k = addDays(k, 1)) if (!allEvents().some(e => e.kind === 'exam' && e.id !== ex.id && e.date === k)) days.push(k);
  const review = days.length >= 2 ? days.pop() : null; // the last day is for going over everything
  const room = days.map(k => Math.floor(dayFreeMin(k) / perTopic)), items = [], overflow = [];
  topics.forEach((topic, i) => {
    const want = Math.floor(i * days.length / topics.length);
    let at = -1;
    for (let k = want; k < days.length && at < 0; k++) if (room[k] > 0) at = k;
    for (let k = want - 1; k >= 0 && at < 0; k--) if (room[k] > 0) at = k;
    if (at < 0) return overflow.push(topic);
    room[at]--; items.push({topic, date: days[at]});
  });
  return {items: items.sort((a, b) => a.date.localeCompare(b.date)), review, overflow, perTopic};
}
const parseTopics = s => [...new Set(String(s).split(/[\n,;]+/).map(x => x.trim()).filter(Boolean))].slice(0, 60);
const planTasks = id => smartTasks().filter(t => t.examId === id);
function applyStudyPlan(ex, plan_){
  const keep = smartTasks().filter(t => !(t.examId === ex.id && !t.done)), today = todayISO();
  const mk = (title, due, topic) => ({id: uid(), title, due, time: null, pri: 2, done: false, created: today, examId: ex.id, topic, perTopic: plan_.perTopic});
  const add = plan_.items.map(x => mk(`${x.topic} · ${ex.title}`, x.date, x.topic));
  if (plan_.review) add.push(mk(`${tr('Общее повторение')} · ${ex.title}`, plan_.review, ''));
  saveTasks([...keep, ...add]);
  const pl = clone(plan()), e = pl.routine?.events?.find(x => x.id === ex.id);
  if (e){ e.studyPlan = {perTopic: plan_.perTopic}; save('app/plan', pl); }
}
function creditStudy(t){
  if (!t?.examId || !t.perTopic) return;
  mutDay(todayISO(), d => { d.timeExtra = {...(d.timeExtra || {}), study: (d.timeExtra?.study || 0) + t.perTopic}; });
  const pl = clone(plan()), e = pl.routine?.events?.find(x => x.id === t.examId);
  if (e){ e.prepMin = (e.prepMin || 0) + t.perTopic; save('app/plan', pl); }
}
function studyBody(){
  const ex = allEvents().find(e => e.id === SH.spId); if (!ex) return '';
  const per = SH.spPer || 60, p = SH.spPlan, n = dayDiff(todayISO(), ex.date);
  const form = `<div class="hint">${esc(ex.title)} · ${fmtShort(ex.date)}. ${tr('Запиши темы, а я распределю их по дням, где есть свободное время.')}</div>
    <div class="field"><label for="spT">${tr('Темы: по одной в строке или через запятую')}</label><textarea class="in" id="spT" style="min-height:120px">${esc(SH.spText || '')}</textarea></div>
    <div class="field"><label>${tr('Времени на тему')}</label><div class="seg">${[30, 45, 60, 90].map(m => `<button class="${per === m ? 'on' : ''}" data-act="spPer" data-v="${m}">${fmtMin(m)}</button>`).join('')}</div></div>`;
  if (n < 1) return `<div class="note">${tr('Экзамен уже сегодня: планировать поздно. Повтори самое важное.')}</div>`;
  if (!p) return form + `<button class="btn block" data-act="spBuild">${ic('list')}${tr('Составить план')}</button>`;
  const byDay = {}; p.items.forEach(x => { (byDay[x.date] = byDay[x.date] || []).push(x.topic); });
  return `${p.overflow.length ? `<div class="banner" role="status">${ic('alert')}<div>${tr('Времени не хватает. Не поместились темы:')} ${esc(p.overflow.join(', '))}. ${tr('Убери лишнее или дай меньше времени на тему.')}</div></div>` : ''}
    <section class="card" style="padding:4px 18px"><div class="list">${Object.entries(byDay).map(([k, ts]) => `<div class="row"><div class="mid"><div class="t">${fmtShort(k)}, ${DOW[dow(k)]}</div><div class="s">${esc(ts.join(', '))}</div></div></div>`).join('')}${p.review ? `<div class="row"><div class="mid"><div class="t">${fmtShort(p.review)}, ${DOW[dow(p.review)]}</div><div class="s">${tr('Общее повторение')}</div></div></div>` : ''}</div></section>
    ${p.items.length ? `<button class="btn block" data-act="spApply">${ic('check')}${tr('Добавить в задачи')}</button>` : ''}<button class="btn ghost block" data-act="spBack">${tr('Изменить')}</button>`;
}
A.studyPlan = el => {
  const id = el.dataset.id;
  openSheet(tr('План подготовки'), studyBody);
  const open = planTasks(id).filter(t => !t.done && t.topic);
  SH.spId = id; SH.spText = open.map(t => t.topic).join('\n'); SH.spPer = allEvents().find(e => e.id === id)?.studyPlan?.perTopic || 60; drawSheet();
};
A.spPer = el => { SH.spText = val('spT'); SH.spPer = +el.dataset.v; drawSheet(); };
A.spBack = () => { SH.spPlan = null; drawSheet(); };
A.spBuild = () => {
  SH.spText = val('spT'); const topics = parseTopics(SH.spText); if (!topics.length) return toast(tr('Впиши хотя бы одну тему'));
  const ex = allEvents().find(e => e.id === SH.spId), start = new Date().getHours() >= 20 ? addDays(todayISO(), 1) : todayISO();
  SH.spPlan = buildStudyPlan(topics, ex, SH.spPer || 60, start); drawSheet();
};
A.spApply = () => {
  const ex = allEvents().find(e => e.id === SH.spId); if (!ex || !SH.spPlan) return;
  applyStudyPlan(ex, SH.spPlan); closeSheet(); haptic('success'); toast(tr('План готов: темы появятся в задачах в нужные дни'), {icon: 'checkc', tone: 'good', ms: 4000});
};

/* ---- levels: earned from what is already logged, so nothing extra to track ---- */
const xpFor = n => 50 * n * (n + 1); // total XP needed to reach level n + 1
function totalXP(){
  let xp = 0;
  dayKeys().forEach(k => {
    const d = S.docs['days/' + k]; if (!d) return;
    const done = (d.tasks || []).filter(t => t.done).length, t = timeOn(k);
    xp += done * 10 + (d.tasks?.length && done === d.tasks.length ? 20 : 0) + Math.round((t.walk + t.gym + t.study) / 2);
  });
  return xp + smartTasks().filter(t => t.done).length * 10;
}
function levelOf(xp){
  let n = 0; while (xp >= xpFor(n + 1)) n++;
  const from = xpFor(n), to = xpFor(n + 1);
  return {level: n + 1, xp, into: xp - from, need: to - from};
}
function checkLevel(){
  const {level} = levelOf(totalXP()), seen = meta().level;
  if (seen == null || level < seen) return setMeta({level});
  if (level > seen){
    setMeta({level}); haptic('success'); sound('success'); confetti({n: 90});
    toast(`${tr('Новый уровень:')} ${level}`, {icon: 'trophy', tone: 'gold', ms: 3400});
  }
}
function levelRow(){
  const l = levelOf(totalXP());
  return `<div class="lvl"><span class="lvl-n">${l.level}</span><div class="mid"><div class="lvl-h"><b>${tr('Уровень')} ${l.level}</b><span class="hint">${l.into} / ${l.need} XP</span></div><div class="bar"><i style="width:${Math.min(100, l.into / l.need * 100)}%;background:var(--accent)"></i></div></div></div>`;
}

/* ---- weekly recap: a picture to keep or share. It holds only numbers, never names or what was eaten ---- */
function recapRange(){ const t = todayISO(), end = dow(t) === 1 ? addDays(t, -1) : t; return [...Array(7)].map((_, i) => addDays(end, i - 6)); }
function recapStats(){
  const days = recapRange(), s = timeSum(days);
  const tasks = days.reduce((a, k) => a + (S.docs['days/' + k]?.tasks || []).filter(t => t.done).length, 0) + smartTasks().filter(t => t.done && days.includes(t.doneAt)).length;
  return {days, ...s, tasks, streak: streak(), level: levelOf(totalXP()).level};
}
function recapCanvas(st){
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), font = (w, px) => `${w} ${px}px Manrope, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#123a3f'); g.addColorStop(.45, '#0b2226'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const hours = m => m >= 60 ? num(m / 60, 1) + ' ' + tr('ч') : Math.round(m) + ' ' + tr('мин');
  c.fillStyle = '#fff'; c.font = font(800, 56); c.fillText('KAI', 80, 120);
  c.fillStyle = '#a2a6aa'; c.font = font(600, 36); c.fillText(`${fmtShort(st.days[0])} – ${fmtShort(st.days[6])}`, 80, 180);
  c.fillStyle = '#fff'; c.font = font(800, 150); c.fillText(hours(st.total), 80, 370);
  c.fillStyle = '#a2a6aa'; c.font = font(600, 40); c.fillText(tr('вложено за неделю'), 80, 435);
  const tiles = [[hours(st.walk), tr('ходьба'), '#199e70'], [hours(st.gym), tr('зал'), '#3987e5'], [hours(st.study), tr('учёба'), '#c98500'], [st.active + ' / 7', tr('активных дней'), '#e8a33d'], [String(st.tasks), tr('задач сделано'), '#2ebd6b'], [String(st.streak), tr('дней подряд'), '#ef5b56']];
  tiles.forEach(([v, l, col], i) => {
    const x = 80 + (i % 2) * 470, y = 510 + Math.floor(i / 2) * 230;
    c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); if (c.roundRect) c.roundRect(x, y, 450, 205, 32); else c.rect(x, y, 450, 205); c.fill();
    c.fillStyle = col; c.fillRect(x + 36, y + 40, 56, 8);
    c.fillStyle = '#fff'; c.font = font(800, 68); c.fillText(v, x + 36, y + 120);
    c.fillStyle = '#a2a6aa'; c.font = font(600, 32); c.fillText(l, x + 36, y + 170);
  });
  c.fillStyle = '#fff'; c.font = font(700, 40); c.fillText(`${tr('Уровень')} ${st.level}`, 80, 1270);
  return cv;
}
A.recap = () => {
  const st = recapStats();
  let src = ''; try { src = recapCanvas(st).toDataURL('image/png'); } catch {}
  openSheet(tr('Итоги недели'), () => `${src ? `<img src="${src}" alt="${tr('Итоги недели')}" style="width:100%;border-radius:16px">` : ''}<div class="btnrow"><button class="btn" data-act="recapShare">${ic('send')}${tr('Поделиться')}</button></div><div class="hint">${tr('На картинке только цифры: без имени и того, что ты ел.')}</div>`);
};
A.recapShare = async () => {
  const blob = await new Promise(r => recapCanvas(recapStats()).toBlob(r, 'image/png'));
  if (blob) await shareOrDownload(`kai-week-${todayISO()}.png`, blob);
};
function recapBanner(){
  const t = todayISO(), wk = recapRange()[0];
  if (![7, 1].includes(dow(t)) || meta().recapSeen === wk || timeSum(recapRange()).active < 2) return '';
  return `<button class="card navrow" data-act="recapOpen"><span class="ic">${ic('trophy')}</span><div class="mid"><div class="t">${tr('Итоги недели готовы')}</div><div class="s">${tr('Посмотри, сколько ты вложил за 7 дней')}</div></div>${ic('chevR')}</button>`;
}
A.recapOpen = () => { setMeta({recapSeen: recapRange()[0]}); A.recap(); };

/* ============ v8: the iPhone app. The native wrapper adds its plugins to window.Capacitor; in a browser none of this runs ============ */
const REMIND_KINDS = [['exams', tr('Экзамены и дедлайны'), tr('За 2 недели, неделю, 3 дня, день и 2 часа')], ['events', tr('События'), tr('За час')], ['classes', tr('Пары'), tr('За 15 минут')], ['gym', tr('Тренировки'), tr('За 30 минут')], ['tasks', tr('Задачи со временем'), tr('Ко времени')], ['warnings', tr('Конфликты в планах'), tr('Накануне в 20:00')], ['recap', tr('Итоги недели'), tr('В воскресенье в 20:00')], ['bed', tr('Отбой'), tr('За 30 минут до сна по расписанию')]];
const REMIND_OFF = new Set(['bed']); // off until the person turns them on
const remindOn = k => { const v = (meta().remind || {})[k]; return v === undefined ? !REMIND_OFF.has(k) : v !== false; };
const REMIND_MAX = 60; // iOS keeps only 64 pending notifications per app
const REMIND_MUST = 30; // exams come first, so a full timetable can't push them out
const remindId = key => { let h = 2166136261; for (const ch of key){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 1) || 1; };
const atMin = (date, min) => { const [y, m, d] = date.split('-').map(Number); return new Date(y, m - 1, d, 0, min).getTime(); };
function buildReminders(now = Date.now()){
  const out = [], today = todayISO();
  const add = (key, at, title, body, must, go = 'day') => { if (at > now + 30000) out.push({id: remindId(key), key, at, title, body, must: !!must, go}); };
  if (remindOn('exams')) allEvents().filter(e => (e.kind === 'exam' || e.kind === 'deadline') && e.date >= today).forEach(e => {
    const start = atMin(e.date, hm(e.from || '09:00')), open = planTasks(e.id).filter(t => !t.done).length;
    const steps = e.kind === 'exam' ? [[14, tr('через 2 недели')], [7, tr('через неделю')], [3, tr('через 3 дня')], [1, tr('завтра')]] : [[3, tr('через 3 дня')], [1, tr('завтра')]];
    steps.forEach(([n, l]) => add(`x${e.id}_${n}`, start - n * 1440 * 60000, `${e.title}: ${l}`, open ? `${tr('Осталось тем:')} ${open}. ${examStage(n, e.kind)}` : examStage(n, e.kind), true));
    add(`x${e.id}_h`, start - 120 * 60000, `${e.title}: ${tr('через 2 часа')}`, examStage(0, e.kind), true);
  });
  for (let i = 0; i < 14; i++){
    const date = addDays(today, i);
    timedOn(date).forEach(x => {
      if (x.k === 'cls' && remindOn('classes')) add(`c${date}_${x.id}`, atMin(date, x.s - 15), x.title, tr('Через 15 минут'));
      if (x.k === 'task' && remindOn('tasks')) add(`t${x.id}`, atMin(date, x.s), x.title, tr('Задача на это время'));
      if (x.k === 'ev' && remindOn('events') && !['exam', 'deadline'].includes(allEvents().find(e => e.id === x.id)?.kind)) add(`e${date}_${x.id}`, atMin(date, x.s - 60), x.title, tr('Через час'));
    });
    const gym = workoutFor(date) && dayBlocks(date).find(b => b.gym);
    if (gym && remindOn('gym') && !getDay(date).tasks.some(t => t.id === 'gym' && t.done)) add(`g${date}`, atMin(date, gym.s - 30), tr('Скоро тренировка'), tr('Через 30 минут'), false, 'train');
    const bed = i < 7 && remindOn('bed') && bedMin(date);
    if (bed != null && bed !== false) add(`b${date}`, atMin(date, bed - 30), tr('Скоро отбой'), tr('Через 30 минут по расписанию сон. Пора откладывать телефон.'));
  }
  if (remindOn('warnings')) upcomingWarnings(7).forEach(w => add(`w${w.id}`, atMin(addDays(w.date, -1), 20 * 60), tr('Завтра в планах конфликт'), w.text));
  if (remindOn('recap')){ let k = today; while (dow(k) !== 7) k = addDays(k, 1); add(`r${k}`, atMin(k, 20 * 60), tr('Итоги недели готовы'), tr('Посмотри, как прошла твоя неделя'), false, 'recap'); }
  const byTime = (a, b) => a.at - b.at, must = out.filter(r => r.must).sort(byTime).slice(0, REMIND_MUST);
  return [...must, ...out.filter(r => !r.must).sort(byTime).slice(0, REMIND_MAX - must.length)].sort(byTime);
}
let remindT, remindSig = '';
function remindSoon(){ if (!isNative()) return; clearTimeout(remindT); remindT = setTimeout(syncReminders, 1500); }
async function syncReminders(){
  const LN = plug('LocalNotifications'); if (!LN || !S.ready || !meta().remindAsked) return;
  try {
    if ((await LN.checkPermissions()).display !== 'granted') return;
    const want = buildReminders(), sig = JSON.stringify(want.map(r => [r.id, r.at, r.title, r.body, r.go]));
    if (sig === remindSig) return;
    const {notifications: pend = []} = await LN.getPending();
    if (pend.length) await LN.cancel({notifications: pend.map(p => ({id: p.id}))});
    // a real Date: the iOS plugin reads this field as a native date, not as text
    if (want.length) await LN.schedule({notifications: want.map(r => ({id: r.id, title: r.title, body: r.body, extra: {go: r.go}, schedule: {at: new Date(r.at), allowWhileIdle: true}}))});
    remindSig = sig;
  } catch {}
}
/* bedtime from the day's routine; a sleep time past midnight belongs to the same evening */
function bedMin(date){
  const bl = dayBlocks(date), sl = bl.find(b => b.kind === 'sleep'), wk = bl.find(b => b.id === 'wake');
  if (!sl) return null;
  return wk && sl.s < wk.s ? sl.s + 1440 : sl.s;
}
/* tapping a reminder opens the screen it is about; a tap that launched the app waits for the data */
function openFromReminder(go){
  if (!S.ready) return setTimeout(() => openFromReminder(go), 200);
  closeSheetQuiet(); window.scrollTo(0, 0);
  if (go === 'train') return A.goTrain();
  S.tab = 'day'; render();
  if (go === 'recap') A.recap();
}
let remindTapOn = false;
function listenReminderTaps(){
  const LN = plug('LocalNotifications'); if (!LN || remindTapOn) return;
  remindTapOn = true;
  try { LN.addListener('localNotificationActionPerformed', e => openFromReminder(e?.notification?.extra?.go)); } catch {}
}
function notifBody(){
  const m = meta();
  if (SH.notifDenied) return `<div class="hint">${tr('Уведомления выключены в настройках iPhone. Открой Настройки → KAI → Уведомления и включи их.')}</div>`;
  if (!m.remindAsked) return `<div class="hint">${tr('KAI напомнит об экзаменах, парах и конфликтах в планах, даже когда приложение закрыто и нет интернета.')}</div><button class="btn block" data-act="notifOn">${ic('bell')}${tr('Включить напоминания')}</button>`;
  return `<div class="hint">${tr('Напоминания обновляются сами, когда меняется расписание.')}</div><section class="card" style="padding:4px 16px"><div class="list">${REMIND_KINDS.map(([k, l, hh]) => `<label class="row" style="padding:10px 0"><div class="mid"><div class="t">${l}</div><div class="s">${hh}</div></div><input type="checkbox" switch class="sw" data-ch="remind" data-k="${k}" aria-label="${l}" ${remindOn(k) ? 'checked' : ''}></label>`).join('')}</div></section>`;
}
A.notifSheet = () => openSheet(tr('Напоминания'), notifBody);
A.notifOn = async () => {
  const LN = plug('LocalNotifications'); if (!LN) return;
  let ok = false;
  try { ok = (await LN.requestPermissions()).display === 'granted'; } catch {}
  if (!ok){ SH.notifDenied = true; drawSheet(); return; }
  setMeta({remindAsked: true}); drawSheet(); syncReminders(); haptic('success');
};
CH.remind = el => { setMeta({remind: {...(meta().remind || {}), [el.dataset.k]: el.checked}}); };
const icsWeb = A.ics;
A.ics = () => isNative() ? A.notifSheet() : icsWeb();

/* ---- Apple Health: only reads, and never overwrites what the person typed in ---- */
const HEALTH_READ = ['steps', 'sleep', 'workouts'];
const WALK_TYPES = new Set(['walking', 'hiking', 'running', 'runningTreadmill', 'stairClimbing']);
const ASLEEP = new Set(['asleep', 'rem', 'deep', 'light']);
const localISO = iso => { const t = new Date(iso); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); };
function applyHealth({steps = [], sleep = [], workouts = []}){
  const sleepMin = {}, byDay = {};
  const day = k => (byDay[k] = byDay[k] || {});
  steps.forEach(x => { if (x.value > 0) day(localISO(x.startDate)).steps = Math.round(x.value); });
  sleep.filter(x => ASLEEP.has(x.sleepState || 'asleep')).forEach(x => { const k = localISO(x.endDate); sleepMin[k] = (sleepMin[k] || 0) + x.value; }); // a night counts for the morning it ends
  Object.entries(sleepMin).forEach(([k, v]) => { day(k).sleep = Math.round(v / 6) / 10; });
  workouts.forEach(w => { const k = localISO(w.startDate); (day(k).wk = day(k).wk || []).push({id: w.platformId || w.startDate, min: Math.round(w.duration / 60), walk: WALK_TYPES.has(w.workoutType)}); });
  Object.entries(byDay).forEach(([k, v]) => mutDay(k, d => {
    if (v.steps) d.steps = Math.max(toNum(d.steps) || 0, v.steps);
    if (v.sleep && (!d.sleep || d.sleepHealth)){ d.sleep = v.sleep; d.sleepHealth = true; }
    (v.wk || []).forEach(w => {
      d.healthWk = d.healthWk || {}; if (d.healthWk[w.id]) return; // already counted on an earlier import
      d.healthWk[w.id] = w.min;
      if (w.walk) d.walkExtra = (d.walkExtra || 0) + w.min;
      else d.timeExtra = {...(d.timeExtra || {}), gym: (d.timeExtra?.gym || 0) + w.min};
    });
  }));
  return Object.keys(byDay).length;
}
async function healthImport(days = 3){
  const H = plug('Health'); if (!H || !meta().healthOn) return 0;
  const startDate = new Date(atMin(addDays(todayISO(), -days), 0)).toISOString(), endDate = new Date().toISOString();
  const [st, sl, wk] = await Promise.all([
    H.queryAggregated({dataType: 'steps', startDate, endDate, bucket: 'day', aggregation: 'sum'}),
    H.readSamples({dataType: 'sleep', startDate, endDate, limit: 500, ascending: true}),
    H.queryWorkouts({startDate, endDate, limit: 50, ascending: true}),
  ]);
  return applyHealth({steps: st.samples, sleep: sl.samples, workouts: wk.workouts});
}
A.healthConnect = async el => {
  const H = plug('Health'); if (!H) return;
  busy(el, true);
  try {
    await H.requestAuthorization({read: HEALTH_READ, write: []});
    setMeta({healthOn: true});
    const n = await healthImport(7);
    toast(n ? tr('Данные из Здоровья добавлены') : tr('В Здоровье пока нет данных за неделю'));
  } catch { toast(tr('Не получилось подключить Здоровье')); } finally { busy(el, false); render(); }
};
A.healthOff = () => { setMeta({healthOn: false}); toast(tr('Здоровье отключено. То, что уже добавлено, осталось.')); };
const healthRow = () => {
  if (!isNative() || !plug('Health')) return '';
  const on = meta().healthOn;
  return acc('apple', 'steps', tr('Здоровье iPhone'), on ? tr('Подключено: шаги, сон, тренировки') : tr('Не подключено'), `<div class="hint">${tr('KAI только читает шаги, сон и тренировки. Записи, которые ты сделал сам, не меняются. Эти данные идут в твоё расписание и прогресс, а ИИ получает их только в разборах, которые ты запустил сам.')}${healthCloudNote()}</div>${on ? `<button class="btn ghost" data-act="healthOff">${tr('Отключить')}</button>` : `<button class="btn" data-act="healthConnect">${tr('Подключить')}</button>`}`);
};

/* ---- Sign in with Apple: Apple checks a hash of the nonce, the server checks the nonce itself ---- */
async function sha256Hex(text){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
A.authApple = async el => {
  const SA = plug('SignInWithApple'); if (!SA) return;
  busy(el, true);
  try {
    const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join('');
    const {response} = await SA.authorize({clientId: 'app', redirectURI: '', scopes: 'email name', nonce: await sha256Hex(nonce)});
    const r = await authCall('/token?grant_type=id_token', {provider: 'apple', id_token: response.identityToken, nonce});
    if (!r.ok || !setSession(r.d)) return toast(tr('Не получилось войти через Apple'));
    closeSheet(); haptic('success'); toast(tr('Ты вошёл в аккаунт'), {icon:'checkc', tone:'good'}); syncSoon(0); processQueue();
  } catch(e){ if (!/cancel|1001/i.test(String(e?.message || e?.code))) toast(tr('Не получилось войти через Apple')); } finally { busy(el, false); }
};

/* ---- documents: read in the app from the app's own files, so they also work offline and inside the iPhone app ---- */
A.legal = async el => {
  try {
    const page = new DOMParser().parseFromString(await (await fetch(el.dataset.v + '.html')).text(), 'text/html');
    openSheet(el.textContent.trim(), `<div class="legal">${$(`[lang="${LANG}"]`, page)?.innerHTML || ''}</div>`);
  } catch { toast(tr('Не получилось открыть документ')); }
};
const legalLinks = () => `<div class="btnrow"><button class="link" data-act="legal" data-v="privacy">${tr('Политика конфиденциальности')}</button><button class="link" data-act="legal" data-v="terms">${tr('Условия использования')}</button></div>`;

if (isNative()) listenReminderTaps();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !isNative()) return;
  remindSoon();
  if (Date.now() - (S.healthAt || 0) > 30 * 60000){ S.healthAt = Date.now(); healthImport().catch(() => {}); }
});

/* ============ first week: one obvious first step, and less on screen until there is something to show ============ */
const trackedFrom = () => meta().startedOn || dayKeys()[0] || todayISO();
const firstWeek = () => { const st = meta().startedOn; return !!st && dayDiff(st, todayISO()) < 7; };
// someone who already sent a message, or has one waiting, has found KAI; old installs count by what they logged
const hasTold = () => !!meta().toldOnce || Object.keys(S.docs).some(k => (k.startsWith('jobs/') || k.startsWith('inbox/')) && S.docs[k]?.kind === 'tell') || dayKeys().some(k => S.docs['days/' + k]?.log?.length);
// without AI, only examples the phone can read itself, so the first tap always works
const TELL_EXAMPLES = () => aiStatus().ok ? [tr('Съел овсянку с бананом и выпил кофе'), tr('Гулял 40 минут, спал 7 часов'), tr('Потратил 12 на обед'), tr('В пятницу в 10:00 экзамен')] : [tr('Гулял 40 минут, спал 7 часов'), tr('Потратил 12 на обед'), tr('В пятницу в 10:00 экзамен'), tr('Завтра в 18:30 позвонить маме')];
function firstTellCard(){
  if (hasTold() || meta().firstTellOff) return '';
  return `<section class="card firstc" aria-labelledby="firstH"><h2 id="firstH">${tr('Расскажи KAI, как прошёл день')}</h2>
    <div class="hint">${tr('Одним сообщением, своими словами. KAI сам разложит еду, движение, деньги и планы и покажет, прежде чем что-то менять. Нажми на пример или напиши своё:')}</div>
    <div class="ob-goals">${TELL_EXAMPLES().map(x => `<button class="pill" data-act="tellEx" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <button class="btn block" data-act="tell">${ic('mic')}${tr('Написать KAI')}</button>
    <button class="link" data-act="firstTellOff">${tr('Не сейчас')}</button></section>`;
}
A.tellEx = el => {
  A.tell(); SH.tellText = el.dataset.v; drawSheet();
  const t = $('#tellT'); if (t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
};
A.firstTellOff = () => setMeta({firstTellOff: true});
const tellGo0 = A.tellGo;
A.tellGo = async (...a) => { if (val('tellT') && !meta().toldOnce) setMeta({toldOnce: true}); return tellGo0(...a); };

/* ============ Tell KAI without AI: the most common messages are read on the phone, in the same format the AI answers in ============ */
const NUM = '(\\d+(?:[.,]\\d+)?)';
const toN = x => +String(x).replace(',', '.');
const MIN_U = '(мин[а-яё]*|min(?:ute)?s?|h|hrs?|hours?|ч|час[а-яё]*)';
const asMin = (n, u) => Math.round(/^(h|hr|hrs|hour|hours|ч|час)/i.test(u) ? toN(n) * 60 : toN(n));
const MONEY_CAT = [[/обед|ужин|завтрак|кофе|кафе|ресторан|lunch|dinner|breakfast|coffee|cafe|restaurant|pizza|пицц/i, 'Кафе и рестораны'], [/продукт|магазин|супермаркет|grocer|supermarket|shop/i, 'Супермаркеты'], [/такси|автобус|метро|бензин|taxi|bus|metro|subway|fuel|gas\b|train|поезд/i, 'Транспорт'], [/телефон|phone|ноутбук|laptop|наушник|headphones|зарядк|charger|планшет|tablet/i, 'Электроника'], [/связь|интернет|internet|тариф|мобильн/i, 'Связь и интернет']];
const INTENT_RE = /^(?:i\s+)?(?:need to|have to|must|remind me to|don.?t forget to|надо|нужно|не забыть|напомни(?: мне)?|мне надо|мне нужно)\s+/i;
const TODO_RE = /надо|нужно|не забыть|напомни|должен|должна|need to|have to|must|remind|don.?t forget|^(?:call|buy|pay|send|email|book|clean|write|finish|pick up|return|позвонить|купить|оплатить|отправить|написать|записаться|забрать|сдать|вернуть|убрать|заказать)/i;
const LOCAL_SKIP = /\bgot an?\b|получил[аи]? (?:\d|оценк|пят|четв|тройк)|перен[её]с|перенеси|отмен|вместо|сдвин|теперь в|moved?\b|cancel|instead|now at|resched|postpone|skip\b|didn.?t|did\b|не успел|сделал|забыл/i;
const EVENT_RE = /защит[аеуы]|презентац|presentation|встреч|врач|стоматолог|дантист|концерт|день рождения|вечеринк|свидани|приём|meeting|doctor|dentist|appointment|concert|party|birthday|date with|interview|собеседован/i;
/* money: "spent $12 on lunch", "потратил 1 200 руб на продукты", "lunch 12", "кофе 150 руб", "got paid 400" */
const AMT = '(?:[$€£₽]\\s*)?(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+)(?:[.,](\\d{1,2}))?(?!\\d)\\s*(?:\\$|€|£|₽|р\\.?(?![а-яё])|руб[а-яё.]*|rm\\b|usd\\b|eur\\b|dollars?\\b|bucks\\b|euros?\\b)?';
const amountOf = (whole, cents) => +(whole.replace(/[\s ]/g, '') + (cents ? '.' + cents : ''));
const SPEND_WORDS = 'lunch|dinner|breakfast|coffee|taxi|uber|bus|groceries|rent|cinema|movie|subscription|gas|fuel|обед|ужин|завтрак|кофе|такси|автобус|продукты|аренда|кино|подписка|бензин';
function localMoney(c){
  const cat = () => (MONEY_CAT.find(([re]) => re.test(c)) || [0, 'Другое'])[1];
  // income first: "got paid" also contains "paid"
  let m = c.match(new RegExp('(?:получил[аи]? (?:зарплат[а-яё]*|деньги|аванс|перевод)|заработал[аи]?|зарплат[а-яё]*|аванс|earned|got paid|salary|income)\\D{0,12}?' + AMT, 'i'));
  if (m){ const amount = amountOf(m[1], m[2]); if (amount > 0) return {type: 'in', amount, cat: 'Доход', note: c}; }
  m = c.match(new RegExp('(?:потратил[аи]?|заплатил[аи]?|купил[аи]?|spent|paid|bought)\\s+(?:(.*?[^\\d\\s])\\s+)?(?:за|на|for|on)?\\s*' + AMT + '\\s*(?:(?:на|за|on|for)\\s+(.+))?$', 'i'));
  if (m){ const amount = amountOf(m[2], m[3]); if (amount > 0) return {type: 'out', amount, cat: cat(), note: (m[4] || m[1] || c).trim()}; }
  // "lunch 12", "кофе 150 руб": a spending word straight before an amount, and not grams, minutes or calories
  m = c.match(new RegExp('^(' + SPEND_WORDS + ')\\s*(?:was|cost|costs|стоил[аио]?|:|—|-)?\\s*' + AMT + '(?!\\s*(?:g\\b|г\\b|гр|шт|мин|min|ч\\b|h\\b|kcal|ккал|%|km|км))\\s*$', 'i'));
  if (m){ const amount = amountOf(m[2], m[3]); if (amount > 0) return {type: 'out', amount, cat: cat(), note: m[1]}; }
  return null;
}
function localTellParse(text, date){
  const r = {reply: '', time_log: [], money: [], new_tasks: [], events: []}, left = [];
  // spelled-out durations become numbers first, so "an hour and a half" isn't split at "and"
  const spelled = String(text).replace(/полтора часа|an hour and a half|one and a half hours/ig, '90 мин').replace(/полчаса|half an hour/ig, '30 мин').replace(/(^|\s)(?:один\s+)?час(?![а-яё])|(^|\s)(?:an|one)\s+hour(?!s)/ig, (m0, a, b) => (a ?? b ?? ' ') + '60 мин');
  // gym sets first, before the text is split at commas: "squats 60 kg for 8, 8 and 7", "отжимания 3х10"
  const sets = [];
  let rest = localSets(spelled, date, sets);
  // "went to bed at 23:30, woke up at 7" / "лёг в 23, встал в 7": the hours in between
  const bed = rest.match(/(?:went to bed|fell asleep|got to sleep|slept from|лёг|легла|лег|уснул[аи]?|заснул[аи]?)\s+(?:at\s+|в\s+|около\s+|around\s+)?(\d{1,2})(?:[:.](\d\d))?\D{1,40}?(?:woke(?: up)?|got up|until|till|встал[аи]?|проснул[аи]?сь|до)\s+(?:at\s+|в\s+|около\s+|around\s+)?(\d{1,2})(?:[:.](\d\d))?/i);
  if (bed){
    const h = ((+bed[3] * 60 + +(bed[4] || 0)) - (+bed[1] * 60 + +(bed[2] || 0)) + 1440) % 1440 / 60;
    if (h >= 2 && h <= 14){ r.sleep_h = Math.round(h * 10) / 10; rest = rest.replace(bed[0], ' '); }
  }
  if (sets.length) r.sets = sets;
  const parts = rest.replace(/(\d)\s*k\s+steps/ig, '$1000 steps').split(/[;\n]+|\.\s+|,\s+|\s+(?:и|а ещё|а также|and|also)\s+/i).map(x => x.trim().replace(/^(?:and|also|а|и|ещё)\s+/i, '')).filter(Boolean)
    .reduce((a, x) => { if (a.length && /^(?:from\s+|с\s+)?\d{1,2}(?::\d\d)?\s*(?:am|pm)?\s*(?:to|till|until|-|–|до)\s*\d/i.test(x)) a[a.length - 1] += ' ' + x; else a.push(x); return a; }, []); // "9am to 11am" belongs to the clause before
  for (const c of parts){
    let m, hit = false;
    if ((m = c.match(new RegExp('(?:спал[аи]?|поспал[аи]?|slept|sleep)\\D{0,12}?' + NUM + '\\s*(?:ч|час[а-яё]*|h|hrs?|hours?)(?![a-zа-яё])', 'i'))) || (m = c.match(new RegExp(NUM + '\\s*(?:ч|час[а-яё]*|h|hrs?|hours?)\\s*(?:of\\s+)?(?:сна|sleep)', 'i')))){ const h = toN(m[1]); if (h > 0 && h <= 16){ r.sleep_h = h; hit = true; } }
    if (/(?:i.?m|i am|feeling|got|feel)\s+(?:sick|ill|unwell)(?!\s+of)|заболел[аи]?|болею|приболел[аи]?|простыл[аи]?|температур[аы]\s+\d/i.test(c)){ r.sick = true; hit = true; }
    if ((m = c.match(/(?:rate (?:the |my )?day|day was|rating|оценка(?: дня)?|день на)\D{0,6}([1-5])\s*(?:\/\s*5|из 5|out of 5|★)?/i)) || (m = c.match(/(?:^|\s)([1-5])\s*(?:\/\s*5|из 5|out of 5)\b/i))){ r.rating = +m[1]; hit = true; }
    if ((m = c.match(/(\d[\d\s.,]*\d|\d)\s*(?:steps|шаг[а-яё]*)/i))){ const n = +m[1].replace(/[\s.,]/g, ''); if (n > 0 && n < 100000){ r.steps = n; hit = true; } }
    if ((m = c.match(new RegExp('(?:гулял[аи]?|погулял[аи]?|прогулк[а-яё]*|ходил[аи]?|walked|walk(?:ing)?|went for a walk)\\D{0,14}?' + NUM + '\\s*' + MIN_U + '(?![a-zа-яё])', 'i')))){ r.time_log.push({kind: 'walk', min: asMin(m[1], m[2])}); hit = true; }
    else if ((m = c.match(new RegExp('(?:учил[аи]?(?:сь)?|позанимал[аи]?сь|занимал[аи]?сь|учёба|учеба|studied|study|studying|homework)\\D{0,14}?' + NUM + '\\s*' + MIN_U + '(?![a-zа-яё])', 'i')))){ r.time_log.push({kind: 'study', min: asMin(m[1], m[2])}); hit = true; }
    else if ((m = c.match(new RegExp('(?:тренировк[а-яё]*|тренировал[аи]?(?:сь)?|в зале|зал|workout|worked out|trained|gym)\\D{0,14}?' + NUM + '\\s*' + MIN_U + '(?![a-zа-яё])', 'i')))){ r.time_log.push({kind: 'gym', min: asMin(m[1], m[2])}); hit = true; }
    if ((m = c.match(new RegExp('(?:вес(?![а-яё])|вешу|взвесил[аи]?сь|weigh(?:t|ed|ing)?)\\D{0,8}?' + NUM + '\\s*(кг|kg|lbs?|pounds?|фунт[а-яё]*)?', 'i')))){
      let w = toN(m[1]); const lb = m[2] ? /lb|pound|фунт/i.test(m[2]) : isUS();
      if (lb) w = Math.round(w / LB * 10) / 10;
      if (w >= 25 && w <= 300){ r.weight = w; hit = true; }
    }
    const mo = localMoney(c);
    if (mo){ r.money.push(mo); hit = true; }
    const future = !/(?:^|\s)(?:ate|had|съел[аи]?|выпил[аи]?|поел[аи]?|перекусил[аи]?)(?![a-zа-яё])/i.test(c) && (() => { const q = parseQuick(c); return !!q && !!q.due && (q.due > date || !!q.time); })(); // "buy 2 bananas tomorrow" is a to-do, not a meal; "вечером съел…" already happened
    if (!hit && !future){ const ms = c.split(/\s+(?:with|plus|с|со)\s+/i).map(localMeal).filter(Boolean); if (ms.length){ (r.meals = r.meals || []).push(...ms); hit = true; } }
    if (!hit){ const k = localDone(c, date); if (k){ (r[k.key] = r[k.key] || []).push(k.id); hit = true; } }
    // changing or cancelling what is already planned is for the AI: guessing could duplicate or delete
    if (!hit && LOCAL_SKIP.test(c)){ left.push(c); continue; }
    if (!hit){
      const range = c.match(/(?:from\s+|с\s+)?(\d{1,2})(?::(\d\d))?\s*(am|pm)?\s*(?:to|till|until|-|–|до)\s*(\d{1,2}(?::\d\d)?\s*(?:am|pm)?|midnight|полуночи)/i);
      const t = parseQuick(range ? c.replace(range[0], ' at ' + range[1] + (range[2] ? ':' + range[2] : '') + (range[3] || '')) : c);
      if (t && t.due && !allEvents().some(e => e.title.toLowerCase() === t.title.toLowerCase())){
        const exam = /экзамен|зач[её]т|контрольн|тест(?![а-яё])|exam|test\b|quiz|midterm|final/i.test(c), deadline = /дедлайн|сдать|сдача|deadline|due\b|submit/i.test(c);
        const until = range && t.time ? (/midnight|полуночи/i.test(range[4]) ? '00:00' : (() => { const q = parseQuick('x at ' + range[4]); return q?.time || null; })()) : null;
        const night = !t.time && /всю ночь|до утра|all night|until morning|till morning/i.test(c); // so the late-night checks can see it
        if (exam || deadline || EVENT_RE.test(c)) r.events.push({title: t.title.replace(/\s+(?:from|till|until)\s*$/i, ''), date: t.due, from: night ? '22:00' : t.time || null, until: night ? '04:00' : until, kind: exam ? 'exam' : deadline ? 'deadline' : 'event', note: ''});
        else if (t.time || TODO_RE.test(c)) r.new_tasks.push({title: t.title, date: t.due, time: t.time || null});
        else { left.push(c); continue; } // "Friday is my favourite day" isn't a to-do
        hit = true;
      } else if (INTENT_RE.test(c)){ // "remind me to buy a charger": a to-do without a date
        const title = c.replace(INTENT_RE, ' ').replace(/\s+/g, ' ').trim();
        if (title.length > 2){ r.new_tasks.push({title: title[0].toUpperCase() + title.slice(1), date: null, time: null}); hit = true; }
      }
    }
    if (!hit) left.push(c);
  }
  if ((r.meals || []).length > 1) r.meals = [joinMeals(r.meals)]; // one message, one meal in the diary, as the AI does
  return {r, left};
}
const joinMeals = ms => ({name: ms.map(m => m.name).join(' + '), ...Object.fromEntries(['kcal', 'p', 'f', 'c'].map(k => [k, Math.round(ms.reduce((a, m) => a + (+m[k] || 0), 0) * (k === 'kcal' ? 1 : 10)) / (k === 'kcal' ? 1 : 10)]))});
/* "200 g chicken", "2 яйца": a food from the built-in table with an amount; cooked unless the message says raw or dry */
const stem = w => w.toLowerCase().replace(/ё/g, 'е').slice(0, 5);
// English: one word starts the other (egg ~ eggs, not soup ~ sour). Russian: only the ending may differ (яйца ~ яйцо, not курсовую ~ куриное)
const sameWord = (a, b) => {
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  if (i < 3) return false;
  return /[a-z]/.test(a) ? i === Math.min(a.length, b.length) : i >= Math.min(a.length, b.length) - 1;
};
const RAW_RE = /сыр(?:ой|ая|ое|ые)|сух(?:ой|ая|ие|ое)|raw|dry|uncooked/i, COOKED_RE = /варён|варен|cooked|boiled/i;
// everyday portions in grams, for "a cup of rice", "горсть орехов", "стакан кефира"
const PORTIONS = [[/cups?|стакан[а-яё]*|кружк[а-яё]*|mugs?/i, 200], [/glass(?:es)?/i, 250], [/bowls?|тарелк[а-яё]*|миск[а-яё]*/i, 300], [/slices?|ломтик[а-яё]*|кус(?:ок|ка|очек|очка|ки)/i, 30], [/handfuls?|горст[а-яё]*/i, 30], [/tablespoons?|tbsp|столов[а-яё]* ложк[а-яё]*|ложк[а-яё]*/i, 15], [/teaspoons?|tsp|чайн[а-яё]* ложк[а-яё]*/i, 5], [/scoops?|мерн[а-яё]* ложк[а-яё]*/i, 30], [/servings?|portions?|порци[а-яё]*/i, 200]];
const ALIAS = {toast: 'bread', тост: 'хлеб', тосты: 'хлеб', nuts: 'walnuts', орехов: 'орехи', орешки: 'орехи'};
function portionOf(c){
  for (const [re, gr] of PORTIONS){
    const m = c.match(new RegExp('(?:(\\d{1,2}|a|an|one|two|three|один|одна|одну|два|две|три)\\s+)?(?:' + re.source + ')\\s+(?:of\\s+)?([a-zа-яё]{3,})', 'i'));
    if (m){ const n = /^\d+$/.test(m[1] || '') ? +m[1] : ({two: 2, three: 3, 'два': 2, 'две': 2, 'три': 3})[(m[1] || '').toLowerCase()] || 1; return {grams: n * gr, n, piece: gr === 30 && /slice|ломтик|кус/i.test(m[0]), word: m[m.length - 1]}; }
  }
  return null;
}
function localMeal(c){
  const por = !/\d+\s*(?:г|гр|g|grams?)(?![a-zа-яё])/i.test(c) && portionOf(c);
  if (por) c = `${por.grams} g ${ALIAS[por.word.toLowerCase()] || por.word}`; // "a slice of toast" is 30 g of bread
  else c = c.replace(/[a-zа-яё]+/gi, w => ALIAS[w.toLowerCase()] || w);
  const g = c.match(/(\d+(?:[.,]\d+)?)\s*(?:г|гр|грамм[а-яё]*|g|grams?)(?![a-zа-яё])/i);
  const WORD_N = {a: 1, an: 1, one: 1, two: 2, three: 3, 'один': 1, 'одна': 1, 'одно': 1, 'одну': 1, 'два': 2, 'две': 2, 'три': 3, 'трёх': 3, 'трех': 3};
  const dn = !g && c.match(/(?:^|\s)(\d{1,2})\s+([a-zа-яё]{3,})/i), wn = !g && !dn && c.match(/(?:^|\s)(a|an|one|two|three|один|одна|одно|одну|два|две|три|трёх|трех)\s+([a-zа-яё]{3,})/i);
  // "съел банан": Russian has no "a", so eating words count as one piece
  const n = dn ? dn : wn ? [0, WORD_N[wn[1].toLowerCase()]] : !g && /(?:^|\s)(?:ate|had|съел[аи]?|перекусил[аи]?|выпил[аи]?)(?![a-zа-яё])/i.test(c) ? [0, 1] : null;
  if (!g && !n) return null;
  // with a count, the food is the word right after it: "2 eggs", not "by 25 January"
  const words = dn || wn ? [stem((dn || wn)[2])] : (c.replace(/(?:^|\s)(?:ate|had|съел[аи]?|перекусил[аи]?|выпил[аи]?|на завтрак|на обед|на ужин|for breakfast|for lunch|for dinner|snack)(?![a-zа-яё])/gi, ' ').match(/[a-zа-яё]{3,}/gi) || []).map(stem).filter(w => !['грам', 'gram', 'съел', 'ate ', 'have', 'had', 'with', 'and'].includes(w));
  let best = null;
  PRODUCTS.forEach((p, i) => {
    const names = (p[0] + ' ' + (PRODUCTS_ALT[i] || '')).split(/[^a-zа-яё]+/i).filter(x => x.length >= 3).map(stem);
    const score = words.filter(w => names.some(nm => sameWord(w, nm))).length; if (!score) return;
    const raw = RAW_RE.test(p[0] + ' ' + (PRODUCTS_ALT[i] || '')), cooked = COOKED_RE.test(p[0] + ' ' + (PRODUCTS_ALT[i] || ''));
    const pref = RAW_RE.test(c) ? (raw ? 1 : 0) : (cooked ? 1 : raw ? -1 : 0); // people mostly log what they ate, cooked
    const fits = g || p[5] ? 1 : 0; // a count needs a piece weight, so foods that have one win
    if (!best || score > best.score || (score === best.score && (fits > best.fits || fits === best.fits && pref > best.pref))) best = {p, score, pref, fits};
  });
  if (!best) return null;
  const [name, kcal, pr, fat, carb, unit] = best.p;
  const grams = por && por.piece && unit ? por.n * unit[1] : g ? toN(g[1]) : unit ? +n[1] * unit[1] : null; // a count needs a piece weight in the table; "a slice of pizza" uses the pizza's
  if (!grams || grams > 3000) return null;
  const k = grams / 100, r1 = x => Math.round(x * k * 10) / 10;
  return {name: `${name}, ${Math.round(grams)} ${tr('г')}`, kcal: Math.round(kcal * k), p: r1(pr), f: r1(fat), c: r1(carb)};
}
const SKIP_WORDS = new Set(['did', 'done', 'today', 'сегодня', 'сделал', 'сделала', 'выполнил', 'finished', 'the', 'my', 'мои', 'свои', 'get', 'didn', 'успел', 'exercises', 'упражнения']);
const wordsOf = t => (String(t).match(/[a-zа-яё]{3,}/gi) || []).filter(w => !SKIP_WORDS.has(w.toLowerCase())).map(stem);
/* "did my posture exercises", "gym done", "не успел сделать осанку": a task of that day, checked or unchecked */
function localDone(c, date){
  const neg = /didn.?t|did not|не сделал|не успел|пропустил|skipped/i.test(c);
  if (!neg && !/(?:^|\s)(?:did|done|finished|completed|сделал[аи]?|выполнил[аи]?|сходил[аи]? в зал|был[аи]? в зале|worked out)(?![a-zа-яё])/i.test(c)) return null;
  const tasks = getDay(date).tasks || [];
  if (/\bgym\b|в зал|в зале|worked out|тренировк/i.test(c) && tasks.some(t => t.id === 'gym')) return {key: neg ? 'tasks_undone' : 'tasks_done', id: 'gym'};
  const ws = wordsOf(c), hit = tasks.find(t => wordsOf(t.title + ' ' + otherLang(t.title)).some(a => ws.some(b => sameWord(a, b))));
  return hit ? {key: neg ? 'tasks_undone' : 'tasks_done', id: hit.id} : null;
}
/* sets for exercises in the plan, today's workout first; returns the text with them taken out */
function localSets(text, date, out){
  const today = (plan().workouts[workoutFor(date)]?.ex || []), all = [...today, ...Object.values(plan().workouts).flatMap(w => w.ex)];
  const findEx = name => { const ws = wordsOf(name); return ws.length ? all.find(e => wordsOf(e.name + ' ' + otherLang(e.name)).some(a => ws.some(b => sameWord(a, b)))) : null; }; // "присед" finds "Barbell squats" too
  const kg = (n, u) => { const v = toN(n); return (u ? /lb|фунт/i.test(u) : isUS()) ? Math.round(v / LB * 10) / 10 : v; };
  return text.replace(/([a-zа-яё][a-zа-яё' -]{1,40}?)\s+(\d+(?:[.,]\d+)?)\s*(kg|кг|lbs?|фунт[а-яё]*)?\s*(?:for|на|по)\s*(\d{1,2}(?:\s*(?:,|and|и|\/)\s*\d{1,2})*)/gi, (m, name, w, u, reps) => {
    const ex = findEx(name); if (!ex) return m;
    reps.split(/\s*(?:,|and|и|\/)\s*/).filter(Boolean).forEach(rp => out.push({ex: ex.id, w: kg(w, u), r: +rp}));
    return ' ';
  }).replace(/([a-zа-яё][a-zа-яё' -]{1,40}?)\s+(\d)\s*[x×х]\s*(\d{1,3})(?![\d.,])/gi, (m, name, n, rp) => {
    const ex = findEx(name); if (!ex) return m;
    for (let i = 0; i < +n; i++) out.push({ex: ex.id, w: 0, r: +rp});
    return ' ';
  });
}
/* the food sheet's "describe" without AI: only the meals, shown and confirmed like a Tell answer */
function foodLocal(text, date){
  const meals = String(text).split(/[;\n]+|,\s+|\s+(?:и|with|and|с)\s+/i).map(x => x.trim()).filter(Boolean).map(localMeal).filter(Boolean);
  if (!meals.length) return false;
  const id = uid(), it = {id, kind: 'tell', result: {reply: tr('Посчитал по таблице продуктов, без ИИ. Проверь граммы и подтверди.'), meals: meals.length > 1 ? [joinMeals(meals)] : meals}, meta: {date, text, local: true}, provider: 'local', label: tr('КБЖУ · ') + String(text).slice(0, 30), date, created: new Date().toISOString(), done: false};
  save('inbox/' + id, it);
  SH.jobId = id; SH.outId = 'fpOut';
  const out = $('#fpOut'); if (out) out.innerHTML = jobView(it);
  return true;
}
function tellLocal(text, date){
  const {r, left} = localTellParse(text, date);
  if (!tellLines(r, date).length) return false;
  const missed = left.map(x => x.trim()).filter(x => x.length > 2).slice(0, 4).map(x => (LANG === 'ru' ? '«' : '“') + x.slice(0, 60) + (LANG === 'ru' ? '»' : '”'));
  r.reply = tr('Разобрал на телефоне, без ИИ. Проверь и подтверди.') + (missed.length ? ' ' + tr('Не понял без ИИ:') + ' ' + missed.join(', ') + '. ' + tr('Еду проще записать с граммами, например «150 г риса».') : '');
  const id = uid(), it = {id, kind: 'tell', result: r, meta: {date, text, local: true}, provider: 'local', label: tr('Разбор · ') + fmtShort(date), date, created: new Date().toISOString(), done: false};
  save('inbox/' + id, it);
  SH.jobId = id; SH.outId = 'tellOut';
  const out = $('#tellOut'); if (out) out.innerHTML = jobView(it);
  return true;
}

/* ---- "What can I write?": examples by topic; a tap adds one to the message. Without AI, only what the phone understands, plus a few marked as needing AI ---- */
const TELL_HELP = [
  [tr('Тело'), [tr('Спал 7 часов'), tr('Лёг в 23, встал в 7'), tr('9 000 шагов'), tr('Вес 72,5')]],
  [tr('Движение и учёба'), [tr('Гулял 40 минут'), tr('Учился 2 часа'), tr('Присед 40 на 10, 10 и 8')]],
  [tr('Еда'), [tr('200 г гречки и 2 яйца'), tr('Стакан кефира')]],
  [tr('Деньги'), [tr('Потратил 12 на обед'), tr('Получил зарплату 900')]],
  [tr('Планы'), [tr('В пятницу в 10:00 экзамен по физике'), tr('Завтра в 18:30 позвонить маме'), tr('Надо купить зарядку')]],
  [tr('День'), [tr('Заболел'), tr('Оценка дня 4')]],
];
const TELL_HELP_AI = [tr('Перенеси тренировку с пятницы на субботу'), tr('Стоматолога отменили'), tr('На обед суп и салат')];
function tellHelpHTML(){
  const chip = (x, ai) => `<button class="pill" data-act="tellAdd" data-v="${esc(x)}">${esc(x)}${ai ? ` <span class="tag warn">${tr('нужен ИИ')}</span>` : ''}</button>`;
  return `<section class="card tellhelp" style="display:flex;flex-direction:column;gap:10px">${TELL_HELP.map(([h, xs]) => `<b>${h}</b><div class="ob-goals">${xs.map(x => chip(x)).join('')}</div>`).join('')}
    <b>${tr('С ИИ')}</b><div class="ob-goals">${TELL_HELP_AI.map(x => chip(x, !aiStatus().ok)).join('')}</div></section>`;
}
A.tellHelp = () => { SH.tellText = val('tellT'); SH.tellHelp = !SH.tellHelp; drawSheet(); };
A.tellAdd = el => {
  const cur = val('tellT'), add = el.dataset.v;
  SH.tellText = cur ? cur.replace(/[\s,.]*$/, '') + ', ' + add[0].toLowerCase() + add.slice(1) : add;
  SH.tellHelp = false; drawSheet();
  const t = $('#tellT'); if (t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
};

/* ============ permissions on the iPhone: say why first, then let iOS ask ============ */
function permBody(){
  const m = meta(), H = plug('Health');
  const row = (icon, title, why, done, act, denied) => `<section class="card permc"><div style="display:flex;gap:12px;align-items:center"><span class="ic">${ic(icon)}</span><b style="flex:1">${title}</b>${done ? `<span class="tag good">${tr('Включено')}</span>` : ''}</div><div class="hint">${why}</div>${denied ? `<div class="note">${denied}</div>` : done ? '' : `<button class="btn" data-act="${act}">${tr('Разрешить')}</button>`}</section>`;
  return `<div class="hint">${tr('KAI спросит разрешение только на то, что нужно. Это можно изменить позже в настройках iPhone.')}</div>
    ${row('bell', tr('Напоминания'), tr('Об экзаменах, тренировках и конфликтах в планах. Работают без интернета, даже когда приложение закрыто.'), !!m.remindAsked, 'notifOn', SH.notifDenied ? tr('Уведомления выключены в настройках iPhone. Открой Настройки → KAI → Уведомления и включи их.') : '')}
    ${H ? row('heart', tr('Здоровье iPhone'), tr('KAI только читает шаги, сон и тренировки. Записи, которые ты сделал сам, не меняются.') + healthCloudNote(), !!m.healthOn, 'permHealth', '') : ''}
    <button class="btn ghost block" data-act="closeSheet">${m.remindAsked || m.healthOn ? tr('Готово') : tr('Позже')}</button>`;
}
A.permSheet = () => openSheet(tr('Разрешения'), permBody);
A.permHealth = async el => { await A.healthConnect(el); if (SH) drawSheet(); };

/* ============ plans and AI usage: limits mirror server/supabase (tiers); no payments exist yet ============ */
const PLANS = {free: {daily: 10, photos: false, smart: false}, plus: {daily: 100, photos: true, smart: true}};
const PLUS_PRICE = null; // set when payments are added; until then the screen says the price is a placeholder
const planNow = () => SH?.prof?.tier || KAI_USE?.tier || 'free';
async function loadAccountUsage(){
  if (!cloudOn() || !signedIn() || !SH) return;
  SH.usageErr = false;
  try {
    const [tiers, prof, use] = await Promise.all(['/rest/v1/tiers?select=tier,daily_requests,images_allowed,smart_model', '/rest/v1/profiles?select=tier,tier_expires_at', `/rest/v1/ai_usage?select=day,requests,input_tokens,output_tokens&day=gte.${addDays(todayISO(), -29)}&order=day.asc`].map(async u => { const r = await apiFetch(u); if (!r.ok) throw new Error(r.status); return r.json(); }));
    if (!SH) return;
    tiers.forEach(t => { if (PLANS[t.tier]) PLANS[t.tier] = {daily: t.daily_requests, photos: t.images_allowed, smart: t.smart_model}; });
    SH.prof = prof[0] || null; SH.use = use;
  } catch { if (SH) SH.usageErr = true; }
  if (SH) drawSheet();
}
function planBody(){
  const cur = planNow(), yes = ic('check'), no = '–';
  const row = (l, f, p) => `<div class="pl-row"><span>${l}</span><b>${f}</b><b>${p}</b></div>`;
  return `<div class="hint">${tr('Всё, что работает без ИИ, бесплатно и без ограничений: дневник, тренировки, еда, деньги, напоминания и синхронизация.')}</div>
    <section class="card pl-table"><div class="pl-row pl-h"><span></span><b class="${cur === 'free' ? 'on' : ''}">${tr('Бесплатно')}</b><b class="${cur === 'plus' ? 'on' : ''}">Plus</b></div>
      ${row(tr('Запросов к ИИ в день'), PLANS.free.daily, PLANS.plus.daily)}
      ${row(tr('Разбор фото еды и скриншотов'), PLANS.free.photos ? yes : no, PLANS.plus.photos ? yes : no)}
      ${row(tr('Более умная модель для разборов недели и меню'), PLANS.free.smart ? yes : no, PLANS.plus.smart ? yes : no)}
      ${row(tr('Всё без ИИ, синхронизация, напоминания'), yes, yes)}
      ${row(tr('Цена'), '0', PLUS_PRICE || `<span class="tag warn">${tr('пример, не настоящая цена')}</span>`)}</section>
    <div class="note">${tr('Оплата ещё не подключена: ничего не списывается, и купить Plus пока нельзя. Твой тариф сейчас:')} <b>${cur === 'plus' ? 'Plus' : tr('Бесплатно')}</b>${SH?.prof?.tier_expires_at ? ` · ${tr('до')} ${fmtShort(SH.prof.tier_expires_at.slice(0, 10))}` : ''}.</div>
    <button class="btn block" disabled>${tr('Скоро')}</button>`;
}
A.planSheet = () => { openSheet(tr('Тарифы'), planBody); loadAccountUsage(); };
function usageBody(){
  let h = '';
  if (cloudOn()){
    if (!signedIn()) h += `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('ИИ от KAI')}</b><div class="hint">${tr('Войди, чтобы пользоваться ИИ без ключей. Здесь появится расход по дням.')}</div><button class="btn" data-act="accountSheet">${tr('Войти')}</button></section>`;
    else {
      const today = (SH.use || []).find(u => u.day === todayISO())?.requests ?? KAI_USE?.used ?? 0, lim = PLANS[planNow()]?.daily ?? KAI_USE?.limit ?? PLANS.free.daily;
      const pts = [...Array(14)].map((_, i) => addDays(todayISO(), i - 13)).map(k => ({x: fmtShort(k).split(' ')[0], y: (SH.use || []).find(u => u.day === k)?.requests || 0}));
      const month = (SH.use || []).reduce((a, u) => a + u.requests, 0);
      h += `<section class="card" style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${tr('ИИ от KAI')}</b>${CFG.plans ? `<button class="link" data-act="planSheet">${planNow() === 'plus' ? 'Plus' : tr('Бесплатно')}</button>` : `<span class="muted">${planNow() === 'plus' ? 'Plus' : tr('Бесплатно')}</span>`}</div>
        <div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>${tr('Сегодня')}</span><span class="muted">${trf('{n} из {m}', {n: today, m: lim})}</span></div><div class="bar"><i style="width:${Math.min(100, today / (lim || 1) * 100)}%;background:${today >= lim ? 'var(--bad)' : 'var(--accent)'}"></i></div><div class="hint" style="margin-top:6px">${tr('Лимит обновляется каждый день. Неудачные запросы не считаются.')}</div></div>
        ${SH.usageErr ? `<div class="note">${tr('Не получилось загрузить расход. Проверь интернет и открой ещё раз.')}</div>` : SH.use ? `${pts.some(p => p.y) ? barChart(pts, {unit: tr('запр.'), c: 'c1', label: tr('Запросы к ИИ за 14 дней')}) : ''}<div class="hint">${trf('За 30 дней: {n}', {n: month})}</div>` : `<div class="hint">${tr('Загружаю…')}</div>`}</section>`;
    }
  }
  const own = Object.entries(meta().claudeUsage || {}).sort().reverse().slice(0, 6);
  h += `<section class="card" style="display:flex;flex-direction:column;gap:10px"><b>${tr('Свой ключ Claude')}</b>${own.length ? `<div class="list">${own.map(([m, u]) => `<div class="row" style="padding:8px 0"><div class="mid"><div class="t">${esc(new Date(m + '-15').toLocaleDateString(LOCALE, {month: 'long', year: 'numeric'}))}</div><div class="s">${trf('{n} {r} · {i} входящих и {o} исходящих токенов', {n: u.n, r: plural(u.n, tr('запрос'), tr('запроса'), tr('запросов')), i: num(u.in), o: num(u.out)})}</div></div></div>`).join('')}</div><div class="hint">${tr('Оплата идёт напрямую в Anthropic по твоему ключу. Точную сумму смотри в их консоли.')}</div>` : `<div class="hint">${tr('Запросов по своему ключу пока не было.')}</div>`}</section>`;
  const jobs = Object.keys(S.docs).filter(k => k.startsWith('jobs/')).map(k => S.docs[k]), wait = jobs.filter(j => j.status === 'queued' || j.status === 'running').length, bad = jobs.filter(j => j.status === 'error').length;
  if (wait || bad) h += `<section class="card navrow" style="cursor:pointer" data-act="aiSheet"><span class="ic">${ic('spark')}</span><div class="mid"><div class="t">${tr('Очередь ИИ')}</div><div class="s">${trf('ждут: {w} · с ошибкой: {b}', {w: wait, b: bad})}</div></div>${ic('chevR')}</section>`;
  return h;
}
A.usageSheet = () => { openSheet(tr('Расход ИИ'), usageBody); loadAccountUsage(); };

// Apple asks apps to say plainly where Health data goes (App Review 5.1.3)
const healthCloudNote = () => cloudOn() ? ' ' + tr('Если ты вошёл в аккаунт, эти данные хранятся и в твоей облачной копии на сервере KAI, а не в iCloud.') : '';

/* ============ appearance: follows the phone by default; light or dark can be fixed per device ============ */
const themePref = () => { try { const t = localStorage.getItem('kai_theme'); return t === 'light' || t === 'dark' ? t : 'system'; } catch { return 'system'; } };
const isDark = () => { const t = themePref(); if (t !== 'system') return t === 'dark'; try { return !matchMedia('(prefers-color-scheme: light)').matches; } catch { return true; } };
function applyTheme(){
  const t = themePref(), de = document.documentElement;
  if (de?.setAttribute){ if (t === 'system') de.removeAttribute('data-theme'); else de.setAttribute('data-theme', t); }
  $$('meta[name=theme-color]').forEach(m => m.setAttribute('content', isDark() ? '#000000' : '#f2f2f7'));
}
const themeSeg = () => `<div class="seg" role="group" aria-labelledby="themeL">${[['system', tr('Как в системе')], ['light', tr('Светлое')], ['dark', tr('Тёмное')]].map(([v, l]) => `<button class="${themePref() === v ? 'on' : ''}" aria-pressed="${themePref() === v}" data-act="setTheme" data-v="${v}">${l}</button>`).join('')}</div>`;
A.setTheme = el => { try { if (el.dataset.v === 'system') localStorage.removeItem('kai_theme'); else localStorage.setItem('kai_theme', el.dataset.v); } catch {} applyTheme(); render(); };
try { matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { applyTheme(); render(); }); } catch {}
applyTheme();

/* ============ links into the app: home-screen shortcuts open a screen directly (#tell, #day) ============ */
function openFromLink(){
  const h = location.hash.slice(1); if (!['tell', 'day'].includes(h)) return;
  if (!S.ready) return setTimeout(openFromLink, 200);
  history.replaceState(null, '', location.pathname + location.search);
  S.tab = 'day'; render();
  if (h === 'tell' && meta().welcomed) A.tell();
}

/* ============ delete everything on this phone (the cloud copy is separate, under Account) ============ */
A.wipeLocal = async el => {
  if (!el.dataset.sure){ el.dataset.sure = '1'; el.textContent = tr('Точно? Нажми ещё раз, это не отменить'); return; }
  busy(el, true);
  // signed out first, so the deletions below are not sent to the cloud copy
  clearSession(); syncSave(null);
  try {
    for (const k of Object.keys(S.docs)) remove(k);
    await Promise.all(Object.values(chains));
    for (const k of await blobKeys()) await blobDel(k);
  } catch {}
  try { Object.keys(localStorage).filter(k => k.startsWith('kai_') && k !== 'kai_lang').forEach(k => localStorage.removeItem(k)); } catch {}
  location.reload();
};

/* ============ once, for people who used supplements before they were switched off ============ */
function suppsGoneNote(){
  if (SUPPS_ON || meta().suppsNoteSeen || !(plan().supps || []).length) return '';
  return `<div class="banner" role="status">${ic('alert')}<div><div>${tr('Раздел БАДов убран, чтобы приложение было проще. Твой список сохранён и вернётся, если раздел включат снова.')}</div><div class="btnrow"><button class="btn ghost" data-act="suppsNoteOk">${tr('Понятно')}</button></div></div></div>`;
}
A.suppsNoteOk = () => setMeta({suppsNoteSeen: true});

/* Ctrl or Cmd + Enter sends a Tell KAI message from a keyboard */
document.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target?.id === 'tellT'){ e.preventDefault(); A.tellGo(); } });

/* ============ sheets follow the finger: pull down from the grab bar or title to close, like iOS ============ */
let DRAG = null;
document.addEventListener('pointerdown', e => {
  const sh = e.target.closest?.('.sheet'); if (!sh || !SH) return;
  if (!e.target.closest('.grab, .sh-h') || e.target.closest('button, input, textarea, select, a')) return; // scrolling and taps inside work as usual
  DRAG = {sh, y0: e.clientY, t0: performance.now(), dy: 0, id: e.pointerId};
}, {passive: true});
document.addEventListener('pointermove', e => {
  if (!DRAG || e.pointerId !== DRAG.id) return;
  DRAG.dy = Math.max(0, e.clientY - DRAG.y0);
  DRAG.sh.style.transition = 'none'; DRAG.sh.style.transform = `translateY(${DRAG.dy}px)`;
}, {passive: true});
const dragEnd = () => {
  if (!DRAG) return;
  const {sh, dy, t0} = DRAG; DRAG = null;
  const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
  sh.style.transition = reduceMotion() ? 'none' : 'transform .2s ease';
  if (dy > 110 || (fast && dy > 30)){ haptic('light'); closeSheet(); } else sh.style.transform = '';
};
document.addEventListener('pointerup', dragEnd); document.addEventListener('pointercancel', dragEnd);

/* ============ init ============ */
async function init(){
  render();
  await authFromUrl().catch(() => {});
  const c = window.claude;
  let real = null;
  if (c && typeof c.use === 'function'){ [real, SAMPLE_CAP, DL_CAP] = await Promise.all(['db','sample','downloads'].map(n => c.use(n).catch(()=>null))); }
  if (real){
    S.inClaude = true; S.live = true;
    try { IDB = await idbOpen(); } catch {}
    attach(real);
    if (SAMPLE_CAP){ const lim = await SAMPLE_CAP.limits().catch(()=>null); S.appImg = !!lim?.images; }
  } else {
    try { attach(await idbDB()); S.live = true; }
    catch(e){ attach(memDB()); toast(tr('Хранилище телефона недоступно: данные не сохранятся')); }
  }
  try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch {}
  if (!S.inClaude && !window.claude && window.top === window.self && 'serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').then(reg => { reg.addEventListener('updatefound', () => { const w = reg.installing; w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast(tr('Обновление скачано: перезапусти приложение')); }); }); }).catch(()=>{});
  }
  render();
  openFromLink();
}
init();

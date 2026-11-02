// Usage: npm install acorn acorn-walk, then: node tools/check-i18n.js kai
// Every tr() key in app.js must exist in i18n-en.js, and no English value may contain Russian.
const fs = require('fs'), vm = require('vm'), acorn = require('acorn'), walk = require('acorn-walk');
const dir = process.argv[2];
const ctx = {window: {}}; vm.runInNewContext(fs.readFileSync(dir + '/i18n-en.js', 'utf8'), ctx);
const d = ctx.window.I18N_EN, src = fs.readFileSync(dir + '/app.js', 'utf8');
const ast = acorn.parse(src, {ecmaVersion: 'latest'}), used = new Set();
// a key can also be one side of a choice: tr(paid ? 'Оплачено' : 'Получено')
const keys = a => a?.type === 'Literal' ? [a.value] : a?.type === 'ConditionalExpression' ? [...keys(a.consequent), ...keys(a.alternate)] : [];
walk.simple(ast, {CallExpression(n){ if (n.callee.name === 'tr' || n.callee.name === 'trf') keys(n.arguments[0]).forEach(k => typeof k === 'string' && used.add(k)); }});
const CY = /[А-Яа-яЁё]/;
const missing = [...used].filter(k => CY.test(k) && d[k.trim()] === undefined);
const dirty = Object.entries(d).filter(([, v]) => CY.test(v)).map(([k]) => k);
const unused = Object.keys(d).filter(k => !used.has(k) && ![...used].some(u => u.trim() === k));
const unsafe = Object.entries(d).filter(([k, v]) => /"/.test(v) && !/"/.test(k)).map(([k]) => k);
console.log({entries: Object.keys(d).length, used: used.size, missing: missing.length, russianInEnglish: dirty.length, doubleQuoteRisk: unsafe.length, notFromCode: unused.length});
if (missing.length) console.log('MISSING:\n' + missing.join('\n'));
if (dirty.length) console.log('DIRTY:\n' + dirty.join('\n'));
if (unsafe.length) console.log('QUOTE:\n' + unsafe.join('\n'));
console.log('DATA-ONLY:', unused.join(' | '));

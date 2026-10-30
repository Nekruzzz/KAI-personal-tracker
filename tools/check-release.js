// Lists what would stop an App Store submission. Run before each release: node tools/check-release.js
// It only reads files; fix what it lists, then run it again until it prints "ready".
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(root, f), 'utf8');
const blockers = [];

const ctx = {window: {}}; vm.runInNewContext(read('kai/config.js'), ctx);
const cfg = ctx.window.KAI_CONFIG || {};
if (!cfg.supabaseUrl || !cfg.supabaseKey) blockers.push('kai/config.js: the server is not connected (supabaseUrl and supabaseKey are empty), so there is no account, sync or AI without a key');
if (cfg.plans) blockers.push('kai/config.js: plans is on, but the plans screen shows a placeholder price until real purchases exist');

for (const f of ['kai/privacy.html', 'kai/terms.html']) {
  const html = read(f);
  if (/class="draft"/.test(html)) blockers.push(`${f}: still marked as a draft`);
  const gaps = [...new Set(html.match(/\[[^\]<]{2,40}\]/g) || [])];
  if (gaps.length) blockers.push(`${f}: blanks to fill in: ${gaps.join(', ')}`);
}

const store = read('docs/app-store.md');
const storeGaps = [...new Set(store.match(/\[[^\]`]{3,60}\]/g) || [])].filter(g => g !== '[bracket]'); // the doc's own instructions mention [bracket]
if (storeGaps.length) blockers.push(`docs/app-store.md: blanks to fill in: ${storeGaps.join(', ')}`);

const plist = read('native/ios/App/App/Info.plist');
// KAI only reads Health data, so only the reading text is required
if (!plist.includes('NSHealthShareUsageDescription')) blockers.push('Info.plist: NSHealthShareUsageDescription is missing, and iOS ends the app when Health access is requested without it');

console.log(blockers.length ? `Not ready, ${blockers.length} to fix:\n- ` + blockers.join('\n- ') : 'ready');
process.exitCode = blockers.length ? 1 : 0;

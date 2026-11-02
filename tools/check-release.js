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
// App Store Connect won't save a listing over these limits
const field = label => (store.match(new RegExp('\\*\\*' + label + '(?::\\*\\*|\\*\\*[^:\\n]*:)\\s*`?([^`\\n]+)`?')) || [])[1]?.trim();
for (const [label, max] of [['Name', 30], ['Subtitle', 30], ['Keywords', 100], ['Promotional text', 170], ['Название', 30], ['Подзаголовок', 30], ['Ключевые слова', 100], ['Промотекст', 170]]) {
  const v = field(label);
  if (!v) blockers.push(`docs/app-store.md: "${label}" is missing`);
  else if ([...v].length > max) blockers.push(`docs/app-store.md: "${label}" is ${[...v].length} characters, over Apple's ${max}`);
}
const storeGaps = [...new Set(store.match(/\[[^\]`]{3,60}\]/g) || [])].filter(g => g !== '[bracket]'); // the doc's own instructions mention [bracket]
if (storeGaps.length) blockers.push(`docs/app-store.md: blanks to fill in: ${storeGaps.join(', ')}`);

const plist = read('native/ios/App/App/Info.plist');
// iOS ends the app when it touches any of these without the text that explains why. KAI only reads Health, so only the reading text is required.
for (const [key, why] of [
  ['NSHealthShareUsageDescription', 'Health access is requested'],
  ['NSCameraUsageDescription', 'someone takes a photo of a meal'],
  ['NSPhotoLibraryUsageDescription', 'someone picks a photo'],
  ['NSPhotoLibraryAddUsageDescription', 'someone taps Save Image when sharing the weekly summary'],
]) if (!plist.includes(`<key>${key}</key>`)) blockers.push(`Info.plist: ${key} is missing, and iOS ends the app when ${why}`);

// people using the app in Russian see the permission texts in Russian
const ruStrings = fs.existsSync(path.join(root, 'native/ios/App/App/ru.lproj/InfoPlist.strings')) ? read('native/ios/App/App/ru.lproj/InfoPlist.strings') : '';
for (const [, key] of plist.matchAll(/<key>(NS\w+UsageDescription)<\/key>/g)) if (!new RegExp(`^${key} = "`, 'm').test(ruStrings)) blockers.push(`ru.lproj/InfoPlist.strings: no Russian text for ${key}`);
for (const [, title] of plist.matchAll(/<key>UIApplicationShortcutItemTitle<\/key>\s*<string>([^<]+)<\/string>/g)) if (!ruStrings.includes(`"${title}" = "`)) blockers.push(`ru.lproj/InfoPlist.strings: no Russian title for the quick action "${title}"`);

// App Store Connect refuses an upload whose code reads file dates or stored settings without saying why (the Filesystem and Apple sign-in plugins do)
const manifest = fs.existsSync(path.join(root, 'native/ios/App/App/PrivacyInfo.xcprivacy')) ? read('native/ios/App/App/PrivacyInfo.xcprivacy') : '';
if (!manifest) blockers.push('native/ios/App/App/PrivacyInfo.xcprivacy is missing: the upload is refused (ITMS-91053)');
else {
  for (const c of ['NSPrivacyAccessedAPICategoryFileTimestamp', 'NSPrivacyAccessedAPICategoryUserDefaults']) if (!manifest.includes(c)) blockers.push(`PrivacyInfo.xcprivacy: ${c} is not declared, and the upload is refused`);
  if (!read('native/ios/App/App.xcodeproj/project.pbxproj').includes('PrivacyInfo.xcprivacy in Resources')) blockers.push('PrivacyInfo.xcprivacy is not in the Xcode project, so it is not in the app');
}

console.log(blockers.length ? `Not ready, ${blockers.length} to fix:\n- ` + blockers.join('\n- ') : 'ready');
process.exitCode = blockers.length ? 1 : 0;

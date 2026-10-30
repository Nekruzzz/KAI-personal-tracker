# KAI

An AI-powered life tracker. Type or say anything: KAI logs it, updates your schedule and warns you about conflicts, and your effort becomes visible and fun to watch.

Available in English and Russian. It runs as an installable web app or an iPhone app, and stores data on the device.

## Run it locally

```bash
python -m http.server 8123 --directory kai
```

Then open http://localhost:8123.

## Project layout

- `kai/`: the app, with no build step. The app itself is `app.js`, the English text is in `i18n-en.js`, and `config.js` connects it to the server.
- `server/`: sign-in, cloud sync and AI without personal keys. See [server/README.md](server/README.md) for setup, including the kit that measures AI accuracy and cost.
- `native/`: the iPhone app, which wraps `kai/` with Capacitor. See [native/README.md](native/README.md).
- `docs/`: the App Store listing draft.
- `tests/`: tests of the app's rules, such as conflict warnings and study plans. Run them with `node --test tests/app.test.mjs`. GitHub also runs them on every push and compiles the iPhone app.
- `tools/check-i18n.js`: reports any interface text missing an English translation.
- `tools/check-release.js`: lists what would block an App Store submission, such as draft legal pages or blanks still to fill in.

## Adding interface text

Wrap new visible text in `tr()` and add its English to `kai/i18n-en.js`. To check for gaps:

```bash
npm install acorn acorn-walk
```

```bash
node tools/check-i18n.js kai
```

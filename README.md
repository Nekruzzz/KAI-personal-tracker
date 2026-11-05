# KAI

An AI-powered life tracker. Type or say anything: KAI logs it, updates your schedule and warns you about conflicts, and your effort becomes visible and fun to watch.

Everyday messages (sleep, steps, walks, weight, spending, gym sets, food with an amount, to-dos, events and exams) are understood on the phone even without AI, in English and Russian. AI handles the rest, and nothing changes until you confirm.

Available in English and Russian. It runs as an installable web app or an iPhone app, and stores data on the device.

## Run it locally

```bash
python -m http.server 8123 --directory kai
```

Then open http://localhost:8123.

## Put it online

The web app is just the `kai/` folder, so any static host works. With GitHub Pages:

1. Settings → Pages → Source: **GitHub Actions** (once).
2. Actions → **Publish web app** → Run workflow, and pick the branch. It runs the app tests first, then publishes `kai/`. GitHub shows this workflow only once `.github/workflows/pages.yml` is on `main`, so merge it first.

With **Vercel**: import the repository, then either keep the `vercel.json` at the top of the repository (it tells Vercel to serve `kai/` with no build step), or, in the project's **Settings → Build and Deployment → Root Directory**, choose `kai` with the framework preset **Other** and no build command. Vercel deploys the branch set as its Production Branch (`main` by default), so the newest version appears there once it is merged into `main`; other branches get preview addresses.

The GitHub Pages workflow never publishes by itself. On an iPhone, open the address in Safari and choose Share → Add to Home Screen. Accounts, sync and the built-in AI need the server (`server/README.md`); the iPhone app needs a Mac (`native/README.md`).

## Project layout

- `kai/`: the app, with no build step. The app itself is `app.js`, the English text is in `i18n-en.js`, `config.js` connects it to the server, and `fonts/` holds the Manrope font (SIL Open Font License), so the app loads nothing from other sites.
- `server/`: sign-in, cloud sync and AI without personal keys. See [server/README.md](server/README.md) for setup, including the kit that measures AI accuracy and cost.
- `native/`: the iPhone app, which wraps `kai/` with Capacitor. See [native/README.md](native/README.md).
- `docs/`: the App Store listing draft.
- `tests/`: tests of the app's rules, such as conflict warnings and study plans. Run them with `node --test tests/app.test.mjs`. GitHub also runs them on every push and compiles the iPhone app.
- `tools/check-i18n.js`: reports any interface text missing an English translation. GitHub runs it on every push and fails the check if anything is missing.
- `tools/check-release.js`: lists what would block an App Store submission, such as draft legal pages or blanks still to fill in.

## Adding interface text

Wrap new visible text in `tr()` and add its English to `kai/i18n-en.js`. To check for gaps:

```bash
npm install acorn acorn-walk
```

```bash
node tools/check-i18n.js kai
```

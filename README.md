# Game Challenge demo

A standalone copy of the Game Challenge demo from [gaming-lab-fe](https://github.com/AppTrainers-web/gaming-lab-fe), live at **https://apptrainers-design.github.io/challenge/**.

There is no backend. The demo seeds sample schools, teams and judges in the browser and keeps every change in that browser's localStorage, so each visitor has their own copy. The demo controls in the portal toolbar reset it.

## Run it locally

```bash
npm install
npm run dev   # http://localhost:3000/challenge
```

Every push to `main` rebuilds the site and publishes it to GitHub Pages ([deploy.yml](.github/workflows/deploy.yml)).

## Where the files come from

These are unchanged copies from gaming-lab-fe's `staging` branch. When the feature changes there, copy them again:

- the challenge feature: `pages/challenge`, `components/challenge`, `layouts/challenge.vue`, `composables/useChallenge*.ts`, `utils/challenge*.ts`, `types/challenge.ts` and `i18n/locales/{en,ar}.json`
- the shared pieces it uses: `AppIcon`, `VideoPlayer`, `ExamQuestion`, `useSidebar`, `safeUrl`, the Tailwind setup, and the few translation keys in `i18n/locales/host/`

The rest exists only so the demo runs on its own: `package.json`, `nuxt.config.ts`, `app.vue`, `layouts/default.vue` (a header with the language switch, in place of the site's header and footer, which need its API) and `pages/index.vue` (forwards the site root to `/challenge`).

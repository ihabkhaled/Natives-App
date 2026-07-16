# Project customization

Everything below ships with safe placeholder values so the repository runs immediately. This page
is the complete list of what to change when you make it your own — nothing is hidden in a template
you have not seen.

## 1. Application identity (start here)

[`src/shared/config/app-identity.constants.ts`](../../src/shared/config/app-identity.constants.ts)
is the single canonical source. `capacitor.config.ts` imports it, so the web app and the native
shells cannot drift apart.

```ts
export const APP_IDENTITY = {
  appId: 'com.capacitorranger.app',
  appName: 'Capacitor Ranger',
  appSlug: 'capacitor-ranger',
  packageScope: '@app',
} as const;
```

Changing `appId` after the native projects exist does **not** rewrite them. Either regenerate:

```bash
rm -rf android ios && npm run build && npx cap add android && npx cap add ios
```

or edit `android/app/build.gradle` (`applicationId`) and the iOS bundle identifier in Xcode.
`npm run cap:sync:check` fails if the native identity and the canonical identity disagree, so a
half-finished rename cannot reach main.

## 2. Package name

`package.json` `name` field, plus the repository URL in
[`eslint/architecture-plugin/shared/rule-helpers.mjs`](../../eslint/architecture-plugin/shared/rule-helpers.mjs)
(`docs.url`, used in lint output).

## 3. Environment

Copy `.env.example` to `.env.local`. Committed defaults live in `.env.development` (dev) and
`.env.test` (Vitest). Every variable is validated by
[`src/packages/environment/environment.schema.ts`](../../src/packages/environment/environment.schema.ts)
at startup — an invalid value fails fast with a precise message rather than at first use.

| Variable                                        | Change when                                        |
| ----------------------------------------------- | -------------------------------------------------- |
| `VITE_APP_NAME`, `VITE_APP_ID`                  | Rebranding (keep in sync with `APP_IDENTITY`).     |
| `VITE_API_BASE_URL`, `VITE_API_MODE`            | Pointing at a real backend.                        |
| `VITE_API_TIMEOUT_MS`                           | Your latency budget.                               |
| `VITE_DEFAULT_LOCALE`, `VITE_SUPPORTED_LOCALES` | Adding or dropping a language.                     |
| `VITE_DEFAULT_THEME`                            | Default appearance.                                |
| `VITE_SENTRY_DSN`                               | Enabling error reporting (empty = fully disabled). |
| `VITE_SOCKET_URL`                               | Enabling the Socket.IO realtime owner.             |
| `VITE_ENABLE_QUERY_DEVTOOLS`                    | Devtools in development.                           |

## 4. Branding assets

- [`public/favicon.svg`](../../public/favicon.svg) — placeholder mark.
- `index.html` — `<title>`, `theme-color`, description.
- Android icons: `android/app/src/main/res/mipmap-*/`.
- iOS icons: `ios/App/App/Assets.xcassets/`.
- Splash screens: configure through `capacitor.config.ts` and the native asset catalogs.

## 5. Copy

All user-visible text lives in [`src/shared/i18n/locales/`](../../src/shared/i18n/locales/) with
keys declared in `i18n-keys.constants.ts`. `npm run quality:locales` enforces parity between `en`
and `ar` and rejects orphan or undeclared keys — you cannot half-translate a rename.

## 6. Design tokens

- [`src/app/styles/app.css`](../../src/app/styles/app.css) — Tailwind theme bridge.
- Ionic CSS variables — override in the same file.
- Variants live in `*.variants.ts` files next to their component.

## 7. Native minimums

- Android `minSdkVersion` / `targetSdkVersion`: `android/variables.gradle` (currently 26 / 36).
- iOS deployment target: Xcode build settings (currently 15.0).

## 8. Governance

- `AGENTS.md` and the model entrypoints carry `Governance-Version: 1`. Bump all of them together;
  `npm run quality:agent-docs` fails if they drift.
- Team-specific rules belong in [`rules/`](../../rules/), not in agent entrypoints.

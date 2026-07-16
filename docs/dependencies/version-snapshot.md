# Dependency snapshot

Verified against the npm registry on **2026-07-16**. Every version in `package.json` is exact —
no ranges, no `latest`, no `*`. `package-lock.json` is committed.

## Re-verifying

```bash
npm run deps:check                       # npm-check-updates report
npm run quality:package-ownership        # every runtime dep has an owner
npm run security:audit                   # known vulnerabilities
```

A new runtime dependency without an entry in
[`eslint/package-ownership.config.mjs`](../../eslint/package-ownership.config.mjs) fails both
`npm run lint` (`architecture/no-raw-package-imports`) and `npm run quality:package-ownership`.
That is intentional: adding a vendor is a decision, not a reflex.

## Deliberate version decisions

These are the ones that look wrong until you know why.

### `@sentry/react` is pinned to 10.60.0, not the latest

`@sentry/capacitor@4.2.0` declares an **exact** peer:

```json
"peerDependencies": { "@sentry/react": "10.60.0" }
```

10.65.0 was current at snapshot time and installs cleanly on its own, but pairing it with
`@sentry/capacitor` produces an unresolvable peer conflict. Bump the two together, never
separately.

### React Router is pinned to the v5 line

`@ionic/react-router@8.8.14` implements the React Router **v5** integration contract
(`react-router@5.3.4`, `react-router-dom@5.3.4`). React Router 7/8 exist, but Ionic's router
outlet, page transitions, and lifecycle events are written against v5. Installing v7 beside it
would give you two routers and one working set of transitions. Revisit when Ionic ships a v7+
integration — see `memory/ionic-router-compatibility.md`.

### ESLint 10 needs `overrides` for two plugins

`eslint-plugin-react@7.37.5` and `eslint-plugin-jsx-a11y@6.10.2` still declare `eslint <= 9` peers
but work on ESLint 10. Hence:

```jsonc
"overrides": {
  "eslint-plugin-jsx-a11y": { "eslint": "$eslint" },
  "eslint-plugin-react":    { "eslint": "$eslint" }
}
```

Related: `eslint-plugin-react`'s `settings.react.version: 'detect'` **crashes** on ESLint 10 —
its version probe calls the removed `context.getFilename()`. `eslint.config.mjs` pins
`version: '19.2'` instead. Remove the override and the pin once upstream declares ESLint 10.

### npm is 10, though the snapshot targets 12

npm 12 requires Node `^22.22.2 || ^24.15.0 || >=26`; this environment runs Node 24.14.1, where
npm 12 refuses to install. `engines.npm` is therefore `>=10`. Raise it once you are on Node
`24.15` or newer.

### TypeScript is installed twice

Deliberate and temporary — see [`typescript-compatibility.md`](typescript-compatibility.md) and
ADR-0011.

## Optional capability packages (deliberately absent)

Camera, Filesystem, Geolocation, Push/Local Notifications, Biometrics, Background Tasks, and
Screen Orientation are **not** installed. Each carries permissions, store-review obligations, and
privacy disclosure. Install one only when a feature needs it, give it an owner package under
`src/packages/capacitor-*`, register it, and run a security review first.

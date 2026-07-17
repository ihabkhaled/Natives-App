# Known pitfalls

Things that cost real time while building this repository. Each is a fact plus the workaround
already in the code — so nobody pays for it twice.

## 1. npm 12 cannot be installed on Node 24.14.1

npm 12 declares `engines.node: ^22.22.2 || ^24.15.0 || >=26`. The installed Node is **24.14.1**,
which falls in the gap _below_ `^24.15.0` — so npm 12 is uninstallable here despite Node 24 being
current. `package.json` therefore declares `engines.npm: ">=10"` (the toolchain runs on npm 10.7.0).
Do not raise that range to match a newer npm without first checking `node -v` against npm's own
range. `.nvmrc` pins the Node major to `24`.

## 2. `eslint-plugin-react` with `version: 'detect'` crashes on ESLint 10

The plugin's detection path calls `context.getFilename()`, which ESLint 10 removed — the result is a
crash during linting, not a graceful warning. `eslint.config.mjs` pins the version instead:
`settings: { react: { version: '19.2' } }`. Keep that literal in sync with the installed `react` by
hand: nothing checks it, because the thing that would check it is the code that crashes.

## 3. `eslint-plugin-react` and `eslint-plugin-jsx-a11y` declare ESLint ≤9 peers

Both work with ESLint 10 but have not updated `peerDependencies`, so a plain install fails peer
resolution. `package.json` carries a scoped `overrides` block re-pointing only their `eslint` peer
at `$eslint`. The override is cosmetic — it satisfies a stale range for plugins that already work.
Do not generalize the trick to a peer enforced for a real reason (see
[typescript-7-status](./typescript-7-status.md)).

## 4. TypeScript 7 removed `baseUrl` (TS5102)

Setting `baseUrl` in any tsconfig now raises **TS5102**. `tsconfig.base.json` declares `paths`
without it — `"@/*": ["./src/*"]` — and `vite-tsconfig-paths` resolves at build and test time.
Copying a `baseUrl` line in from an older project breaks `npm run typecheck` immediately.

## 5. `@sentry/capacitor@4.2.0` pins `@sentry/react` to an exact version

Its peer is exact `10.60.0`, not a caret range. Bumping `@sentry/react` alone breaks the install;
the two must move together. Both are owned by `src/packages/error-reporting`, which is what makes
the coordinated bump a one-directory change.

## 6. Ionic 8 exposes overlays as hooks, not controllers

There is no importable `toastController` / `alertController` to call from a service — Ionic 8
exports `useIonToast` and `useIonAlert`. So the toast and alert owners are **hooks**
(`use-app-toast.hook.ts`, `use-confirm-alert.hook.ts`) and inherit hook call rules: a service cannot
raise a toast. Surface the failure as an `AppError` and let a hook present it.

## 7. `exactOptionalPropertyTypes` forces conditional prop spreads

It makes `{ color: undefined }` incompatible with `color?: string`, so forwarding an optional prop
into an Ionic component needs a spread, not a pass-through:

```ts
await presentToast({ message, duration, ...(color === undefined ? {} : { color }) });
```

The same shape appears in `use-confirm-alert.hook.ts`, `axios-config.helper.ts`, and
`createPersistedAppStore`. It looks like ceremony; it is the compiler refusing to pretend that
"absent" and "explicitly undefined" are the same thing.

## 8. In jsdom, Ionic boolean props are DOM properties, not attributes

Ionic's custom elements reflect booleans onto the element object, so `toHaveAttribute('disabled')`
fails while the control genuinely is disabled. Use `toHaveProperty('disabled', true)`; strings such
as `color` still reflect as attributes. Ionic's custom events do not fire from `userEvent` either —
use `tests/setup/ionic-events.helper.ts` (`fireIonInput`, `fireIonBlur`, `fireIonChange`).

## 9. `eslint-plugin-security` rejects nested-quantifier regexes

`security/detect-unsafe-regex` flags patterns whose quantifiers nest (`(a+)+`) as ReDoS-prone — even
when the input is trusted. The fix is not a disable comment; it is a linear parser.
`scripts/quality/validate-filenames.mjs` splits on `.` and `-` and validates each segment, and
`environment.schema.ts` validates a reverse-domain app id with `value.split('.').every(...)` rather
than one nested pattern. Linear scans are also easier to read.

## 10. `jscpd` 5 ships a native binary that Windows Application Control can block

`npm run quality:duplicates` shells out to `node_modules/jscpd-<platform>/bin/jscpd.exe`. jscpd
moved from pure JS (v4) to per-platform native binaries in v5, and a locked-down Windows host
refuses to execute the unsigned vendored `.exe`:

```text
Error: spawnSync ...\jscpd-windows-x64-msvc\bin\jscpd.exe UNKNOWN
Program 'jscpd.exe' failed to run: An Application Control policy has blocked this file
```

This is the host's policy, not a repository defect — the gate runs normally on the Linux CI runner.
If your workstation blocks it too, rely on the CI `static-analysis` job rather than pinning jscpd
back to v4. Do not report the gate as passing on a machine where it could not execute.

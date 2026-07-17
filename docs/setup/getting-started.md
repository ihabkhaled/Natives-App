# Getting started

## Requirements

| Tool    | Version        | Notes                                                                      |
| ------- | -------------- | -------------------------------------------------------------------------- |
| Node.js | >= 24          | `.nvmrc` pins the major. Vite 8 and Capacitor CLI 8 need a modern runtime. |
| npm     | >= 10          | See the npm 12 caveat below.                                               |
| JDK     | 21 (17+ works) | Android builds only. `java` must be on `PATH`.                             |
| Xcode   | latest         | iOS builds only, macOS only.                                               |
| Trivy   | latest         | `npm run security:scan` only.                                              |

### The npm version caveat

The dependency snapshot targets npm 12, but npm 12 requires Node
`^22.22.2 || ^24.15.0 || >=26`. On Node 24.14.x it refuses to install, so `engines.npm` is
`>=10` and the lockfile is npm 10 format. Once you are on Node >= 24.15, `npm i -g npm@12` works
and the lockfile upgrades cleanly. This is recorded in
[`memory/package-upgrade-notes.md`](../../memory/package-upgrade-notes.md).

## Install and run

```bash
npm ci
npm run dev
```

The app boots in **mock mode**: MSW serves a deterministic NestJS-shaped API, so no backend is
required. Sign in with:

```text
email:    ranger@example.com
password: Ranger#1234
```

Other mock identities trigger deterministic failures (locked, rate-limited, server error) — see
[`src/tests/msw/mock-data.constants.ts`](../../src/tests/msw/mock-data.constants.ts).

## Point at a real NestJS backend

```bash
cp .env.example .env.local
```

Set `VITE_API_MODE=remote` and `VITE_API_BASE_URL=https://your-api.example.com/api/v1`. The wire
contracts are identical: the same Zod schemas parse both modes, so mock-mode green does not mean
remote-mode untested — the contract suite pins the shape ([`tests/contract/`](../../tests/contract/)).

Never put a secret in a `VITE_` variable: every one is embedded in the public web bundle.

## Native

```bash
npm run cap:sync           # build + copy web assets into android/ and ios/
npm run cap:open:android
npm run cap:open:ios       # macOS only
```

Both native projects are committed. See [`docs/native/android-runbook.md`](../native/android-runbook.md)
and [`docs/native/ios-runbook.md`](../native/ios-runbook.md).

## Everyday commands

```bash
npm run lint               # zero warnings, 50 architecture rules included
npm run typecheck          # TypeScript 7 (primary compiler)
npm run test               # all vitest projects
npm run test:coverage      # + per-file thresholds
npm run test:e2e           # Playwright (installs browsers with test:e2e:install)
npm run validate:web       # the full web gate chain
```

Before your first E2E run:

```bash
npm run test:e2e:install
```

## Where to look next

- [`AGENTS.md`](../../AGENTS.md) — the engineering contract.
- [`context/architecture-map.md`](../../context/architecture-map.md) — where code lives.
- [`docs/setup/project-customization.md`](project-customization.md) — rebranding.

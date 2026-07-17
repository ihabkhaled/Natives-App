# Capacitor Ranger

A strict Ionic React + Capacitor starter where the architecture is **mechanically enforced**, not
just described. Fifty custom ESLint rules, per-file coverage floors, and honest gates mean the
rules in `rules/` are the rules the build actually applies.

Runs immediately with no backend: mock mode serves a deterministic NestJS-shaped API.

```bash
npm ci
npm run dev          # http://localhost:5173 — sign in as ranger@example.com / Ranger#1234
```

## Stack

| Concern      | Choice                                                                                  |
| ------------ | --------------------------------------------------------------------------------------- |
| UI           | Ionic React 8, React 19, Tailwind CSS 4 + Ionic tokens                                  |
| Build        | Vite 8, TypeScript 7 (primary) + TypeScript 5.9 (ESLint parser only)                    |
| Native       | Capacitor 8 — Android and iOS committed                                                 |
| Server state | TanStack Query 5                                                                        |
| Client state | Zustand 5 (persisted, versioned, migrated)                                              |
| Validation   | Zod 4 at every trust boundary                                                           |
| HTTP         | Axios behind an owner facade: single-flight refresh, replay, NestJS error normalization |
| i18n         | i18next — English + Arabic, RTL-ready                                                   |
| Tests        | Vitest 4, Testing Library, MSW 2, Playwright 1.61, axe                                  |

## What makes it strict

- **One owner per vendor.** Axios, Ionic, Capacitor, Day.js, Virtuoso, Zustand, Zod and the rest
  are reachable only through `src/packages/*`. A raw import fails the build.
- **One-way dependencies.** `app → modules → platform → shared → packages → vendors`.
- **UI-only components.** No hooks, no services, no stores, no raw copy in `*.component.tsx`.
- **Hook isolation.** Every hook invocation lives in a `*.hook.ts` file or a package facade.
- **Per-file coverage.** 95% for every production file; 100% for pure logic. No project-average
  hiding an untested path.
- **Sanitized errors.** Backend messages never reach users — proven by an integration test that
  asserts the raw string is absent from the DOM.
- **Honest gates.** `ios:verify` reports UNVERIFIED off macOS instead of faking a pass.

## Layout

```text
src/app          composition root: router, guards, providers, lifecycle, startup
src/modules      features: auth, health, home, settings, ui-workbench
src/platform     runtime capabilities: network, deep links, storage, back button
src/shared       design system, error taxonomy, i18n keys, config constants
src/packages     one owner per third-party library
eslint           the architecture plugin (50 rules, fixtures, tests)
scripts          quality, architecture, knowledge, and native gates
rules skills architecture/adrs context memory agents   canonical governance
.ai              generated routing aids (never edit by hand)
```

## Commands

```bash
npm run dev                  npm run build
npm run lint                 npm run typecheck
npm run test                 npm run test:coverage && npm run test:coverage:per-file
npm run test:e2e             npm run test:a11y
npm run quality              # format, lint, typechecks, coverage, build, architecture gates
npm run validate             # everything available in this environment
npm run knowledge:context -- --task="add a profile module"
```

## Documentation

| Start here                                                       | For                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| [`docs/setup/getting-started.md`](docs/setup/getting-started.md) | Running it.                                             |
| [`AGENTS.md`](AGENTS.md)                                         | The engineering contract (humans and AI agents).        |
| [`rules/`](rules/)                                               | Normative rules with their enforcement mechanism.       |
| [`skills/`](skills/)                                             | Task playbooks — start with new-feature-module.         |
| [`architecture/adrs/`](architecture/adrs/)                       | Why each boundary exists.                               |
| [`docs/`](docs/)                                                 | Reference: API contract, native runbooks, security, CI. |

## Honest limitations

- **iOS is uncompiled.** The project is generated and structurally checked; no macOS machine was
  available. `npm run ios:verify` reports UNVERIFIED off macOS by design.
- **Android is unbuilt here.** No JDK was present in the authoring environment; the Gradle runner
  fails loudly rather than skipping.
- **Visual baselines are Windows-rendered** and platform-specific; the CI visual job is
  `continue-on-error` until Linux baselines are generated. See
  [`docs/operations/ci.md`](docs/operations/ci.md).
- **The web token fallback is not secure at rest.** Native uses the platform keystore; the browser
  has no equivalent. See [`docs/security/token-storage.md`](docs/security/token-storage.md).
- **npm is 10, not 12** — npm 12 requires Node >= 24.15 and this environment runs 24.14.

## License

Unlicensed template. Add your own before publishing.

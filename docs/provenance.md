# Provenance and upstream-sync policy

## Origin

`Natives-App` is the Ionic React + Capacitor client for the **Ultimate Natives** application. It is
derived from the strict **CapacitorRanger** engineering operating system.

| Field                | Value                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| Template             | CapacitorRanger                                                       |
| Template remote      | `upstream-template` → `https://github.com/ihabkhaled/CapacitorRanger` |
| Template commit      | `fd6b3575a68f768c428b3746b27d6392f6d967e1` (branch `main`)            |
| Bootstrap date       | 2026-07-17                                                            |
| Destination `origin` | `git@github.com:ihabkhaled/Natives-App.git`                           |

The initial repository commit is preserved as an ancestor of `main`; the template baseline was merged
in with `--allow-unrelated-histories` so full template history remains reachable.

## Remote policy

- `origin` — the destination repository; the only push target.
- `upstream-template` — read-only source of the CapacitorRanger baseline. Its push URL is disabled
  (`DISABLED_NO_PUSH_TEMPLATE`) so the template can never be an accidental push destination.

## Upstream sync

The template is not tracked for continuous merges. Adopt upstream improvements by cherry-picking the
specific change, re-running every inherited gate, and recording it here. The inherited architecture,
package-ownership, coverage, locale, docs, and knowledge gates must never be weakened.

## Baseline gate evidence (template, before product code)

All local web gates GREEN on the bootstrap commit: `format:check`, `lint` (0 warnings),
`typecheck` + `typecheck:toolchain`, and the full `quality` aggregate (architecture, package-ownership,
dead-code, circular, duplicates, exports, locales, docs, agent-docs, per-file coverage) — 0 circular,
0 duplicates, 85 EN/AR locale keys, 181 docs checked. Playwright e2e/a11y/visual and native
(Android/iOS) are **UNVERIFIED** in this environment (need browser install / Android SDK / macOS+Xcode).
See the workspace execution ledger for full command output.

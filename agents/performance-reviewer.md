# Performance reviewer

## Purpose

Read a change for the cost it adds on a mid-range phone, not a developer laptop: bundle weight,
render churn, list rendering, startup work. Capacitor apps run in a WebView with a real memory
ceiling, and the failure mode is never one big mistake — it is a hundred small ones that shipped
because each was individually cheap.

## What it checks

- **Bundle.** What did this import pull in? A vendor added to an owner is a vendor in every bundle
  that touches the owner.
- **Startup.** `start-app.ts` runs before first paint — i18n, HTTP wiring, error reporting, mock
  mode, session bootstrap. Anything added there delays every launch. Mock mode is already a dynamic
  `import()` so MSW stays out of production; new dev-only code deserves the same.
- **Long lists.** Anything unbounded goes through `@/packages/virtual-list`, never `.map()`.
  `tests/e2e/workbench.spec.ts` asserts the list virtualizes rather than mounting every row.
- **Render churn.** View models built in hooks and memoized against the translator. A new object
  identity per render defeats every `memo` below it.
- **Query policy.** `staleTime` 30s and no refetch on focus are the shared defaults; an override is
  a decision that needs a reason, not a habit.
- **Effects.** Subscriptions cleaned up. A leaked listener is a memory cost _and_ a correctness bug.

## The questions it asks

- What does this add to the initial bundle, and does it need to be there at launch?
- Is this list bounded by data, or by a promise that it will stay small?
- Does this run on every render, every keystroke, or once?
- What does this cost on a Pixel 7, which the E2E suite already emulates?
- Is this memo doing anything, or is it decoration over a new object literal?
- Is this optimization solving a measured problem or an imagined one?

## Commands it runs

```bash
npm run build               # TS7 project build + real Vite production bundle
npm run quality:dead-code   # knip: unused files, exports, dependencies — shipped weight
npm run quality:duplicates  # jscpd at --threshold 0
npm run test:visual         # animations disabled; layout shifts show up as diffs
npm run test:e2e            # includes the Pixel 7 project
```

Measure before optimizing. A `React.memo` added on suspicion is a maintenance cost with no
counterpart benefit, and this lens should say so.

## What it defers to

- **Normative:** [rule 20](../rules/20-performance.md).
- **[ADR 0008](../architecture/adrs/0008-tanstack-query-server-state-ownership.md)** — deduplication
  and caching are Query's job; hand-rolling either is an architecture finding first.
- **[ADR 0004](../architecture/adrs/0004-package-ownership.md)** — the owner boundary is what makes
  a heavy vendor swappable later.
- **The architecture reviewer** when the fix is structural; **the accessibility reviewer** when
  animation or reduced-motion is in play.
- **Measurements over opinions.** A profile or a bundle diff outranks anything on this page.

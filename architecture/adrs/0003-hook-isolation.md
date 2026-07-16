# ADR 0003: Hook isolation

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

[ADR 0001](./0001-module-first-architecture.md) puts vendors behind owners and
[ADR 0002](./0002-ui-only-components.md) empties components of logic. That work leaks straight back
out if `useState`, `useEffect`, or `useQuery` may be called from anywhere: a container that calls
five hooks inline is the god-component again under a different suffix. React's own rules of hooks
constrain _where_ hooks may run, not _which files_ may host them, so an extra rule is needed to make
the view-model layer a real place rather than a habit.

## Decision

Hook calls — built-in React hooks, vendor hooks, and app hooks alike — are legal only inside files
named `*.hook.ts` (or `*.hook.tsx`), and each such file exports exactly one primary `use*` hook
named after the file.

- Screen hooks return a finished view model: `src/modules/health/hooks/use-health-card.hook.ts`
  translates and formats so its component receives strings.
- Owner packages expose their vendor hooks the same way: `use-app-query.hook.ts` is the only caller
  of TanStack Query's `useQuery`, and `use-app-translation.hook.ts` the only caller of
  `react-i18next`.
- Containers are the sole exception by design: they call one screen hook and render.
- Effects that register native listeners return their cleanup, as in
  `src/app/lifecycle/use-app-lifecycle.hook.ts`, which unsubscribes back button, deep links, and
  app-state on unmount.

## Consequences

**Positive:** Every stateful decision has a file name, and `react-hooks/exhaustive-deps` runs at
error severity over a small, predictable file set. A view model can be swapped without touching JSX.

**Negative / cost:** Small components that legitimately need one `useState` must still grow a hook
file. The one-hook-per-file rule forbids convenient private helper hooks alongside their consumer.

**Enforcement:** `architecture/no-built-in-hooks-outside-hook-files`,
`architecture/no-third-party-hooks-outside-hook-files`, `architecture/one-hook-per-file`,
`architecture/require-hook-filename`, `architecture/require-native-listener-cleanup`,
`architecture/no-floating-native-listeners`, plus a 200-line cap on `src/**/*.hook.ts`.

## Alternatives considered

- Allowing hooks in containers freely — rejected because the container then accretes logic and the
  boundary between composition and behavior disappears.
- Relying on `eslint-plugin-react-hooks` alone — rejected because it enforces call-order safety, not
  file ownership, and cannot express "this layer holds the view model".

## Supersession

None currently foreseen. Revisit only if React introduces a first-class view-model primitive that
makes a dedicated hook file redundant.

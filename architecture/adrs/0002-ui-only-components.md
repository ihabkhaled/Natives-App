# ADR 0002: UI-only components

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

React lets a single file fetch data, derive state, translate copy, and render markup. When it does,
that file is untestable without a provider tree, unreusable in another context, and impossible to
review at a glance. The failure is progressive: one `useQuery` in a view file is harmless, and
twenty of them are a rewrite. A convention alone never held this line, because nothing rejects the
first violation.

## Decision

Split every screen into three file kinds with distinct suffixes:

- `*.component.tsx` — presentational only. Props in, JSX out. No hook calls at all, no control-flow
  statements, no data access. `src/modules/health/components/health-status-card/` is the reference.
- `*.hook.ts` — the view model: queries, translation, derivation, callbacks.
- `*.container.tsx` — composition: calls exactly one screen hook and spreads the result into the
  component, as in `src/modules/health/containers/health-card.container.tsx`.

Components live in their own folder with an `index.ts`, with types in `*.types.ts` and literals in
`*.constants.ts`. Slot props keep composition presentational: the home screen receives its health
card as a `healthSlot` prop rather than importing the container.

## Consequences

**Positive:** Components render in a test with plain props and no provider tree, which is why
`src/shared/ui/button/button.component.test.tsx` needs no setup. Reviewers can read a screen's
behavior in one hook file.

**Negative / cost:** Three files per screen instead of one, and a real indirection step when
tracing a prop from hook to markup. Trivial views pay the same structural tax as complex ones.

**Enforcement:** `architecture/no-hooks-in-components`, `architecture/no-inline-component-logic`,
`architecture/one-component-per-file`, `architecture/require-component-folder`,
`architecture/no-types-outside-type-files`, plus a 150-line cap on `src/**/*.component.tsx` in
`eslint.config.mjs`. See [no-hooks-in-components](../../docs/eslint/no-hooks-in-components.md).

## Alternatives considered

- Smart/dumb components by convention and code review — rejected because review does not catch the
  first violation, and the first violation is what normalizes the rest.
- Colocating the hook inside the component file — rejected because it re-couples rendering to data
  access, which is precisely the coupling the split removes.

## Supersession

Revisit if React Server Components or a comparable model land in the Ionic/Capacitor stack and make
the data-fetching boundary a framework concern instead of a file-layout concern.

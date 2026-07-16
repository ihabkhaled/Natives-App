# UI workbench module

A living catalogue of the design system: every shared primitive, every state, the form pattern, and
the virtualized list, on one route.

## Public surface (`index.ts`)

| Export                                          | Purpose             |
| ----------------------------------------------- | ------------------- |
| `getWorkbenchRouteDefinitions`, `workbenchPath` | `/workbench` route. |

## What it demonstrates

- **Buttons** — every tone through `AppButton`.
- **Form** — React Hook Form + Zod through `@/packages/forms`, messages as i18n keys.
- **States** — loading, empty, error (with retry), offline, permission.
- **Virtualized list** — 500 items through the `@/packages/virtual-list` owner facade; Virtuoso is
  never imported by feature code.

## Invariants

- Item labels are translated in the hook and memoized against the translator; the component only
  renders them.
- The retry demo raises a toast through the `useAppToast` owner rather than calling Ionic directly.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [16-forms-and-validation](../../../rules/16-forms-and-validation.md),
  [19-accessibility](../../../rules/19-accessibility.md),
  [20-performance](../../../rules/20-performance.md).

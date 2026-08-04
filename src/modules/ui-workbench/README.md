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

## Where it is available

`getWorkbenchRouteDefinitions()` returns the route outside production and an empty list inside it.
The gallery exists to show mock records and every loading, error, conflict and permission state on
one screen — useful to designers and reviewers, and nothing a visitor should reach. In a production
build the path is never registered, so a direct URL falls through to the catch-all and gets the
product's ordinary not-found page.

This is deliberately not a permission check. A signed-out visitor typing the URL must not depend on
RBAC resolving correctly to be kept out.

The container is still linked into the bundle (routes are statically imported, not lazy), so the
exclusion is reachability, not bundle size. Making it a lazy chunk would remove the code from
production output too; that is a separate change to the route-definition contract.

## Invariants

- Item labels are translated in the hook and memoized against the translator; the component only
  renders them.
- The retry demo raises a toast through the `useAppToast` owner rather than calling Ionic directly.
- The route is registered outside production only, and appears in no sitemap or navigation entry.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [16-forms-and-validation](../../../rules/16-forms-and-validation.md),
  [19-accessibility](../../../rules/19-accessibility.md),
  [20-performance](../../../rules/20-performance.md).

# architecture/no-inline-test-ids

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

A `data-testid` JSX attribute MUST NEVER receive a string literal. Test ids are referenced
through `TEST_IDS` constants from `@/shared/config`, surfaced via a companion constants file.

## Why

A central test-id registry keeps selectors stable and greppable for E2E suites instead of
scattering ad-hoc strings through components.

## Valid

```tsx
// src/shared/ui/badge/badge.component.tsx
import { BADGE_TEST_ID } from './badge.constants';

export function Badge() {
  return <span data-testid={BADGE_TEST_ID} />;
}
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge() {
  return <span data-testid="badge" />;
}
```

## How to fix

Define the id in the component's companion `*.constants.ts` file (backed by `TEST_IDS` from
`@/shared/config`) and bind the attribute to that constant.

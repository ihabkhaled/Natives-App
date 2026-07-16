# architecture/no-undocumented-eslint-disable

**Severity:** error · **Scope:** every linted file (no path self-scoping in the rule)

## What it enforces

Every comment containing `eslint-disable` MUST also cite a documented exception identifier
matching `EXC-nnnn`. A disable comment without such a reference is reported at the comment's
location.

## Why

Suppressions without a paper trail rot; requiring a documented exception id keeps every disable
justified, reviewable, and discoverable.

## Valid

```tsx
// src/packages/logger/logger.factory.ts
/* eslint-disable no-console -- EXC-0001: the logger package is the single console owner. */
export function log() {
  console.info('x');
}
/* eslint-enable no-console -- EXC-0001 */
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
// eslint-disable-next-line no-console
export function loadDemo() {
  return 1;
}
```

## How to fix

Prefer fixing the underlying violation; if the disable is truly justified, document the exception
in `docs/exceptions` and cite its `EXC-nnnn` id inside the disable comment.

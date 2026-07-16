# architecture/no-raw-package-imports

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Every third-party value import MUST occur inside the vendor's registered owner directories from
`eslint/package-ownership.config.mjs`. A vendor with no registered owner is reported wherever it
is imported. Only the foundational vendors `react` and `react-dom` are exempt everywhere.

## Why

One owner per vendor keeps the dependency surface auditable and lets any vendor be upgraded or
replaced behind its facade without touching feature code.

## Valid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
import { getAppHttpClient } from '@/packages/http';

export function requestDemo(schema) {
  return getAppHttpClient().get(schema.path, schema);
}
```

## Invalid

```tsx
// src/modules/demo/helpers/demo.helper.ts
import lodash from 'lodash';

export function pickIt(v) {
  return lodash.pick(v, []);
}
```

## How to fix

Register an owner for the vendor in `eslint/package-ownership.config.mjs`, wrap it in an owner
package facade, and import that facade from feature code.

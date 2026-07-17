# architecture/no-process-env-outside-tooling

**Severity:** error · **Scope:** all `src/**` files

## What it enforces

`process.env` MUST NEVER be accessed in application source; it belongs to Node tooling only.
Application configuration is read through Vite variables exposed by `@/packages/environment`.

## Why

`process.env` does not exist in the browser/WebView runtime; the environment package validates
and types the Vite-provided values once for the whole app.

## Valid

```tsx
// src/modules/demo/services/load-demo.service.ts
import { getEnvironment } from '@/packages/environment';

export function loadDemo() {
  return getEnvironment().mode;
}
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
export function loadDemo() {
  return process.env.NODE_ENV;
}
```

## How to fix

Expose the value as a validated `VITE_*` variable through `@/packages/environment` and read it
from `getEnvironment()`.

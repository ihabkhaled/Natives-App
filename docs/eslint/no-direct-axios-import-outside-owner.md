# architecture/no-direct-axios-import-outside-owner

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Value imports of `axios` MUST appear only inside its registered owner directory,
`src/packages/http`. Every other file NEVER imports axios directly and talks HTTP through the
owner's facade instead.

## Why

A single owner wraps the HTTP vendor so interceptors, auth, and error mapping stay centralized
and the vendor remains swappable.

## Valid

```tsx
// src/packages/http/http-error.mapper.ts
import { isAxiosError } from 'axios';

export function isIt(e) {
  return isAxiosError(e);
}
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
import axios from 'axios';

export async function loadDemo() {
  return axios.get(target);
}
```

## How to fix

Request data through the facade exported by `@/packages/http` (for example `getAppHttpClient()`)
instead of importing axios.

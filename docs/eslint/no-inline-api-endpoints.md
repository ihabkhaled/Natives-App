# architecture/no-inline-api-endpoints

**Severity:** error · **Scope:** `src/**` except tests and `*.constants.ts` files

## What it enforces

The first argument of an HTTP client method (`get`, `post`, `put`, `patch`, `delete`, `download`,
`postMultipart`) MUST NEVER be a string literal. Endpoints are referenced through api-path
constants.

## Why

Centralized endpoint constants keep the API surface auditable in one place and prevent
copy-pasted, drifting path strings.

## Valid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
import { DEMO_API_PATHS } from '../constants/demo-api.constants';

export function requestDemo(client, schema) {
  return client.get(DEMO_API_PATHS.list, schema);
}
```

## Invalid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
export function requestDemo(client, schema) {
  return client.get('/demo', schema);
}
```

## How to fix

Declare the endpoint in the module's `*-api.constants.ts` object and pass that constant to the
client call.

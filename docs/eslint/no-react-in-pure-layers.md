# architecture/no-react-in-pure-layers

**Severity:** error · **Scope:** helper/utils/mapper/schema/constants/enums/keys/paths/migrations/selectors/parser files

## What it enforces

Pure-layer file kinds MUST NEVER import from `react` or `react-dom`. Any import declaration from
those packages — even a type-only import such as `import type { ReactNode }` — is reported.

## Why

Helpers, mappers, schemas, and friends are framework-free by contract; that keeps them portable,
tree-shakable, and testable without a React runtime.

## Valid

```tsx
// src/modules/demo/mappers/demo.mapper.ts
export function mapDemo(dto) {
  return { id: dto.id };
}
```

## Invalid

```tsx
// src/shared/helpers/format.helper.ts
import type { ReactNode } from 'react';

export function wrap(node: ReactNode) {
  return node;
}
```

## How to fix

Keep pure files operating on plain data; anything that needs React values or types belongs in a
hook, component, or container file instead.

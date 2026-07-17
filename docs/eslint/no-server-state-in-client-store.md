# architecture/no-server-state-in-client-store

**Severity:** error · **Scope:** `*.store.ts` files in `src/**`

## What it enforces

Client store files MUST NEVER import server-state code: any internal import whose path contains
`/gateways/`, `/queries/`, or `/mutations/`, or a `.gateway` / `.query` / `.mutation` suffix, is
reported. Remote data belongs to TanStack Query, not to client stores.

## Why

Stores hold client-only UI state; caching server responses in a store duplicates the query cache
and drifts out of sync with the backend.

## Valid

```tsx
// src/modules/demo/store/demo.store.ts
import { createAppStore } from '@/packages/state';

export const useDemoStore = createAppStore((set) => ({
  open: false,
  toggle: () => {
    set((s) => ({ open: !s.open }));
  },
}));
```

## Invalid

```tsx
// src/modules/demo/store/demo.store.ts
import { requestDemo } from '../gateways/demo.gateway';

export const useDemoStore = { load: requestDemo };
```

## How to fix

Fetch and cache remote data through the module's query/mutation files, and keep the store limited
to client state such as toggles, drafts, and selections.

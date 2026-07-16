# architecture/no-direct-ionic-import-outside-owner

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Value imports of `@ionic/react` MUST appear only inside the registered owner directories
`src/packages/ionic` and `src/packages/router`; `@ionic/react-router` only inside
`src/packages/router`. Every other file NEVER imports Ionic packages directly.

## Why

The Ionic and router owner packages re-export the UI kit behind a stable surface, so the vendor
can be themed, wrapped, or swapped without touching feature code.

## Valid

```tsx
// src/packages/ionic/index.ts
export { IonButton } from '@ionic/react';
```

## Invalid

```tsx
// src/modules/demo/components/demo-view/demo-view.component.tsx
import { IonButton } from '@ionic/react';

export function DemoView() {
  return <IonButton />;
}
```

## How to fix

Import Ionic components from `@/packages/ionic` (and router pieces from `@/packages/router`),
adding re-exports to the owner package when a component is missing.

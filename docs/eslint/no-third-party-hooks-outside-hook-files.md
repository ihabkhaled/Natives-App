# architecture/no-third-party-hooks-outside-hook-files

**Severity:** error · **Scope:** `src/**` except tests and `*.hook.ts` files

## What it enforces

A `use*` function imported as a value from a vendor package MUST only be invoked inside
`*.hook.ts` files. The rule resolves each hook call against the file's import bindings and
reports vendor-sourced hooks; type-only imports are ignored.

## Why

Wrapping every vendor hook once behind an app-owned hook keeps the vendor swappable and gives
features a single, stable hook surface.

## Valid

```tsx
// src/packages/i18n/hooks/use-app-translation.hook.ts
import { useTranslation } from 'react-i18next';

export function useAppTranslation() {
  return useTranslation();
}
```

## Invalid

```tsx
// src/modules/demo/containers/demo.container.tsx
import { useTranslation } from 'react-i18next';

export function DemoContainer() {
  const { t } = useTranslation();
  return <div>{t('x')}</div>;
}
```

## How to fix

Wrap the vendor hook in a `*.hook.ts` file (typically inside the vendor's owner package) and
consume the wrapper hook from containers.

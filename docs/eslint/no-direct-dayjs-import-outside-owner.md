# architecture/no-direct-dayjs-import-outside-owner

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Value imports of `dayjs` MUST appear only inside its registered owner directory,
`src/packages/date`. All other files NEVER import Day.js directly; they consume the date facade
instead.

## Why

Date handling flows through one owner so formatting, locales, and the vendor choice itself stay
centralized and replaceable.

## Valid

```tsx
// src/packages/date/date.facade.ts
import dayjs from 'dayjs';

export function formatIt(iso) {
  return dayjs(iso).format();
}
```

## Invalid

```tsx
// src/modules/demo/helpers/demo-date.helper.ts
import dayjs from 'dayjs';

export function formatIt(iso) {
  return dayjs(iso).format();
}
```

## How to fix

Use (or extend) the date helpers exported by `@/packages/date` instead of importing dayjs in
feature or shared code.

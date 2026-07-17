# architecture/no-raw-i18n-text

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

User-visible copy MUST NEVER appear as raw JSX text: any JSX text node containing letters, and
any string-literal expression child (`{'...'}`), is reported. Copy arrives already translated
through props or i18n hooks; JSX attribute values are not checked by this rule.

## Why

Hardcoded strings bypass the i18n pipeline and ship untranslatable UI; forcing copy through
translations keeps every locale complete.

## Valid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  return <span>{props.label}</span>;
}
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge() {
  return <span>Save changes</span>;
}
```

## How to fix

Add the copy to the locale resources and pass the translated string down via props (or an i18n
hook in the container) instead of hardcoding it in JSX.

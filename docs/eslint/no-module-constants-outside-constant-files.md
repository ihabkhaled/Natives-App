# architecture/no-module-constants-outside-constant-files

**Severity:** error · **Scope:** hook/service/gateway/repository/store/query/mutation and UI-family files

## What it enforces

Module-scope `const` declarations whose initializer is literal-like — a string, number, template,
object, or array (including `as const`) — MUST NEVER appear in these files. Literal configuration
lives in `*.constants.ts` (or enums/variants/keys/paths homes). Constants initialized from calls,
such as `getLogger('demo')`, are allowed.

## Why

Hidden module-scope literals are configuration in disguise; hoisting them into constants files
keeps every tunable value discoverable and reviewable.

## Valid

```tsx
// src/modules/demo/constants/demo.constants.ts
export const DEMO_LIMIT = 25;
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
const DEMO_LIMIT = 25;
export function useDemo() {
  return DEMO_LIMIT;
}
```

## How to fix

Move the literal into the module's companion `*.constants.ts` file and import it where it is
consumed.

# Recurring review findings

The violations this architecture keeps catching. Every one is a habit from a normal React codebase
that a rule here rejects. Each entry: what shows up, where it belongs, and what catches it.

## Hooks in components

`useState`, `useTranslation`, or `useQuery` inside a `*.component.tsx`. Belongs in a `*.hook.ts`
returning a finished view model, which the container spreads into the component. A component that
calls a hook needs a provider tree to render, so its test needs a rig, so it stops getting tested.
The single most common finding. Caught by `no-hooks-in-components`,
`no-built-in-hooks-outside-hook-files`.

## Interfaces and types in component files

`interface ButtonProps { … }` at the top of `button.component.tsx`. Belongs in the sibling
`*.types.ts`. The component folder is a contract — types, constants, component, barrel — and a type
declared inline cannot be imported without importing the component. Caught by
`no-interfaces-outside-interface-files`, `no-types-outside-type-files`.

## Raw vendor imports

`import axios from 'axios'` in a service; `IonButton` from `@ionic/react` in a feature component;
`dayjs` in a mapper. Belongs to the owner: `@/packages/http`, a `src/shared/ui` primitive,
`@/packages/date`. Every direct edge is a line in the next migration's diff
([ADR 0004](../architecture/adrs/0004-package-ownership.md)). Caught by the six ownership rules and
`npm run quality:package-ownership`. An _unregistered_ vendor reports differently — "Register an
owner before using it" — which is a design request, not a lint nit.

## Inline literals that belong in a constants file

`queryKey: ['health']`; `.get('/health')`; `history.push('/home')`; `getSecureValue('auth-token')`;
`data-testid="submit"`; `trackEvent('login_success')`. Belong in `queries/*.keys.ts`,
`constants/*-api.constants.ts`, `APP_PATHS` + `routes/*.paths.ts`, `STORAGE_KEYS`, `TEST_IDS`, and
`constants/*-analytics.constants.ts`. A typo'd literal fails at runtime, in one place, silently; a
typo'd constant fails at compile time, everywhere. Caught by the six `no-inline-*` rules.

## Raw user-visible text

`<IonButton>Save</IonButton>`, or `placeholder="Email"`. Belongs in `I18N_KEYS`, translated in the
hook, passed down as a prop. `ar` is a shipped locale, not a plan. Caught by `no-raw-i18n-text` and
`npm run quality:locales`.

## Rendering a raw error

`{error.message}`, or `catch (e) { setError(String(e)) }`. Belongs in the `AppError` → i18n-key
pipeline ([error-flow](../context/error-flow.md)). It leaks backend internals, cannot be translated,
and every call site invents its own fallback string. Caught by `no-unsafe-error-display`.

## Server state copied into a store

A `user` field on the session store, or an `isLoading` flag beside a query. Belongs to TanStack
Query; the session store holds status only. Two sources of truth, one silently stale — and a
persisted store writes server data to disk. Caught by `no-server-state-in-client-store`.

## Cross-module deep imports

`import { loginUser } from '@/modules/auth/services/login.service'`. Belongs in the module's
`index.ts` — if it should be public at all; usually it should not. A deep import makes another
module's internals load-bearing. Caught by `no-cross-module-deep-imports` and
`npm run quality:architecture`.

## React leaking into pure layers

`useTranslation()` in a service; a `ReactNode` in a mapper's return type. Belongs in the hook:
services and gateways return data, hooks turn data into view models. Caught by
`no-react-in-services`, `no-react-in-gateways`, `no-react-in-pure-layers`.

## Undocumented eslint-disable

`// eslint-disable-next-line` with no reason. A disable comment is an architecture exception and
needs its reason attached, or the next reader cannot tell a deliberate carve-out from a shortcut.
The codebase has exactly one, in `logger.factory.ts`, because the logger package is the single
`console` owner. Caught by `no-undocumented-eslint-disable`, `unicorn/no-abusive-eslint-disable`.

# Skill: Add a hook

**Use when:** React state, effects, or vendor hooks must be used — they are legal only in
`*.hook.ts`.

## Required reading

- [rules/05 — Hooks and effects](../rules/05-hooks-and-effects.md) — ownership, one per file,
  cleanup.
- [ADR 0003 — Hook isolation](../architecture/adrs/0003-hook-isolation.md) — why hook calls are
  quarantined to one file kind.
- [use-health-card.hook.ts](../src/modules/health/hooks/use-health-card.hook.ts) — a view-model hook
  that translates, formats, and hands back a flat object.
- [use-login-form.hook.ts](../src/modules/auth/hooks/use-login-form.hook.ts) — a hook that takes
  options and composes package hooks.

## Preconditions

- [ ] You know the hook's kind: **query** ([query](query.md)), **mutation**
      ([mutation](mutation.md)), **form** ([form](form.md)), or **view model** (this skill).
- [ ] The view model is decided: what the component renders, as flat translated primitives.
- [ ] Every vendor hook you need has an owner facade — `useAppQuery`, `useAppTranslation`,
      `useAppForm`, `useAppNavigation`. If not, see [package-wrapper](package-wrapper.md).

## Files

```text
src/modules/<module>/hooks/use-<thing>.hook.ts       one primary hook, its view interface beside it
```

## Steps

1. Name it `use-<thing>.hook.ts`. `architecture/require-hook-filename` reports an exported `use*`
   function living anywhere else; `architecture/require-component-folder` does not apply to hooks.
2. Export the view interface from the same file. `use-health-card.hook.ts` exports `HealthCardView`
   next to `useHealthCard` — hook files are a declaration home, so the interface is legal here and
   the component's `.types.ts` aliases it.
3. Compose owner hooks, never vendors. `useAppTranslation()` from `@/packages/i18n` gives
   `{ t, locale }`; `useAppQuery` from `@/packages/query` wraps TanStack. Importing `react-i18next`
   directly fails `architecture/no-raw-package-imports` and
   `architecture/no-third-party-hooks-outside-hook-files`.
4. Resolve copy here: `t(I18N_KEYS.health.title)`, and errors via
   `t(mapErrorCodeToI18nKey(healthQuery.error.code))` — the error code becomes copy, the raw message
   never does.
5. Format here too: `formatDateTime(health.checkedAtIso, locale)` from `@/packages/date`. Importing
   `dayjs` trips `architecture/no-direct-dayjs-import-outside-owner`.
6. Return a flat object of primitives and callbacks. Health returns eleven fields including
   `onRefresh: healthQuery.refetch` — the component then needs no thought.
7. Exactly one exported `use*` per file (`architecture/one-hook-per-file`). Private helpers such as
   `translateFieldError` in `use-login-form.hook.ts` are fine; they are not hooks.
8. Any effect that registers a listener must return its cleanup —
   `architecture/require-native-listener-cleanup`. See [native-listener](native-listener.md).

## Tests

- `use-<thing>.hook.test.ts`, colocated. Mock the layer below (`vi.mock('./use-health-query.hook')`)
  and drive it with a `mockHealthQuery(overrides)` helper as `use-health-card.hook.test.ts` does.
- i18n-dependent hooks need `beforeAll(async () => { await initTestI18n(); })` from
  `tests/setup/i18n-test.helper.ts`; then assert real copy (`'API health'`), not keys.
- Hooks touching query or router need `renderHookWithProviders` from
  `tests/setup/render-with-providers.helper.tsx`; pure ones can use bare `renderHook`.
- Prove the negative: `use-health-card.hook.test.ts` asserts an `AppError` carrying `'ECONNREFUSED'`
  still renders the translated offline copy.
- Run: `npx vitest run --project unit src/modules/<module>/hooks`.

## Security / accessibility / native considerations

- Never return tokens or an `AppError` object; return the code-derived string. Raw errors reaching
  JSX trip `architecture/no-unsafe-error-display`.
- `eslint.config.mjs` caps hook files at 200 lines and 90 lines per function; a hook that outgrows
  that is two hooks.

## Documentation delta

- The module README when the hook is exported — auth documents `useSession` as "Session status for
  guards and screens (never tokens)".

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/hooks
npm run test:coverage && npm run test:coverage:per-file
```

## Forbidden shortcuts

- `useState` in a container or component — `architecture/no-built-in-hooks-outside-hook-files`.
- Two exported hooks in one file — `architecture/one-hook-per-file`.
- Calling a service directly from a view-model hook and skipping the query layer — server state
  belongs to TanStack Query (`architecture/no-server-state-in-client-store`, ADR 0008).
- Returning `{ query }` and letting the component read `query.data` — that puts logic in the
  component.

## Definition of done

- [ ] One exported hook, one view interface, in one `use-*.hook.ts`.
- [ ] Only owner facades are imported; no vendor import survives.
- [ ] The view model is flat, translated, and formatted.
- [ ] Every branch of the view model is covered at 95%+.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.

# Skill: Test a hook or a component

**Use when:** the thing under test renders or uses React — the jsdom rules differ from plain units.

## Required reading

- [render-with-providers.helper.tsx](../tests/setup/render-with-providers.helper.tsx) —
  `renderWithProviders`, `renderHookWithProviders`, `createTestQueryClient`.
- [i18n-test.helper.ts](../tests/setup/i18n-test.helper.ts) — `initTestI18n` loads the real
  catalogs.
- [ionic-events.helper.ts](../tests/setup/ionic-events.helper.ts) — `fireIonInput`, `fireIonBlur`,
  `fireIonChange`.
- [use-health-query.hook.test.ts](../src/modules/health/hooks/use-health-query.hook.test.ts) — a
  query hook driven through providers.
- [use-health-card.hook.test.ts](../src/modules/health/hooks/use-health-card.hook.test.ts) — a
  view-model hook with real i18n and a mocked layer below.

## Preconditions

- [ ] You know which harness applies: bare `renderHook` for a pure hook, `renderHookWithProviders`
      when query or router are involved, `render` for a component (components have no hooks).
- [ ] i18n-dependent tests will call `initTestI18n()` — asserting keys instead of copy hides an
      empty catalog.

## Files

```text
src/modules/<module>/hooks/use-<thing>.hook.test.ts
src/modules/<module>/components/<thing>/<thing>.component.test.tsx
```

## Steps

1. **Providers.** `renderHookWithProviders(() => useHealthQuery())` wraps the hook in a
   `QueryClientProvider` (retry disabled, infinite `gcTime`) and a `MemoryRouter`. Pass
   `{ initialPath: '/login' }` or `{ queryClient }` when the test needs them.
2. **i18n.** `beforeAll(async () => { await initTestI18n(); });`. It initializes the real i18n stack
   with the real `en.json`/`ar.json`, so assertions read like the product:
   `expect(result.current.title).toBe('API health')`.
3. **Mock one layer down.**
   `vi.mock('../services/get-health.service', () => ({ getHealthStatus: vi.fn() }))` for a query
   hook; `vi.mock('./use-health-query.hook')` for the view-model hook above it.
4. **Async settling.** Assert the pending state synchronously, then `await waitFor(() => { … })` for
   the resolved state. Wrap imperative calls in `act`: `act(() => { result.current.refetch(); });`.
5. **Components take plain `render`.** No providers, because a component has no hooks — that is the
   whole point of `architecture/no-hooks-in-components`. Build props with a `buildProps(overrides)`
   factory.
6. **jsdom fact — Ionic boolean props are DOM properties.** Ionic reflects `disabled` onto the
   element, not to an attribute jsdom exposes. Assert
   `expect(submit).toHaveProperty('disabled', true)`; `toHaveAttribute('disabled')` fails even when
   the button really is disabled. Same for `toHaveProperty('value', …)` and
   `toHaveProperty('errorText', …)` on `ion-input`.
7. **jsdom fact — `ion-button` has no implicit ARIA role.** Ionic's custom elements do not upgrade
   in jsdom, so `getByRole('button')` finds nothing. Query by
   `getByTestId(TEST_IDS.healthRefreshButton)` or by text — `health-status-card.component.test.tsx`
   clicks the retry action with `getByText('Try again')`. String props Ionic _does_ reflect
   (`color`, `expand`) are assertable with `toHaveAttribute`.
8. **jsdom fact — Ionic inputs ignore `fireEvent.change`.** They emit `ionInput`/`ionChange` custom
   events. Use `fireIonInput(element, 'user@test.dev')` from `tests/setup/ionic-events.helper.ts`.
   `userEvent.click` works normally for buttons.
9. Plain semantic elements keep their roles — `getByRole('heading', { level: 2 })` works for
   `StatusView`'s title, and `getByRole('alert')` works for an error note.

## Tests

- Hook: prove the initial state, the resolved state, the error state (an `AppError` with the right
  code), and that callbacks delegate — `use-health-query.hook.test.ts` proves `refetch()` calls the
  service a second time.
- Component: prove each state renders alone, precedence between states, and that handlers fire once.
- Run: `npx vitest run --project unit src/modules/<module>`.

## Security / accessibility / native considerations

- Assert the sanitization directly:
  `expect(result.current.errorMessage).toBe('You appear to be offline…')` for an `AppError` whose
  message is `'ECONNREFUSED'`. That test is the guard rail on ADR 0012.
- Assert `aria-busy` and `role="alert"` in component tests; axe covers the rendered page separately
  in [accessibility-test](accessibility-test.md).
- `matchMedia` is stubbed globally in `tests/setup/testing-library.setup.ts` — do not re-stub it.

## Documentation delta

- None. If a jsdom quirk cost you an hour and is not listed above, add it to this skill.

## Validation

```bash
npx vitest run --project unit src/modules/<module>
npm run test:coverage:per-file
npm run lint
```

## Forbidden shortcuts

- `renderHook` for a query hook — no `QueryClientProvider`, so it throws; use the providers helper.
- Asserting `t()` keys instead of copy — passes with an empty catalog.
- `fireEvent.change` on an `ion-input` — nothing happens and the test proves nothing.
- `getByRole('button')` for an `ion-button` — it is not there in jsdom.
- `await new Promise(r => setTimeout(r, 100))` instead of `waitFor` — flaky, and slow when it works.

## Definition of done

- [ ] The right harness is used; providers are present exactly when needed.
- [ ] i18n-dependent assertions run against real copy after `initTestI18n()`.
- [ ] Ionic properties are asserted with `toHaveProperty`; Ionic inputs are driven with
      `fireIonInput`.
- [ ] Async states settle through `waitFor`/`act`, not timers.
- [ ] The file clears its coverage threshold and `npm run lint` passes.

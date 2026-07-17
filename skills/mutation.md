# Skill: Add a mutation

**Use when:** the user performs a write — submit, delete, sign in, sign out.

## Required reading

- [rules/15 — Server state and queries](../rules/15-server-state-and-queries.md) — invalidation is
  part of the write.
- [rules/17 — Error handling](../rules/17-error-handling.md) — how the failure reaches the screen.
- [use-login-mutation.hook.ts](../src/modules/auth/mutations/use-login-mutation.hook.ts) — a write
  that flips client state on success.
- [use-logout-mutation.hook.ts](../src/modules/auth/mutations/use-logout-mutation.hook.ts) — a write
  that clears the query cache.

## Preconditions

- [ ] The service performing the write exists — see [service](service.md).
- [ ] You know what becomes stale: which query keys to invalidate, and which client state flips.
- [ ] The success path's navigation owner is clear. Auth navigates by flipping session status and
      letting `guarded-route.guard.tsx` redirect — mutations do not push history.

## Files

```text
src/modules/<module>/mutations/use-<verb>-mutation.hook.ts
src/modules/<module>/index.ts     edit: export when a foreign layer triggers the write
```

## Steps

1. Name it `use-<verb>-mutation.hook.ts` under `mutations/`. It is a hook file, so
   `architecture/require-hook-filename` and `architecture/one-hook-per-file` both apply.
2. Wrap `useAppMutation<TData, TVariables>` from `@/packages/query`, passing
   `mutationFn: (vars) => <service>(vars)`. Importing `useMutation` directly fails
   `architecture/no-raw-package-imports`.
3. Do the invalidation in `onSuccess`. Use the key builders, never literals: `useQueryClient()` from
   `@/packages/query`, then `queryClient.invalidateQueries({ queryKey: authQueryKeys.all })` —
   `architecture/no-inline-query-keys` guards this.
4. Flip client state in `onSuccess` when it is genuinely client state. `useLoginMutation` reads
   `markAuthenticated` from `useSessionStore` and calls it; the route guard then redirects. Never
   copy the server response into the store.
5. Return a narrow view: `{ login, isSubmitting: mutation.isPending, error }`. Wrap the trigger so
   callers do not handle promises — `login: (credentials) => { mutation.mutate(credentials); }`.
6. Normalize the error exactly as queries do:
   `error: mutation.error === null ? null : toAppError(mutation.error)`, typed `AppError | null`.
7. For a destructive write, confirm through `useConfirmAlert` from `@/shared/ui` inside the screen
   hook — not inside the mutation, and never with `window.confirm`
   (`architecture/no-direct-browser-api-outside-platform`).

## Tests

- `use-<verb>-mutation.hook.test.ts`, colocated. Mock the service and render with
  `renderHookWithProviders`; its `QueryClient` has `mutations: { retry: false }` so failures settle
  at once.
- Prove: `isSubmitting` toggles across the call; success runs the side effect (session flipped,
  cache invalidated); failure surfaces an `AppError` with the expected code and leaves state
  untouched.
- For cache effects, pass your own client via `renderHookWithProviders(cb, { queryClient })` and spy
  on `invalidateQueries`.
- Cover the flow end to end in `tests/integration/auth-login-flow.integration.test.ts` — see
  [integration-test](integration-test.md).
- Run: `npx vitest run --project unit src/modules/<module>/mutations`.

## Security / accessibility / native considerations

- A failed write must render sanitized copy. `tests/e2e/auth.spec.ts` asserts a locked account shows
  "You do not have permission to do that." and never the word "locked".
- Disable and mark the submit control `aria-busy` while `isSubmitting` — `AppButton` does both.
- Auth writes are the **critical** lane: integration + contract + `security:secrets` before merge.

## Documentation delta

- The module README's public surface — auth documents `useLogoutMutation` as "Ends the session and
  clears cached server state".
- `context/auth-flow.md` when the post-write transition changes.

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/mutations
npm run test:integration
npm run test:e2e
```

## Forbidden shortcuts

- Optimistic updates without a rollback — the cache lies on failure; add `onError` restore or skip
  the optimism.
- `history.push('/home')` in `onSuccess` — `architecture/no-direct-navigation-outside-router-owner`;
  flip state and let the guard move.
- Invalidating with `['auth']` inline — `architecture/no-inline-query-keys`.
- Storing the response entity in Zustand — `architecture/no-server-state-in-client-store`.

## Definition of done

- [ ] The hook wraps `useAppMutation` and exposes `{ trigger, isSubmitting, error }`.
- [ ] Everything the write invalidates is invalidated through key builders.
- [ ] Failure yields a translated `AppError`, never backend text.
- [ ] `npm run test:integration` covers the flow; unit tests cover the hook's branches.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.

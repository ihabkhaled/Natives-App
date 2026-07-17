# Skill: Register a native listener

**Use when:** the app must react to a native event — lifecycle, back button, network, URL open.

## Required reading

- [rules/05 — Hooks and effects](../rules/05-hooks-and-effects.md) — effect cleanup obligations.
- [docs/eslint/require-native-listener-cleanup](../docs/eslint/require-native-listener-cleanup.md) —
  the effect-side rule.
- [docs/eslint/no-floating-native-listeners](../docs/eslint/no-floating-native-listeners.md) — the
  handle-side rule.
- [capacitor-app.facade.ts](../src/packages/capacitor-app/capacitor-app.facade.ts) — `toCleanup` and
  the three `subscribeTo*` functions.
- [use-network-status.hook.ts](../src/platform/network/hooks/use-network-status.hook.ts) — a
  subscription surfaced as React state.

## Preconditions

- [ ] The plugin owner exposes a `subscribeTo*` returning a cleanup — if not, see
      [capacitor-plugin](capacitor-plugin.md).
- [ ] Ownership is settled: single-owner events (the Android back button) get exactly one registrar
      in the app layer, not one per screen.
- [ ] The web behavior is known — some events never fire off-device.

## Files

```text
src/packages/capacitor-<name>/capacitor-<name>.facade.ts   subscribeTo* + cleanup
src/platform/<capability>/<capability>.facade.ts           app semantics, runtime gating
src/platform/<capability>/hooks/use-<capability>.hook.ts   React surface (optional)
src/app/lifecycle/app-lifecycle.provider.tsx               where app-wide listeners mount
```

## Steps

1. **Owner side.** The plugin's `addListener` returns `Promise<PluginListenerHandle>`, not a handle.
   Convert it once — `capacitor-app.facade.ts` has `toCleanup(handlePromise)` returning
   `() => { void handlePromise.then((handle) => handle.remove()); }` — and give every `subscribeTo*`
   that return type. A `subscribeTo*` returning `void` is unremovable by construction.
2. **Platform side.** Compose and gate. `startDeepLinkListener` returns a real no-op cleanup on web
   rather than `undefined`, so callers never branch:
   `if (!isNativeRuntime()) { return () => { /* nothing registered */ }; }`.
3. **React side.** Register in an effect inside a `*.hook.ts` and **return the cleanup**:
   `useEffect(() => subscribeToAppStateChange(setActive), []);`. An effect that registers without
   returning a cleanup is reported by `architecture/require-native-listener-cleanup`; a
   `subscribeTo*` call whose return value is discarded is reported by
   `architecture/no-floating-native-listeners`.
4. Never call a subscribe from a component — `architecture/no-hooks-in-components` and
   `architecture/no-built-in-hooks-outside-hook-files` both fire, and a re-render would stack
   listeners.
5. **Mount app-wide listeners once.** `src/app/lifecycle/app-lifecycle.provider.tsx` and
   `use-app-lifecycle.hook.ts` are the single registration point; the hardware back button in
   particular must have exactly one owner or two handlers fight over the same press.
6. Keep the callback thin: map the native payload to app vocabulary and set state. The facade
   already unwraps — `subscribeToAppStateChange` hands you `isActive: boolean`, not the plugin's
   event object.
7. Event name strings belong in a constants file — `architecture/no-inline-event-names`. In practice
   the owner facade is the only place that names `'appStateChange'` or `'appUrlOpen'` at all.
8. Effects with dependencies must re-subscribe correctly: `react-hooks/exhaustive-deps` is `error`
   here, so a stale closure fails lint rather than silently listening with old state.

## Tests

- `capacitor-<name>.facade.test.ts` — mock the plugin. Prove `addListener` receives the right event
  name, the callback is unwrapped, and the returned cleanup awaits the handle and calls `remove()`.
- `use-<capability>.hook.test.ts` — `renderHook`, then `unmount()`, and assert the cleanup ran. That
  single assertion is what stops the leak.
- `deep-link.listener.test.ts` is the reference for the web branch: nothing registered, cleanup
  still callable.
- Run: `npx vitest run --project unit src/packages/capacitor-<name> src/platform/<capability>`.

## Security / accessibility / native considerations

- A leaked listener survives navigation and fires against unmounted state — on `appUrlOpen` that
  means a stale handler routing a deep link. Cleanup is a correctness and a security property.
- `appUrlOpen` payloads are untrusted input; parse them through the allowlist — see
  [deep-link](deep-link.md).
- Resume events are the right moment to re-check permissions and refresh stale queries.

## Documentation delta

- `context/native-capability-map.md` — the event, its owner, and its web behavior.
- The module or platform README when a new single-owner event appears.

## Validation

```bash
npm run lint
npx vitest run --project unit src/platform src/packages/capacitor-<name>
npm run quality:architecture
npm run android:verify
```

## Forbidden shortcuts

- `void App.addListener(...)` in a hook — `architecture/no-raw-capacitor-imports` and
  `architecture/no-floating-native-listeners`.
- An effect with no return — `architecture/require-native-listener-cleanup`.
- `globalThis.addEventListener` in a module — `architecture/no-direct-browser-api-outside-platform`;
  the platform layer owns browser events.
- Registering the back-button handler per screen — the presses interleave unpredictably.

## Definition of done

- [ ] Every `subscribeTo*` returns a cleanup; every effect returns it.
- [ ] App-wide events are registered exactly once, in the app lifecycle owner.
- [ ] A test unmounts and proves `remove()` ran.
- [ ] Web behavior is gated on `isNativeRuntime()` where the shim would mislead.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.

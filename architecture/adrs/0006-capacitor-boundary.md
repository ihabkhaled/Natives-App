# ADR 0006: Capacitor boundary

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Capacitor plugins behave differently per platform, resolve asynchronously, and hand back listener
handles that leak if nobody removes them. They are also the part of the app that cannot be exercised
by a web test run: a raw `Keyboard.addListener` in a component is untestable in jsdom and unmockable
without stubbing the module. On top of that, plugins arrive as many small packages, so "one facade
for native" would become a grab-bag that every feature imports for any reason.

## Decision

Two tiers, and the distinction is load-bearing.

- **Owner packages** — one per plugin: `src/packages/capacitor-app`, `capacitor-browser`,
  `capacitor-device`, `capacitor-haptics`, `capacitor-keyboard`, `capacitor-network`,
  `capacitor-preferences`, `capacitor-share`, `capacitor-splash-screen`, `capacitor-status-bar`,
  and `secure-storage` for `@aparajita/capacitor-secure-storage`. Each owns exactly one plugin,
  normalizes its shape, and returns an unsubscribe function from every subscription.
- **Platform facades** — `src/platform/` composes owners into app policy: `back-button.facade.ts`
  is the single hardware-back owner, `deep-links/` parses and listens, `lifecycle/` applies native
  chrome, `storage/preferences-storage.adapter.ts` bridges Preferences into the store contract.

`@capacitor/core` is not a plugin and is registered to `src/platform/runtime` (plus
`src/packages/secure-storage`, which must branch on `Capacitor.isNativePlatform()` to choose between
hardware-backed storage and its documented web fallback). `runtime.facade.ts` is therefore the only
place that answers "am I native?".

Capability plugins that are _not_ installed — camera, geolocation, filesystem, push — are a
deliberate omission, not an oversight; `src/platform/permissions/permission-state.mapper.ts` already
defines the permission taxonomy they must normalize into when added.

## Consequences

**Positive:** Feature code never imports a plugin, so a web test needs no native mocks. Adding a
plugin is a mechanical, reviewable shape: package, facade, registry entry.

**Negative / cost:** Eleven single-purpose directories for eleven plugins is real ceremony, and
each facade is a partial view of its plugin's API. Two hops (owner, then platform facade) separate
a feature from the device.

**Enforcement:** `architecture/no-raw-capacitor-imports`,
`architecture/require-native-listener-cleanup`, `architecture/no-floating-native-listeners`,
`architecture/no-direct-browser-api-outside-platform`,
`architecture/no-direct-storage-api-outside-platform`, plus `npm run quality:package-ownership`.

## Alternatives considered

- A single `src/packages/capacitor` owning all plugins — rejected because it becomes the import
  everything reaches for, which defeats the point of ownership.
- Calling plugins straight from hooks — rejected: untestable in jsdom and it scatters listener
  cleanup across the app.

## Supersession

Revisit if Capacitor consolidates its official plugins into one package, or if a plugin's web
implementation makes the owner layer redundant.

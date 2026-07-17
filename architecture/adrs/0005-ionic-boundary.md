# ADR 0005: Ionic boundary

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Ionic React is the most invasive dependency in the stack: it supplies the component vocabulary, the
navigation shell, the overlay controllers, and the CSS reset. Left unbounded it appears in every
view file, and a major upgrade then rewrites the app. Two specifics forced an explicit boundary
rather than a general rule. Ionic 8 exposes overlays as the hooks `useIonToast` and `useIonAlert`,
not as importable controller singletons, so the wrapper for an overlay must itself be a hook. And
`@ionic/react-router` supplies the routing integration, which makes Ionic and the router one
coupled decision, not two.

## Decision

`src/packages/ionic/index.ts` is the single Ionic surface. It re-exports the allowlisted component
set (`IonApp`, `IonContent`, `IonPage`, `IonInput`, …), `setupIonicReact`, the view-lifecycle hooks,
and the two overlay hooks. It also imports `./ionic-styles`, so importing the owner is what pulls
Ionic CSS into the bundle exactly once.

- The registry grants `@ionic/react` two owner dirs, `src/packages/ionic` and `src/packages/router`,
  because `IonRouterOutlet` and `useIonRouter` are routing concerns
  ([ADR 0001](./0001-module-first-architecture.md) keeps them in the router owner).
- Overlays get app-level hook owners in `src/shared/ui/`: `use-app-toast.hook.ts` and
  `use-confirm-alert.hook.ts` wrap the Ionic hooks and expose an app vocabulary (`tone`,
  `durationMs`) instead of Ionic colors.
- Shared primitives in `src/shared/ui/` are the only place Ionic components are composed into app
  components; feature modules consume the primitives.

## Consequences

**Positive:** The Ionic component surface is an enumerated list in one file, so an upgrade's blast
radius is readable before it is attempted. Overlay call sites speak app vocabulary.

**Negative / cost:** Every newly needed Ionic component requires an explicit re-export first, which
feels like friction when prototyping. The overlay owners are hooks, so they inherit hook call rules
and cannot be invoked from services — a real constraint when a background failure wants a toast.
`exactOptionalPropertyTypes` further forces conditional prop spreads when forwarding optional props
into Ionic components.

**Enforcement:** `architecture/no-direct-ionic-import-outside-owner` and the registry entries for
`@ionic/react` / `@ionic/react-router`; `npm run quality:package-ownership` re-checks independently.

## Alternatives considered

- Importing `@ionic/react` directly in views — rejected: it is the exact coupling that makes Ionic
  majors expensive.
- One mega-facade wrapping every Ionic component in an app-named component — rejected as a second
  design system with no consumers; re-export is the honest cost.

## Supersession

Revisit when Ionic ships a major that changes the component or overlay contract, or if the app
adopts a non-Ionic UI kit for some surfaces.

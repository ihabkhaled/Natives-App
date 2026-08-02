# Home module

Owns the public landing page (the site's front door at `/`), the lightweight public welcome screen,
the public About Us marketing screen, the protected home screen, and the not-found screen.

## Public surface (`index.ts`)

| Export                                             | Purpose                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `getHomeRouteDefinitions`                          | `/` (public), `/welcome` (public-only), `/about` (public), `/home` (protected). |
| `getNotFoundRouteDefinition`                       | Catch-all; the app router registers it last.                                    |
| `rootPath`, `welcomePath`, `aboutPath`, `homePath` | Typed path builders.                                                            |
| `AboutScreenView`                                  | About screen's view-model type, for tests/factories.                            |
| `LandingScreenView`                                | Landing screen's view-model type, for tests/factories.                          |

## Anatomy

```text
routes/home.paths.ts     typed builders over APP_PATHS
constants/landing-*      declaration-home literal data (staff roster, competitions, map link)
helpers/landing-*        pure, translated view-model builders — one per landing section (or group)
hooks/use-*-screen.hook  translated view models
components/*             UI-only views (one folder per landing section + the shared seam shell)
containers/*             composition (home injects the health card by slot)
```

## Invariants

- Home consumes auth through `@/modules/auth` and health through `@/modules/health` — public
  surfaces only, never deep imports. The landing page reaches `@/modules/tryouts` and
  `@/modules/contact` the same way, for its call-to-action targets.
- The health card arrives as a `healthSlot` prop, so `HomeView` stays presentational.
- Route access is declared, not hand-rolled: the app-level guard enforces it.
- `/` is `Public` (not `PublicOnly`): the landing page reads the same for an anonymous visitor and a
  signed-in one — nobody is bounced away from the marketing site. `/welcome` stays `PublicOnly`: a
  lightweight sign-in entry kept working for old deep links, distinct from the landing page.
- About is `Public` (not `PublicOnly`): it is static marketing content, so it reads the same for an
  anonymous visitor and a signed-in user. Both About and the landing page publish per-route SEO
  metadata via `@/shared/ui`'s `PageSeo` (React 19 native `<title>`/`<meta>`/`<link>` hoisting).
- The landing page's data-driven sections (leadership & staff, active players, competitions & ranks,
  recent match scores, per-competition leaderboard, news) are TODO seams: typed view models fed by a
  stub source (`helpers/landing-*-seam.helper.ts`), never an invented gateway call to an endpoint
  that does not exist yet (contract 1.8.0 is in flight). Every seam renders through the same
  `AsyncStateView` machinery a real query would use (see `LandingSeamSection`), so wiring the real
  query later only changes what feeds `chrome` — no layout rework. Leadership & staff and
  competitions already have real, spec-sourced content (only the _source_ is a stub); active
  players, match scores, leaderboard, and news have no seed data to show honestly, so they always
  present their designed empty state.
- `SpiritValuesGrid` (`components/spirit-values-grid`) is shared by the About page and the landing
  page's Spirit of the Game section, reusing the exact same `I18N_KEYS.about.*` copy, so the two can
  never drift apart or duplicate markup.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [04-containers](../../../rules/04-containers.md),
  [12-routing-and-deep-links](../../../rules/12-routing-and-deep-links.md).
- Context: [routing-map](../../../context/routing-map.md).
- Spec: `recovery-audit/specs/landing-site-and-team-directory.md` (canonical team facts, staff
  table, and the public showcase endpoints this module's seams are waiting on).

# Open product decisions (frontend)

Unresolved product choices affecting the client. An unresolved decision must **not** be hidden by an
arbitrary implementation choice. The canonical backend copy lives in `Natives-Backend`; this file tracks
the frontend-visible items.

| ID     | Decision                                                          | Default until resolved                             | Status |
| ------ | ----------------------------------------------------------------- | -------------------------------------------------- | ------ |
| OD-003 | Public registration allowed?                                      | Admin invitation only (no public sign-up screen)   | OPEN   |
| OD-006 | Final badge thresholds above the legacy 450-point tier            | Show >100/>200/>450 candidate tiers; >649 disabled | OPEN   |
| OD-007 | Do jersey and board-governance modules ship in the first release? | Deferred / optional (module hidden behind flag)    | OPEN   |
| OD-009 | Match scorekeeping fully live vs post-match only                  | Post-match entry; live scoreboard behind flag      | OPEN   |

## Deferred to specific prompts

- **Prompt 800 (branding):** app display name, bundle IDs, icons, splash screens, and design tokens. The
  inherited CapacitorRanger display identity (`Capacitor Ranger` / `com.capacitorranger.app`) and its
  deep-link/env/identity test suite remain intact until prompt 800 rebrands them together.
- **Prompt 816:** English + Arabic localization, RTL, dates, numbers, and Frisbee terminology.
- **Prompt 817:** PWA offline read cache, app updates, storage migration, native lifecycle.

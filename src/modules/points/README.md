# Points module

Team leaderboard with period / cohort / category scopes, deterministic displayed tie-breaking, rank
movement, per-row rank explanations, the personal append-only points ledger, and awarded badges
(prompt 809). Remote and mock modes consume the backend's team-scoped **points** contract exactly;
the server computes every total, every rank, and every badge.

## The rules that shape everything here

**Zero is a standing, not an absence.** A member with no contributions in the selected period stays
on the board with `0`, rendered muted but present. Nothing in this module filters a row by its
total.

**The client never recalculates a rank.** Totals, ranks, `previousRank`, `rankDelta`, and the tie
mode all arrive from the server. The board displays the tie-break rule the server actually applied
in plain words, and a row's "how this rank was calculated" panel lists the contributing sums the
server reported plus the rule version — there is no client-side formula anywhere in this module.

**Only published badges exist.** Badges render only when the server awarded them. The three
published thresholds (100 / 200 / 450) appear separately as _candidates_ with a "points to go"
readout; reaching one reads "awaiting the server", never "earned". The unresolved legacy tier
(649) is absent from the candidate list and is therefore never displayed or inferred.

**The ledger is append-only.** An award, its reversal, and any adjustment are three separate rows
with their own signed amounts. No earlier entry is ever rewritten, and the notice above the list
says so.

## Public surface (`index.ts`)

- `getPointsRouteDefinitions` — leaderboard and personal-ledger route definitions.
- `leaderboardPagePath`, `pointsHistoryPath` — typed navigation targets.
- `pointsQueryKeys` — team-scoped, filter-aware cache key builders.
- `leaderboardResponseSchema` — the exact leaderboard DTO the app parses with.
- `pointsSummaryResponseSchema` — the exact total + ledger + badge DTO.
- `LEADERBOARD_PERIOD`, `LEADERBOARD_COHORT`, `TIE_MODE`, `RANK_MOVEMENT` — app vocabularies.
- `BADGE_CANDIDATE_THRESHOLDS`, `UNPUBLISHED_BADGE_THRESHOLD` — the published candidate tiers, and
  the unresolved tier this module refuses to render.
- `Leaderboard`, `LeaderboardRow`, `LedgerEntry`, `PlayerBadge`, `PointsSummary` — domain types.

## Anatomy

```text
constants/points-api.constants.ts        team-scoped leaderboard and my-points paths
constants/points.constants.ts            vocabularies, i18n label maps, movement glyphs, thresholds
constants/points-filter.constants.ts     the "all categories" filter sentinel
schemas/points.schema.ts                 exact leaderboard, ledger, and badge DTOs
mappers/points.mapper.ts                 wire DTO -> app domain (row order preserved verbatim)
gateways/points.gateway.ts               exact authenticated points calls (React-free)
services/*.service.ts                    one use case each, AppError-normalized
queries/points.keys.ts                   stable team-scoped cache keys, filter-aware
queries/points.query.ts                  query option builders, gated on a resolved team id
hooks/use-points-context.hook.ts         team scope + effective grants + connectivity
hooks/use-leaderboard.hook.ts            board view model: filters, tie rule, movement, explanations
hooks/use-points-history.hook.ts         personal ledger view model
helpers/leaderboard-view.helper.ts       row views, tie detection, rank explanation
helpers/ledger-view.helper.ts            ledger rows, badges, candidates, category bar chart
components/**                            UI-only presentational components
containers/*.container.tsx               screen composition (hook -> view)
routes/points.routes.ts                  permission-guarded, nav-registered route definitions
```

## Screens

| Route          | Screen                 | Permission         |
| -------------- | ---------------------- | ------------------ |
| `/leaderboard` | Team standings         | `leaderboard.read` |
| `/points`      | Personal points ledger | `points.read.self` |

## Accessibility

The standings are a real `<table>` with row headers, so a screen reader reaches every rank without
relying on layout. Rank movement is **never colour-only**: each row carries a decorative glyph, a
text label ("Moved up"), and a supporting detail line ("Previously #3" / "3 place(s)"). The
points-by-category chart is in-house SVG with no chart vendor, and it always ships with the same
numbers in the tabular alternative underneath it.

## Design

Gold (`--un-brand-gold`) is spent here and only here: a badge is an achievement, which is exactly
what gold is reserved for. Candidate thresholds deliberately use the neutral treatment so an
unearned tier can never be mistaken for an award.

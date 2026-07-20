# Assessments module

Coach assessment entry, the draft → submit → review → publish workflow, accessible player
performance charts, published coach feedback with acknowledgement, and development goals with
action plans (prompt 807). Remote and mock modes consume the backend's team-scoped assessment and
development contracts exactly; the server remains the sole authority for every read and transition.

## The rule that shapes everything here

`null` means **not evaluated**. It is a different fact from a score of `0`, and the two never
collapse into one another — not in the draft state, not on the wire, not in a chart, and not in a
readout. A blank numeric input parses to `null`; clearing a metric writes `null` and keeps the
evidence note; a period with no value plots as a **gap** in the line, never as a point at zero; a
category with nothing evaluated is reported as "not evaluated" in the radar's data table.

## Public surface (`index.ts`)

| Export                                                             | Purpose                                    |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `getAssessmentsRouteDefinitions`                                   | Workspace, entry, and performance routes.  |
| `assessmentsPath` / `assessmentEntryPath` / `performancePath`      | Typed navigation targets.                  |
| `assessmentsQueryKeys`                                             | Team-scoped cache key builders.            |
| `playerAssessmentResponseSchema` / `assessmentListResponseSchema`  | Exact assessment DTOs.                     |
| `publishedAssessmentListResponseSchema`                            | Own-scope published assessment DTO.        |
| `templateListResponseSchema` / `metricListResponseSchema` / …      | Catalog DTOs (templates/metrics/scales/…). |
| `sharedFeedbackListResponseSchema` / `feedbackAcknowledgement…`    | Player-facing feedback DTOs.               |
| `developmentGoalListResponseSchema` / `developmentGoalResponse…`   | Development goal DTOs.                     |
| `ASSESSMENT_STATUS` / `ASSESSMENT_WORKFLOW_STEP` / `GOAL_STATUS` … | App vocabularies (as-const).               |
| `AssessmentCatalog` / `AssessmentDetail` / `PublishedAssessment` … | App-owned domain types.                    |

## Anatomy

```text
constants/assessments-api.constants.ts   team-scoped assessment, catalog, feedback, goal paths
constants/assessments.constants.ts       vocabularies, i18n label maps, tones, chart geometry
schemas/assessment.schema.ts             exact assessment + catalog response DTOs
schemas/development.schema.ts            exact feedback + development goal response DTOs
mappers/assessment.mapper.ts             generated DTO vocabulary -> app domain (+ metric source)
mappers/development.mapper.ts            feedback + goal DTO -> app domain (actions sorted)
gateways/assessments.gateway.ts          exact authenticated assessment + catalog calls (React-free)
gateways/development.gateway.ts          exact authenticated feedback + goal calls (React-free)
services/*.service.ts                    one use case each; HttpError -> AppError
queries/assessments.keys.ts|*.query.ts   team-scoped keys + query option builders
hooks/use-assessment-draft.hook.ts       local draft state routed through the null-not-zero helpers
hooks/use-assessments-workspace.hook.ts  coach list: permission gate, status filter, screen state
hooks/use-assessment-entry.hook.ts       metric grid, completeness, save, workflow bar
hooks/use-performance-screen.hook.ts     charts + feedback + goals for the signed-in player
mutations/use-*-mutation.hook.ts         save (optimistic concurrency), workflow, acknowledge, goal
helpers/assessment-value.helper.ts       null-not-zero parsing, draft edits, completeness
helpers/assessment-workflow.helper.ts    lifecycle x permission -> the steps actually offered
helpers/metric-grid-view.helper.ts       template + catalog + draft -> grouped, translated fields
helpers/chart-geometry.helper.ts         in-house SVG geometry (line, area, markers, radar)
helpers/performance-series.helper.ts     series, category averages, chart view models + tables
helpers/development-view.helper.ts       feedback sections, goal cards, progress percentage
components/*                             UI-only grid, charts, panels, and screens
containers/*.container.tsx               one screen hook wired to one component
routes/assessments.paths.ts|.routes.ts   APP_PATHS builders + permission/team guards
```

## Contract

- `GET /teams/:teamId/player-assessments?limit&offset` — bounded coach list.
- `GET|PUT /teams/:teamId/player-assessments/:id[/values]` — read and autosave under
  `expectedRecordVersion`; a stale version is a 409 that surfaces conflict copy and reloads.
- `POST .../:id/{submit,review,publish}` — the workflow. `review` carries
  `decision: start_review|approve|reject`.
- `GET .../:id/revisions` — the revision family.
- `GET /teams/:teamId/assessment-catalog/{templates,metrics,scales,categories,periods}`.
- `GET /teams/:teamId/my-assessments` — own published assessments only.
- `GET /teams/:teamId/my-feedback`, `POST .../:feedbackId/acknowledge`.
- `GET /teams/:teamId/my-development-goals`, `POST /teams/:teamId/development-goals/:id/transition`.

## Charts and accessibility

- No chart vendor is introduced. Every mark is inline SVG built from pure geometry helpers owned by
  this module, so the bundle gains no new dependency and the drawing stays themable with tokens.
- Every chart is a `<figure>` whose `<svg role="img">` carries an `aria-label` describing the
  series in words, **and** ships a real `<table>` alternative inside a native `<details>`
  disclosure with the same numbers, including the "not evaluated" rows.
- A radar is only ever offered next to its text alternative.
- The trend line breaks at a gap; markers exist only for evaluated points.
- Metric provenance (coach judgement, measured, attendance, external, match-derived) is a visible
  chip on every field, so a judgement is never read as a measurement. "Power" is only ever the
  approved strength/power metric, never inferred.

## Permissions

| Screen                             | Permission                       |
| ---------------------------------- | -------------------------------- |
| `/assessments`                     | `assessment.read.team`           |
| `/assessments/:id`                 | `assessment.read.team`           |
| `/performance`                     | `assessment.read.self.published` |
| Submit                             | `assessment.create`              |
| Start review / approve / send back | `assessment.review`              |
| Publish                            | `assessment.publish`             |
| Coach feedback section             | `feedback.read.self`             |

These gate convenience UI only; the backend re-authorises every operation.

## Invariants

- Every cache key includes `teamId`; one team never reuses another team's assessment cache.
- Lists are bounded, deterministically ordered, and virtualized.
- Values are editable only while the record is a draft; published and superseded revisions are
  read-only for everyone.
- Draft saves carry `expectedRecordVersion`; a conflict never silently overwrites a colleague.
- Private coach notes are never requested and never rendered; the player sees only the shared
  fields the server published.
- Errors render translated `AppErrorCode` copy, never raw backend messages.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [assessments wire contract](../../../tests/contract/assessments.contract.test.ts).
- Integration: [entry flow](../../../tests/integration/assessment-entry-flow.integration.test.tsx),
  [performance flow](../../../tests/integration/performance-flow.integration.test.tsx).
- E2E: [assessments experience](../../../tests/e2e/assessments.spec.ts).

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [ui-ux-quality-mandate](../../../rules/ui-ux-quality-mandate.md).

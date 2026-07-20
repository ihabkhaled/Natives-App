# Tryouts module

The candidate and staff journey from public registration through check-in, evaluator scoring,
decision/offer, and member conversion (prompt 813).

> **Backend-pending.** The backend tryouts module (prompts 600/601) is not deployed and no tryout
> path exists in `contracts/openapi.json`. Every screen here runs against the NestJS-shaped MSW
> handlers in `src/tests/msw/tryouts-handlers.ts`, validated by the **same** Zod schemas that will
> parse the remote responses. Switching to the live service is a configuration change
> (`VITE_API_MODE=remote`), not a rewrite. Recorded in `docs/api-verification.md`.

## Public surface (`index.ts`)

| Export                                                           | Purpose                                   |
| ---------------------------------------------------------------- | ----------------------------------------- |
| `getTryoutsRouteDefinitions`                                     | Public registration + staff routes.       |
| `tryoutRegistrationPath` / `tryoutsPath` / `tryoutDetailPath`    | Typed navigation targets.                 |
| `tryoutsQueryKeys`                                               | Cache key builders.                       |
| `tryoutEvent*ResponseSchema` / `candidate*ResponseSchema`        | Exact event, candidate list, detail DTOs. |
| `registrationResponseSchema` / `conversionResponseSchema`        | Registration and conversion result DTOs.  |
| `CANDIDATE_STATUSES` / `EVALUATION_CRITERIA` / `CONSENT_VERSION` | App vocabularies and the consent tag.     |
| `CandidateSummary` / `CandidateDetail` / `TryoutEvent`           | App-owned domain types.                   |

## Anatomy

```text
constants/tryouts.constants.ts          vocabularies, limits, consent version, "not scored" sentinel
constants/tryouts-api.constants.ts      public + team-scoped path builders
constants/tryouts-labels.constants.ts   i18n key maps, tones, decision test ids, state-copy namespace
schemas/tryout.schema.ts                event, candidate summary/detail, registration, conversion DTOs
mappers/tryout.mapper.ts                wire DTO -> app domain, preserving restriction decisions
gateways/tryouts.gateway.ts             exact public + authenticated calls (React-free)
services/*.service.ts                   one use case each; HttpError -> AppError
queries/tryouts.keys.ts|.query.ts       cache keys + query options
hooks/use-tryout-registration.hook.ts   the public consent-gated registration form
hooks/use-tryout-workspace.hook.ts      staff candidate roll + check-in + selected candidate
hooks/use-candidate-*.hook.ts           evaluation, decision, conversion sub-panels
mutations/*.hook.ts                     register, check in, evaluate, decide, convert
helpers/candidate-view.helper.ts        rows, event facts, and the two restricted-block builders
helpers/decision-view.helper.ts         score options, the null-score rule, conversion preview
helpers/registration-*.helper.ts        draft validation, field models, consent gate
components/*                            UI-only form, roll, restricted blocks, panels
containers/*.container.tsx              one screen hook wired to one component
routes/tryouts.paths.ts|.routes.ts      APP_PATHS builders + access policy
```

## Privacy rules (the reason this module exists)

- **Candidate contact details and readiness/health notes are restricted.** They are gated on
  `tryout.contacts.read` and `tryout.readiness.read` respectively.
- The **list projection has no field for them at all** (`CandidateSummary`), so they cannot leak
  through a roll, a filter, or a broad export — the type has nowhere to put them.
- On the detail record they are nullable blocks. The server omits them for a caller without the
  grant (the mock handler does the same), and the client additionally renders the designed
  permission state instead of the fields. Both conditions must hold before a value is shown.
- Evaluator notes and internal scores are staff-only; the candidate-facing surface shows the
  decision, never the reasoning behind it.
- Consent is explicit and auditable: the submit button stays disabled until the candidate ticks the
  statement, and `consentVersion` + `consentGiven` travel with the request.

## Other invariants

- An unscored evaluation criterion stays `null` — never 0. `NOT_SCORED_VALUE` is the empty select
  value and maps back to null on save.
- Decisions require a reason of at least five characters (mirrors the server rule).
- Conversion is idempotent and only offered for an accepted candidate; the response reports
  `alreadyConverted` when the membership already exists.
- Capacity is honest: a full session says registrations join the waitlist rather than accepting one
  it cannot honour, and a duplicate email is reported as a duplicate.

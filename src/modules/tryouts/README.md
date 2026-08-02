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
constants/public-tryouts.constants.ts   the "what happens next" step table the public page renders
hooks/use-public-tryouts.hook.ts        the public screen: open sessions + the application form
hooks/use-registration-draft.hook.ts    the application draft, its result, and the failure flag
hooks/use-tryout-workspace.hook.ts      staff candidate roll + check-in + selected candidate
hooks/use-candidate-*.hook.ts           evaluation, decision, conversion sub-panels
mutations/*.hook.ts                     register, check in, evaluate, decide, convert
helpers/candidate-view.helper.ts        rows, event facts, and the two restricted-block builders
helpers/decision-view.helper.ts         score options, the null-score rule, conversion preview
helpers/public-tryouts.helper.ts        session cards, capacity meter, session selection
helpers/registration-*.helper.ts        draft validation, field models, consent gate, form view
components/public-tryouts-view/*        the public page: hero, sessions, form, outcome, steps
components/*                            UI-only form, roll, restricted blocks, panels
containers/*.container.tsx              one screen hook wired to one component
routes/tryouts.paths.ts|.routes.ts      APP_PATHS builders + access policy
```

## The public page (`/tryout-registration`)

The only signed-out surface. It lists the open sessions from `GET /public/tryout-events` — date and
time in Africa/Cairo via `@/packages/date`, venue, remaining places, and status — and binds the
application form to the session the visitor picks. It carries its own `PageSeo` (title, description,
canonical, Open Graph) and renders inside the router-level `PublicNavContainer` /
`PublicFooterContainer` chrome, which every anonymous route already gets.

It is honest in every state: a closed session is blocked with a reason and its action disabled, a
full one says new applications join the waitlist, a duplicate email is reported as a duplicate, and
a failed call says nothing was saved instead of showing a blank confirmation. The submit button,
the in-flight notice, and the outcome are all announced through `role="status" aria-live="polite"`.

> The public page is deliberately routed at `APP_PATHS.tryoutRegistration` (`/tryout-registration`)
> rather than `/tryouts`: `/tryouts` is the team-scoped staff workspace, and the route table
> requires unique paths (`src/app/router/route-registry.test.ts`). The public navbar and footer
> already link here under the label "Tryouts".

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

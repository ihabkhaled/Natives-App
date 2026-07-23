# Training module

External training submission, evidence metadata, training buddies, the draft → submit → withdraw →
resubmit lifecycle, and the reviewer queue with approve / reject / request-changes (prompt 808).
Remote and mock modes consume the backend's team-scoped **activities** contract exactly; the server
remains the sole authority for every read, every transition, and every point awarded.

## The rule that shapes everything here

**The client never invents a points number.** The activity-type catalog carries a _candidate_ value,
and that is all this module will ever show. A type whose `pointsApproval` is `pending` — or whose
`defaultPointValue` is `null` — renders the word **pending**, never a guessed figure, and every
candidate readout is followed by the notice that the server awards points after approval. The
second rule is close behind: anti-abuse **signals are advisory**. They are phrased as observations
for a human reviewer to look at, they never pre-fill a decision, and they never accuse anyone.

## Public surface (`index.ts`)

| Export                                                     | Purpose                                   |
| ---------------------------------------------------------- | ----------------------------------------- |
| `getTrainingRouteDefinitions`                              | Workspace, submission, and review routes. |
| `trainingPath` / `trainingSubmissionPath` / `trainingRev…` | Typed navigation targets.                 |
| `trainingQueryKeys`                                        | Team-scoped cache key builders.           |
| `activityTypeListResponseSchema`                           | Exact activity-type catalog DTO.          |
| `submissionDetailResponseSchema` / `submissionListRespo…`  | Exact submission DTOs.                    |
| `evidenceListResponseSchema` / `buddyListResponseSchema`   | Exact evidence + buddy DTOs.              |
| `reviewQueueResponseSchema` / `reviewDetailResponseSchema` | Exact reviewer-projection DTOs.           |
| `SUBMISSION_STATUS` / `EVIDENCE_KIND` / `REVIEW_DECISION`  | App vocabularies (as-const).              |
| `ActivityType` / `TrainingSubmissionDetail` / `ReviewSub…` | App-owned domain types.                   |

## Anatomy

```text
constants/training-api.constants.ts     team-scoped activity, submission, evidence, review paths
constants/training.constants.ts         vocabularies, i18n label maps, tones, backend limits
constants/training-form.constants.ts    composer + evidence form state shapes and their empties
schemas/activity.schema.ts              exact activity, submission, evidence, buddy, review DTOs
mappers/activity.mapper.ts              wire DTO -> app domain (candidate value carried through)
gateways/training.gateway.ts            exact authenticated activity calls (React-free)
services/*.service.ts                   one use case each, AppError-normalized
queries/training.keys.ts                stable team-scoped cache keys
queries/training.query.ts               query option builders, gated on a resolved team id
hooks/use-training-context.hook.ts      team scope + effective grants + connectivity
hooks/use-training-composer.hook.ts     composer state, validation, evidence + buddy editors
hooks/use-training-workspace.hook.ts    member workspace view model
hooks/use-training-detail.hook.ts       one claim: facts, evidence, buddies, history, actions
hooks/use-submission-workflow.hook.ts   confirm-then-transition wiring for submit / withdraw
hooks/use-training-review.hook.ts       reviewer queue + decision panel view model
mutations/*.hook.ts                     create, transition, and decide, each with its version token
helpers/*.helper.ts                     pure view-model builders, validation, and status resolution
components/**                           UI-only presentational components
containers/*.container.tsx              screen composition (hook -> view)
routes/training.routes.ts               permission-guarded, nav-registered route definitions
```

## Screens

| Route                     | Screen             | Permission           |
| ------------------------- | ------------------ | -------------------- |
| `/training`               | Member workspace   | `activity.read.self` |
| `/training/:submissionId` | One claim's detail | `activity.read.self` |
| `/training-review`        | Reviewer queue     | `activity.review`    |

The reviewer queue deliberately lives on its own top-level path rather than under `/training/`, so
the `:submissionId` pattern can never shadow it.

## Buddy confirmations

The workspace carries a badge-counted "Buddy confirmations" section (`my-activity-buddies`):
teammates' claims that name the caller, each with an explicit confirm/decline pair. Both routes are
self-scoped (`activity.read.self` / `activity.submit.self`); a response invalidates the buddy
list, the caller's submissions, and the points family, because a confirmation can change a claim's
points outcome. Answered credits render a status chip with the responded instant; the empty state
says so honestly.

## Evidence handling

Only **metadata** travels through this client: the kind, the opaque storage reference, and an
optional description. Raw bytes are never read into memory, never persisted in web storage, and
never included in a submission body — the composer says so explicitly under the field, and the
detail screen repeats it above the attached list. Scan status is displayed as the backend reports
it (`pending` / `clean` / `infected` / `failed`), never inferred.

## Workflow

`draft → submitted → under_review → (approved | rejected | changes_requested)`, with `withdrawn`
reachable from the queue and `reversed` reachable after approval. Submit doubles as the resubmit
path once changes were requested — the same endpoint, the same optimistic version token. Every
mutation carries `expectedRecordVersion`, so a claim someone else moved fails loudly with a 409
instead of silently overwriting the other decision.

Self-review is refused: the decision panel replaces its buttons with a plain statement when the
signed-in principal owns the claim, and the backend refuses the call regardless.

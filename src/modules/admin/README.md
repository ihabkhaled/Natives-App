# Admin module

The administration surface (prompt 814): a permission-filtered hub plus five screens — team
settings, role assignment, versioned rule governance, the operations centre, and the platform
super-admin panel. Everything here is backed by the published contract (synced at 1.4.0, which
carries the 1.3.0 typed-settings union); see
[`docs/api-verification.md`](../../../docs/api-verification.md).

## Public surface (`index.ts`)

| Export                                                              | Purpose                                          |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| `getAdminRouteDefinitions`                                          | The hub and its five screens, with route meta.   |
| `adminPath` / `adminSettingsPath` / `adminRolesPath` / …            | Typed path builders for each screen.             |
| `adminQueryKeys`                                                    | The admin cache branch.                          |
| `settings*` / `rule*` / `operations*` schemas                       | Wire contracts, also used by the contract tests. |
| `SETTING_KEYS`, `RULE_STATUSES`, `RULE_TRANSITIONS`, `ADMIN_LIMITS` | Domain vocabulary and bounded-page sizes.        |

## Screens

| Route               | What it owns                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/admin`            | Hub. One card per surface the principal may actually open.                                                              |
| `/admin/settings`   | Readable effective snapshot, diffed version history with cancel, typed per-key editors (P2), seasons, venues, catalogs. |
| `/admin/roles`      | RBAC assignment bounded by the server's `assignableRoles`.                                                              |
| `/admin/rules`      | Points and calculation rule versions: DRAFT → APPROVED → PUBLISHED → RETIRED.                                           |
| `/admin/operations` | Outbox health, dead letters, heartbeat-derived job health, audit log.                                                   |
| `/admin/platform`   | Platform super-admin roster: audited promote and last-admin-guarded revoke.                                             |

## Anatomy

```text
constants/    setting keys + per-key value vocabulary/bounds, rule lifecycle, catalogs, API paths
schemas/      Zod contracts: per-key setting values (mirror of the backend policy), rules, operations
mappers/      DTO -> domain; valid values parse per key, legacy documents stay behind a wrapper
gateways/     one request function per endpoint, grouped by resource
services/     one use case per file (incl. the future-only setting-version cancel)
queries/      stable keys + query option builders (incl. the as-of settings snapshot)
hooks/        context, per-screen view models, the typed setting form and its sub-hooks
helpers/      row builders, summaries, stable-key diffs, history assembly, draft factories
components/   UI-only screens on the shared kit + the 8 typed setting editors and history
containers/   the six routed screens
routes/       typed paths + route definitions
```

## Invariants

- **The hub cannot advertise a screen the guard would refuse.** `hub-cards.helper.ts` filters each
  card on the same grant its route carries, so a card is either openable or absent.
- **Role assignment cannot escalate.** Only the server's `assignableRoles` — the acting principal's
  privilege ceiling — are rendered. A role the member holds but the actor may not grant is not shown
  as a disabled control; it is absent, because the server would reject it.
- **An audited change needs a reason.** Both write forms (setting version, role assignment) block
  locally on a missing reason rather than sending a command the server would refuse.
- **A setting value is typed, or it is not sent.** Each key's editor emits a document the per-key
  schema (the backend policy's mirror) accepts; the raw-JSON disclosure exists only for platform
  administrators and validates through the same schema. `effectiveFrom` is edited as Africa/Cairo
  wall time and always leaves as a strict-UTC `Z` instant; creates carry `expectedHeadVersionId`,
  and a stale 409 refreshes the history for re-confirmation instead of overwriting.
- **Legacy is shown, never served.** A pre-validation stored document renders read-only with a
  guided "replace with a valid configuration" flow; the snapshot resolves it to null, and snapshot
  `issues[]` (e.g. a counting status without a weight) render as warnings, not silence.
- **Activation needs a preview.** `publish` stays disabled until a simulation has been seen
  (`SIMULATION_REQUIRED_TRANSITIONS`), and the screen says why. Every transition sends
  `expectedRecordVersion`, so a stale view loses the optimistic-concurrency check.
- **Nothing that could be a payload reaches the client.** The dead-letter DTO has no payload field at
  all; replay addresses an event by id. The audit diff is reduced to a changed-field count in the
  mapper, so no changed value exists in a view model to be rendered.
- **`null` is never coerced to zero.** An unscored point entry renders "Not scored"; a simulation
  with no published baseline renders "No baseline", not a zero delta.
- **Super Admin is granted here or nowhere.** The platform panel is gated on the GLOBAL
  `platform.admin` grant, every write demands a confirm plus an audited reason, and the backend
  refuses to remove the last super administrator (409 `errors.rbac.lastSuperAdmin`) — surfaced as
  dedicated privilege copy.
- Every route sits behind the `admin-console` feature flag and carries the grant its screen needs as
  route metadata — never a role-name check. Navigation is convenience only; the backend re-authorizes
  every operation regardless of what the shell shows.
- Governance, jerseys, private imports, and reports are **not built** — no route, no mock, no card.
  See _Gap 7_ in `docs/api-verification.md`.

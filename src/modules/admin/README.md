# Admin module

The administration surface (prompt 814): a permission-filtered hub plus four screens — team
settings, role assignment, versioned rule governance, and the operations centre. Everything here is
backed by the published contract except two operations panels, which are recorded as backend-pending
in [`docs/api-verification.md`](../../../docs/api-verification.md).

## Public surface (`index.ts`)

| Export                                                              | Purpose                                          |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| `getAdminRouteDefinitions`                                          | The hub and its four screens, with route meta.   |
| `adminPath` / `adminSettingsPath` / `adminRolesPath` / …            | Typed path builders for each screen.             |
| `adminQueryKeys`                                                    | The admin cache branch.                          |
| `settings*` / `rule*` / `operations*` schemas                       | Wire contracts, also used by the contract tests. |
| `SETTING_KEYS`, `RULE_STATUSES`, `RULE_TRANSITIONS`, `ADMIN_LIMITS` | Domain vocabulary and bounded-page sizes.        |

## Screens

| Route               | What it owns                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `/admin`            | Hub. One card per surface the principal may actually open.                                   |
| `/admin/settings`   | Effective snapshot, version history, effective-dated change form, seasons, venues, catalogs. |
| `/admin/roles`      | RBAC assignment bounded by the server's `assignableRoles`.                                   |
| `/admin/rules`      | Points and calculation rule versions: DRAFT → APPROVED → PUBLISHED → RETIRED.                |
| `/admin/operations` | Outbox health, dead letters, job health, audit log.                                          |

## Anatomy

```text
constants/    setting keys, rule lifecycle, catalogs, API paths, label and tone maps
schemas/      Zod contracts for settings, rules, and operations
mappers/      DTO -> domain; the audit diff is reduced to a field count here
gateways/     one request function per endpoint, grouped by resource
services/     one use case per file
queries/      stable keys + query option builders
hooks/        context, per-screen view models, and the two draft forms
helpers/      row builders, lifecycle rules, hub cards, setting-value parsing
components/   UI-only screens on the shared kit (WorkspaceScreen, ListScreen, RecordList)
containers/   the five routed screens
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
- **Activation needs a preview.** `publish` stays disabled until a simulation has been seen
  (`SIMULATION_REQUIRED_TRANSITIONS`), and the screen says why. Every transition sends
  `expectedRecordVersion`, so a stale view loses the optimistic-concurrency check.
- **Nothing that could be a payload reaches the client.** The dead-letter DTO has no payload field at
  all; replay addresses an event by id. The audit diff is reduced to a changed-field count in the
  mapper, so no changed value exists in a view model to be rendered.
- **`null` is never coerced to zero.** An unscored point entry renders "Not scored"; a simulation
  with no published baseline renders "No baseline", not a zero delta.
- **Backend-pending panels say so.** The dead-letter listing and job health run on MSW handlers and
  carry a visible pending notice; they are never presented as live.
- Every route sits behind the `admin-console` feature flag and carries the grant its screen needs as
  route metadata — never a role-name check. Navigation is convenience only; the backend re-authorizes
  every operation regardless of what the shell shows.
- Governance, jerseys, private imports, and reports are **not built** — no route, no mock, no card.
  See _Gap 7_ in `docs/api-verification.md`.

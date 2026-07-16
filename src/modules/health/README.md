# Health module

The smallest complete vertical slice: one `GET /health` endpoint carried through every layer.
Use it as the copy-paste reference for a new module.

## Public surface (`index.ts`)

| Export                 | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `HealthCardContainer`  | Embeddable health card (used by home).          |
| `healthQueryKeys`      | Query-key builder for cache invalidation.       |
| `healthResponseSchema` | Wire contract, shared by remote and mock modes. |
| `HealthStatus`         | App-owned domain type.                          |

## Anatomy

```text
constants/health-api.constants.ts   endpoint path
schemas/health.schema.ts            wire contract (Zod)
mappers/health.mapper.ts            DTO → HealthStatus (pure, 100% covered)
gateways/health.gateway.ts          HTTP call through @/packages/http
services/get-health.service.ts      use case; HttpError → AppError
queries/health.keys.ts|.query.ts    key builder + query options
hooks/use-health-query.hook.ts      query hook
hooks/use-health-card.hook.ts       translated view model
components/health-status-card/      UI-only
containers/health-card.container.tsx composition
```

## Invariants

- `/health` is public: the gateway sets `skipAuth`.
- The component renders a prepared view model; dates are formatted by `@/packages/date`.
- Errors reach the UI as translated copy from the error code, never as raw messages.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [health wire contract](../../../tests/contract/health.contract.test.ts).

## Related

- Skill: [new-feature-module](../../../skills/new-feature-module.md).
- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md).

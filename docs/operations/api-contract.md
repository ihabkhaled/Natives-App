# API contract workflow

The backend owns `contracts/openapi.json` and `contracts/openapi.sha256`. The frontend commits the
same bytes so each repository can build independently.

## Coordinated update

1. In `Natives-Backend`, run `npm run contract:generate`, contract tests, then
   `npm run contract:check`.
2. Review the compatibility report and coordinate breaking endpoint/schema changes.
3. In `Natives-App`, run `npm run contract:sync`.
4. Update runtime Zod schemas, gateways, mocks, and contract tests until they agree with generated
   types.
5. Run `npm run contract:check`, `npm run test:contract`, typecheck, coverage, and the full release
   gates in both repositories.

`contract:check` is read-only. In a standalone frontend checkout it verifies the committed checksum
and generated declarations. In the shared workspace it additionally rejects a checksum that differs
from the sibling backend.

## Compatibility and rollback

Added operations/schemas are additive. Deprecations require a migration window. Removing or changing
an existing operation/schema is treated conservatively as breaking and requires a versioned or
coordinated rollout.

Rollback consumers first, restore the last accepted frontend artifact/checksum, then roll back the
backend. Never regenerate frontend types from an uncommitted or runtime-fetched Swagger document.

# API contract owner

`contracts/openapi.json` and its SHA-256 sidecar are copied byte-for-byte from the backend contract
with `npm run contract:sync`. `openapi-typescript` generates the private declarations under
`generated/`; feature modules consume only the curated types exported from this package.

Runtime Zod schemas remain mandatory at every HTTP boundary. Generated TypeScript proves compile-time
agreement but cannot validate a hostile or incompatible response at runtime.

Use `npm run contract:check` in CI and before a coordinated release. It verifies the checksum,
compares the sibling backend when available, and rejects stale generated declarations without
rewriting files.

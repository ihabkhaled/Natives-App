# ADR 0017: Canonical OpenAPI contract

- Status: Accepted
- Date: 2026-07-18
- Deciders: Architecture and API owners

## Context

ADR 0007 intentionally kept handwritten gateways and ADR 0013 required handwritten Zod validators
because the backend did not publish a stable artifact. That condition is no longer true. The
backend now emits deterministic OpenAPI bytes and a SHA-256 sidecar, while independent repository
histories still require an explicit handoff rather than a build-time sibling dependency.

## Decision

The backend artifact is copied byte-for-byte into `contracts/` with `npm run contract:sync`.
`openapi-typescript` generates immutable declarations under
`src/packages/api-contract/generated/`. Feature code imports only curated types from
`@/packages/api-contract`; generator internals never become a module dependency.

`npm run contract:check` validates the checksum, compares a sibling backend when one is present,
and uses the generator's read-only check mode. CI runs the same command. Generated declarations are
explicitly excluded from style, coverage, filename-internal, and dead-export analysis because they
are deterministic declarative output; the checksum, compile gate, and contract tests own them.

Zod parsing remains mandatory in `@/packages/http`. TypeScript declarations disappear at runtime
and cannot replace trust-boundary validation or sanitized error normalization.

## Consequences

**Positive:** Gateway request types and runtime schemas are checked against one backend-owned source;
class-name collisions and auth response drift fail before release.

**Negative:** A coordinated backend change requires synchronizing two committed artifacts. The
frontend contract cannot update itself in an isolated checkout, and conservative breaking changes
still require human review and rollout planning.

## Alternatives considered

- Generate directly from a running backend: rejected because builds would require network and
  database availability.
- Share a cross-repository package: rejected because it couples release histories.
- Remove Zod after generation: rejected because generated types provide no runtime protection.

## Supersession

Revisit when a trusted artifact registry can publish signed, versioned contracts to both
repositories without coupling their builds. ADRs 0007, 0013, and 0016 remain active but their
handwritten-contract caveats are amended by this record.

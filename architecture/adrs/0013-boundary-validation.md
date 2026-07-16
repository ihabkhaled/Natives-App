# ADR 0013: Boundary validation

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

TypeScript types are erased at runtime, so every `as` on incoming data is a promise the compiler
cannot keep. Four boundaries in this app carry data the code did not create: the HTTP response, the
`.env`-derived configuration, the persisted preferences payload, and deep-link URLs. Each has a
distinct failure mode. A renamed backend field surfaces as `undefined` three layers away from its
cause. A missing env var yields an app that boots and misbehaves. A persisted payload from an older
build crashes startup. A hostile deep link is an unvalidated navigation.

## Decision

Nothing untyped crosses a boundary without being parsed. Zod is owned exclusively by
`src/packages/schema`, which exposes `schemaBuilder` and `safeParseWithSchema` returning a
discriminated `SchemaParseResult` — the vendor's error type never escapes the owner.

Each boundary parses, and each chooses its failure mode deliberately:

- **HTTP responses** — every `AxiosHttpClient` method parses through `parse-response.helper.ts`.
  A violation throws `HttpError` with kind `response-contract`, naming the offending path.
- **Environment** — `src/packages/environment/environment.schema.ts` validates every `VITE_*` value
  (URL shape, reverse-domain app id, positive integer timeout, CSV locale list) and
  `environment.factory.ts` **throws at startup**. A misconfigured app must not boot.
- **Persisted state** — `settings.migrations.ts` parses against `settings.schema.ts` and returns
  defaults on failure. Startup must not die because of stale disk contents.
- **Deep links** — `src/platform/deep-links/deep-link.parser.ts` returns a `Result`, not an
  exception, and rejects anything outside the allowlist by scheme, host, or path prefix.
- **Forms** — schemas in `schemas/*.schema.ts` feed React Hook Form through
  `standardSchemaResolver`; their messages are i18n **keys**, translated by the hook.

The pattern is intentional: parse at the edge, hand pure domain types inward.

## Consequences

**Positive:** A wire, config, or disk drift fails at its boundary with the offending field named,
not as a mystery `undefined` in a component. Each boundary's response to bad data is a written
decision rather than an accident.

**Negative / cost:** Every endpoint and persisted shape needs a schema written and kept in sync by
hand — schemas are hand-authored, so they can drift from the backend until a contract test catches
it. Parsing costs runtime work on every response. Throwing on bad env is unforgiving during setup.

**Enforcement:** the registry pins `zod` to `@/packages/schema`;
`architecture/no-import-meta-env-outside-environment`,
`architecture/no-process-env-outside-tooling`,
`architecture/no-raw-vendor-types-in-domain`; 100% coverage on `*.schema.ts` and `*.parser.ts`
under the pure-file policy; `npm run test:contract` proves the schemas match the wire.

## Alternatives considered

- Trusting types with `as` casts — rejected: it is a runtime lie with a compile-time face.
- Validating in development only — rejected: production is where unexpected payloads arrive.
- A hand-written type guard per shape — rejected: unmaintainable, and it drifts from the type it
  claims to guard.

## Supersession

Revisit if a generated client (ADR 0007's supersession path) produces validators from a published
contract; the four boundaries would remain, only their schema authorship would change.

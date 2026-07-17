# Skill: Integrate a NestJS DTO

**Use when:** a backend payload must become an app domain type — new endpoint, or a contract change.

## Required reading

- [ADR 0013 — Boundary validation](../architecture/adrs/0013-boundary-validation.md) — every
  untrusted boundary is parsed at the edge.
- [docs/api/nest-error-contract](../docs/api/nest-error-contract.md) — the failure envelope the
  owner already understands.
- [api-error.schema.ts](../src/packages/http/schemas/api-error.schema.ts) —
  `nestErrorEnvelopeSchema` and the RFC 9457 fallback.
- [health.schema.ts](../src/modules/health/schemas/health.schema.ts) plus
  [health.mapper.ts](../src/modules/health/mappers/health.mapper.ts) — wire shape and the
  translation into domain vocabulary.

## Preconditions

- [ ] You have the authoritative shape, not a guess — an OpenAPI document, the Nest DTO class, or a
      captured response.
- [ ] You know which fields are genuinely optional on the wire versus merely absent in one sample.
- [ ] The domain type is designed independently of the DTO. They are allowed to disagree; that is
      the point of the mapper.

## Files

```text
src/modules/<module>/schemas/<module>.schema.ts   the wire contract
src/modules/<module>/types/<module>.types.ts      the domain type
src/modules/<module>/mappers/<module>.mapper.ts   DTO → domain
```

## Steps

1. **Schema mirrors the wire, exactly.** `healthResponseSchema` declares
   `status: union([literal('ok'), literal('error')])`, `version: string().min(1)`,
   `timestamp: iso.datetime({ offset: true })`. Build it from `schemaBuilder` (`@/packages/schema`)
   — importing `zod` directly fails `architecture/no-raw-package-imports`.
2. Be strict where the backend is strict. A union of literals is worth far more than `string()`: the
   health gateway test proves a `'degraded'` status rejects, so a backend change surfaces as a test
   failure instead of a silent `isHealthy: false`.
3. Model optionality honestly. `nestErrorEnvelopeSchema` marks `code`, `message`, `errors`, `path`,
   `timestamp` and `requestId` `.optional()` because the envelope really varies; do not copy that
   looseness into a resource schema.
4. **Domain type is app vocabulary.** `HealthStatus` is `{ isHealthy, version, checkedAtIso }` — not
   `{ status, version, timestamp }`. It carries `readonly` fields and no vendor types
   (`architecture/no-raw-vendor-types-in-domain`).
5. **Mapper does the translation.**
   `mapHealthResponseToStatus(dto: SchemaOutput<typeof healthResponseSchema>): HealthStatus` turns
   `status === 'ok'` into a boolean and renames `timestamp` to `checkedAtIso`. Derive the DTO type
   from the schema with `SchemaOutput`; never hand-write a parallel interface that can drift.
6. Keep the mapper pure — no clock, no I/O, no React (`architecture/no-react-in-pure-layers`). Any
   default belongs here, explicitly, not as a schema `.default()` that hides a missing field.
7. When the backend adds a field, extend the schema first; nothing downstream changes until the
   mapper and domain type opt in. That ordering is what keeps a wire change from rippling.
8. For a **contract change** to an existing DTO, update the schema, then MSW's payload in
   `src/tests/msw/mock-data.constants.ts`, then run the contract suite — it fails loudly if mock
   mode and the schema disagree, which is exactly its job (ADR 0016).

## Tests

- `<module>.schema.test.ts` — a pure file at **100%**. Prove a valid payload parses and each
  constraint rejects: unknown enum member, empty string, non-ISO timestamp.
- `<module>.mapper.test.ts` — also **100%**. Prove both sides of every branch:
  `mapHealthResponseToStatus` has an `'ok'` case and an `'error'` case, and both are tested.
- `tests/contract/<module>.contract.test.ts` —
  `safeParseWithSchema(<module>Schema, await response.json())` against the live mock. See
  [contract-test](contract-test.md).
- Run: `npx vitest run --project unit src/modules/<module>/schemas src/modules/<module>/mappers`.

## Security / accessibility / native considerations

- The schema is a trust boundary: it is what stops a compromised or buggy backend from injecting an
  unexpected shape into the app. Weakening it to `z.any()` removes the defense entirely.
- Never model a token field into a domain type — tokens stop at the auth mapper and go to
  [secure-storage](secure-storage.md).
- Error payloads are parsed by the owner, not by modules; do not re-parse `message` to show it.

## Documentation delta

- `context/api-flow.md` — the payload's journey.
- `docs/api/nest-error-contract.md` when the envelope itself changes.
- The module README's anatomy line for the schema and mapper.

## Validation

```bash
npx vitest run --project unit src/modules/<module>/schemas src/modules/<module>/mappers
npm run test:contract
npm run test:coverage:per-file
npm run typecheck
```

## Forbidden shortcuts

- `as` casting the response instead of parsing — `typescript-eslint` strictness plus ADR 0013; a
  cast is a lie the compiler cannot check.
- Using the DTO as the domain type so "no mapper is needed" — the wire then dictates the UI's
  vocabulary, and every backend rename becomes a UI change.
- `import { z } from 'zod'` — `architecture/no-raw-package-imports`; `schemaBuilder` is the owner.
- Declaring the DTO interface by hand next to the schema — `SchemaOutput<typeof schema>` cannot
  drift.

## Definition of done

- [ ] The schema mirrors the wire, including optionality and literal unions.
- [ ] The domain type is app vocabulary with `readonly` fields and no vendor types.
- [ ] The mapper is pure and covers every branch at 100%.
- [ ] Mock data matches the schema and the contract test passes.
- [ ] `npm run typecheck` and `npm run test:contract` pass.

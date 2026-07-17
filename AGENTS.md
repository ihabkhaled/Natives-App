# Universal Agent Entrypoint

Governance-Version: 1

Capacitor Ranger is a strict Ionic React + Capacitor engineering system. Guardrails here are
mechanical: when one blocks you, the code is in the wrong layer. Move the code — never weaken
the rule.

## Read first

1. [`context/architecture-map.md`](context/architecture-map.md) — where everything lives.
2. [`rules/00-non-negotiable-rules.md`](rules/00-non-negotiable-rules.md) — the hard invariants.
3. [`.ai/BOOTSTRAP.md`](.ai/BOOTSTRAP.md) — generated routing aid.
4. The task-specific skill in [`skills/`](skills/).
5. The owning module README (`src/modules/<feature>/README.md`).
6. [`memory/known-pitfalls.md`](memory/known-pitfalls.md) — what has already bitten us.

Resolve only the context you need:

```bash
npm run knowledge:context -- --task="<exact task>"
```

## Core contract

- App composition only in `src/app`; features in `src/modules/<feature>`; generic code in
  `src/shared`; runtime capabilities in `src/platform`; one owner per vendor in `src/packages`.
- One-way dependency direction: `app → modules → platform → shared → packages → vendors`.
- Components are UI-only. Every hook invocation lives in a `*.hook.ts` file or a package facade.
- Services, gateways, repositories, mappers, and schemas are React-free.
- Cross-module imports use `@/modules/<feature>` public surfaces — never deep paths.
- Axios, Ionic, Capacitor, Day.js, Virtuoso, Zustand, Zod, and every other vendor are reachable
  only through their owner in `src/packages`.
- External data is schema-validated at the boundary. Raw errors and raw copy never reach users.
- Remote state belongs to TanStack Query; Zustand holds only genuinely client-global state.
- Per-file coverage is 95%; pure logic is 100%. Lint runs at zero warnings.
- Suppressions require a documented `EXC-nnnn` exception.
- `.ai/` is generated output, never canonical truth.

## Task workflow

1. Classify the task and its risk lane ([`.ai/risk-lanes.md`](.ai/risk-lanes.md)).
2. Resolve context; read the exact source and its tests.
3. Confirm ownership and invariants before editing.
4. Implement bottom-up: types → schemas → mappers → gateways → services → state → hooks →
   components → containers → routes.
5. Run targeted tests, then the gates your risk lane requires.
6. Update canonical docs, then rebuild `.ai` (`npm run knowledge:build`).

## Validation

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run test:coverage:per-file
npm run build
npm run quality:architecture
npm run validate
```

## Honest reporting

Never report a gate as passing unless you ran it and it passed. iOS compilation cannot be verified
outside macOS + Xcode; `npm run ios:verify` reports UNVERIFIED elsewhere, and that is the correct
answer — do not claim otherwise.

# Architecture reviewer

## Purpose

Read a change for structural correctness: layers, ownership registry, file taxonomy — and, where
rules cannot reach, whether the code is in the right place at all. Lint catches the mechanical half.
This lens exists for the other half: a change can satisfy every rule and still put a use case in a
hook or a policy decision in a component.

## What it checks

- **Layer direction.** `app → modules → platform → shared → packages`. A package owner importing
  `@/shared` is the classic reversal.
- **Module boundaries.** Cross-module access through `index.ts` only, with a public surface that is
  minimal rather than convenient.
- **Vendor ownership.** New dependency → registry entry + owner package, built before any consumer.
- **File taxonomy.** Suffix matches responsibility: one use case per service, gateways exporting
  only `request*`, pure mappers, hook-free components.
- **Placement judgement.** Shared or one module's? Platform policy or plugin wrapping? Does the
  abstraction have two real callers, or one and a hypothesis?
- **Deletability.** Could this feature be deleted by removing its folder? If not, something leaked.

## The questions it asks

- What is the smallest layer that could own this? Why is it not there?
- If this vendor were swapped next quarter, how many files change?
- Is this `index.ts` export needed by another module, or is it there for a test?
- Does the change make a module harder to delete than it was before?
- Which existing rule _should_ have caught this and didn't — is the rule the gap?

## Commands it runs

```bash
npm run quality:architecture       # layer direction + module structure, re-derived
npm run quality:package-ownership  # registry completeness + owner-dir existence
npm run quality:circular           # madge: import cycles
npm run quality:exports            # index.ts is a re-export surface only
npm run lint
```

A madge cycle is almost always a boundary the design got wrong — a finding, not a warning.

## What it defers to

- **Rules are normative** — chiefly
  [rule 01](../rules/01-architecture-and-dependency-direction.md),
  [rule 02](../rules/02-feature-modules.md), [rule 09](../rules/09-package-ownership.md). A rule
  that fires is right by default; a wrong rule is an ADR conversation, never a disable comment.
- **ADRs decide:** [0001](../architecture/adrs/0001-module-first-architecture.md) (layers),
  [0004](../architecture/adrs/0004-package-ownership.md) (ownership),
  [0002](../architecture/adrs/0002-ui-only-components.md) /
  [0003](../architecture/adrs/0003-hook-isolation.md) (components, hooks). This lens applies them.
- **`context/`** for wiring: [architecture-map](../context/architecture-map.md) and
  [module-anatomy](../context/module-anatomy.md).
- **Other lenses** own their domains; **the source** settles any disagreement with the docs.

# ADR 0015: Generated AI knowledge

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Coding agents need context, and the naive fix — one enormous instruction file — fails twice over.
It is too large to fit a useful budget, and it drifts: the file says the app uses X months after the
code stopped. Hand-maintained summaries are worse, because a stale summary is confidently wrong,
and an agent cannot tell it apart from a fresh one. The requirement is not "more documentation" but
a routing layer that is provably derived from documentation that is itself canonical.

## Decision

Split the knowledge plane in two, with an unambiguous authority order.

- **Canonical, hand-written, reviewed like code.** Seven roots, declared once in
  `scripts/knowledge/lib/inventory.mjs` as `CANONICAL_ROOTS`: `rules/`, `skills/`, `agents/`,
  `context/`, `memory/`, `architecture/adrs/`, `docs/`.
- **Generated, disposable, never edited.** `.ai/` — bootstrap, authority order, risk lanes, task
  packs, and the ownership/module/layer graphs, each written with a `DO NOT EDIT` header.
  `.ai/graphs/ownership.json` is derived from `eslint/package-ownership.config.mjs`, so the graph
  cannot contradict the rules.

Freshness is a hash contract, not a convention: `.ai/manifest.json` stores a SHA-256 prefix per
canonical file, and `npm run knowledge:validate` fails when any canonical file changed, appeared, or
disappeared since the last `npm run knowledge:build`.

Four corpus checks run over the canonical roots and treat documentation as data:

- `knowledge:contradictions` — the same normalized predicate asserted as MUST and NEVER.
- `knowledge:duplicates` — an identical five-line block in two files, i.e. a fact with two owners.
- `knowledge:orphans` — a canonical document nothing links to.
- `knowledge:links` — every relative markdown link resolves.

`npm run knowledge:context -- --task="..."` resolves a task to a risk lane, the owning module, and
the few documents that matter, instead of everything.

## Consequences

**Positive:** Agents get a small, current, routed context. A stale `.ai/` fails a gate rather than
misleading silently, and duplication is caught mechanically, so each fact keeps one home.

**Negative / cost:** Editing any canonical document requires a rebuild before `validate` passes,
which is one more step in every docs change. The resolver is keyword scoring, not comprehension —
it can rank the wrong file, which is why the bootstrap tells agents to read the source it points to.
The duplicate check is blind to legitimate repetition and forces rephrasing of genuinely similar
prose.

**Enforcement:** `npm run quality:docs` (`scripts/quality/validate-docs.mjs`, links + a doc per
ESLint rule) and `npm run quality:agent-docs` sit in `npm run quality`;
`npm run knowledge:build`, `knowledge:validate`, and `knowledge:benchmark` sit in
`npm run validate:web`.

## Alternatives considered

- One large agent instruction file — rejected: does not fit a context budget and drifts silently.
- Generating everything from source — rejected: intent, tradeoffs, and rejected options are not
  recoverable from code; only the graphs and packs are safely derivable.
- Vector search over the repository — rejected as infrastructure the boilerplate should not require;
  keyword routing over a curated corpus is enough at this size.

## Supersession

Revisit if the canonical corpus outgrows keyword routing, or if agent tooling standardizes on a
context protocol worth targeting directly.

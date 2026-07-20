# Claude Code subagents — Natives-App

This directory holds the **runnable** Claude Code subagent definitions for this repository (valid
YAML frontmatter + system prompt, auto-discovered by Claude Code from `.claude/agents/`). Several
implement/extend the narrative review lenses that already lived in [`/agents/`](../../agents/README.md);
that folder remains valid deeper reference material. Use `/agents/` to understand a lens in depth; use
these files to actually delegate work.

Claude Code selects a subagent either automatically (matching your request against each
`description:`) or when you name one explicitly ("use the accessibility-reviewer on this screen").

## Roster (13 subagents)

| Subagent                                                            | Category       | Model  | Mission                                                                            |
| ------------------------------------------------------------------- | -------------- | ------ | ---------------------------------------------------------------------------------- |
| [frontend-planner](./frontend-planner.md)                           | Planning       | opus   | Turn a request into a scoped, layer-ordered delivery plan before code is touched   |
| [frontend-architect](./frontend-architect.md)                       | Architecture   | opus   | Layer/module/vendor-ownership placement authority; applies pure structural fixes   |
| [frontend-implementer](./frontend-implementer.md)                   | Implementation | sonnet | Write Ionic React + Capacitor code test-first for an already-scoped change         |
| [frontend-test-engineer](./frontend-test-engineer.md)               | Testing        | sonnet | Own per-file coverage; unit/integration/contract/E2E/a11y tests at the right layer |
| [frontend-debugger](./frontend-debugger.md)                         | Debugging      | opus   | Reproduce, isolate, and root-cause a failure before proposing a fix                |
| [frontend-code-reviewer](./frontend-code-reviewer.md)               | Code Review    | opus   | Consolidated final correctness gate — APPROVE / REQUEST CHANGES                    |
| [frontend-security-reviewer](./frontend-security-reviewer.md)       | Security       | opus   | Tokens/deep-links/external URLs/logs/error-copy gate — PASS / BLOCK                |
| [accessibility-reviewer](./accessibility-reviewer.md)               | Code Review    | opus   | Focus, announcements, RTL, contrast, targets beyond automated axe                  |
| [native-reviewer](./native-reviewer.md)                             | Code Review    | opus   | Capacitor plugin ownership, listener lifetimes, native config, sync drift          |
| [performance-reviewer](./performance-reviewer.md)                   | Code Review    | opus   | Bundle, startup, list rendering, render churn, query policy                        |
| [api-contract-reviewer](./api-contract-reviewer.md)                 | Code Review    | opus   | Backend ↔ Zod schema ↔ MSW mock agreement                                          |
| [frontend-release-gatekeeper](./frontend-release-gatekeeper.md)     | Code Review    | opus   | Final GO/NO-GO before commit, push, merge, web deploy, or native build             |
| [frontend-documentation-writer](./frontend-documentation-writer.md) | Documentation  | sonnet | Keep module READMEs, ADRs, context maps, and memory current with behavior          |

## Model assignment rule

- **opus** — architecture, planning, debugging, and every review/gate agent (correctness matters more
  than speed; these issue verdicts that block merges).
- **sonnet** — implementation, testing, and documentation (routine, well-specified execution work).
- Fable is never used for a subagent in this repository.

## Tool / permission model

Every agent's `tools:` frontmatter is least-privilege for its job:

- **Review/gate agents** (`frontend-code-reviewer`, `frontend-security-reviewer`,
  `accessibility-reviewer`, `native-reviewer`, `performance-reviewer`, `api-contract-reviewer`,
  `frontend-release-gatekeeper`) get `Read, Grep, Glob, Bash` only — they can read code and run gate
  commands, but cannot edit files. They report findings and a verdict; they don't fix them.
- **Design/build/fix agents** (`frontend-planner`, `frontend-architect`, `frontend-implementer`,
  `frontend-test-engineer`, `frontend-debugger`, `frontend-documentation-writer`) get
  `Read, Grep, Glob, Edit, Write, Bash` — they produce the actual change.

No subagent has the `Agent`/Task-spawning tool — none of them recursively delegate.

## Non-overlapping responsibilities

- `frontend-architect` decides **where** code goes (layer, module, vendor ownership) and applies pure
  structural fixes; `frontend-implementer` writes **new** behavior inside that placement. Two different
  jobs on the same files.
- `frontend-code-reviewer` is the general correctness/architecture/UI-mandate/coverage gate; the four
  specialist reviewers (`accessibility-reviewer`, `native-reviewer`, `performance-reviewer`,
  `api-contract-reviewer`) own one narrow domain each and are consulted by the code reviewer rather
  than duplicated by it; `frontend-security-reviewer` is a separate blocking gate that can veto a change
  no lint rule catches; `frontend-release-gatekeeper` owns git/native-sync hygiene and release
  readiness — a distinct final gate, not a second code review.
- `frontend-debugger` only engages for an existing failure (reproduce → root-cause → minimal fix);
  `frontend-planner` only engages before code exists (scope → build order → risk).

## Related

- [`/agents/`](../../agents/README.md) — the original review-lens docs several of these subagents
  extend.
- [`/CLAUDE.md`](../../CLAUDE.md) and [`/AGENTS.md`](../../AGENTS.md) — the canonical entrypoints; see
  `CLAUDE.md`'s "Subagents" section for when Claude should delegate to which of these.
- [`/rules/`](../../rules/README.md), [`/context/`](../../context/README.md),
  [`/skills/`](../../skills/README.md) — the canon every subagent reads before acting.

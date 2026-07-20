# Claude Agent Entrypoint

Governance-Version: 2

This file is a pointer. The canonical contract is [`AGENTS.md`](AGENTS.md) — read it first, then:

1. [`context/architecture-map.md`](context/architecture-map.md)
2. [`rules/00-non-negotiable-rules.md`](rules/00-non-negotiable-rules.md)
3. [`.ai/BOOTSTRAP.md`](.ai/BOOTSTRAP.md)
4. The task-specific skill in [`skills/`](skills/) and the owning `src/modules/<feature>/README.md`
5. [`memory/known-pitfalls.md`](memory/known-pitfalls.md)

Resolve context for the task at hand:

```bash
npm run knowledge:context -- --task="<exact task>"
```

## Hard rules

- When a rule fails, move the code. Never disable the rule.
- Components are UI-only; hooks live in `*.hook.ts` files or package facades.
- Third-party and Capacitor imports belong only to their owner in `src/packages`.
- Cross-module imports use public surfaces (`@/modules/<feature>`).
- Remote data belongs to TanStack Query; Zustand holds only client-global state.
- External data is validated; raw errors and raw user copy are forbidden.
- Tests and documentation change with behavior.
- Per-file coverage is 95% (100% for pure logic); lint runs at zero warnings.
- Suppressions need a documented `EXC-nnnn` exception.
- `.ai` is generated: update canonical knowledge, then `npm run knowledge:build`.
- UI/UX Quality Mandate: every UI must be cool, clear, vibrant, catchy and UX-perfect on web and
  mobile — responsive (desktop sidebar+navbar, mobile tab bar+drawer), polished loaders and skeletons
  for all async states, first-class dark + light mode, perfect RTL + LTR, accessible (WCAG AA),
  refined components and tasteful motion. Plain/default styling is not acceptable.
- Report only gates you actually ran. iOS compilation is UNVERIFIED off macOS.

## Subagents

This repository ships 13 runnable Claude Code subagents under
[`.claude/agents/`](.claude/agents/README.md) (auto-discovered by Claude Code; not just
documentation). Claude Code may select one automatically by matching the request against each
subagent's `description:`, or be told explicitly to use one by name. Prefer delegating to the named
subagent below over improvising the same work inline.

| Situation                                                                                                  | Delegate to                     |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| A new feature module, screen, or flow needs scoping before code is touched                                 | `frontend-planner`              |
| Deciding which layer new code belongs in, a new vendor's package owner, an import-cycle fix                | `frontend-architect`            |
| Writing new component/hook/gateway/service/store/query code for an already-scoped change                   | `frontend-implementer`          |
| Writing/extending unit, integration, contract, or E2E tests, or closing a per-file coverage gap            | `frontend-test-engineer`        |
| A test fails, a bug is reported, or UI behavior is unexpected — root-cause before fixing                   | `frontend-debugger`             |
| Final correctness/architecture/UI-mandate verdict before a change is declared done                         | `frontend-code-reviewer`        |
| Any diff touching tokens, secure storage, deep links, external URLs, error copy, or `VITE_*`/native config | `frontend-security-reviewer`    |
| A UI change needs focus/announcement/RTL/contrast/touch-target review beyond automated axe                 | `accessibility-reviewer`        |
| A Capacitor plugin, native listener, native config, or android/ios file changed                            | `native-reviewer`               |
| Bundle size, startup cost, long lists, render churn, or query-cache policy changed                         | `performance-reviewer`          |
| A gateway, Zod schema, MSW handler, or error-mapping table changed                                         | `api-contract-reviewer`         |
| Immediately before commit/push/merge/web deploy/native build — the final GO/NO-GO                          | `frontend-release-gatekeeper`   |
| Module READMEs, ADRs, context maps, or memory files need updating                                          | `frontend-documentation-writer` |

Model policy: `frontend-architect`, `frontend-planner`, `frontend-debugger`,
`frontend-code-reviewer`, `frontend-security-reviewer`, `accessibility-reviewer`, `native-reviewer`,
`performance-reviewer`, `api-contract-reviewer`, and `frontend-release-gatekeeper` run on **opus**
(architecture, planning, debugging, and every review/gate agent). `frontend-implementer`,
`frontend-test-engineer`, and `frontend-documentation-writer` run on **sonnet** (implementation,
testing, and documentation). No subagent in this repository uses Fable.

Review/gate subagents are read-only by tool grant (`Read, Grep, Glob, Bash` — no `Edit`/`Write`): they
report itemized findings and a verdict, they do not silently fix what they find. Design/build/fix
subagents carry `Edit`/`Write` and produce the actual change. See
[`.claude/agents/README.md`](.claude/agents/README.md) for the full roster and the non-overlap
rationale.

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

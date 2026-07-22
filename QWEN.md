# Qwen Agent Entrypoint

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
- CI gates before commit and push: every gate green before `git commit` AND before `git push` —
  format, lint, typecheck, contract, coverage/per-file, build, architecture/ownership/exports/
  filenames/locales/docs, static analysis, e2e, a11y, visual, security, knowledge build+validate,
  Capacitor sync, Android, iOS, and the aggregate `all-gates-green`. Fix the root cause; never
  weaken a rule, threshold, or coverage floor, skip a test, or mark a check `continue-on-error`.
  See `rules/32-ci-gates-before-commit-and-push.md`.
- Report only gates you actually ran. iOS compilation is UNVERIFIED off macOS.

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

# Review lenses

Seven specialist perspectives for reading a change. Each is a lens, not a gate: the gates are in
`package.json` and they run regardless. A lens exists for what a script cannot check — placement,
proportion, provenance, and the question nobody asked.

## The lenses

| Lens                                                  | Reads a change for                                        |
| ----------------------------------------------------- | --------------------------------------------------------- |
| [architecture-reviewer](./architecture-reviewer.md)   | Layers, ownership, taxonomy, placement, deletability      |
| [security-reviewer](./security-reviewer.md)           | Tokens, deep links, external URLs, logs, error disclosure |
| [accessibility-reviewer](./accessibility-reviewer.md) | Names, focus, announcements, RTL, contrast, targets       |
| [native-reviewer](./native-reviewer.md)               | Plugin ownership, listener lifetimes, config, sync drift  |
| [testing-reviewer](./testing-reviewer.md)             | Whether the tests would fail if the code were wrong       |
| [performance-reviewer](./performance-reviewer.md)     | Bundle, startup, list rendering, render churn             |
| [api-contract-reviewer](./api-contract-reviewer.md)   | Backend ↔ schema ↔ mock agreement                         |

## Which lens for which change

- **New feature module** — architecture, testing, accessibility.
- **New endpoint or schema** — api-contract, security, testing.
- **Auth, tokens, permissions, deep links, migrations** — security first, then api-contract and
  testing. This is the critical lane; see [release-gates](../context/release-gates.md).
- **New Capacitor plugin** — native, security, architecture.
- **New dependency** — architecture, performance, plus `memory/package-upgrade-notes.md`.
- **UI work** — accessibility, performance.

More than one lens usually applies. Where two overlap, each defers to the other's home ground —
`server.url` is native _and_ security; a leaked listener is native _and_ performance.

## The rule these lenses live under

**A lens defers to canonical sources. It never overrides one.**

The authority order is fixed: security and privacy policy, then active ADRs, then normative rules,
then public contracts, then module docs, then source and tests — and generated summaries last,
never overriding anything.

What that means in practice:

- **A rule that fires is right by default.** A lens does not grant an exception. If a rule is wrong,
  that is an ADR conversation and a rule change — never a disable comment. The codebase has exactly
  one documented disable, and it is documented.
- **A lens does not relitigate an ADR.** It applies one. Disagreeing with a boundary is a proposal
  to supersede a record, made in `architecture/adrs/`, not a review comment.
- **A lens does not invent a rule.** A finding with no basis in an ADR, a rule, or a measurable fact
  is an opinion. Opinions are allowed — labelled as such, and not blocking.
- **The source settles it.** When a lens and the code disagree about what the code does, the code
  wins and the lens's page is stale. Fix the page.

The value a lens adds is the part no script can: whether the change is in the right place, whether
its cost was noticed, and whether the failure nobody wrote a test for is the one that ships.

## Related

- [Rules](../rules/README.md) — what you must do; normative, and where a lens defers first.
- [ADR index](../architecture/adrs/README.md) — why each boundary exists.
- [Context maps](../context/README.md) — how it is wired today.
- [Memory](../memory/README.md) — what already cost someone a day.
- [ESLint rule catalogue](../docs/eslint/README.md) — the 50 mechanical rules; do not hand-report
  what lint already reports.
- `npm run knowledge:context -- --task="<exact task>"` — resolves risk lane, owning module, and the
  documents that matter for one specific task.

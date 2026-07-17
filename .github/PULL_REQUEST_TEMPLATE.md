# Summary

<!-- What changed and why. Link the issue or ADR that motivated it. -->

## Risk lane

<!-- routine | standard | critical — see .ai/risk-lanes.md -->

## Architecture

- [ ] Code sits in the correct layer; the one-way direction still holds.
- [ ] New vendors (if any) have an owner in `src/packages` and a registry entry.
- [ ] Cross-module access goes through public surfaces only.
- [ ] No new suppressions, or each carries a documented `EXC-nnnn`.

## Verification

<!-- Paste the actual commands you ran and their results. Do not list a gate you did not run. -->

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:coverage` + `npm run test:coverage:per-file`
- [ ] `npm run build`
- [ ] Risk-lane gates (integration/contract/e2e/security as applicable)

## Documentation

- [ ] Canonical docs updated (rules / ADR / module README / context).
- [ ] `npm run knowledge:build` rerun and `.ai` committed.

## Honest limitations

<!-- Anything unverified in this environment (for example iOS compilation off macOS). -->

# 31 — Review checklist

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST let the machine do the mechanical review first: if lint, typecheck, coverage, architecture,
  ownership, and docs gates are red, the change is not ready for a human.
- MUST spend the human review on the judgements no rule can make:
  - **Layer fit** — is this file in the right layer, or merely legal there? A generic name over
    feature logic passes every import rule.
  - **Surface size** — is each new module export a contract, or an internal leaking out one line at
    a time?
  - **Facade depth** — does the owner abstract the vendor, or pass its shape straight through?
  - **View-model shape** — do the props describe a view, or a domain object dragged into it?
  - **Semantics of mappings** — is a 500 really `SERVER_ERROR`, and is that i18n key the right one?
  - **Invalidation completeness** — which cached keys does this mutation actually make stale?
  - **Test value** — mutate the code in your head: which test goes red? If none, the coverage
    number is decoration.
  - **Copy and direction** — does the `ar` string mean what the `en` one means, and does the
    mirrored layout still put the primary action where a thumb lands?
  - **Threat surface** — what does this change let an attacker reach that they could not before?
- MUST require the risk lane's gates in the change description, and MUST re-review when the lane
  rises — a change that starts as a UI tweak and touches token storage is critical work now.
- MUST reject an exception, a threshold change, or an ignore entry unless the alternatives are
  written down and rejected on the record.
- MUST review the documentation diff as code: a README that no longer matches the surface is a
  defect.

## Forbidden

- NEVER approve on green gates alone: every rule in this corpus names what it cannot catch, and the
  sum of those blind spots is exactly the review's job.
- NEVER approve a change whose description does not say what it does, why, and which lane it is in.
- NEVER wave through "temporary" — a disable, a `TODO`, or a stub with no removal condition is
  permanent by default.

## Rationale

Fifty architecture rules and seventeen quality gates make a large class of mistakes impossible,
which changes what review is _for_: not brace placement or import order, but whether the code means
the right thing. The blind spots are known and enumerated — each rule's enforcement table ends by
naming them — so a reviewer's attention has a map rather than a vibe.

## Valid

```ts
// src/modules/health/hooks/use-health-card.hook.ts
// Passes review: the hook owns the decision, the component gets finished copy,
// and the error arrives as a translated code rather than a backend string.
errorMessage:
  healthQuery.error === null ? undefined : t(mapErrorCodeToI18nKey(healthQuery.error.code)),
```

## Invalid

```ts
// src/shared/helpers/session-refresh.helper.ts
// Green on every gate — and wrong on every judgement a gate cannot make:
// auth logic in shared under a generic name, reachable by any module.
export function shouldRefreshSession(status: string, expiresAt: number): boolean {
  return status === 'authenticated' && expiresAt - Date.now() < 60_000;
}
```

## Enforcement

| Mechanism                                           | Command                                              |
| --------------------------------------------------- | ---------------------------------------------------- |
| Everything mechanical, before a human looks         | `npm run quality`                                    |
| The full release chain, before a release is claimed | `npm run validate`                                   |
| The lane's gates for the change in hand             | `npm run knowledge:context -- --task="<exact task>"` |

Manual review where mechanical enforcement is impossible: this entire rule. It is the one file in
the corpus with no mechanism behind it, deliberately — it exists to name the residue that tooling
leaves, and to make ignoring that residue a visible choice rather than an oversight.

## Definition of done

- [ ] All mechanical gates for the change's risk lane are green before review starts.
- [ ] Each judgement above was considered, and the ones that applied were raised.
- [ ] Every "temporary" thing in the diff has a removal condition written down.

## Related

[00-non-negotiable-rules](00-non-negotiable-rules.md) · [30-release-gates](30-release-gates.md) ·
[29-exceptions](29-exceptions.md) · [24-documentation](24-documentation.md)

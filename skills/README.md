# Skills corpus

Task-shaped playbooks. Each one takes a single job — add a gateway, wire a plugin, prove
accessibility — and walks it end to end: what to read first, what must already be true, the exact
files, the steps bottom-up, the tests that prove it, the gates that check it, and the specific wrong
turns that job tempts.

Skills are canonical truth, and they sit below the rules in the authority order: the
[rules corpus](../rules/README.md) says what must hold, the [ADRs](../architecture/adrs/README.md)
say why the boundary exists, [context](../context/module-anatomy.md) maps how today's code connects,
and a skill says how to do the work without breaking any of it. When a skill and a rule disagree,
the rule wins and the skill is the bug.

Every step names real files, real APIs, and real rule ids. The health module is the reference slice
throughout — start at [new-feature-module](new-feature-module.md) if you are new here, because it
walks that slice from types to public surface and links to almost every other skill on the way.

Find the right skill from a task description with:

```bash
npm run knowledge:context -- --task="add a refresh button to the settings screen"
```

## Build

Making a feature exist, bottom-up.

| Skill                                       | Use when                                         |
| ------------------------------------------- | ------------------------------------------------ |
| [new-feature-module](new-feature-module.md) | A capability needs its own vertical slice        |
| [component](component.md)                   | New UI that renders props and raises callbacks   |
| [container](container.md)                   | A hook and a component must be joined            |
| [hook](hook.md)                             | React state, effects, or vendor hooks are needed |
| [service](service.md)                       | A business operation must run outside React      |
| [gateway](gateway.md)                       | A module must call an endpoint and parse it      |
| [repository](repository.md)                 | Local data needs a persistence port              |
| [query](query.md)                           | A screen needs remote data, read and cached      |
| [mutation](mutation.md)                     | The user performs a write                        |
| [store](store.md)                           | Client-owned state is shared across screens      |
| [form](form.md)                             | The user must enter and submit validated input   |

## Integrate

Connecting the slice to routes, the API, vendors, and language.

| Skill                                           | Use when                                    |
| ----------------------------------------------- | ------------------------------------------- |
| [route](route.md)                               | A screen must be reachable at a URL         |
| [deep-link](deep-link.md)                       | An external URL must open a screen          |
| [axios-endpoint](axios-endpoint.md)             | The backend exposes an uncalled operation   |
| [nest-dto-integration](nest-dto-integration.md) | A backend payload must become a domain type |
| [package-wrapper](package-wrapper.md)           | A new library must be usable from app code  |
| [i18n-key](i18n-key.md)                         | Any new user-visible string appears         |

## Native

Everything that only exists on a device.

| Skill                                   | Use when                                     |
| --------------------------------------- | -------------------------------------------- |
| [capacitor-plugin](capacitor-plugin.md) | A native capability needs a Capacitor plugin |
| [permission-flow](permission-flow.md)   | A capability needs the user's consent        |
| [native-listener](native-listener.md)   | The app must react to a native event         |
| [secure-storage](secure-storage.md)     | A token or secret must outlive a page load   |

## Test

Proving it, at the right level.

| Skill                                       | Use when                                          |
| ------------------------------------------- | ------------------------------------------------- |
| [unit-test](unit-test.md)                   | Any file under `src/` changes                     |
| [hook-test](hook-test.md)                   | The thing under test renders or uses React        |
| [integration-test](integration-test.md)     | A behavior only exists when real layers are wired |
| [contract-test](contract-test.md)           | An endpoint's wire shape must be pinned           |
| [playwright-test](playwright-test.md)       | A user journey must be proven in a real browser   |
| [accessibility-test](accessibility-test.md) | A screen is added or its states change            |
| [native-test](native-test.md)               | Anything native changes, or a release is near     |

## Review

Judgement calls no gate can make for you.

| Skill                                       | Use when                                         |
| ------------------------------------------- | ------------------------------------------------ |
| [security-review](security-review.md)       | Auth, tokens, storage, permissions, deep links   |
| [performance-review](performance-review.md) | A list, a heavy screen, a bundle, or a re-render |

## Operate

Keeping the codebase and its gates healthy.

| Skill                                                 | Use when                               |
| ----------------------------------------------------- | -------------------------------------- |
| [refactor](refactor.md)                               | Structure changes, behavior does not   |
| [dependency-upgrade](dependency-upgrade.md)           | A package is added, bumped, or removed |
| [eslint-typecheck-repair](eslint-typecheck-repair.md) | Lint or typecheck is red               |
| [exception](exception.md)                             | A rule truly cannot be satisfied       |
| [final-validation](final-validation.md)               | A change is about to be claimed done   |

## Writing a new skill

1. **Check it is a task.** A skill answers "how do I do X here". A constraint is a
   [rule](../rules/README.md); a tradeoff is an ADR; a map of today's wiring is `context/`.
2. **Follow the shape.** Use when, Required reading, Preconditions, Files, Steps, Tests, Security /
   accessibility / native considerations, Documentation delta, Validation, Forbidden shortcuts,
   Definition of done — in that order, 55–110 lines.
3. **Name real things.** Real paths, real exports, real rule ids, real scripts. A step that cites
   nothing checkable cannot be followed or verified.
4. **Steps run bottom-up.** Types before schemas, schemas before gateways, gateways before hooks, UI
   last. That ordering is the whole reason a slice compiles as it grows.
5. **Make "Forbidden shortcuts" specific.** Name the wrong turn _this_ task tempts and the rule id
   that catches it. Generic advice teaches nobody.
6. **Be honest in the considerations.** "None beyond the defaults" is a real answer; inventing risk
   trains readers to skim the section.
7. **Link it from this README** — the orphan check fails on a document nothing references — and
   cross-link the neighbouring skills.
8. **Rebuild the knowledge plane:** `npm run knowledge:build`, then `npm run knowledge:validate` and
   `npm run quality:docs`.

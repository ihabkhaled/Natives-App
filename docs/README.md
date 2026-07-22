# Documentation

Reference material. Normative rules live in [`rules/`](../rules/), decisions in
[`architecture/adrs/`](../architecture/adrs/), and task playbooks in [`skills/`](../skills/).

## Setup

| Page                                                    | What it covers                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| [getting-started](setup/getting-started.md)             | Requirements, install, run, mock vs remote, everyday commands.        |
| [project-customization](setup/project-customization.md) | Every placeholder to replace when rebranding.                         |
| [coverage-policy](setup/coverage-policy.md)             | Per-file thresholds, the pure-logic 100% rule, legitimate exclusions. |

## API

| Page                                              | What it covers                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| [nest-error-contract](api/nest-error-contract.md) | Success/error envelopes, status→code mapping, auth endpoints, headers. |

## Dependencies

| Page                                                                 | What it covers                                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [version-snapshot](dependencies/version-snapshot.md)                 | Exact versions and the deliberate pins (Sentry, React Router v5, ESLint overrides, npm). |
| [typescript-compatibility](dependencies/typescript-compatibility.md) | The dual-compiler arrangement and its automated removal trigger.                         |

## Native

| Page                                         | What it covers                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| [android-runbook](native/android-runbook.md) | Requirements, commands, security posture, deep links, troubleshooting. |
| [ios-runbook](native/ios-runbook.md)         | Requirements, honest verification, ATS, universal links.               |

## Branding

| Page                                          | What it covers                                                     |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [brand-system](brand/brand-system.md)         | Black/gold/white tokens, themes, typography, accessibility rules.  |
| [asset-generation](brand/asset-generation.md) | Source vs generated ownership, determinism, the regeneration flow. |
| [native-identity](brand/native-identity.md)   | Bundle IDs, display names, applied vs deferred, verification.      |
| [signing-runbook](brand/signing-runbook.md)   | Android/iOS signing placeholders; no secrets in Git.               |

## Security

| Page                                       | What it covers                                                   |
| ------------------------------------------ | ---------------------------------------------------------------- |
| [token-storage](security/token-storage.md) | Secure storage, the web fallback tradeoff, redaction, lifecycle. |

## Operations

| Page                                                       | What it covers                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| [ci](operations/ci.md)                                     | Every CI job, the `.ai` drift check, the visual-baseline caveat. |
| [deployment-templates](operations/deployment-templates.md) | Commented templates — nothing is wired.                          |
| [pwa](operations/pwa.md)                                   | Install surface, safe cache classes, updates, offline recovery.  |
| [api-contract](operations/api-contract.md)                 | OpenAPI sync, generated types, drift checks, and rollback.       |
| [attendance queue](operations/attendance-offline-queue.md) | Offline replay, conflicts, privacy, and restart recovery.        |

## Features

| Page                               | What it covers                                            |
| ---------------------------------- | --------------------------------------------------------- |
| [mock-mode](features/mock-mode.md) | Deterministic MSW backend, identities, failure scenarios. |

## Localization

| Page                                                   | What it covers                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [terminology-glossary](i18n/terminology-glossary.md)   | Canonical EN ↔ AR wording for every Ultimate Frisbee term.          |
| [localization-workflow](i18n/localization-workflow.md) | Adding keys, plurals, number/date owners, the pseudo-locale, gates. |

## ESLint

| Page                              | What it covers                            |
| --------------------------------- | ----------------------------------------- |
| [eslint/README](eslint/README.md) | All 50 architecture rules, one page each. |

## Exceptions

| Page                                      | What it covers                              |
| ----------------------------------------- | ------------------------------------------- |
| [exceptions/README](exceptions/README.md) | The `EXC-nnnn` register and how to add one. |

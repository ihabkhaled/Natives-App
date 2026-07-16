# Exceptions register

Every suppression in this repository is listed here. `architecture/no-undocumented-eslint-disable`
fails the lint gate on any `eslint-disable` comment that does not cite an `EXC-nnnn` identifier, so
this register cannot silently fall out of date.

Broad suppressions (whole-file, whole-directory, or rule-wide `ignorePatterns` for architecture
rules) are forbidden outright.

## Active exceptions

### EXC-0001 — the logger package may call `console`

| Field        | Value                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule         | `no-console`                                                                                                                                                                             |
| Scope        | [`src/packages/logger/logger.factory.ts`](../../src/packages/logger/logger.factory.ts), `createConsoleSink` only                                                                         |
| Owner        | Platform                                                                                                                                                                                 |
| Date         | 2026-07-16                                                                                                                                                                               |
| Reason       | Something must own the console. The logger package is that owner: it is the sink every other layer routes through, and it sanitizes fields before writing.                               |
| Alternatives | A vendor logging SDK (rejected: another dependency, another owner, no benefit at this size). Leaving `no-console` off globally (rejected: then any file could log an unsanitized token). |
| Risk         | Low, and contained: the suppression covers a single function whose only job is to write.                                                                                                 |
| Tests        | `logger.factory` unit tests assert sanitization and level routing.                                                                                                                       |
| Removal      | When a real transport replaces the console sink.                                                                                                                                         |
| Review       | 2027-01-16                                                                                                                                                                               |

## Adding an exception

1. Try to move the code first. Most guardrail failures are misplacement, not a genuine exception.
2. Claim the next `EXC-nnnn`.
3. Add a row here with **every** field above filled in — an alternative you did not consider is not
   an alternative you rejected.
4. Reference the identifier inline:

   ```ts
   /* eslint-disable no-console -- EXC-0001: the logger package is the single console owner. */
   ```

5. Keep the scope as narrow as the tool allows: one rule, one file, ideally one function. Re-enable
   immediately after.
6. Run `npm run lint` to confirm the reference is recognized.

## Reviewing

At each review date, ask whether the constraint that forced the exception still exists. An
exception nobody can justify today is a defect with paperwork.

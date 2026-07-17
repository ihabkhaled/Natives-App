# Source-data handling (private team data)

The Ultimate Natives legacy source is a set of private Excel workbooks with real member data. The
frontend **never** ingests these files directly.

## Hard rules

- **Never commit** source workbooks, exports, or uploads. Enforced by `.gitignore` (`/private-imports/`,
  `*.xlsx|xls|xlsm|csv`, `/exports/`, `/uploads/`).
- Private workbooks are **never mounted into the frontend** or served as public assets. All legacy import
  happens on the backend through its audited, dry-run, idempotent, reconciled pipeline.
- **No PII** (names, contacts, national IDs, coach notes) in the client bundle, logs, analytics, crash
  reports, URLs, deep links, or insecure browser/native storage. Tokens live only in secure storage via
  the `@/packages/secure-storage` owner.
- Test fixtures and MSW mock data are **synthetic and deterministic** (reserved domain `example.test`,
  fake phone ranges, synthetic English + Arabic names). No data is ever copied from real members.
- `null` means "not evaluated" and is never rendered as, or averaged into, zero.

## Import surfaces

The admin import experience (prompt 814) only ever displays **redacted** previews, reconciliation
summaries, and error reports returned by the backend — never raw workbook contents or private fields the
operator lacks permission to see.

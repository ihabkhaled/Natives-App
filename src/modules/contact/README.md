# Contact module

Owns the public Contact Us page: a real, schema-validated form (email/subject/message, bounds
mirrored from the backend DTO) wired to the live `POST /contact` relay from backend contract 1.7.0.

## Public surface (`index.ts`)

| Export                                    | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `getContactRouteDefinitions`              | `/contact` (public).                         |
| `contactPath`                             | Typed path builder.                          |
| `contactResponseSchema`                   | The 201 wire contract, for contract tests.   |
| `ContactScreenView`                       | Screen view-model type, for tests/factories. |
| `ContactRequestDto`, `ContactResponseDto` | The DTO shapes the gateway sends and parses. |

## Anatomy

```text
contact.constants.ts                 CONTACT_FORM_ENABLED kill switch, notice tones, field names
constants/contact-api.constants.ts   POST /contact path
types/contact.types.ts               request/response DTOs + the notice view model
schemas/contact-form.schema.ts       zod bounds mirrored from the backend DTO
schemas/contact-response.schema.ts   the 201 acknowledgement wire contract
gateways/contact.gateway.ts          public POST, schema-parsed, no bearer token
services/submit-contact.service.ts   use case; every failure leaves as an AppError
mutations/use-submit-contact-mutation.hook.ts   TanStack mutation + verbatim retry
helpers/contact-notice.helper.ts        AppError code -> honest, translated notice copy
helpers/contact-field-errors.helper.ts  400 field errors -> the inputs they name
helpers/contact-form-bindings.helper.ts server rejection pinned to a field binding
hooks/use-contact-form.hook.ts       schema-bound field state (react-hook-form)
hooks/use-contact-screen.hook.ts     translated view model; clears the form once sent
components/contact-notice/*          the single aria-live announcement region
components/contact-view/*            UI-only view
containers/contact.container.tsx     composition
routes/contact.paths.ts              typed builder over APP_PATHS
```

## Failure mapping

`POST /contact` documents 201, 400 (invalid body **or** an unknown extra property), 429 (rate
limited) and 503 (the operator email channel is disabled or unconfigured). The service converts each
to an `AppError` through the shared transport mapper, and `contact-notice.helper.ts` turns the code
into copy that never claims more than is known:

| Failure               | `AppErrorCode`                | What the visitor is told                                   | Retry |
| --------------------- | ----------------------------- | ---------------------------------------------------------- | ----- |
| 400 invalid body      | `VALIDATION_ERROR`            | "check the highlighted fields"; each named field is marked | no    |
| 429 rate limited      | `RATE_LIMITED`                | "wait a few minutes" — a retry now would fail again        | no    |
| 503 channel off / 500 | `SERVER_ERROR`                | "our inbox is not reachable; try later or use social"      | yes   |
| network / timeout     | `NETWORK_OFFLINE` / `TIMEOUT` | "check your connection and try again"                      | yes   |
| anything else         | (any)                         | "your message was not sent" — no invented cause            | yes   |

503 and 500 share one code because the shared HTTP mapper collapses every 5xx to `SERVER_ERROR`, and
the copy is true of both: the send failed server-side and may work later. Splitting them would mean
a new code in the shared taxonomy plus a new HTTP kind and both mapping tables
([17-error-handling](../../../rules/17-error-handling.md)) for a difference the visitor cannot act
on. The retry resends the last request verbatim, so a failure never costs the visitor their draft.

## Invariants

- Validation bounds (email format max 254; subject trim 3-160; message trim 10-4000) mirror the
  backend DTO exactly, so a visitor never sees a client-side rule the server would reject anyway.
- The form is cleared **only** on a confirmed 201. Every failure keeps the draft on screen.
- `contactResponseSchema` parses `sent` as the literal `true`: a body that denies the send is a
  contract violation and surfaces as "not sent", never as a fake success.
- `CONTACT_FORM_ENABLED` is a kill switch, not a TODO. Flipping it to `false` disables the inputs
  and the submit and shows the "switched off" notice rather than collecting undeliverable messages.
- The social links list is the shared `SOCIAL_LINKS` declaration home (`@/shared/config`), the same
  one the public footer decorates with icons — never re-typed here.
- Route access is `Public`, not `PublicOnly`: the page reads the same whether or not a visitor is
  signed in. The public navbar and footer come from router-level chrome, not from this screen.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [06-services-use-cases](../../../rules/06-services-use-cases.md),
  [16-forms-and-validation](../../../rules/16-forms-and-validation.md),
  [17-error-handling](../../../rules/17-error-handling.md).

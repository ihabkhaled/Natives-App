# Contact module

Owns the public Contact Us page: a real, schema-validated form (email/subject/message, bounds
mirrored from the backend DTO spec) that is not yet wired to a live endpoint.

## Public surface (`index.ts`)

| Export                                    | Purpose                                             |
| ----------------------------------------- | --------------------------------------------------- |
| `getContactRouteDefinitions`              | `/contact` (public).                                |
| `contactPath`                             | Typed path builder.                                 |
| `ContactScreenView`                       | Screen view-model type, for tests/factories.        |
| `ContactRequestDto`, `ContactResponseDto` | The backend DTO shapes the future gateway will use. |

## Anatomy

```text
contact.constants.ts            CONTACT_FORM_ENABLED seam flag + submit status enum
types/contact.types.ts          request/response DTOs, pinned ahead of the real endpoint
schemas/contact-form.schema.ts  zod bounds mirrored from the backend spec
services/submit-contact.service.ts  TODO-seam stub; always resolves "unavailable"
hooks/use-contact-form.hook.ts  schema-bound field state (react-hook-form)
hooks/use-contact-screen.hook.ts  translated view model, composes the form + seam flag
components/contact-view/*       UI-only view
containers/contact.container.tsx  composition
routes/contact.paths.ts         typed builder over APP_PATHS
```

## The TODO seam

`POST /contact` (public, rate-limited, stateless email relay) is specified but not deployed. Rather
than invent a gateway call to a route that does not exist, `submitContactRequest` is a stub that
takes the exact request DTO the real endpoint will accept and always reports `unavailable`. The
screen reads `CONTACT_FORM_ENABLED` (`contact.constants.ts`, currently `false`) to disable
submission and show an honest notice; the fields still validate for real. Wiring the real endpoint
is a one-file change: flip the flag and replace the service body with a gateway `request*` call
parsed through a response schema — the hook, form, and view need no changes.

## Invariants

- Validation bounds (email format max 254; subject trim 3-160; message trim 10-4000) mirror the
  backend DTO exactly, so a visitor never sees a client-side rule the server would reject anyway.
- The social links list is the shared `SOCIAL_LINKS` declaration home (`@/shared/config`), the same
  one the public footer decorates with icons — never re-typed here.
- Route access is `Public`, not `PublicOnly`: the page reads the same whether or not a visitor is
  signed in.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [06-services-use-cases](../../../rules/06-services-use-cases.md),
  [16-forms-and-validation](../../../rules/16-forms-and-validation.md).

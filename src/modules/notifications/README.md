# Notifications module

The in-app inbox, per-category preferences, quiet hours, and the deep-link arrival screen
(prompt 815). The backing service is the deployed platform module (prompt 105): `/notifications`,
`/notifications/{id}/read`, `/notifications/preferences`, and `/notifications/quiet-hours` are all
published in `contracts/openapi.json` and consumed live.

## Public surface (`index.ts`)

| Export                                                      | Purpose                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| `getNotificationsRouteDefinitions`                          | Inbox, preferences, and link routes with their metadata. |
| `notificationsPagePath` / `notificationPreferencesPagePath` | Typed path builders for the two screens.                 |
| `notificationLinkPath`                                      | The arrival path a notification is opened through.       |
| `useUnreadNotifications`                                    | The app bar's unread badge and popover read model.       |
| `notification*Schema`                                       | Wire contracts, also used by the contract tests.         |
| `NOTIFICATION_*` / `MANDATORY_CATEGORIES`                   | Category, channel, and bound vocabulary.                 |

## Anatomy

```text
constants/    category + channel vocabulary, API paths, label and tone maps
schemas/      Zod contracts for the four endpoints
mappers/      DTO -> domain, including the params bag narrowed to strings
gateways/     one request function per endpoint
services/     one use case per file
queries/      stable keys + query option builders
hooks/        context, query, and the three screen view models
mutations/    mark-read, preference, quiet-hours commands
helpers/      grouping, delivery state, target resolution, link resolution
components/   UI-only inbox, row, preference matrix, quiet hours, link screen
containers/   the three routed screens
routes/       typed paths + route definitions
```

## Invariants

- **A deep link re-checks authorization on arrival.** Opening a notification never navigates
  straight at the target: it routes to `/notifications/open/:notificationId`, where
  `resolveLink` compares the target's required grants against the _current_ effective permissions
  before any target request is made. A revoked grant produces the designed forbidden state and no
  redirect; the arrival screen renders no field of the linked record in any outcome, so nothing
  can leak through it.
- **Stale and forbidden are separate outcomes, and neither confirms existence.** A notification
  whose target no longer resolves renders the designed empty state; a forbidden one renders the
  permission state. Both carry a path of `null`.
- **Mandatory categories cannot be muted, and the UI says so.** `system` (security and
  administrative notices) and the `in_app` channel are locked in
  `notification-preference.helper.ts`. Locked cells render disabled with an "always on" chip and a
  stated reason — the screen never accepts a change the backend would discard.
- **Delivery state is only claimed where it is known.** The recipient sees in-app delivery and read
  state, which the inbox actually holds. Email and push delivery is not exposed to recipients at
  all; failures live in the operations centre and the link to it appears only for a principal
  holding `notification.delivery.read`.
- **Every list is bounded.** The window starts at one page and grows by one page at a time, up to
  `NOTIFICATION_LIMITS.maxItems`. There is no "load everything".
- **Read state is idempotent.** The endpoint accepts a repeat, and the arrival screen additionally
  guards with a ref so a re-render cannot issue a second command.
- Notification bodies are i18n keys, never server prose. An unmapped event type falls back to
  designed copy rather than rendering a wire string.

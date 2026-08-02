/**
 * Deterministic contact-relay scenarios. The sender's email selects the
 * outcome so every documented status of `POST /contact` — 201, 400, 429,
 * 503 — is reachable from a test without hand-rolling a handler override.
 */
export const MOCK_CONTACT = {
  senderEmail: 'visitor@example.test',
  channelDisabledEmail: 'channel-disabled@example.test',
  rateLimitedEmail: 'rate-limited@example.test',
  subject: 'Tryout question',
  message: 'I would like to know more about your next open tryout, thanks!',
} as const;

/** The bounds `ContactRequestDto` declares in contract 1.7.0. */
export const MOCK_CONTACT_LIMITS = {
  emailMaxLength: 254,
  subjectMinLength: 3,
  subjectMaxLength: 160,
  messageMinLength: 10,
  messageMaxLength: 4000,
} as const;

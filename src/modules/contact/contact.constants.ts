/**
 * TODO(contact-endpoint): flip once `POST /contact` is deployed (see the
 * landing-site spec). The screen reads this flag to disable submission and
 * show the honest "not available yet" notice; every other part of the form
 * (fields, validation) already works and needs no change when this becomes
 * `true` — only this flag and the service body in
 * `services/submit-contact.service.ts` change.
 */
export const CONTACT_FORM_ENABLED = false;

export const CONTACT_SUBMIT_STATUS = {
  Sent: 'sent',
  Unavailable: 'unavailable',
} as const;

export type ContactSubmitStatus =
  (typeof CONTACT_SUBMIT_STATUS)[keyof typeof CONTACT_SUBMIT_STATUS];

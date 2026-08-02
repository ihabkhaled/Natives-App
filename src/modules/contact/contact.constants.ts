/**
 * Kill switch for the live contact relay. `POST /contact` shipped in backend
 * contract 1.7.0, so the form submits for real; flipping this back to `false`
 * disables submission and shows the "switched off" notice rather than
 * collecting messages nothing will deliver.
 */
export const CONTACT_FORM_ENABLED = true;

/** Tone of the single aria-live notice region above the contact form. */
export const CONTACT_NOTICE_TONE = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;

export type ContactNoticeTone = (typeof CONTACT_NOTICE_TONE)[keyof typeof CONTACT_NOTICE_TONE];

/** The three fields `ContactRequestDto` carries, in form order. */
export const CONTACT_FIELD_NAMES = ['email', 'subject', 'message'] as const;

export type ContactFieldName = (typeof CONTACT_FIELD_NAMES)[number];

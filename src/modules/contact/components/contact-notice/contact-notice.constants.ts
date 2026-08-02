import { CONTACT_NOTICE_TONE, type ContactNoticeTone } from '../../contact.constants';

/** Tone modifier per notice state; the base class carries the layout. */
export const CONTACT_NOTICE_TONE_CLASS: Readonly<Record<ContactNoticeTone, string>> = {
  [CONTACT_NOTICE_TONE.Success]: 'app-contact-notice--success',
  [CONTACT_NOTICE_TONE.Warning]: 'app-contact-notice--warning',
  [CONTACT_NOTICE_TONE.Error]: 'app-contact-notice--error',
};

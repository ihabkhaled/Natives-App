import type { ContactNoticeView } from '../../types/contact.types';

export interface ContactNoticeProps {
  /** `null` while the form is idle: the live region stays mounted but silent. */
  readonly notice: ContactNoticeView | null;
}

import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

import type { CandidateContactChannel, CandidateStatus } from '../types/tryout-candidates.types';

/** The AsyncStateView copy block for the candidate review screen. */
export const TRYOUT_CANDIDATES_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.tryoutCandidates.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;

/**
 * Status labels. Six come from the tryouts namespace; `rejected` and `no_show`
 * have no key of their own yet, so they borrow the nearest true sentence
 * elsewhere in the catalog rather than shipping an untranslated wire token.
 * See the README's "Copy this module does not own" section.
 */
export const CANDIDATE_STATUS_LABEL_KEYS: Readonly<Record<CandidateStatus, string>> = {
  registered: I18N_KEYS.tryouts.statusRegistered,
  waitlisted: I18N_KEYS.tryouts.statusWaitlisted,
  checked_in: I18N_KEYS.tryouts.statusCheckedIn,
  no_show: I18N_KEYS.attendance.statusAbsent,
  withdrawn: I18N_KEYS.tryouts.statusWithdrawn,
  accepted: I18N_KEYS.tryouts.statusAccepted,
  rejected: I18N_KEYS.training.statusRejected,
  converted: I18N_KEYS.tryouts.statusConverted,
};

export const CANDIDATE_STATUS_TONES: Readonly<Record<CandidateStatus, string>> = {
  registered: 'primary',
  waitlisted: 'warning',
  checked_in: 'success',
  no_show: 'medium',
  withdrawn: 'medium',
  accepted: 'success',
  rejected: 'danger',
  converted: 'primary',
};

/**
 * How the candidate asked to be reached, used as the label of the single
 * contact fact. A WhatsApp reference is a phone number, so it reads as one;
 * `none` means the person offered no channel and the value says so.
 */
export const CONTACT_CHANNEL_LABEL_KEYS: Readonly<Record<CandidateContactChannel, string>> = {
  email: I18N_KEYS.tryouts.contactEmailLabel,
  phone: I18N_KEYS.tryouts.contactPhoneLabel,
  whatsapp: I18N_KEYS.tryouts.contactPhoneLabel,
  none: I18N_KEYS.tryouts.contactsHeading,
};

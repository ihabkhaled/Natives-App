import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  WITHDRAWAL_REASON_MAX_LENGTH,
  WITHDRAWAL_REASON_MIN_LENGTH,
} from '../constants/tryout-candidates.constants';

type Translate = (key: string, params?: TranslateParams) => string;

/** Keeps typed input inside the contract's ceiling before it is ever sent. */
export function clampWithdrawalReason(value: string): string {
  return value.slice(0, WITHDRAWAL_REASON_MAX_LENGTH);
}

/** A reason is what makes the withdrawal auditable, so whitespace does not count. */
export function isWithdrawalReasonValid(reason: string): boolean {
  return reason.trim().length >= WITHDRAWAL_REASON_MIN_LENGTH;
}

/**
 * The validation line, or null.
 *
 * Nothing is said until the reviewer has actually typed something: telling
 * someone their empty field is wrong before they start is nagging, not help.
 */
export function resolveWithdrawalReasonMessage(t: Translate, reason: string): string | null {
  if (reason.trim() === '' || isWithdrawalReasonValid(reason)) {
    return null;
  }
  return t(I18N_KEYS.tryouts.decisionReasonRequired);
}

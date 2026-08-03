import { describe, expect, it } from 'vitest';

import {
  WITHDRAWAL_REASON_MAX_LENGTH,
  WITHDRAWAL_REASON_MIN_LENGTH,
} from '../constants/tryout-candidates.constants';
import {
  clampWithdrawalReason,
  isWithdrawalReasonValid,
  resolveWithdrawalReasonMessage,
} from './withdrawal-reason.helper';

const t = (key: string): string => `t:${key}`;

describe('clampWithdrawalReason', () => {
  it('leaves an ordinary reason untouched', () => {
    expect(clampWithdrawalReason('Asked us to remove them.')).toBe('Asked us to remove them.');
  });

  it('stops accepting input at the contract ceiling', () => {
    expect(clampWithdrawalReason('x'.repeat(WITHDRAWAL_REASON_MAX_LENGTH + 50))).toHaveLength(
      WITHDRAWAL_REASON_MAX_LENGTH,
    );
  });
});

describe('isWithdrawalReasonValid', () => {
  it('accepts a written reason', () => {
    expect(isWithdrawalReasonValid('They asked to be removed')).toBe(true);
  });

  it('rejects whitespace, which records nothing', () => {
    expect(isWithdrawalReasonValid(' '.repeat(WITHDRAWAL_REASON_MIN_LENGTH + 5))).toBe(false);
  });

  it('rejects a reason shorter than the stated minimum', () => {
    expect(isWithdrawalReasonValid('no')).toBe(false);
  });
});

describe('resolveWithdrawalReasonMessage', () => {
  it('says nothing before the reviewer has typed anything', () => {
    expect(resolveWithdrawalReasonMessage(t, '')).toBeNull();
    expect(resolveWithdrawalReasonMessage(t, '   ')).toBeNull();
  });

  it('says nothing once the reason is long enough', () => {
    expect(resolveWithdrawalReasonMessage(t, 'Asked to be removed')).toBeNull();
  });

  it('states the requirement once a too-short reason has been started', () => {
    expect(resolveWithdrawalReasonMessage(t, 'no')).toBe('t:tryouts.decisionReasonRequired');
  });
});

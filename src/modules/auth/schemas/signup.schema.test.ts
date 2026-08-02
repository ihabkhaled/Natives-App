import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { ACCOUNT_STATE } from '../types/auth.types';
import { signupAcknowledgementSchema } from './signup.schema';

describe('signupAcknowledgementSchema', () => {
  it('parses the pending acknowledgement the backend returns on 201', () => {
    const parsed = safeParseWithSchema(signupAcknowledgementSchema, {
      message: 'identity.signup.received',
      state: ACCOUNT_STATE.Pending,
    });

    expect(parsed).toEqual({
      success: true,
      data: { message: 'identity.signup.received', state: ACCOUNT_STATE.Pending },
    });
  });

  it('accepts every account state the contract enumerates', () => {
    for (const state of Object.values(ACCOUNT_STATE)) {
      const parsed = safeParseWithSchema(signupAcknowledgementSchema, { message: 'ok', state });

      expect(parsed.success).toBe(true);
    }
  });

  it('rejects an unknown state rather than trusting the wire', () => {
    const parsed = safeParseWithSchema(signupAcknowledgementSchema, {
      message: 'ok',
      state: 'approved',
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects an empty message', () => {
    const parsed = safeParseWithSchema(signupAcknowledgementSchema, {
      message: '',
      state: ACCOUNT_STATE.Pending,
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects a response that smuggles no state at all', () => {
    expect(safeParseWithSchema(signupAcknowledgementSchema, { message: 'ok' }).success).toBe(false);
  });
});

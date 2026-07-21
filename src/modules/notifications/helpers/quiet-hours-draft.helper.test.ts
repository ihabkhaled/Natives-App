import { describe, expect, it } from 'vitest';

import type { QuietHours } from '../types/notifications.types';
import { resolveQuietHoursDraft } from './quiet-hours-draft.helper';

const SERVER: QuietHours = {
  timezone: 'Africa/Cairo',
  startsLocal: '22:00',
  endsLocal: '07:00',
  urgentCancellationOverride: true,
};

const EMPTY = { startsLocal: null, endsLocal: null, urgent: null };

describe('resolveQuietHoursDraft', () => {
  it('shows the server value while nothing has been edited', () => {
    expect(resolveQuietHoursDraft(EMPTY, SERVER)).toEqual({
      startsLocal: '22:00',
      endsLocal: '07:00',
      timezone: 'Africa/Cairo',
      urgent: true,
      isValid: true,
    });
  });

  it('lets a local edit shadow the server value', () => {
    const resolved = resolveQuietHoursDraft(
      { startsLocal: '21:30', endsLocal: null, urgent: false },
      SERVER,
    );

    expect(resolved.startsLocal).toBe('21:30');
    expect(resolved.endsLocal).toBe('07:00');
    expect(resolved.urgent).toBe(false);
  });

  it('falls back to empty strings before the server has answered', () => {
    expect(resolveQuietHoursDraft(EMPTY, undefined)).toEqual({
      startsLocal: '',
      endsLocal: '',
      timezone: '',
      urgent: false,
      isValid: false,
    });
  });

  it('reports an invalid wall-clock time so the form can block the save', () => {
    expect(
      resolveQuietHoursDraft({ startsLocal: '25:00', endsLocal: null, urgent: null }, SERVER)
        .isValid,
    ).toBe(false);
  });
});

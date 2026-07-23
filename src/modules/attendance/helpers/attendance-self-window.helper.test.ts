import { describe, expect, it } from 'vitest';

import { makeSelfRecordDto } from '@/tests/msw/attendance-wire.fixture';

import { mapAttendanceSelfRecord } from '../mappers/attendance-self.mapper';
import { resolveSelfCheckIn } from './attendance-self-window.helper';

const STARTS_AT = '2026-07-26T15:00:00.000Z';
const ENDS_AT = '2026-07-26T17:00:00.000Z';

function record(overrides: Parameters<typeof makeSelfRecordDto>[0] = {}) {
  return mapAttendanceSelfRecord(makeSelfRecordDto(overrides));
}

describe('resolveSelfCheckIn', () => {
  it('always trusts the server eligibility block when present', () => {
    const resolution = resolveSelfCheckIn(
      record({
        selfCheckIn: { state: 'closed', opensAt: '2026-07-26T14:00:00.000Z', closesAt: ENDS_AT },
      }),
      STARTS_AT,
      ENDS_AT,
      '2026-07-26T15:30:00.000Z',
    );

    expect(resolution).toEqual({
      state: 'closed',
      opensAtIso: '2026-07-26T14:00:00.000Z',
      isProvisional: false,
    });
  });

  it('reads an existing mark as recorded before any window math', () => {
    const resolution = resolveSelfCheckIn(
      record({ status: 'present_late' }),
      STARTS_AT,
      ENDS_AT,
      '2026-07-20T00:00:00.000Z',
    );

    expect(resolution.state).toBe('recorded');
    expect(resolution.isProvisional).toBe(true);
  });

  it('is not open before startsAt minus sixty minutes, citing the open instant', () => {
    const resolution = resolveSelfCheckIn(record(), STARTS_AT, ENDS_AT, '2026-07-26T13:59:59.000Z');

    expect(resolution.state).toBe('not_open');
    expect(resolution.opensAtIso).toBe('2026-07-26T14:00:00.000Z');
  });

  it('opens exactly at the provisional open instant', () => {
    const resolution = resolveSelfCheckIn(record(), STARTS_AT, ENDS_AT, '2026-07-26T14:00:00.000Z');

    expect(resolution.state).toBe('open');
    expect(resolution.isProvisional).toBe(true);
  });

  it('stays open through the session end instant', () => {
    expect(resolveSelfCheckIn(record(), STARTS_AT, ENDS_AT, ENDS_AT).state).toBe('open');
  });

  it('closes after the session end instant', () => {
    const resolution = resolveSelfCheckIn(record(), STARTS_AT, ENDS_AT, '2026-07-26T17:00:01.000Z');

    expect(resolution.state).toBe('closed');
    expect(resolution.opensAtIso).toBeNull();
  });
});

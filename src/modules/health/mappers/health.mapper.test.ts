import { describe, expect, it } from 'vitest';

import { mapHealthResponseToStatus } from './health.mapper';

describe('mapHealthResponseToStatus', () => {
  it('maps an ok status to a healthy domain snapshot', () => {
    expect(
      mapHealthResponseToStatus({
        status: 'ok',
        version: '1.4.2',
        timestamp: '2026-07-16T10:15:00.000Z',
      }),
    ).toEqual({ isHealthy: true, version: '1.4.2', checkedAtIso: '2026-07-16T10:15:00.000Z' });
  });

  it('maps an error status to an unhealthy domain snapshot', () => {
    const status = mapHealthResponseToStatus({
      status: 'error',
      version: '1.4.2',
      timestamp: '2026-07-16T10:15:00.000Z',
    });

    expect(status.isHealthy).toBe(false);
    expect(status.version).toBe('1.4.2');
    expect(status.checkedAtIso).toBe('2026-07-16T10:15:00.000Z');
  });
});

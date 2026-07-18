import { describe, expect, it } from 'vitest';

import { mapSessionDto, mapSessionListResponse } from './session.mapper';

const dto = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-1',
  device: 'Chrome on macOS',
  approxLocation: 'Cairo, EG',
  lastActiveAt: '2026-07-18T09:30:00.000Z',
  current: false,
  ...overrides,
});

describe('mapSessionDto', () => {
  it('maps wire fields onto the domain shape', () => {
    expect(mapSessionDto(dto({ current: true }))).toEqual({
      id: 'session-1',
      device: 'Chrome on macOS',
      approxLocation: 'Cairo, EG',
      lastActiveAtIso: '2026-07-18T09:30:00.000Z',
      isCurrent: true,
    });
  });
});

describe('mapSessionListResponse', () => {
  it('orders the current device first, then by most recent activity', () => {
    const ordered = mapSessionListResponse({
      sessions: [
        dto({ id: 'older', lastActiveAt: '2026-07-10T00:00:00.000Z', current: false }),
        dto({ id: 'newer', lastActiveAt: '2026-07-17T00:00:00.000Z', current: false }),
        dto({ id: 'current', lastActiveAt: '2026-07-01T00:00:00.000Z', current: true }),
      ],
    });

    expect(ordered.map((session) => session.id)).toEqual(['current', 'newer', 'older']);
  });

  it('returns an empty list unchanged', () => {
    expect(mapSessionListResponse({ sessions: [] })).toEqual([]);
  });
});

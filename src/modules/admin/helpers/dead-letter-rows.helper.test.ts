import { describe, expect, it, vi } from 'vitest';

import { buildDeadLetterRows } from './dead-letter-rows.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

const ITEMS = [
  {
    eventId: 'evt-1',
    eventType: 'notification.email.send',
    attempts: 5,
    failedAt: '2026-07-19T22:15:00.000Z',
    failureCode: 'SMTP_TIMEOUT',
  },
];

describe('buildDeadLetterRows', () => {
  it('carries the id, type, failure code, and attempt count only', () => {
    const rows = buildDeadLetterRows(t, formatInstant, ITEMS, {
      canReplay: true,
      onReplay: vi.fn(),
    });

    expect(Object.keys(rows[0]!)).toEqual([
      'eventId',
      'eventType',
      'attemptsLabel',
      'failedAtLabel',
      'failureCode',
      'replayLabel',
      'canReplay',
      'onReplay',
    ]);
    expect(rows[0]?.failedAtLabel).toBe('formatted:2026-07-19T22:15:00.000Z');
  });

  it('replays by event id, never by payload', () => {
    const onReplay = vi.fn();
    buildDeadLetterRows(t, formatInstant, ITEMS, { canReplay: true, onReplay })[0]?.onReplay();

    expect(onReplay).toHaveBeenCalledWith('evt-1');
  });

  it('disables replay for a principal without the grant', () => {
    expect(
      buildDeadLetterRows(t, formatInstant, ITEMS, { canReplay: false, onReplay: vi.fn() })[0]
        ?.canReplay,
    ).toBe(false);
  });

  it('produces nothing when there are no dead letters', () => {
    expect(
      buildDeadLetterRows(t, formatInstant, [], { canReplay: true, onReplay: vi.fn() }),
    ).toEqual([]);
  });
});

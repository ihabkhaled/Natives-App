import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import {
  buildQueueBadge,
  buildQueueRows,
  formatConflictServerValue,
} from './scorekeeper-queue-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('buildQueueRows', () => {
  it('names a point by the side it favours and shows the version it was taken at', () => {
    const rows = buildQueueRows(t, [buildQueuedOperation()]);

    expect(rows[0]?.label).toBe(`${I18N_KEYS.scorekeeperQueue.operationPoint}:{"side":"us"}`);
    expect(rows[0]?.detail).toBe(`${I18N_KEYS.scorekeeperQueue.baseVersion}:{"version":14}`);
    expect(rows[0]?.value).toBe(I18N_KEYS.scorekeeperQueue.statePending);
    expect(rows[0]?.tone).toBe('secondary');
  });

  it('names a correction without a side', () => {
    const rows = buildQueueRows(t, [
      buildQueuedOperation({
        kind: 'void',
        payload: { kind: 'void', eventId: 'event-1', reason: 'mis-tap' },
      }),
    ]);

    expect(rows[0]?.label).toBe(I18N_KEYS.scorekeeperQueue.operationVoid);
  });

  it('tones a conflict as danger', () => {
    const rows = buildQueueRows(t, [buildQueuedOperation({ state: 'conflict' })]);

    expect(rows[0]?.tone).toBe('danger');
  });
});

describe('buildQueueBadge', () => {
  it('says offline first', () => {
    expect(buildQueueBadge(t, { isOffline: true, isReplaying: true, queuedCount: 3 }).label).toBe(
      I18N_KEYS.scorekeeperQueue.offlineBadge,
    );
  });

  it('says replaying while the queue is draining', () => {
    expect(buildQueueBadge(t, { isOffline: false, isReplaying: true, queuedCount: 3 }).label).toBe(
      I18N_KEYS.scorekeeperQueue.replayingBadge,
    );
  });

  it('counts the queued actions when idle but not empty', () => {
    expect(buildQueueBadge(t, { isOffline: false, isReplaying: false, queuedCount: 3 }).label).toBe(
      `${I18N_KEYS.scorekeeperQueue.queuedBadge}:{"count":3}`,
    );
  });

  it('says synced only when nothing is waiting', () => {
    const badge = buildQueueBadge(t, { isOffline: false, isReplaying: false, queuedCount: 0 });

    expect(badge.label).toBe(I18N_KEYS.scorekeeperQueue.onlineBadge);
    expect(badge.tone).toBe('success');
  });
});

describe('formatConflictServerValue', () => {
  it('prints the server score when the server reported one', () => {
    expect(formatConflictServerValue('9-6')).toBe('9-6');
  });

  it('prints a dash when the request failed before the server answered', () => {
    expect(formatConflictServerValue('')).toBe('—');
    expect(formatConflictServerValue(null)).toBe('—');
  });
});

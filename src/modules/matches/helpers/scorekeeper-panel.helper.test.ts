import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { buildQueuePanel, type QueuePanelInput } from './scorekeeper-panel.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function input(overrides: Partial<QueuePanelInput> = {}): QueuePanelInput {
  return {
    operations: [],
    conflicts: [],
    pendingCount: 0,
    isOffline: false,
    isReplaying: false,
    isAtLimit: false,
    hasForeignQueue: false,
    hasFailed: false,
    onRetryFailed: vi.fn(),
    onDiscardConflict: vi.fn(),
    onReloadAuthoritative: vi.fn(),
    ...overrides,
  };
}

describe('buildQueuePanel', () => {
  it('says synced when nothing is waiting', () => {
    const panel = buildQueuePanel(t, input());

    expect(panel.badgeLabel).toBe(I18N_KEYS.scorekeeperQueue.onlineBadge);
    expect(panel.rows).toStrictEqual([]);
    expect(panel.limitTitle).toBeNull();
    expect(panel.foreignTitle).toBeNull();
  });

  it('raises the at-limit blocker with recovery guidance', () => {
    const panel = buildQueuePanel(t, input({ isAtLimit: true }));

    expect(panel.limitTitle).toBe(I18N_KEYS.scorekeeperQueue.limitTitle);
    expect(panel.limitMessage).toBe(I18N_KEYS.scorekeeperQueue.limitMessage);
  });

  it('warns that another account still owns queued work', () => {
    const panel = buildQueuePanel(t, input({ hasForeignQueue: true }));

    expect(panel.foreignTitle).toBe(I18N_KEYS.scorekeeperQueue.otherAccountTitle);
    expect(panel.foreignMessage).toBe(I18N_KEYS.scorekeeperQueue.otherAccountMessage);
  });

  it('presents a conflict as two competing records with no merge action', () => {
    const conflict = buildQueuedOperation({
      operationId: 'op-conflict1',
      state: 'conflict',
      conflictServerScore: '9-7',
    });
    const panel = buildQueuePanel(t, input({ conflicts: [conflict] }));

    expect(panel.conflicts).toHaveLength(1);
    expect(panel.conflicts[0]?.queuedValue).toBe('us');
    expect(panel.conflicts[0]?.serverValue).toBe('9-7');
    expect(panel.conflictNote).toBe(I18N_KEYS.scorekeeperQueue.conflictNeverMerged);
    expect(Object.keys(panel.conflicts[0] ?? {})).not.toContain('onMerge');
  });

  it('discards only the operation the coach chose', () => {
    const onDiscardConflict = vi.fn();
    const conflict = buildQueuedOperation({ operationId: 'op-conflict1', state: 'conflict' });
    const panel = buildQueuePanel(t, input({ conflicts: [conflict], onDiscardConflict }));

    panel.conflicts[0]?.onDiscard();

    expect(onDiscardConflict).toHaveBeenCalledWith('op-conflict1');
  });

  it('reloads the authoritative record on request', () => {
    const onReloadAuthoritative = vi.fn();
    const conflict = buildQueuedOperation({ operationId: 'op-conflict1', state: 'conflict' });
    const panel = buildQueuePanel(t, input({ conflicts: [conflict], onReloadAuthoritative }));

    panel.conflicts[0]?.onReload();

    expect(onReloadAuthoritative).toHaveBeenCalledTimes(1);
  });

  it('lists queued rows and offers a retry once something has failed', () => {
    const panel = buildQueuePanel(
      t,
      input({ operations: [buildQueuedOperation()], pendingCount: 1, hasFailed: true }),
    );

    expect(panel.rows).toHaveLength(1);
    expect(panel.hasFailed).toBe(true);
    expect(panel.badgeLabel).toBe(`${I18N_KEYS.scorekeeperQueue.queuedBadge}:{"count":1}`);
  });
});

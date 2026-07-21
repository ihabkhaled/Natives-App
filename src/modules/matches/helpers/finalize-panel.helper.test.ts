import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildScoreboard } from '@/tests/msw/matches-domain.fixture';

import { buildFinalizePanel, type FinalizePanelInput } from './finalize-panel.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function input(overrides: Partial<FinalizePanelInput> = {}): FinalizePanelInput {
  return {
    scoreboard: buildScoreboard({ status: 'completed' }),
    queuedCount: 0,
    lastKnownStreamVersion: 14,
    canFinalize: true,
    isRunning: false,
    onFinalize: vi.fn(),
    ...overrides,
  };
}

describe('buildFinalizePanel', () => {
  it('enables finalizing once everything is synced and current', () => {
    const panel = buildFinalizePanel(t, input());

    expect(panel.disabled).toBe(false);
    expect(panel.blockedNotice).toBeNull();
    expect(panel.statusNotice).toBe(I18N_KEYS.scoreboard.finalizeReady);
  });

  it('states the queue as the blocking reason, with the count', () => {
    const panel = buildFinalizePanel(t, input({ queuedCount: 3 }));

    expect(panel.disabled).toBe(true);
    expect(panel.blockedNotice).toBe(`${I18N_KEYS.scoreboard.finalizeBlockedQueue}:{"count":3}`);
  });

  it('states a stale projection as the blocking reason', () => {
    const panel = buildFinalizePanel(t, input({ lastKnownStreamVersion: 20 }));

    expect(panel.blockedNotice).toBe(`${I18N_KEYS.scoreboard.finalizeBlockedStale}:{"count":0}`);
  });

  it('disables the action on an already finalized match and says so', () => {
    const panel = buildFinalizePanel(
      t,
      input({ scoreboard: buildScoreboard({ status: 'finalized' }) }),
    );

    expect(panel.disabled).toBe(true);
    expect(panel.statusNotice).toBe(I18N_KEYS.scoreboard.finalizeDone);
  });
});

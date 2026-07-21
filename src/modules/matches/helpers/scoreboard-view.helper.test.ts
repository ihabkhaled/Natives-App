import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import {
  buildMatchEvent,
  buildMatchRuleset,
  buildScoreboard,
} from '@/tests/msw/matches-domain.fixture';
import { buildIdleQueueInput, buildTimelineInput } from '@/tests/msw/matches-view.fixture';

import { buildScoreboardView, type ScoreboardViewInput } from './scoreboard-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function input(overrides: Partial<ScoreboardViewInput> = {}): ScoreboardViewInput {
  return {
    scoreboard: buildScoreboard(),
    ruleset: buildMatchRuleset(),
    events: [buildMatchEvent()],
    memberOptions: [],
    status: 'ready',
    error: null,
    isOffline: false,
    canScore: true,
    canFinalize: true,
    onRetry: vi.fn(),
    onBack: vi.fn(),
    queue: buildIdleQueueInput(vi.fn()),
    timeline: buildTimelineInput(vi.fn()),
    scorerValue: 'unattributed',
    assistValue: 'unattributed',
    isSubmitting: false,
    isTransitioning: false,
    isFinalizing: false,
    lastKnownStreamVersion: 14,
    onScorerChange: vi.fn(),
    onAssistChange: vi.fn(),
    onPoint: vi.fn(),
    onTimeout: vi.fn(),
    onTransition: vi.fn(),
    onFinalize: vi.fn(),
    ...overrides,
  };
}

describe('buildScoreboardView', () => {
  it('assembles every panel of the field screen', () => {
    const view = buildScoreboardView(t, input());

    expect(view.head.ourScore).toBe('8');
    expect(view.rules).toHaveLength(9);
    expect(view.scoring.usControl.disabled).toBe(false);
    expect(view.timeouts.usControl.disabled).toBe(false);
    expect(view.queue.badgeLabel).toBe(I18N_KEYS.scorekeeperQueue.onlineBadge);
    expect(view.timeline.rows).toHaveLength(1);
    expect(view.permissionNotice).toBeNull();
  });

  it('explains the read-only case without the scoring grant', () => {
    const view = buildScoreboardView(t, input({ canScore: false }));

    expect(view.permissionNotice).toBe(I18N_KEYS.scoreboard.permissionNotice);
    expect(view.scoring.usControl.disabled).toBe(true);
  });

  it('says the queue is full and blocks scoring rather than dropping a point', () => {
    const view = buildScoreboardView(t, input({ queue: { ...input().queue, isAtLimit: true } }));

    expect(view.scoring.blockedNotice).toBe(I18N_KEYS.scorekeeperQueue.limitBlocked);
    expect(view.scoring.usControl.disabled).toBe(true);
    expect(view.queue.limitTitle).toBe(I18N_KEYS.scorekeeperQueue.limitTitle);
  });

  it('says scoring is closed when the server has closed it', () => {
    const view = buildScoreboardView(
      t,
      input({ scoreboard: buildScoreboard({ scoringOpen: false }) }),
    );

    expect(view.scoring.blockedNotice).toBe(I18N_KEYS.scoreboard.scoringClosed);
  });

  it('blocks finalizing while work is queued', () => {
    const view = buildScoreboardView(t, input({ queue: { ...input().queue, pendingCount: 2 } }));

    expect(view.finalize.disabled).toBe(true);
    expect(view.finalize.blockedNotice).toBe(
      `${I18N_KEYS.scoreboard.finalizeBlockedQueue}:{"count":2}`,
    );
  });

  it('routes the transition and the finalize actions', () => {
    const onTransition = vi.fn();
    const onFinalize = vi.fn();
    const view = buildScoreboardView(t, input({ onTransition, onFinalize }));

    view.state.onTransition('pause');
    view.finalize.onFinalize();

    expect(onTransition).toHaveBeenCalledWith('pause');
    expect(onFinalize).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildScoreboard } from '@/tests/msw/matches-domain.fixture';

import { buildScoringPanel, buildStatePanel, buildTimeoutPanel } from './scoreboard-panels.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function scoringInput(overrides: Record<string, unknown> = {}) {
  return {
    scoreboard: buildScoreboard(),
    canScore: true,
    isBlocked: false,
    isSubmitting: false,
    blockedNotice: null,
    scorerValue: 'unattributed',
    assistValue: 'unattributed',
    memberOptions: [],
    onScorerChange: vi.fn(),
    onAssistChange: vi.fn(),
    onPoint: vi.fn(),
    ...overrides,
  };
}

describe('buildScoringPanel', () => {
  it('enables both targets when scoring is open and granted', () => {
    const panel = buildScoringPanel(t, scoringInput());

    expect(panel.usControl.disabled).toBe(false);
    expect(panel.themControl.disabled).toBe(false);
  });

  it('disables scoring without the grant', () => {
    expect(buildScoringPanel(t, scoringInput({ canScore: false })).usControl.disabled).toBe(true);
  });

  it('disables scoring once the queue is at its limit', () => {
    expect(buildScoringPanel(t, scoringInput({ isBlocked: true })).usControl.disabled).toBe(true);
  });

  it('disables scoring when the server has closed it', () => {
    const panel = buildScoringPanel(
      t,
      scoringInput({ scoreboard: buildScoreboard({ scoringOpen: false }) }),
    );

    expect(panel.themControl.disabled).toBe(true);
  });

  it('routes each target to its side', () => {
    const onPoint = vi.fn();
    const panel = buildScoringPanel(t, scoringInput({ onPoint }));

    panel.usControl.onPress();
    panel.themControl.onPress();

    expect(onPoint.mock.calls).toStrictEqual([['us'], ['them']]);
  });
});

function timeoutInput(overrides: Record<string, unknown> = {}) {
  return {
    scoreboard: buildScoreboard(),
    canScore: true,
    isBlocked: false,
    isSubmitting: false,
    onTimeout: vi.fn(),
    ...overrides,
  };
}

describe('buildTimeoutPanel', () => {
  it('prints the remaining allowance from the rule set', () => {
    const panel = buildTimeoutPanel(t, timeoutInput());

    expect(panel.usRemainingLabel).toBe(
      `${I18N_KEYS.scoreboard.timeoutRemaining}:{"remaining":1,"allowance":2}`,
    );
  });

  it('disables a side that has no timeout left and says so', () => {
    const panel = buildTimeoutPanel(
      t,
      timeoutInput({
        scoreboard: buildScoreboard({
          timeouts: { allowance: 2, remainingForUs: 0, remainingForThem: 2 },
        }),
      }),
    );

    expect(panel.usControl.disabled).toBe(true);
    expect(panel.usRemainingLabel).toBe(I18N_KEYS.scoreboard.timeoutExhausted);
    expect(panel.themControl.disabled).toBe(false);
  });

  it('routes each control to its side', () => {
    const onTimeout = vi.fn();
    const panel = buildTimeoutPanel(t, timeoutInput({ onTimeout }));

    panel.usControl.onPress();
    panel.themControl.onPress();

    expect(onTimeout.mock.calls).toStrictEqual([['us'], ['them']]);
  });
});

describe('buildStatePanel', () => {
  it('enables only the transitions the current status allows', () => {
    const panel = buildStatePanel(t, {
      scoreboard: buildScoreboard(),
      canScore: true,
      isRunning: false,
      onTransition: vi.fn(),
    });
    const enabled = panel.buttons.filter((button) => !button.disabled);

    expect(enabled.map((button) => button.transition)).toStrictEqual([
      'pause',
      'halftime',
      'complete',
    ]);
  });

  it('enables nothing on a finalized match', () => {
    const panel = buildStatePanel(t, {
      scoreboard: buildScoreboard({ status: 'finalized' }),
      canScore: true,
      isRunning: false,
      onTransition: vi.fn(),
    });

    expect(panel.buttons.every((button) => button.disabled)).toBe(true);
  });

  it('enables nothing without the scoring grant', () => {
    const panel = buildStatePanel(t, {
      scoreboard: buildScoreboard({ status: 'ready' }),
      canScore: false,
      isRunning: false,
      onTransition: vi.fn(),
    });

    expect(panel.buttons.every((button) => button.disabled)).toBe(true);
  });

  it('offers ready from scheduled', () => {
    const panel = buildStatePanel(t, {
      scoreboard: buildScoreboard({ status: 'scheduled' }),
      canScore: true,
      isRunning: false,
      onTransition: vi.fn(),
    });

    expect(panel.buttons.find((button) => !button.disabled)?.transition).toBe('ready');
  });
});

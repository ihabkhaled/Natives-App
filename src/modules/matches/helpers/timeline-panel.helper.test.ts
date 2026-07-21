import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildTimelineInput } from '@/tests/msw/matches-view.fixture';

import {
  buildTimelinePanel,
  isCorrectionReasonValid,
  type TimelinePanelInput,
} from './timeline-panel.helper';

const t = (key: string): string => key;

function input(overrides: Partial<TimelinePanelInput> = {}): TimelinePanelInput {
  return { ...buildTimelineInput(vi.fn()), ...overrides };
}

describe('buildTimelinePanel', () => {
  it('enables undo when a point can be corrected and nothing is queued', () => {
    const panel = buildTimelinePanel(t, input());

    expect(panel.undoDisabled).toBe(false);
    expect(panel.undoBlockedNotice).toBeNull();
  });

  it('BLOCKS undo while anything is still queued, and says why', () => {
    const panel = buildTimelinePanel(t, input({ hasQueuedWork: true }));

    expect(panel.undoDisabled).toBe(true);
    expect(panel.undoBlockedNotice).toBe(I18N_KEYS.scoreboard.undoQueuedFirst);
  });

  it('disables undo when there is nothing to correct', () => {
    expect(buildTimelinePanel(t, input({ undoableEventId: null })).undoDisabled).toBe(true);
  });

  it('disables undo without the scoring grant', () => {
    expect(buildTimelinePanel(t, input({ canScore: false })).undoDisabled).toBe(true);
  });

  it('renders the bounded timeline rows', () => {
    expect(buildTimelinePanel(t, input()).rows).toHaveLength(1);
  });
});

describe('isCorrectionReasonValid', () => {
  it('requires the minimum the backend requires', () => {
    expect(isCorrectionReasonValid('oops')).toBe(false);
    expect(isCorrectionReasonValid('   ')).toBe(false);
    expect(isCorrectionReasonValid('mis-tap on the sideline')).toBe(true);
  });
});

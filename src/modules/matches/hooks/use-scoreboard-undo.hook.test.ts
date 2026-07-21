import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMatchEvent } from '@/tests/msw/matches-domain.fixture';

import { useScoreboardUndo } from './use-scoreboard-undo.hook';

const onCorrect = vi.fn();

function scope(overrides: Record<string, unknown> = {}) {
  return {
    events: [buildMatchEvent()],
    undoableEvent: buildMatchEvent(),
    canScore: true,
    hasQueuedWork: false,
    isRunning: false,
    onCorrect,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useScoreboardUndo', () => {
  it('opens, edits, and confirms a correction carrying the typed reason', () => {
    const { result } = renderHook(() => useScoreboardUndo(scope()));

    act(() => {
      result.current.onUndoOpen();
    });
    expect(result.current.isUndoOpen).toBe(true);

    act(() => {
      result.current.onUndoReasonChange('  mis-tap on the sideline  ');
    });
    act(() => {
      result.current.onUndoConfirm();
    });

    expect(onCorrect).toHaveBeenCalledWith('event-1', 'mis-tap on the sideline');
    expect(result.current.isUndoOpen).toBe(false);
  });

  it('refuses to submit a reason shorter than the backend minimum', () => {
    const { result } = renderHook(() => useScoreboardUndo(scope()));

    act(() => {
      result.current.onUndoOpen();
      result.current.onUndoReasonChange('oops');
    });
    act(() => {
      result.current.onUndoConfirm();
    });

    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('refuses to correct when there is nothing to compensate', () => {
    const { result } = renderHook(() => useScoreboardUndo(scope({ undoableEvent: null })));

    act(() => {
      result.current.onUndoReasonChange('mis-tap on the sideline');
    });
    act(() => {
      result.current.onUndoConfirm();
    });

    expect(onCorrect).not.toHaveBeenCalled();
    expect(result.current.undoableEventId).toBeNull();
  });

  it('cancels without correcting anything', () => {
    const { result } = renderHook(() => useScoreboardUndo(scope()));

    act(() => {
      result.current.onUndoOpen();
    });
    act(() => {
      result.current.onUndoCancel();
    });

    expect(result.current.isUndoOpen).toBe(false);
    expect(onCorrect).not.toHaveBeenCalled();
  });
});

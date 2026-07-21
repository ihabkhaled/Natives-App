import { act, renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as UiModule from '@/shared/ui';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useScorekeeperActionMutation } from '../mutations/use-scorekeeper-action-mutation.hook';
import { useScorekeeperControls } from './use-scorekeeper-controls.hook';
import type { ScorekeeperPayload } from '../types/matches.types';

const { showToast, submit } = vi.hoisted(() => ({
  showToast: vi.fn(),
  submit: vi.fn<(variables: { baseStreamVersion: number; payload: ScorekeeperPayload }) => void>(),
}));

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof UiModule>()),
  useAppToast: () => ({ showToast }),
}));
vi.mock('../mutations/use-scorekeeper-action-mutation.hook', () => ({
  useScorekeeperActionMutation: vi.fn(),
}));

const SCOPE = {
  ownerUserId: 'user-1',
  teamId: 'team-natives',
  matchId: 'match-1',
  isOnline: true,
  baseStreamVersion: 14,
};

function lastMutationScope() {
  return vi.mocked(useScorekeeperActionMutation).mock.calls.at(-1)![0];
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useScorekeeperActionMutation).mockReturnValue({ submit, isSubmitting: false });
});

describe('useScorekeeperControls', () => {
  it('records a point for us with the selected scorer and the base stream version', () => {
    const { result } = renderHook(() => useScorekeeperControls(SCOPE));

    act(() => {
      result.current.setScorer('mem-omar');
      result.current.setAssist('mem-nadia');
    });
    act(() => {
      result.current.recordPoint('us');
    });

    expect(submit).toHaveBeenCalledWith({
      baseStreamVersion: 14,
      payload: {
        kind: 'point',
        scoringSide: 'us',
        scorerMembershipId: 'mem-omar',
        assistMembershipId: 'mem-nadia',
      },
    });
  });

  it('never attributes an opponent point to one of our players', () => {
    const { result } = renderHook(() => useScorekeeperControls(SCOPE));

    act(() => {
      result.current.setScorer('mem-omar');
    });
    act(() => {
      result.current.recordPoint('them');
    });

    expect(submit).toHaveBeenCalledWith({
      baseStreamVersion: 14,
      payload: {
        kind: 'point',
        scoringSide: 'them',
        scorerMembershipId: null,
        assistMembershipId: null,
      },
    });
  });

  it('leaves an unattributed point unattributed', () => {
    const { result } = renderHook(() => useScorekeeperControls(SCOPE));

    act(() => {
      result.current.recordPoint('us');
    });

    expect(submit.mock.calls[0]?.[0].payload).toStrictEqual({
      kind: 'point',
      scoringSide: 'us',
      scorerMembershipId: null,
      assistMembershipId: null,
    });
  });

  it('records a timeout and a compensating correction', () => {
    const { result } = renderHook(() => useScorekeeperControls(SCOPE));

    act(() => {
      result.current.recordTimeout('them');
      result.current.recordCorrection('event-1', 'mis-tap on the sideline');
    });

    expect(submit.mock.calls[0]?.[0].payload).toStrictEqual({
      kind: 'timeout',
      scoringSide: 'them',
    });
    expect(submit.mock.calls[1]?.[0].payload).toStrictEqual({
      kind: 'void',
      eventId: 'event-1',
      reason: 'mis-tap on the sideline',
    });
  });

  it('tells the field a replay did not change the score', () => {
    renderHook(() => useScorekeeperControls(SCOPE));

    lastMutationScope().onResult('replayed');

    expect(showToast).toHaveBeenCalledWith({
      message: 'Already recorded — the score did not change.',
      tone: 'success',
    });
  });

  it('tells the field a conflict needs a decision', () => {
    renderHook(() => useScorekeeperControls(SCOPE));

    lastMutationScope().onResult('conflict');

    expect(showToast).toHaveBeenCalledWith({
      message: 'Conflict: this action needs your decision.',
      tone: 'danger',
    });
  });
});

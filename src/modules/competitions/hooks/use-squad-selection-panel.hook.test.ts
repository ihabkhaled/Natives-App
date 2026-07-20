import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { buildCandidate } from '../../../../tests/factories/competitions.factory';
import { useSquadSelectionPanel } from './use-squad-selection-panel.hook';

const spies = vi.hoisted(() => ({ run: vi.fn(), showToast: vi.fn() }));

vi.mock('../mutations/use-select-player-mutation.hook', () => ({
  useSelectPlayerMutation: vi.fn(() => ({ run: spies.run, isRunning: false })),
}));
vi.mock('./use-squad-eligibility-query.hook', () => ({
  useSquadEligibilityQuery: vi.fn(() => ({
    data: {
      squadId: 'squad-1',
      policyVersion: 'v3',
      attendanceThresholdPct: 70,
      total: 2,
      selectedGenderRatio: { men: 1, women: 0, mixed: 0, unknown: 0, total: 1, balanced: false },
      candidates: [
        { ...buildCandidate({ membershipId: 'm-pass' }) },
        { ...buildCandidate({ membershipId: 'm-fail', overall: 'failed' }) },
        { ...buildCandidate({ membershipId: 'm-selected', selected: true }) },
      ],
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: () => ({ showToast: spies.showToast }),
}));

const INPUT = {
  teamId: 'team-1',
  squadId: 'squad-1',
  isLocked: false,
  canSelect: true,
  canOverride: true,
};

beforeAll(async () => {
  await initTestI18n();
});

describe('useSquadSelectionPanel', () => {
  it('selects a policy-clean candidate directly', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));
    act(() => {
      result.current.onToggle('m-pass');
    });

    expect(spies.run).toHaveBeenCalledWith({ intent: 'select', membershipId: 'm-pass' });
  });

  it('removes a candidate already in the squad', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));
    act(() => {
      result.current.onToggle('m-selected');
    });

    expect(spies.run).toHaveBeenCalledWith({ intent: 'remove', membershipId: 'm-selected' });
  });

  it('opens the override dialog for a flagged candidate instead of selecting', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));
    act(() => {
      result.current.onToggle('m-fail');
    });

    expect(result.current.override).not.toBeNull();
    expect(result.current.override?.canConfirm).toBe(false);
  });

  it('sends the override once a reason is typed, then closes the dialog', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));
    act(() => {
      result.current.onToggle('m-fail');
    });
    act(() => {
      result.current.override?.onReasonChange('Needed for handler depth');
    });
    act(() => {
      result.current.override?.onConfirm();
    });

    expect(spies.run).toHaveBeenCalledWith({
      intent: 'override',
      membershipId: 'm-fail',
      overrideReason: 'Needed for handler depth',
    });

    act(() => {
      result.current.override?.onCancel();
    });
    expect(result.current.override).toBeNull();
  });

  it('ignores a toggle for a membership the report does not contain', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));
    spies.run.mockClear();
    act(() => {
      result.current.onToggle('m-unknown');
    });

    expect(spies.run).not.toHaveBeenCalled();
    expect(result.current.override).toBeNull();
  });

  it('reports an unbalanced selected squad honestly', () => {
    const { result } = renderHook(() => useSquadSelectionPanel(INPUT));

    expect(result.current.ratioVerdict).toBe('Outside the division ratio');
  });
});

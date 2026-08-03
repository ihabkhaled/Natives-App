import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { applyRepair } from '../services/apply-repair.service';
import { runScan } from '../services/run-scan.service';
import { transitionAnomaly } from '../services/transition-anomaly.service';
import { useApplyRepairMutation } from './use-apply-repair-mutation.hook';
import { useScanMutation } from './use-scan-mutation.hook';
import { useTransitionAnomalyMutation } from './use-transition-anomaly-mutation.hook';

vi.mock('../services/apply-repair.service', () => ({ applyRepair: vi.fn() }));
vi.mock('../services/run-scan.service', () => ({ runScan: vi.fn() }));
vi.mock('../services/transition-anomaly.service', () => ({ transitionAnomaly: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(applyRepair).mockResolvedValue({} as never);
  vi.mocked(runScan).mockResolvedValue({} as never);
  vi.mocked(transitionAnomaly).mockResolvedValue({} as never);
});

describe('useApplyRepairMutation', () => {
  it('applies the repair for the anomaly it was given', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useApplyRepairMutation('t1', { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run('a1');
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(applyRepair).toHaveBeenCalledWith({ teamId: 't1', anomalyId: 'a1' });
  });

  it('reports a failure instead of leaving the screen silent', async () => {
    vi.mocked(applyRepair).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useApplyRepairMutation('t1', { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run('a1');
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useTransitionAnomalyMutation', () => {
  it('sends the record version so a stale move is refused by the server', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useTransitionAnomalyMutation('t1', { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ anomalyId: 'a1', transition: 'resolve', expectedRecordVersion: 7 });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(transitionAnomaly).toHaveBeenCalledWith({
      teamId: 't1',
      anomalyId: 'a1',
      transition: 'resolve',
      expectedRecordVersion: 7,
      resolution: null,
    });
  });
});

describe('useScanMutation', () => {
  it('runs every rule for the team', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useScanMutation('t1', { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run(undefined);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(runScan).toHaveBeenCalledWith('t1');
  });
});

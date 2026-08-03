import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { applyRepair } from '../services/apply-repair.service';
import { runScan } from '../services/run-scan.service';
import { transitionAnomaly } from '../services/transition-anomaly.service';
import { useDataQualityActions } from './use-data-quality-actions.hook';

vi.mock('../services/apply-repair.service', () => ({ applyRepair: vi.fn() }));
vi.mock('../services/run-scan.service', () => ({ runScan: vi.fn() }));
vi.mock('../services/transition-anomaly.service', () => ({ transitionAnomaly: vi.fn() }));

const t = (key: string): string => `t:${key}`;

function render(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useDataQualityActions>>
> {
  return renderHookWithProviders(() => useDataQualityActions(t, 't1'));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(applyRepair).mockResolvedValue({} as never);
  vi.mocked(runScan).mockResolvedValue({} as never);
  vi.mocked(transitionAnomaly).mockResolvedValue({} as never);
});

describe('useDataQualityActions', () => {
  it('starts with no notice — nothing has happened yet', () => {
    expect(render().result.current.notice).toBeNull();
  });

  it('runs a scan and reports it is running', async () => {
    const { result } = render();

    act(() => {
      result.current.onScan();
    });

    await waitFor(() => {
      expect(runScan).toHaveBeenCalledWith('t1');
    });
  });

  it('applies a repair through the anomaly it was given', async () => {
    const { result } = render();

    act(() => {
      result.current.onApply('a1');
    });

    await waitFor(() => {
      expect(applyRepair).toHaveBeenCalledWith({ teamId: 't1', anomalyId: 'a1' });
    });
  });

  it('moves an anomaly through its lifecycle', async () => {
    const { result } = render();

    act(() => {
      result.current.onTransition({
        anomalyId: 'a1',
        transition: 'acknowledge',
        expectedRecordVersion: 1,
      });
    });

    await waitFor(() => {
      expect(transitionAnomaly).toHaveBeenCalled();
    });
  });

  it.each([
    [
      'scan',
      (view: ReturnType<typeof useDataQualityActions>) => {
        view.onScan();
      },
      runScan,
    ],
    [
      'apply',
      (view: ReturnType<typeof useDataQualityActions>) => {
        view.onApply('a1');
      },
      applyRepair,
    ],
  ])(
    'says the %s action did not complete rather than surfacing the raw error',
    async (_name, invoke, service) => {
      vi.mocked(service).mockRejectedValue(new Error('database exploded'));
      const { result } = render();

      act(() => {
        invoke(result.current);
      });

      await waitFor(() => {
        expect(result.current.notice).toBe('t:dataQuality.actionFailed');
      });
    },
  );

  it('clears a stale failure once the next action succeeds', async () => {
    vi.mocked(runScan).mockRejectedValueOnce(new Error('boom'));
    const { result } = render();

    act(() => {
      result.current.onScan();
    });
    await waitFor(() => {
      expect(result.current.notice).toBe('t:dataQuality.actionFailed');
    });

    vi.mocked(runScan).mockResolvedValue({} as never);
    act(() => {
      result.current.onScan();
    });

    await waitFor(() => {
      expect(result.current.notice).toBeNull();
    });
  });
});

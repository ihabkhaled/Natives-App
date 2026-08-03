import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { withdrawTryoutCandidate } from '../services/withdraw-tryout-candidate.service';
import { useWithdrawCandidateMutation } from './use-withdraw-candidate-mutation.hook';

vi.mock('../services/withdraw-tryout-candidate.service', () => ({
  withdrawTryoutCandidate: vi.fn(),
}));

const INPUT = {
  candidateId: 'candidate-1',
  reason: 'Asked us to remove them.',
  expectedRecordVersion: 7,
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(withdrawTryoutCandidate).mockResolvedValue({} as never);
});

describe('useWithdrawCandidateMutation', () => {
  it('sends the record version so a stale withdrawal is refused by the server', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useWithdrawCandidateMutation('t1', { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ ...INPUT });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(withdrawTryoutCandidate).toHaveBeenCalledWith({ teamId: 't1', ...INPUT });
  });

  it('reports a failure instead of leaving the screen silent', async () => {
    vi.mocked(withdrawTryoutCandidate).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useWithdrawCandidateMutation('t1', { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ ...INPUT });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('reports while the withdrawal is in flight', async () => {
    vi.mocked(withdrawTryoutCandidate).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderHookWithProviders(() =>
      useWithdrawCandidateMutation('t1', { onSuccess: vi.fn(), onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ ...INPUT });
    });

    await waitFor(() => {
      expect(result.current.isRunning).toBe(true);
    });
  });
});

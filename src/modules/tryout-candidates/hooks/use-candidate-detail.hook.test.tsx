import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TRYOUT_CANDIDATES } from '@/tests/msw/tryout-candidates.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getTryoutCandidate } from '../services/get-tryout-candidate.service';
import { useCandidateDetail } from './use-candidate-detail.hook';

vi.mock('../services/get-tryout-candidate.service', () => ({ getTryoutCandidate: vi.fn() }));

function render(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useCandidateDetail>>
> {
  return renderHookWithProviders(() => useCandidateDetail('team-1'));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTryoutCandidate).mockResolvedValue(MOCK_TRYOUT_CANDIDATES[0]!);
});

describe('useCandidateDetail', () => {
  it('reads nobody until a reviewer opens a record', () => {
    const { result } = render();

    expect(result.current.candidate).toBeNull();
    expect(getTryoutCandidate).not.toHaveBeenCalled();
  });

  it('reads the candidate that was actually opened', async () => {
    const { result } = render();

    act(() => {
      result.current.select('candidate-1');
    });

    await waitFor(() => {
      expect(result.current.candidate?.candidateId).toBe('candidate-1');
    });
    expect(getTryoutCandidate).toHaveBeenCalledWith('team-1', 'candidate-1');
  });

  it('reports the selection immediately, before the record arrives', () => {
    const { result } = render();

    act(() => {
      result.current.select('candidate-2');
    });

    expect(result.current.selectedId).toBe('candidate-2');
    expect(result.current.candidate).toBeNull();
  });

  it('resolves to null rather than undefined when the read fails', async () => {
    vi.mocked(getTryoutCandidate).mockRejectedValue(new Error('boom'));
    const { result } = render();

    act(() => {
      result.current.select('candidate-1');
    });

    await waitFor(() => {
      expect(getTryoutCandidate).toHaveBeenCalled();
    });
    expect(result.current.candidate).toBeNull();
  });
});

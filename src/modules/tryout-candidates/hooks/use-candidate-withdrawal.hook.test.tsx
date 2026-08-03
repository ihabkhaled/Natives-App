import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TRYOUT_CANDIDATES } from '@/tests/msw/tryout-candidates.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { withdrawTryoutCandidate } from '../services/withdraw-tryout-candidate.service';
import type { TryoutCandidate } from '../types/tryout-candidates.types';
import { useCandidateWithdrawal } from './use-candidate-withdrawal.hook';

vi.mock('../services/withdraw-tryout-candidate.service', () => ({
  withdrawTryoutCandidate: vi.fn(),
}));

const t = (key: string): string => `t:${key}`;
const CANDIDATE = MOCK_TRYOUT_CANDIDATES[0]!;

function render(
  candidate: TryoutCandidate | null = CANDIDATE,
): ReturnType<typeof renderHookWithProviders<ReturnType<typeof useCandidateWithdrawal>>> {
  return renderHookWithProviders(() => useCandidateWithdrawal(t, 'team-1', candidate));
}

/** Opens the panel and types a reason long enough to submit. */
function openWithReason(reason = 'Asked us to remove them.'): ReturnType<typeof render> {
  const view = render();
  act(() => {
    view.result.current.open();
  });
  act(() => {
    view.result.current.view?.onReasonChange(reason);
  });
  return view;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(withdrawTryoutCandidate).mockResolvedValue(CANDIDATE);
});

describe('useCandidateWithdrawal', () => {
  it('shows nothing until a reviewer asks to withdraw someone', () => {
    expect(render().result.current.view).toBeNull();
  });

  it('does nothing when there is no candidate open', () => {
    const { result } = render(null);

    act(() => {
      result.current.open();
    });

    expect(result.current.view).toBeNull();
  });

  it('states the consequence and names the person before anything is sent', () => {
    const { result } = openWithReason('');

    expect(result.current.view?.subjectName).toBe('Nour El-Sayed');
    expect(result.current.view?.consequence).toBe('t:dataQuality.previewIrreversible');
    expect(withdrawTryoutCandidate).not.toHaveBeenCalled();
  });

  it('refuses to submit until a reason has been written', () => {
    const { result } = openWithReason('no');

    expect(result.current.view?.canSubmit).toBe(false);
    expect(result.current.view?.validationMessage).toBe('t:tryouts.decisionReasonRequired');
  });

  it('sends the reason and the record version the reviewer was looking at', async () => {
    const { result } = openWithReason();

    act(() => {
      result.current.view?.onSubmit();
    });

    await waitFor(() => {
      expect(withdrawTryoutCandidate).toHaveBeenCalledWith({
        teamId: 'team-1',
        candidateId: 'candidate-1',
        reason: 'Asked us to remove them.',
        expectedRecordVersion: 1,
      });
    });
  });

  it('closes the panel once the server accepted the withdrawal', async () => {
    const { result } = openWithReason();

    act(() => {
      result.current.view?.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.view).toBeNull();
    });
    expect(result.current.notice).toBeNull();
  });

  it('says the action did not complete rather than surfacing the raw error', async () => {
    vi.mocked(withdrawTryoutCandidate).mockRejectedValue(new Error('database exploded'));
    const { result } = openWithReason();

    act(() => {
      result.current.view?.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.notice).toBe('t:tryoutCandidates.actionFailed');
    });
  });

  it('cancels without sending anything', () => {
    const { result } = openWithReason();

    act(() => {
      result.current.view?.onCancel();
    });

    expect(result.current.view).toBeNull();
    expect(withdrawTryoutCandidate).not.toHaveBeenCalled();
  });

  it('forgets a half-typed reason when the panel is reopened', () => {
    const { result } = openWithReason('mistaken text');

    act(() => {
      result.current.view?.onCancel();
    });
    act(() => {
      result.current.open();
    });

    expect(result.current.view?.reason).toBe('');
  });

  it('closes itself when a different candidate is opened', () => {
    // The panel is keyed to the person it was opened for, so a half-typed
    // reason can never be re-aimed at somebody else.
    const other = { ...CANDIDATE, candidateId: 'candidate-9' };
    const { result, rerender } = renderHookWithProviders((props?: { candidate: TryoutCandidate }) =>
      useCandidateWithdrawal(t, 'team-1', props?.candidate ?? CANDIDATE),
    );

    act(() => {
      result.current.open();
    });
    expect(result.current.view).not.toBeNull();

    rerender({ candidate: other });

    expect(result.current.view).toBeNull();
  });
});

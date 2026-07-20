import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';

import type { TryoutsMutationCallbacks as MutationCallbacks } from '../types/mutation.types';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import type { CandidateDetail } from '../types/tryouts.types';
import { useCandidateConversion } from './use-candidate-conversion.hook';
import { useCandidateDecision } from './use-candidate-decision.hook';
import { useCandidateEvaluation } from './use-candidate-evaluation.hook';

const spies = vi.hoisted(() => ({
  decide: vi.fn(),
  evaluate: vi.fn(),
  convert: vi.fn(),
  confirm: vi.fn(() => Promise.resolve(true)),
  showToast: vi.fn(),
  callbacks: [] as { onSuccess: () => void; onError: () => void }[],
}));

vi.mock('../mutations/use-decide-candidate-mutation.hook', () => ({
  useDecideCandidateMutation: vi.fn(
    (_team: string, _tryout: string, callbacks: MutationCallbacks) => {
      spies.callbacks.push(callbacks);
      return { run: spies.decide, isRunning: false };
    },
  ),
}));
vi.mock('../mutations/use-save-evaluation-mutation.hook', () => ({
  useSaveEvaluationMutation: vi.fn(
    (_team: string, _tryout: string, callbacks: MutationCallbacks) => {
      spies.callbacks.push(callbacks);
      return { run: spies.evaluate, isRunning: false };
    },
  ),
}));
vi.mock('../mutations/use-convert-candidate-mutation.hook', () => ({
  useConvertCandidateMutation: vi.fn(
    (_team: string, _tryout: string, callbacks: MutationCallbacks) => {
      spies.callbacks.push(callbacks);
      return { run: spies.convert, isRunning: false };
    },
  ),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: () => ({ showToast: spies.showToast }),
  useConfirmAlert: () => ({ confirm: spies.confirm }),
}));

function detail(overrides: Partial<CandidateDetail> = {}): CandidateDetail {
  return {
    summary: {
      candidateId: 'cand-1',
      reference: 'UN-1',
      displayName: 'Candidate One',
      status: 'accepted',
      checkedInAt: null,
      evaluationCount: 0,
    },
    consentVersion: 'v1',
    consentedAt: '2026-07-02T09:00:00.000Z',
    birthYear: null,
    contacts: null,
    readiness: null,
    scores: [],
    evaluationNote: null,
    decision: null,
    convertedMembershipId: null,
    existingAccount: false,
    ...overrides,
  };
}

function base(record: CandidateDetail | null, isPermitted = true) {
  return { teamId: 'team-1', tryoutId: 'try-1', detail: record, isPermitted };
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useCandidateDecision', () => {
  it('refuses to send a decision while the reason is too short', () => {
    const { result } = renderHook(() => useCandidateDecision(base(detail())));
    spies.decide.mockClear();
    act(() => {
      result.current.actions[0]?.onSelect();
    });

    expect(spies.decide).not.toHaveBeenCalled();
    expect(result.current.validationMessage).not.toBeNull();
  });

  it('sends the decision once a reason is written', () => {
    const { result } = renderHook(() => useCandidateDecision(base(detail())));
    act(() => {
      result.current.onReasonChange('Consistent across every drill');
    });
    act(() => {
      result.current.actions[0]?.onSelect();
    });

    expect(spies.decide).toHaveBeenCalledWith({
      candidateId: 'cand-1',
      outcome: 'accept',
      reason: 'Consistent across every drill',
    });
  });

  it('offers no action and explains itself without the decide grant', () => {
    const { result } = renderHook(() => useCandidateDecision(base(detail(), false)));

    expect(result.current.actions).toEqual([]);
    expect(result.current.forbiddenNotice).not.toBeNull();
  });

  it('does nothing when no candidate is selected yet', () => {
    const { result } = renderHook(() => useCandidateDecision(base(null)));
    spies.decide.mockClear();
    act(() => {
      result.current.onReasonChange('Consistent across every drill');
    });
    act(() => {
      result.current.actions[0]?.onSelect();
    });

    expect(spies.decide).not.toHaveBeenCalled();
    expect(result.current.currentLabel).toBeNull();
    expect(result.current.offerExpiryLabel).toBeNull();
  });

  it('shows the offer expiry of a recorded acceptance', () => {
    const { result } = renderHook(() =>
      useCandidateDecision(
        base(
          detail({
            decision: {
              outcome: 'accept',
              reason: 'Great.',
              decidedAt: '2026-08-16T10:00:00.000Z',
              offerExpiresAt: '2026-08-30T10:00:00.000Z',
            },
          }),
        ),
      ),
    );

    expect(result.current.currentLabel).toBe('Accept and offer');
    expect(result.current.offerExpiryLabel).toContain('Offer expires');
  });
});

describe('useCandidateEvaluation', () => {
  it('sends every criterion, keeping the unscored ones null', () => {
    const { result } = renderHook(() => useCandidateEvaluation(base(detail())));
    act(() => {
      result.current.rows[0]?.onChange('4');
    });
    act(() => {
      result.current.onNoteChange('Strong forehand.');
    });
    act(() => {
      result.current.onSubmit();
    });

    expect(spies.evaluate).toHaveBeenCalledWith({
      candidateId: 'cand-1',
      scores: [
        { criterion: 'throwing', score: 4 },
        { criterion: 'catching', score: null },
        { criterion: 'movement', score: null },
        { criterion: 'attitude', score: null },
      ],
      note: 'Strong forehand.',
    });
  });

  it('sends a null note rather than an empty string', () => {
    const { result } = renderHook(() => useCandidateEvaluation(base(detail())));
    spies.evaluate.mockClear();
    act(() => {
      result.current.onNoteChange('   ');
    });
    act(() => {
      result.current.onSubmit();
    });

    expect(spies.evaluate.mock.calls[0]?.[0]).toMatchObject({ note: null });
  });

  it('does nothing without a selected candidate and explains a missing grant', () => {
    const { result } = renderHook(() => useCandidateEvaluation(base(null, false)));
    spies.evaluate.mockClear();
    act(() => {
      result.current.onSubmit();
    });

    expect(spies.evaluate).not.toHaveBeenCalled();
    expect(result.current.forbiddenNotice).not.toBeNull();
  });
});

describe('useCandidateConversion', () => {
  it('converts after the administrator confirms', async () => {
    const { result } = renderHook(() => useCandidateConversion(base(detail())));
    spies.convert.mockClear();
    await act(async () => {
      result.current.onConfirm();
      await Promise.resolve();
    });

    expect(spies.confirm).toHaveBeenCalled();
    expect(spies.convert).toHaveBeenCalledWith('cand-1');
  });

  it('reports an already-converted candidate instead of converting again', () => {
    const { result } = renderHook(() =>
      useCandidateConversion(base(detail({ convertedMembershipId: 'membership-1' }))),
    );

    expect(result.current.blockedNotice).toBe('This candidate is already a member.');
  });

  it('blocks a candidate who was never accepted', () => {
    const { result } = renderHook(() =>
      useCandidateConversion(
        base(detail({ summary: { ...detail().summary, status: 'registered' } })),
      ),
    );

    expect(result.current.blockedNotice).toBe('Only an accepted candidate can be converted.');
  });

  it('converts nothing when the administrator backs out', async () => {
    spies.confirm.mockImplementationOnce(() => Promise.resolve(false));
    const { result } = renderHook(() => useCandidateConversion(base(detail())));
    spies.convert.mockClear();
    await act(async () => {
      result.current.onConfirm();
      await Promise.resolve();
    });

    expect(spies.convert).not.toHaveBeenCalled();
  });

  it('converts nothing when no candidate is selected', async () => {
    const { result } = renderHook(() => useCandidateConversion(base(null)));
    spies.convert.mockClear();
    await act(async () => {
      result.current.onConfirm();
      await Promise.resolve();
    });

    expect(spies.convert).not.toHaveBeenCalled();
    expect(result.current.previewFacts).toEqual([]);
  });

  it('names the account outcome the preview promises', () => {
    const { result } = renderHook(() =>
      useCandidateConversion(base(detail({ existingAccount: true }))),
    );

    expect(result.current.accountNotice).toContain('account already exists');
  });
});

describe('mutation outcome handling', () => {
  it('announces success and failure for every candidate action', () => {
    spies.callbacks.length = 0;
    renderHook(() => useCandidateDecision(base(detail())));
    renderHook(() => useCandidateEvaluation(base(detail())));
    renderHook(() => useCandidateConversion(base(detail())));
    spies.showToast.mockClear();

    for (const callbacks of spies.callbacks) {
      act(() => {
        callbacks.onSuccess();
      });
      act(() => {
        callbacks.onError();
      });
    }

    expect(spies.showToast).toHaveBeenCalledTimes(spies.callbacks.length * 2);
  });
});

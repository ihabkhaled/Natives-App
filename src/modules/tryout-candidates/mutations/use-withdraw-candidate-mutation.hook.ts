import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { tryoutCandidatesQueryKeys } from '../queries/tryout-candidates.keys';
import { withdrawTryoutCandidate } from '../services/withdraw-tryout-candidate.service';
import type { TryoutCandidate } from '../types/tryout-candidates.types';

/** The one command this screen issues, and what it reports back. */
export interface WithdrawCandidateInput {
  readonly candidateId: string;
  readonly reason: string;
  readonly expectedRecordVersion: number;
}

export interface WithdrawCandidateCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/**
 * Withdraw one candidate.
 *
 * The record version travels with the write, so a second reviewer working the
 * same queue is refused rather than silently overwriting the first one's
 * decision. Invalidating the whole team branch re-reads both the list and the
 * open detail, so the status a reviewer sees afterwards is the server's, not
 * an optimistic guess.
 */
export function useWithdrawCandidateMutation(
  teamId: string,
  callbacks: WithdrawCandidateCallbacks,
): InvalidatingMutationView<WithdrawCandidateInput> {
  return useInvalidatingMutation<TryoutCandidate, WithdrawCandidateInput>({
    mutationFn: (input) =>
      withdrawTryoutCandidate({
        teamId,
        candidateId: input.candidateId,
        reason: input.reason,
        expectedRecordVersion: input.expectedRecordVersion,
      }),
    invalidateKey: tryoutCandidatesQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}

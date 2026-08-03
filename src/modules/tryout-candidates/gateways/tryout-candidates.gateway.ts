import { getAppHttpClient } from '@/packages/http';

import {
  tryoutCandidatePath,
  tryoutCandidateRetentionPath,
  tryoutCandidatesPath,
  tryoutCandidateWithdrawalPath,
} from '../constants/tryout-candidates-api.constants';
import {
  listTryoutCandidatesResponseSchema,
  tryoutCandidateResponseSchema,
  tryoutRetentionResponseSchema,
} from '../schemas/tryout-candidates.schema';
import type {
  TryoutCandidate,
  TryoutCandidatesPage,
  TryoutCandidatesQuery,
  TryoutRetentionReport,
  WithdrawCandidateCommand,
} from '../types/tryout-candidates.types';

/**
 * Both reads are documented "privacy redacted": what comes back depends on the
 * caller's grants, and the schema keeps the withheld fields optional so the
 * least-privileged caller is served rather than rejected.
 */
export function requestTryoutCandidates(
  query: TryoutCandidatesQuery,
): Promise<TryoutCandidatesPage> {
  return getAppHttpClient().get(
    tryoutCandidatesPath(query.teamId),
    listTryoutCandidatesResponseSchema,
    { params: { limit: query.limit, offset: query.offset } },
  );
}

export function requestTryoutCandidate(
  teamId: string,
  candidateId: string,
): Promise<TryoutCandidate> {
  return getAppHttpClient().get(
    tryoutCandidatePath(teamId, candidateId),
    tryoutCandidateResponseSchema,
  );
}

/**
 * Withdraw one candidate. The reason travels with the write because it is
 * recorded against a person, and the record version travels with it so the
 * server refuses a stale withdrawal instead of overwriting someone else's move.
 */
export function requestWithdrawTryoutCandidate(
  command: WithdrawCandidateCommand,
): Promise<TryoutCandidate> {
  return getAppHttpClient().post(
    tryoutCandidateWithdrawalPath(command.teamId, command.candidateId),
    { reason: command.reason, expectedRecordVersion: command.expectedRecordVersion },
    tryoutCandidateResponseSchema,
  );
}

/** Anonymize every candidate past their retention window. Irreversible. */
export function requestTryoutRetention(teamId: string): Promise<TryoutRetentionReport> {
  return getAppHttpClient().post(
    tryoutCandidateRetentionPath(teamId),
    {},
    tryoutRetentionResponseSchema,
  );
}

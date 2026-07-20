import { requestTryoutCandidate } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapCandidateDetail } from '../mappers/tryout.mapper';
import type { CandidateDetail } from '../types/tryouts.types';

/**
 * Use case: one candidate record. Contacts and readiness arrive as null when
 * the caller does not hold the matching grant.
 */
export function getTryoutCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<CandidateDetail> {
  return runRequest(async () =>
    mapCandidateDetail(await requestTryoutCandidate(teamId, tryoutId, candidateId)),
  );
}

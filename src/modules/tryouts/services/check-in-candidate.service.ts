import { requestCheckInCandidate } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapCandidateDetail } from '../mappers/tryout.mapper';
import type { CandidateDetail } from '../types/tryouts.types';

/** Use case: check a candidate in on the day. */
export function checkInCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<CandidateDetail> {
  return runRequest(async () =>
    mapCandidateDetail(await requestCheckInCandidate(teamId, tryoutId, candidateId)),
  );
}

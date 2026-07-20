import { requestDecideCandidate } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapCandidateDetail } from '../mappers/tryout.mapper';
import type { CandidateDetail, DecideCandidateCommand } from '../types/tryouts.types';

/** Use case: accept, waitlist, or decline a candidate with a reason. */
export function decideCandidate(
  teamId: string,
  tryoutId: string,
  command: DecideCandidateCommand,
): Promise<CandidateDetail> {
  return runRequest(async () =>
    mapCandidateDetail(await requestDecideCandidate(teamId, tryoutId, command)),
  );
}

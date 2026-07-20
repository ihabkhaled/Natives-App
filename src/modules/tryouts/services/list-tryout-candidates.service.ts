import { requestTryoutCandidates } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapCandidatePage } from '../mappers/tryout.mapper';
import type { CandidatePage } from '../types/tryouts.types';

/** Use case: the privacy-safe candidate list for one tryout event. */
export function listTryoutCandidates(teamId: string, tryoutId: string): Promise<CandidatePage> {
  return runRequest(async () => mapCandidatePage(await requestTryoutCandidates(teamId, tryoutId)));
}

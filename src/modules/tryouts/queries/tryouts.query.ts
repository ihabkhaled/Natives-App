import { getTryout } from '../services/get-tryout.service';
import { getTryoutCandidate } from '../services/get-tryout-candidate.service';
import { listPublicTryoutEvents } from '../services/list-public-tryout-events.service';
import { listTryoutCandidates } from '../services/list-tryout-candidates.service';
import { listTryouts } from '../services/list-tryouts.service';
import { tryoutsQueryKeys } from './tryouts.keys';

function scoped(teamId: string, resourceId = 'present'): boolean {
  return teamId !== '' && resourceId !== '';
}

/** Public read: no team scope, so it is always enabled. */
export function buildPublicTryoutEventsQueryOptions() {
  return {
    queryKey: tryoutsQueryKeys.publicEvents(),
    queryFn: () => listPublicTryoutEvents(),
    enabled: true,
  };
}

export function buildTryoutsQueryOptions(teamId: string) {
  return {
    queryKey: tryoutsQueryKeys.list(teamId),
    queryFn: () => listTryouts(teamId),
    enabled: scoped(teamId),
  };
}

export function buildTryoutQueryOptions(teamId: string, tryoutId: string) {
  return {
    queryKey: tryoutsQueryKeys.detail(teamId, tryoutId),
    queryFn: () => getTryout(teamId, tryoutId),
    enabled: scoped(teamId, tryoutId),
  };
}

export function buildTryoutCandidatesQueryOptions(teamId: string, tryoutId: string) {
  return {
    queryKey: tryoutsQueryKeys.candidates(teamId, tryoutId),
    queryFn: () => listTryoutCandidates(teamId, tryoutId),
    enabled: scoped(teamId, tryoutId),
  };
}

export function buildTryoutCandidateQueryOptions(
  teamId: string,
  tryoutId: string,
  candidateId: string,
) {
  return {
    queryKey: tryoutsQueryKeys.candidate(teamId, tryoutId, candidateId),
    queryFn: () => getTryoutCandidate(teamId, tryoutId, candidateId),
    enabled: scoped(teamId, tryoutId) && candidateId !== '',
  };
}

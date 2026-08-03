import { requestTryoutCandidates } from '../gateways/tryout-candidates.gateway';
import type { TryoutCandidatesPage, TryoutCandidatesQuery } from '../types/tryout-candidates.types';

/** One page of the team's candidates, redacted by the server to the caller's grants. */
export function listTryoutCandidates(query: TryoutCandidatesQuery): Promise<TryoutCandidatesPage> {
  return requestTryoutCandidates(query);
}

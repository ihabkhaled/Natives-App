import { requestTryoutCandidate } from '../gateways/tryout-candidates.gateway';
import type { TryoutCandidate } from '../types/tryout-candidates.types';

/** One candidate. The server decides which restricted blocks travel with it. */
export function getTryoutCandidate(teamId: string, candidateId: string): Promise<TryoutCandidate> {
  return requestTryoutCandidate(teamId, candidateId);
}

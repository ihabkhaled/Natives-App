import { requestWithdrawTryoutCandidate } from '../gateways/tryout-candidates.gateway';
import type { TryoutCandidate, WithdrawCandidateCommand } from '../types/tryout-candidates.types';

/** Records a withdrawal against one candidate; resolves the updated record. */
export function withdrawTryoutCandidate(
  command: WithdrawCandidateCommand,
): Promise<TryoutCandidate> {
  return requestWithdrawTryoutCandidate(command);
}

import { requestGovernanceMeetings } from '../gateways/governance.gateway';
import type { GovernanceMeetingsPage, GovernanceQuery } from '../types/governance.types';

/** One page of board meetings, already filtered to what the caller may see. */
export function listGovernanceMeetings(query: GovernanceQuery): Promise<GovernanceMeetingsPage> {
  return requestGovernanceMeetings(query);
}

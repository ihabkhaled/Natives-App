import { requestGovernanceTasks } from '../gateways/governance.gateway';
import type { GovernanceQuery, GovernanceTasksPage } from '../types/governance.types';

/** One page of the tasks board meetings raised. */
export function listGovernanceTasks(query: GovernanceQuery): Promise<GovernanceTasksPage> {
  return requestGovernanceTasks(query);
}

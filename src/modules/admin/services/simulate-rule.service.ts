import { runRequest } from '@/shared/errors';

import { requestRuleSimulation } from '../gateways/rules.gateway';
import { mapSimulation } from '../mappers/rules.mapper';
import type { SimulationResult } from '../types/admin.types';

/** Use case: dry-run a rule for one member. Writes nothing. */
export function simulateRule(
  teamId: string,
  ruleId: string,
  membershipId: string,
): Promise<SimulationResult> {
  return runRequest(async () =>
    mapSimulation(await requestRuleSimulation(teamId, ruleId, membershipId)),
  );
}

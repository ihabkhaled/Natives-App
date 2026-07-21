import { runRequest } from '@/shared/errors';

import { requestCalculationRules } from '../gateways/rules.gateway';
import { mapRulePage } from '../mappers/rules.mapper';
import type { RulePage } from '../types/admin.types';

/** Use case: the team's calculation-rule versions and candidates. */
export function listCalculationRules(teamId: string): Promise<RulePage> {
  return runRequest(async () => mapRulePage(await requestCalculationRules(teamId)));
}

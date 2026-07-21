import { runRequest } from '@/shared/errors';

import { requestPointsRules } from '../gateways/rules.gateway';
import { mapRulePage } from '../mappers/rules.mapper';
import type { RulePage } from '../types/admin.types';

/** Use case: the team's points-rule versions and candidates. */
export function listPointsRules(teamId: string): Promise<RulePage> {
  return runRequest(async () => mapRulePage(await requestPointsRules(teamId)));
}

import { runRequest } from '@/shared/errors';

import { requestMatchRulesets } from '../gateways/matches.gateway';
import { mapMatchRulesets } from '../mappers/match.mapper';
import type { MatchRuleset } from '../types/matches.types';

/** Use case: the published rule sets every cap on the scoreboard comes from. */
export function listMatchRulesets(teamId: string): Promise<readonly MatchRuleset[]> {
  return runRequest(async () => mapMatchRulesets(await requestMatchRulesets(teamId)));
}

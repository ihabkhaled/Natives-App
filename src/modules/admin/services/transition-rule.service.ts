import { runRequest } from '@/shared/errors';

import {
  requestCalculationRuleTransition,
  requestPointsRuleTransition,
} from '../gateways/rules.gateway';
import { mapRule } from '../mappers/rules.mapper';
import type { GovernedRule, RuleTransitionCommand } from '../types/admin.types';

/**
 * Use case: move one rule version through its lifecycle. The family decides
 * the endpoint; the server re-authorizes and enforces the same order.
 */
export function transitionRule(
  teamId: string,
  family: string,
  command: RuleTransitionCommand,
): Promise<GovernedRule> {
  return runRequest(async () =>
    mapRule(
      family === 'points'
        ? await requestPointsRuleTransition(teamId, command)
        : await requestCalculationRuleTransition(teamId, command),
    ),
  );
}

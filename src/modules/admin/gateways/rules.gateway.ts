import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  calculationRuleSimulatePath,
  calculationRuleTransitionPath,
  calculationRulesPath,
  pointsRuleTransitionPath,
  pointsRulesPath,
} from '../constants/admin-api.constants';
import { RULE_PAGE_PARAMS } from '../constants/admin-request.constants';
import {
  ruleListResponseSchema,
  ruleResponseSchema,
  simulationResponseSchema,
} from '../schemas/rules.schema';
import type { RuleTransitionCommand } from '../types/admin.types';

type RuleListDto = SchemaOutput<typeof ruleListResponseSchema>;
type RuleDto = SchemaOutput<typeof ruleResponseSchema>;
type SimulationDto = SchemaOutput<typeof simulationResponseSchema>;

export function requestPointsRules(teamId: string): Promise<RuleListDto> {
  return getAppHttpClient().get(pointsRulesPath(teamId), ruleListResponseSchema, {
    params: RULE_PAGE_PARAMS,
  });
}

export function requestCalculationRules(teamId: string): Promise<RuleListDto> {
  return getAppHttpClient().get(calculationRulesPath(teamId), ruleListResponseSchema, {
    params: RULE_PAGE_PARAMS,
  });
}

/** Optimistic concurrency: the server rejects a stale `recordVersion`. */
export function requestPointsRuleTransition(
  teamId: string,
  command: RuleTransitionCommand,
): Promise<RuleDto> {
  return getAppHttpClient().post(
    pointsRuleTransitionPath(teamId, command.ruleId),
    { transition: command.transition, expectedRecordVersion: command.expectedRecordVersion },
    ruleResponseSchema,
  );
}

export function requestCalculationRuleTransition(
  teamId: string,
  command: RuleTransitionCommand,
): Promise<RuleDto> {
  return getAppHttpClient().post(
    calculationRuleTransitionPath(teamId, command.ruleId),
    { transition: command.transition, expectedRecordVersion: command.expectedRecordVersion },
    ruleResponseSchema,
  );
}

/** A dry run. It writes nothing and is required before activation. */
export function requestRuleSimulation(
  teamId: string,
  ruleId: string,
  membershipId: string,
): Promise<SimulationDto> {
  return getAppHttpClient().post(
    calculationRuleSimulatePath(teamId, ruleId),
    { membershipId },
    simulationResponseSchema,
  );
}

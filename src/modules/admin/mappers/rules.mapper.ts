import type { SchemaOutput } from '@/packages/schema';

import type {
  ruleListResponseSchema,
  ruleResponseSchema,
  simulationResponseSchema,
} from '../schemas/rules.schema';
import type { GovernedRule, RulePage, SimulationResult } from '../types/admin.types';

type RuleDto = SchemaOutput<typeof ruleResponseSchema>;
type RuleListDto = SchemaOutput<typeof ruleListResponseSchema>;
type SimulationDto = SchemaOutput<typeof simulationResponseSchema>;

export function mapRule(dto: RuleDto): GovernedRule {
  return {
    ruleId: dto.ruleId,
    ruleKey: dto.ruleKey,
    name: dto.name,
    description: dto.description,
    version: dto.version,
    status: dto.status,
    pointEntries: dto.pointEntries.map((entry) => ({
      activityCategory: entry.activityCategory,
      points: entry.points,
      dailyCap: entry.dailyCap,
      cooldownDays: entry.cooldownDays,
    })),
    effectiveFrom: dto.effectiveFrom,
    effectiveTo: dto.effectiveTo,
    recordVersion: dto.recordVersion,
  };
}

export function mapRulePage(dto: RuleListDto): RulePage {
  return { total: dto.total, items: dto.items.map((item) => mapRule(item)) };
}

/** A null `published` means there is no baseline yet — not a zero delta. */
export function mapSimulation(dto: SimulationDto): SimulationResult {
  return {
    membershipId: dto.membershipId,
    draft: { ...dto.draft },
    published: dto.published === null ? null : { ...dto.published },
    delta: dto.delta,
  };
}

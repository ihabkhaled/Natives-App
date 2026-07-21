import type { GovernedRule } from '@/modules/admin';

/** Deterministic governed rule version shared by the admin helper tests. */
export function buildGovernedRule(overrides: Partial<GovernedRule> = {}): GovernedRule {
  return {
    ruleId: 'rule-1',
    ruleKey: 'points.v1',
    name: 'Points rule v1',
    description: null,
    version: 1,
    status: 'draft',
    pointEntries: [],
    effectiveFrom: null,
    effectiveTo: null,
    recordVersion: 1,
    ...overrides,
  };
}

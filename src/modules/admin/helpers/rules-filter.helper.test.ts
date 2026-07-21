import { describe, expect, it } from 'vitest';

import type { GovernedRule } from '../types/admin.types';
import { buildFamilyOptions, buildStatusOptions, filterRules } from './rules-filter.helper';

const t = (key: string): string => key;

function rule(overrides: Partial<GovernedRule> = {}): GovernedRule {
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

describe('buildFamilyOptions', () => {
  it('offers both governed families', () => {
    expect(buildFamilyOptions(t)).toEqual([
      { value: 'points', label: 'adminRules.familyPoints' },
      { value: 'calculation', label: 'adminRules.familyCalculation' },
    ]);
  });
});

describe('buildStatusOptions', () => {
  it('puts an explicit all entry ahead of the lifecycle states', () => {
    expect(buildStatusOptions(t).map((option) => option.value)).toEqual([
      'all',
      'draft',
      'approved',
      'published',
      'retired',
    ]);
  });
});

describe('filterRules', () => {
  const rules = [rule({ ruleId: 'a', status: 'draft' }), rule({ ruleId: 'b', status: 'published' })];

  it('keeps everything under the all filter', () => {
    expect(filterRules(rules, 'all')).toHaveLength(2);
  });

  it('narrows to one lifecycle state', () => {
    expect(filterRules(rules, 'published').map((entry) => entry.ruleId)).toEqual(['b']);
  });

  it('produces nothing when no rule is in that state', () => {
    expect(filterRules(rules, 'retired')).toEqual([]);
  });
});

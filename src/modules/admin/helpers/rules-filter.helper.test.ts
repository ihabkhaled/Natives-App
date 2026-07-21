import { describe, expect, it } from 'vitest';

import { buildGovernedRule } from '../../../../tests/factories/admin.factory';

import { buildFamilyOptions, buildStatusOptions, filterRules } from './rules-filter.helper';

const t = (key: string): string => key;

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
  const rules = [
    buildGovernedRule({ ruleId: 'a', status: 'draft' }),
    buildGovernedRule({ ruleId: 'b', status: 'published' }),
  ];

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

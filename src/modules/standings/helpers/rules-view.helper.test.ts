import { describe, expect, it } from 'vitest';

import type { StandingsRule } from '../types/standings.types';
import { buildRuleFamilies, resolveTieBreakLabel } from './rules-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function rule(
  overrides: Partial<StandingsRule> & { ruleVersionId: string; version: number },
): StandingsRule {
  return {
    ruleKey: 'league',
    name: 'League',
    winPoints: 3,
    lossPoints: 0,
    tiePoints: 1,
    tieBreakOrder: ['standing_points', 'wins'],
    effectiveFromIso: '2026-06-01T00:00:00.000Z',
    status: 'active',
    ...overrides,
  };
}

describe('resolveTieBreakLabel', () => {
  it('translates every tie-break criterion', () => {
    expect(resolveTieBreakLabel(t, 'standing_points')).toBe('standings.tieBreakStandingPoints');
    expect(resolveTieBreakLabel(t, 'alphabetical')).toBe('standings.tieBreakAlphabetical');
  });
});

describe('buildRuleFamilies', () => {
  it('groups by family with the newest version prominent and older ones beneath', () => {
    const families = buildRuleFamilies(t, 'en', [
      rule({ ruleVersionId: 'v1', version: 1, status: 'archived' }),
      rule({ ruleVersionId: 'v2', version: 2 }),
      rule({ ruleVersionId: 'other', version: 1, ruleKey: 'cup', name: 'Cup' }),
    ]);
    const league = families.find((family) => family.key === 'league');
    expect(league?.newest.key).toBe('v2');
    expect(league?.older).toHaveLength(1);
    expect(league?.older[0]?.key).toBe('v1');
    expect(league?.olderLabel).toContain('standings.ruleOlderVersions');
  });

  it('sorts multiple older versions newest-first', () => {
    const families = buildRuleFamilies(t, 'en', [
      rule({ ruleVersionId: 'v1', version: 1, status: 'archived' }),
      rule({ ruleVersionId: 'v2', version: 2, status: 'archived' }),
      rule({ ruleVersionId: 'v3', version: 3, status: 'active' }),
    ]);
    const league = families.find((family) => family.key === 'league');
    expect(league?.newest.key).toBe('v3');
    expect(league?.older.map((version) => version.key)).toEqual(['v2', 'v1']);
  });

  it('reports no older-versions label for a single-version family', () => {
    const families = buildRuleFamilies(t, 'en', [rule({ ruleVersionId: 'only', version: 1 })]);
    expect(families[0]?.older).toHaveLength(0);
    expect(families[0]?.olderLabel).toBeNull();
  });

  it('renders the active/archived status chip per version', () => {
    const families = buildRuleFamilies(t, 'en', [
      rule({ ruleVersionId: 'v2', version: 2, status: 'active' }),
      rule({ ruleVersionId: 'v1', version: 1, status: 'archived' }),
    ]);
    expect(families[0]?.newest.statusChip.tone).toBe('success');
    expect(families[0]?.older[0]?.statusChip.tone).toBe('medium');
  });
});

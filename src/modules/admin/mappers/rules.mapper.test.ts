import { describe, expect, it } from 'vitest';

import { rulesResponse } from '@/tests/msw/admin-rules.fixture';

import { mapRule, mapRulePage, mapSimulation } from './rules.mapper';

// Derived from the MSW fixture so the mapper is exercised against the exact
// wire shape the handlers serve, rather than a restatement of it.
const DTO = rulesResponse().items.find((rule) => rule.status === 'draft')!;

describe('mapRule', () => {
  it('keeps an unscored category as null, never as zero', () => {
    const mapped = mapRule(DTO);

    expect(mapped.pointEntries[1]?.points).toBeNull();
    expect(mapped.pointEntries[1]?.cooldownDays).toBe(2);
  });

  it('carries the record version the optimistic-concurrency check needs', () => {
    expect(mapRule(DTO).recordVersion).toBe(1);
  });

  it('preserves an unset effective window', () => {
    const mapped = mapRule(DTO);

    expect(mapped.effectiveFrom).toBeNull();
    expect(mapped.effectiveTo).toBeNull();
  });
});

describe('mapRulePage', () => {
  it('carries the total alongside the rules', () => {
    expect(mapRulePage({ items: [DTO], total: 5, limit: 50, offset: 0 })).toEqual({
      total: 5,
      items: [mapRule(DTO)],
    });
  });
});

describe('mapSimulation', () => {
  it('keeps a missing baseline as null instead of a zero comparison', () => {
    const mapped = mapSimulation({
      membershipId: 'm-1',
      draft: { completeness: 0.8, confidence: 'medium', formulaVersion: 3 },
      published: null,
      delta: null,
    });

    expect(mapped.published).toBeNull();
    expect(mapped.delta).toBeNull();
  });

  it('copies both explanations when a baseline exists', () => {
    const mapped = mapSimulation({
      membershipId: 'm-1',
      draft: { completeness: 0.8, confidence: 'medium', formulaVersion: 3 },
      published: { completeness: 0.7, confidence: 'low', formulaVersion: 1 },
      delta: 6,
    });

    expect(mapped.published?.confidence).toBe('low');
    expect(mapped.delta).toBe(6);
  });
});

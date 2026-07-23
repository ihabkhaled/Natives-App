import { describe, expect, it } from 'vitest';

import { buildMyScoreResponse } from '@/tests/msw/assessments-insights.fixture';

import { scoreListResponseSchema } from '../schemas/scoring.schema';

import { mapMyPerformanceScore } from './scoring.mapper';

describe('mapMyPerformanceScore', () => {
  it('projects the newest score with its explanation components', () => {
    const score = mapMyPerformanceScore(scoreListResponseSchema.parse(buildMyScoreResponse()));

    expect(score?.value).toBe(78.4);
    expect(score?.confidence).toBe('high');
    expect(score?.ruleKey).toBe('overall-2026');
    expect(score?.components).toHaveLength(2);
    expect(score?.components[1]).toEqual({
      categoryKey: 'attendance',
      weight: 0.2,
      display: null,
      included: false,
    });
  });

  it('returns null when nothing has been computed for the caller', () => {
    expect(mapMyPerformanceScore({ items: [] })).toBeNull();
  });

  it('tolerates a score without an explanation block', () => {
    const dto = scoreListResponseSchema.parse(buildMyScoreResponse());
    const bare = { items: [{ ...dto.items[0]!, explanation: null, value: null }] };

    const score = mapMyPerformanceScore(bare);

    expect(score?.value).toBeNull();
    expect(score?.components).toEqual([]);
  });
});

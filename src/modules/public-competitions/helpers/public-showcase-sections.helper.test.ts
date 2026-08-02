import { describe, expect, it, vi } from 'vitest';

import type { PublicCompetitionDetailDto } from '../types/public-showcase.types';
import { buildPublicShowcaseSections } from './public-showcase-sections.helper';

const translate = vi.fn((key: string) => key);

const DETAIL: PublicCompetitionDetailDto = {
  competition: {
    slug: 'eunc-2026',
    name: 'EUNC 2026',
    year: 2026,
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    rank: 3,
    entrantCount: 12,
  },
  matches: [
    {
      matchId: 'match-1',
      opponentName: 'Cairo Ultimate',
      playedAt: null,
      ourScore: 8,
      opponentScore: 6,
      playerScores: [],
    },
  ],
  leaderboard: [
    { playerId: 'p1', displayName: 'Sherif Ashraf', rank: 1, points: 40 },
    { playerId: 'p2', displayName: 'Rawan Elessawy', rank: 2, points: 20 },
  ],
};

describe('buildPublicShowcaseSections', () => {
  it('maps the summary, the match rows, and the leaderboard together', () => {
    const sections = buildPublicShowcaseSections(DETAIL, 'en', translate);

    expect(sections.summary?.name).toBe('EUNC 2026');
    expect(sections.matches).toHaveLength(1);
    expect(sections.matches[0]?.outcome).toBe('win');
    expect(sections.leaderboard).toHaveLength(2);
  });

  it('scales every leaderboard meter against the same leader', () => {
    const sections = buildPublicShowcaseSections(DETAIL, 'en', translate);

    expect(sections.leaderboard[0]?.barPercent).toBe(100);
    expect(sections.leaderboard[1]?.barPercent).toBe(50);
  });

  it('yields empty sections for a competition the showcase does not publish', () => {
    expect(buildPublicShowcaseSections(null, 'en', translate)).toEqual({
      summary: null,
      matches: [],
      leaderboard: [],
    });
  });
});

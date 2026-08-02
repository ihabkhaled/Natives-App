import { describe, expect, it } from 'vitest';

import {
  buildCompetitionsSection,
  buildLeaderboardSection,
  buildMatchScoresSection,
} from './landing-competitive-seam.helper';

const t = (key: string): string => `t:${key}`;

describe('buildCompetitionsSection', () => {
  it('seeds the two entered competitions, ready, each with a pending rank', () => {
    const section = buildCompetitionsSection(t);

    expect(section.chrome.status).toBe('ready');
    expect(section.competitions).toEqual([
      {
        id: 'eunc-2026',
        name: 'EUNC',
        season: '2026',
        rankStatus: 't:landing.competitionsRankPending',
      },
      {
        id: 'eudl-2026',
        name: 'EUDL',
        season: '2026',
        rankStatus: 't:landing.competitionsRankPending',
      },
    ]);
  });
});

describe('buildMatchScoresSection', () => {
  it('presents the honest empty state — no results are seeded', () => {
    expect(buildMatchScoresSection(t).chrome.status).toBe('empty');
  });
});

describe('buildLeaderboardSection', () => {
  it('presents the honest empty state — the leaderboard unlocks once matches are scored', () => {
    expect(buildLeaderboardSection(t).chrome.status).toBe('empty');
  });
});

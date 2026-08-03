import { describe, expect, it } from 'vitest';

import { mapTeamDirectoryResponse } from '@/modules/team-directory';
import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

import {
  buildCompetitionsSection,
  buildLeaderboardSection,
  buildMatchScoresSection,
} from './landing-competitive-seam.helper';

const directory = mapTeamDirectoryResponse(MOCK_TEAM_DIRECTORY);
const liveSeam = {
  isLoading: false,
  error: null,
  isOffline: false,
  onRetry: (): void => undefined,
};

const t = (key: string): string => `t:${key}`;

describe('buildCompetitionsSection', () => {
  it('lists the entered competitions, ready, each with a pending rank', () => {
    const section = buildCompetitionsSection(t, directory, liveSeam);

    expect(section.chrome.status).toBe('ready');
    expect(section.competitions).toEqual([
      {
        id: 'comp-1',
        name: 'EUNC 2026',
        season: 'Season 2026',
        rankStatus: 't:landing.competitionsRankPending',
      },
      {
        id: 'comp-2',
        name: 'EUDL 2026',
        season: 'Season 2026',
        rankStatus: 't:landing.competitionsRankPending',
      },
    ]);
  });

  it('reports loading while the directory query is in flight', () => {
    const section = buildCompetitionsSection(t, null, { ...liveSeam, isLoading: true });

    expect(section.chrome.status).toBe('loading');
    expect(section.competitions).toHaveLength(0);
  });

  it('shows the empty state when the team has entered nothing yet', () => {
    const section = buildCompetitionsSection(t, { ...directory, competitions: [] }, liveSeam);

    expect(section.chrome.status).toBe('empty');
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

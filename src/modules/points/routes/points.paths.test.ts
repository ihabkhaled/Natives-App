import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { leaderboardPagePath, pointsHistoryPath } from './points.paths';

describe('points paths', () => {
  it('derives both targets from the canonical route table', () => {
    expect(leaderboardPagePath()).toBe(APP_PATHS.leaderboard);
    expect(pointsHistoryPath()).toBe(APP_PATHS.points);
  });

  it('keeps the two screens on distinct paths', () => {
    expect(leaderboardPagePath()).not.toBe(pointsHistoryPath());
  });
});

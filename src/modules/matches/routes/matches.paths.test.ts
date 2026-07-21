import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  matchScoreboardPath,
  matchScoreboardPattern,
  matchStatisticsPath,
  matchStatisticsPattern,
  matchesPath,
  matchesPattern,
} from './matches.paths';

describe('matches paths', () => {
  it('exposes the canonical patterns', () => {
    expect(matchesPattern()).toBe(APP_PATHS.matches);
    expect(matchScoreboardPattern()).toBe(APP_PATHS.matchScoreboard);
    expect(matchStatisticsPattern()).toBe(APP_PATHS.matchStatistics);
  });

  it('builds concrete navigation targets', () => {
    expect(matchesPath()).toBe('/matches');
    expect(matchScoreboardPath('match-1')).toBe('/matches/match-1');
    expect(matchStatisticsPath('match-1')).toBe('/matches/match-1/statistics');
  });

  it('encodes an id that would otherwise break the path', () => {
    expect(matchScoreboardPath('a/b')).toBe('/matches/a%2Fb');
  });
});

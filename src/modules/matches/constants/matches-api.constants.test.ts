import { describe, expect, it } from 'vitest';

import {
  SCOREKEEPER_PATH_BY_KIND,
  matchEventsPath,
  matchFinalizationPath,
  matchPath,
  matchPointPath,
  matchRulesetsPath,
  matchScoreboardPath,
  matchStatisticsPath,
  matchTimeoutPath,
  matchTransitionPath,
  matchVoidPath,
  matchesPath,
} from './matches-api.constants';

describe('matches API paths', () => {
  it('team-scopes every endpoint', () => {
    expect(matchesPath('t1')).toBe('/teams/t1/matches');
    expect(matchPath('t1', 'm1')).toBe('/teams/t1/matches/m1');
    expect(matchScoreboardPath('t1', 'm1')).toBe('/teams/t1/matches/m1/scoreboard');
    expect(matchEventsPath('t1', 'm1')).toBe('/teams/t1/matches/m1/events');
    expect(matchPointPath('t1', 'm1')).toBe('/teams/t1/matches/m1/events/point');
    expect(matchTimeoutPath('t1', 'm1')).toBe('/teams/t1/matches/m1/events/timeout');
    expect(matchVoidPath('t1', 'm1')).toBe('/teams/t1/matches/m1/events/void');
    expect(matchTransitionPath('t1', 'm1')).toBe('/teams/t1/matches/m1/transition');
    expect(matchFinalizationPath('t1', 'm1')).toBe('/teams/t1/matches/m1/finalization');
    expect(matchStatisticsPath('t1', 'm1')).toBe('/teams/t1/matches/m1/statistics');
    expect(matchRulesetsPath('t1')).toBe('/teams/t1/match-rulesets');
  });

  it('encodes path segments', () => {
    expect(matchPath('a/b', 'c d')).toBe('/teams/a%2Fb/matches/c%20d');
  });

  it('routes each queued command kind to its own endpoint', () => {
    expect(SCOREKEEPER_PATH_BY_KIND.point('t1', 'm1')).toBe('/teams/t1/matches/m1/events/point');
    expect(SCOREKEEPER_PATH_BY_KIND.timeout('t1', 'm1')).toBe(
      '/teams/t1/matches/m1/events/timeout',
    );
    expect(SCOREKEEPER_PATH_BY_KIND.void('t1', 'm1')).toBe('/teams/t1/matches/m1/events/void');
  });
});

import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  achievementsPagePath,
  standingsPagePath,
  standingsRulesPagePath,
  teamHistoryPagePath,
} from './standings.paths';

describe('standings paths', () => {
  it('derives every target from the canonical route table', () => {
    expect(standingsPagePath()).toBe(APP_PATHS.standings);
    expect(standingsRulesPagePath()).toBe(APP_PATHS.standingsRules);
    expect(achievementsPagePath()).toBe(APP_PATHS.achievements);
    expect(teamHistoryPagePath()).toBe(APP_PATHS.teamHistory);
  });

  it('keeps the rules screen nested under the standings screen', () => {
    expect(standingsRulesPagePath().startsWith(standingsPagePath())).toBe(true);
  });

  it('keeps the four screens on distinct paths', () => {
    const paths = [
      standingsPagePath(),
      standingsRulesPagePath(),
      achievementsPagePath(),
      teamHistoryPagePath(),
    ];
    expect(new Set(paths).size).toBe(paths.length);
  });
});

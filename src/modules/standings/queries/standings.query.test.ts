import { afterEach, describe, expect, it, vi } from 'vitest';

import { getTeamHistory } from '../services/get-team-history.service';
import { listAchievements } from '../services/list-achievements.service';
import { listStandings } from '../services/list-standings.service';
import { listStandingsRules } from '../services/list-standings-rules.service';
import { standingsQueryKeys } from './standings.keys';
import {
  buildAchievementsQueryOptions,
  buildStandingsQueryOptions,
  buildStandingsRulesQueryOptions,
  buildTeamHistoryQueryOptions,
} from './standings.query';

vi.mock('../services/list-standings.service', () => ({ listStandings: vi.fn() }));
vi.mock('../services/list-standings-rules.service', () => ({ listStandingsRules: vi.fn() }));
vi.mock('../services/list-achievements.service', () => ({ listAchievements: vi.fn() }));
vi.mock('../services/get-team-history.service', () => ({ getTeamHistory: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('standingsQueryKeys', () => {
  it('builds stable, team-scoped keys', () => {
    expect(standingsQueryKeys.table('t', 'c', 'all')).toEqual([
      'standings',
      'team',
      't',
      'table',
      'c',
      'all',
    ]);
    expect(standingsQueryKeys.rules('t')).toContain('rules');
    expect(standingsQueryKeys.achievements('t', 'submitted', 'trophy', 0)).toContain(
      'achievements',
    );
    expect(standingsQueryKeys.achievement('t', 'a')).toContain('achievement');
    expect(standingsQueryKeys.history('t', 'all', 0)).toContain('history');
  });
});

describe('standings query options', () => {
  it('disables the table read until a competition is scoped', () => {
    expect(buildStandingsQueryOptions('', { competitionId: '', source: null }).enabled).toBe(false);
    expect(buildStandingsQueryOptions('t', { competitionId: 'c', source: null }).enabled).toBe(
      true,
    );
  });

  it('wires each read behind its use case', () => {
    void buildStandingsQueryOptions('t', { competitionId: 'c', source: 'manual' }).queryFn();
    expect(listStandings).toHaveBeenCalledOnce();

    void buildStandingsRulesQueryOptions('t').queryFn();
    expect(listStandingsRules).toHaveBeenCalledOnce();

    void buildAchievementsQueryOptions('t', { status: null, category: null }, 0).queryFn();
    expect(listAchievements).toHaveBeenCalledOnce();

    void buildTeamHistoryQueryOptions('t', { category: null }, 0).queryFn();
    expect(getTeamHistory).toHaveBeenCalledOnce();
  });

  it('gates the team-scoped reads on a resolved team', () => {
    expect(buildStandingsRulesQueryOptions('').enabled).toBe(false);
    expect(buildAchievementsQueryOptions('', { status: null, category: null }, 0).enabled).toBe(
      false,
    );
    expect(buildTeamHistoryQueryOptions('t', { category: null }, 0).enabled).toBe(true);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  requestCreateStandingsRule,
  requestRecomputeStandings,
  requestRecordManualStanding,
  requestStandings,
  requestStandingsRules,
} from './standings.gateway';

import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const { get, post } = gatewayHttp;

beforeEach(resetGatewayHttpDouble);

describe('standings.gateway', () => {
  it('reads the table for a competition, omitting an unset source facet', async () => {
    await requestStandings('t1', { competitionId: 'c1', source: null });
    const [path, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(path).toBe('/teams/t1/standings');
    expect(options.params).toMatchObject({ competitionId: 'c1' });
    expect(options.params).not.toHaveProperty('source');
  });

  it('includes the source facet when set', async () => {
    await requestStandings('t1', { competitionId: 'c1', source: 'manual' });
    const [, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(options.params).toMatchObject({ source: 'manual' });
  });

  it('posts a recompute and a manual row to their paths', async () => {
    await requestRecomputeStandings('t1', { competitionId: 'c1', ruleKey: 'league' });
    expect(post.mock.calls[0]?.[0]).toBe('/teams/t1/standings/recompute');

    await requestRecordManualStanding('t1', {
      competitionId: 'c1',
      entrantKind: 'team',
      opponentId: null,
      played: 1,
      wins: 1,
      losses: 0,
      ties: 0,
      pointsFor: 15,
      pointsAgainst: 10,
      spiritScore: null,
      finalPlace: null,
      qualification: null,
      sourceReference: null,
      reconciliationNote: 'note',
      ruleKey: 'league',
    });
    expect(post.mock.calls[1]?.[0]).toBe('/teams/t1/standings/manual');
  });

  it('reads and publishes rules at the rules path', async () => {
    await requestStandingsRules('t1');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t1/standings-rules');

    await requestCreateStandingsRule('t1', {
      ruleKey: 'league',
      name: 'League',
      winPoints: 3,
      lossPoints: 0,
      tiePoints: 1,
      tieBreakOrder: ['standing_points'],
    });
    expect(post.mock.calls[0]?.[0]).toBe('/teams/t1/standings-rules');
  });
});

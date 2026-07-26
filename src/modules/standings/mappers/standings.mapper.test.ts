import { describe, expect, it } from 'vitest';

import {
  mapRecomputeReport,
  mapStandingRow,
  mapStandingsPage,
  mapStandingsRule,
  mapStandingsRulesPage,
} from './standings.mapper';

const standingDto = {
  standingId: 's1',
  teamId: 't1',
  seasonId: 'se1',
  competitionId: 'c1',
  stageId: null,
  ruleVersionId: 'rv1',
  poolLabel: null,
  entrantKind: 'opponent' as const,
  opponentId: 'o1',
  opponentName: 'Giza',
  played: 5,
  wins: 3,
  losses: 2,
  ties: 0,
  pointsFor: 60,
  pointsAgainst: 55,
  standingPoints: 9,
  spiritScore: null,
  finalPlace: 2,
  qualification: 'undecided' as const,
  source: 'derived' as const,
  sourceReference: null,
  reconciliationNote: null,
  recordVersion: 1,
  recordedBy: null,
  computedAt: '2026-07-10T09:00:00.000Z',
  createdAt: '2026-07-10T09:00:00.000Z',
  updatedAt: '2026-07-10T09:00:00.000Z',
};

const ruleDto = {
  ruleVersionId: 'rv1',
  teamId: 't1',
  ruleKey: 'league',
  version: 2,
  name: 'League',
  winPoints: 3,
  lossPoints: 0,
  tiePoints: 1,
  tieBreakOrder: ['standing_points' as const],
  effectiveFrom: '2026-06-01T00:00:00.000Z',
  status: 'active' as const,
  createdBy: null,
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('standings mappers', () => {
  it('maps a standing row preserving a null spirit score', () => {
    expect(mapStandingRow(standingDto)).toMatchObject({
      standingId: 's1',
      opponentName: 'Giza',
      spiritScore: null,
      computedAtIso: '2026-07-10T09:00:00.000Z',
    });
  });

  it('maps a bounded standings page', () => {
    const page = mapStandingsPage({ items: [standingDto], total: 1, limit: 100, offset: 0 });
    expect(page.rows).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it('maps a recompute report without the rows array', () => {
    const report = mapRecomputeReport({
      competitionId: 'c1',
      ruleVersionId: 'rv1',
      finalizedMatches: 5,
      entrants: 2,
      rows: [standingDto],
    });
    expect(report).toEqual({
      competitionId: 'c1',
      ruleVersionId: 'rv1',
      finalizedMatches: 5,
      entrants: 2,
    });
  });

  it('maps a rule and a rules page', () => {
    expect(mapStandingsRule(ruleDto)).toMatchObject({ ruleKey: 'league', version: 2 });
    const page = mapStandingsRulesPage({ items: [ruleDto], total: 1, limit: 50, offset: 0 });
    expect(page.rules).toHaveLength(1);
  });
});

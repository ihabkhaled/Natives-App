import { afterEach, describe, expect, it, vi } from 'vitest';

import * as achievementsGateway from '../gateways/achievements.gateway';
import * as standingsGateway from '../gateways/standings.gateway';
import { createAchievement } from './create-achievement.service';
import { createStandingsRule } from './create-standings-rule.service';
import { getAchievement } from './get-achievement.service';
import { getTeamHistory } from './get-team-history.service';
import { importAchievements } from './import-achievements.service';
import { listAchievements } from './list-achievements.service';
import { listStandings } from './list-standings.service';
import { listStandingsRules } from './list-standings-rules.service';
import { recomputeStandings } from './recompute-standings.service';
import { recordManualStanding } from './record-manual-standing.service';
import { transitionAchievement } from './transition-achievement.service';

vi.mock('../gateways/standings.gateway');
vi.mock('../gateways/achievements.gateway');

const standingDto = {
  standingId: 's1',
  teamId: 't1',
  seasonId: 'se1',
  competitionId: 'c1',
  stageId: null,
  ruleVersionId: 'rv1',
  poolLabel: null,
  entrantKind: 'team' as const,
  opponentId: null,
  opponentName: null,
  played: 1,
  wins: 1,
  losses: 0,
  ties: 0,
  pointsFor: 15,
  pointsAgainst: 10,
  standingPoints: 3,
  spiritScore: null,
  finalPlace: 1,
  qualification: 'qualified' as const,
  source: 'manual' as const,
  sourceReference: null,
  reconciliationNote: 'note',
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
  version: 1,
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

const achievementDto = {
  achievementId: 'a1',
  teamId: 't1',
  seasonId: null,
  competitionId: null,
  membershipId: null,
  category: 'trophy' as const,
  title: 'Champions',
  description: null,
  achievedOn: '2026-06-20',
  evidenceReference: null,
  visibility: 'public' as const,
  status: 'draft' as const,
  source: 'manual' as const,
  importReference: null,
  rejectionReason: null,
  recordVersion: 1,
  createdBy: null,
  approvedBy: null,
  approvedAt: null,
  rejectedAt: null,
  archivedAt: null,
  createdAt: '2026-06-20T09:00:00.000Z',
  updatedAt: '2026-06-20T09:00:00.000Z',
};

const page = <T>(items: T[]) => ({ items, total: items.length, limit: 100, offset: 0 });

afterEach(() => {
  vi.clearAllMocks();
});

describe('standings services', () => {
  it('lists the table and rules', async () => {
    vi.mocked(standingsGateway.requestStandings).mockResolvedValue(page([standingDto]));
    vi.mocked(standingsGateway.requestStandingsRules).mockResolvedValue(page([ruleDto]));
    expect((await listStandings('t1', { competitionId: 'c1', source: null })).rows).toHaveLength(1);
    expect((await listStandingsRules('t1')).rules).toHaveLength(1);
  });

  it('recomputes and records a manual row', async () => {
    vi.mocked(standingsGateway.requestRecomputeStandings).mockResolvedValue({
      competitionId: 'c1',
      ruleVersionId: 'rv1',
      finalizedMatches: 5,
      entrants: 2,
      rows: [standingDto],
    });
    vi.mocked(standingsGateway.requestRecordManualStanding).mockResolvedValue(standingDto);
    expect(
      (await recomputeStandings('t1', { competitionId: 'c1', ruleKey: 'league' })).entrants,
    ).toBe(2);
    expect(
      (
        await recordManualStanding('t1', {
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
        })
      ).standingId,
    ).toBe('s1');
  });

  it('publishes a rule version', async () => {
    vi.mocked(standingsGateway.requestCreateStandingsRule).mockResolvedValue(ruleDto);
    expect(
      (
        await createStandingsRule('t1', {
          ruleKey: 'league',
          name: 'League',
          winPoints: 3,
          lossPoints: 0,
          tiePoints: 1,
          tieBreakOrder: ['standing_points'],
        })
      ).version,
    ).toBe(1);
  });

  it('lists, reads, creates, transitions, imports achievements and reads history', async () => {
    vi.mocked(achievementsGateway.requestAchievements).mockResolvedValue(page([achievementDto]));
    vi.mocked(achievementsGateway.requestAchievement).mockResolvedValue(achievementDto);
    vi.mocked(achievementsGateway.requestCreateAchievement).mockResolvedValue(achievementDto);
    vi.mocked(achievementsGateway.requestTransitionAchievement).mockResolvedValue({
      ...achievementDto,
      status: 'submitted',
    });
    vi.mocked(achievementsGateway.requestImportAchievements).mockResolvedValue({
      dryRun: true,
      received: 1,
      imported: 1,
      skippedDuplicate: 0,
      rejectedInvalid: 0,
      rows: [],
    });
    vi.mocked(achievementsGateway.requestTeamHistory).mockResolvedValue(page([]));

    expect((await listAchievements('t1', { status: null, category: null }, 0)).items).toHaveLength(
      1,
    );
    expect((await getAchievement('t1', 'a1')).achievementId).toBe('a1');
    expect(
      (
        await createAchievement('t1', {
          category: 'trophy',
          title: 'X',
          description: null,
          achievedOn: '2026-01-01',
          membershipId: null,
          evidenceReference: null,
          visibility: 'team',
        })
      ).status,
    ).toBe('draft');
    expect(
      (
        await transitionAchievement('t1', 'a1', {
          transition: 'submit',
          expectedRecordVersion: 1,
          reason: null,
        })
      ).status,
    ).toBe('submitted');
    expect((await importAchievements('t1', { dryRun: true, rows: [] })).imported).toBe(1);
    expect((await getTeamHistory('t1', { category: null }, 0)).total).toBe(0);
  });
});

import type {
  listStandingsResponseSchema,
  listStandingsRulesResponseSchema,
  standingResponseSchema,
  standingsRecomputeReportSchema,
  standingsRuleResponseSchema,
} from '@/modules/standings';
import type { SchemaOutput } from '@/packages/schema';

type StandingsListDto = SchemaOutput<typeof listStandingsResponseSchema>;
type StandingDto = SchemaOutput<typeof standingResponseSchema>;
type RecomputeReportDto = SchemaOutput<typeof standingsRecomputeReportSchema>;
type RulesListDto = SchemaOutput<typeof listStandingsRulesResponseSchema>;
type RuleDto = SchemaOutput<typeof standingsRuleResponseSchema>;

export const MOCK_STANDINGS = {
  teamId: 'team-natives',
  seasonId: '50000000-0000-4000-8000-000000000001',
  leagueId: '60000000-0000-4000-8000-000000000001',
  ruleVersionId: '90000000-0000-4000-8000-000000000001',
  ruleKey: 'league-standard',
  opponentAId: '70000000-0000-4000-8000-000000000001',
} as const;

const COMPUTED_AT = '2026-07-10T09:00:00.000Z';

function standing(overrides: Partial<StandingDto> & { standingId: string }): StandingDto {
  return {
    teamId: MOCK_STANDINGS.teamId,
    seasonId: MOCK_STANDINGS.seasonId,
    competitionId: MOCK_STANDINGS.leagueId,
    stageId: null,
    ruleVersionId: MOCK_STANDINGS.ruleVersionId,
    poolLabel: null,
    entrantKind: 'opponent',
    opponentId: MOCK_STANDINGS.opponentAId,
    opponentName: 'Giza Griffins',
    played: 5,
    wins: 3,
    losses: 2,
    ties: 0,
    pointsFor: 62,
    pointsAgainst: 55,
    standingPoints: 9,
    spiritScore: null,
    finalPlace: 2,
    qualification: 'undecided',
    source: 'derived',
    sourceReference: null,
    reconciliationNote: null,
    recordVersion: 1,
    recordedBy: null,
    computedAt: COMPUTED_AT,
    createdAt: COMPUTED_AT,
    updatedAt: COMPUTED_AT,
    ...overrides,
  };
}

let manualRows: StandingDto[] = [];

/**
 * The derived league table plus any manual rows recorded during the session.
 * Our team leads on 12; the runner-up carries a null spirit (not scored). A
 * manual row appears only after `recordManualStanding` is called, so the
 * provenance badge is exercised end to end.
 */
export function standingsResponse(source: string | null): StandingsListDto {
  const rows: StandingDto[] = [
    standing({
      standingId: 's-team',
      entrantKind: 'team',
      opponentId: null,
      opponentName: null,
      wins: 4,
      losses: 1,
      standingPoints: 12,
      finalPlace: 1,
      qualification: 'qualified',
    }),
    standing({ standingId: 's-opp-a' }),
    ...manualRows,
  ];
  const filtered = source === null ? rows : rows.filter((row) => row.source === source);
  return { items: filtered, total: filtered.length, limit: 100, offset: 0 };
}

/** Record a manual external row with its reconciliation note. */
export function recordManualStanding(body: {
  reconciliationNote?: string;
  opponentId?: string | null;
  entrantKind?: string;
}): StandingDto {
  const row = standing({
    standingId: `s-manual-${String(manualRows.length + 1)}`,
    entrantKind: body.entrantKind === 'team' ? 'team' : 'opponent',
    opponentId:
      body.entrantKind === 'team' ? null : (body.opponentId ?? MOCK_STANDINGS.opponentAId),
    opponentName: body.entrantKind === 'team' ? null : 'External Club',
    source: 'manual',
    sourceReference: 'Regional cup 2025',
    reconciliationNote: body.reconciliationNote ?? 'Recorded from the paper score sheet.',
    recordedBy: 'user-coach',
  });
  manualRows = [...manualRows, row];
  return row;
}

/** The recompute report; explains the empty case honestly. */
export function recomputeReport(): RecomputeReportDto {
  return {
    competitionId: MOCK_STANDINGS.leagueId,
    ruleVersionId: MOCK_STANDINGS.ruleVersionId,
    finalizedMatches: 5,
    entrants: 2,
    rows: standingsResponse('derived').items,
  };
}

function rule(overrides: Partial<RuleDto> & { ruleVersionId: string; version: number }): RuleDto {
  return {
    teamId: MOCK_STANDINGS.teamId,
    ruleKey: MOCK_STANDINGS.ruleKey,
    name: 'League standard scoring',
    winPoints: 3,
    lossPoints: 0,
    tiePoints: 1,
    tieBreakOrder: ['standing_points', 'wins', 'point_difference', 'spirit'],
    effectiveFrom: '2026-06-01T00:00:00.000Z',
    status: 'active',
    createdBy: 'user-coach',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

let publishedRules: RuleDto[] = [];

/** Two versions of one family: the active current and an archived v1. */
export function standingsRulesResponse(): RulesListDto {
  const rules: RuleDto[] = [
    rule({ ruleVersionId: MOCK_STANDINGS.ruleVersionId, version: 2 }),
    rule({
      ruleVersionId: '90000000-0000-4000-8000-000000000000',
      version: 1,
      status: 'archived',
      winPoints: 2,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
    }),
    ...publishedRules,
  ];
  return { items: rules, total: rules.length, limit: 50, offset: 0 };
}

/** Publish version N+1 of a family. */
export function publishStandingsRule(body: { ruleKey?: string; name?: string }): RuleDto {
  const next = rule({
    ruleVersionId: `90000000-0000-4000-8000-00000000010${String(publishedRules.length + 1)}`,
    version: 3 + publishedRules.length,
    ruleKey: body.ruleKey ?? MOCK_STANDINGS.ruleKey,
    name: body.name ?? 'Revised scoring',
  });
  publishedRules = [...publishedRules, next];
  return next;
}

export function resetMockStandingsState(): void {
  manualRows = [];
  publishedRules = [];
}

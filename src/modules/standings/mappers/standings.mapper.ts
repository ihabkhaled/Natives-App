import type { SchemaOutput } from '@/packages/schema';

import type {
  listStandingsResponseSchema,
  listStandingsRulesResponseSchema,
  standingResponseSchema,
  standingsRecomputeReportSchema,
  standingsRuleResponseSchema,
} from '../schemas/standings.schema';
import type {
  StandingRow,
  StandingsPage,
  StandingsRecomputeReport,
  StandingsRule,
  StandingsRulesPage,
} from '../types/standings.types';

type StandingDto = SchemaOutput<typeof standingResponseSchema>;
type StandingsListDto = SchemaOutput<typeof listStandingsResponseSchema>;
type RecomputeReportDto = SchemaOutput<typeof standingsRecomputeReportSchema>;
type RuleDto = SchemaOutput<typeof standingsRuleResponseSchema>;
type RulesListDto = SchemaOutput<typeof listStandingsRulesResponseSchema>;

/**
 * Pure DTO → domain projection. Row order is preserved exactly as the server
 * sorted it under the rule version it cites; a null spirit score survives as
 * null ("not scored"), never as zero.
 */
export function mapStandingRow(dto: StandingDto): StandingRow {
  return {
    standingId: dto.standingId,
    seasonId: dto.seasonId,
    competitionId: dto.competitionId,
    stageId: dto.stageId,
    ruleVersionId: dto.ruleVersionId,
    poolLabel: dto.poolLabel,
    entrantKind: dto.entrantKind,
    opponentId: dto.opponentId,
    opponentName: dto.opponentName,
    played: dto.played,
    wins: dto.wins,
    losses: dto.losses,
    ties: dto.ties,
    pointsFor: dto.pointsFor,
    pointsAgainst: dto.pointsAgainst,
    standingPoints: dto.standingPoints,
    spiritScore: dto.spiritScore,
    finalPlace: dto.finalPlace,
    qualification: dto.qualification,
    source: dto.source,
    sourceReference: dto.sourceReference,
    reconciliationNote: dto.reconciliationNote,
    recordVersion: dto.recordVersion,
    recordedBy: dto.recordedBy,
    computedAtIso: dto.computedAt,
  };
}

export function mapStandingsPage(dto: StandingsListDto): StandingsPage {
  return {
    rows: dto.items.map(mapStandingRow),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

/** The recompute reconciliation; the rows themselves refresh via the table query. */
export function mapRecomputeReport(dto: RecomputeReportDto): StandingsRecomputeReport {
  return {
    competitionId: dto.competitionId,
    ruleVersionId: dto.ruleVersionId,
    finalizedMatches: dto.finalizedMatches,
    entrants: dto.entrants,
  };
}

export function mapStandingsRule(dto: RuleDto): StandingsRule {
  return {
    ruleVersionId: dto.ruleVersionId,
    ruleKey: dto.ruleKey,
    version: dto.version,
    name: dto.name,
    winPoints: dto.winPoints,
    lossPoints: dto.lossPoints,
    tiePoints: dto.tiePoints,
    tieBreakOrder: dto.tieBreakOrder,
    effectiveFromIso: dto.effectiveFrom,
    status: dto.status,
  };
}

export function mapStandingsRulesPage(dto: RulesListDto): StandingsRulesPage {
  return {
    rules: dto.items.map(mapStandingsRule),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

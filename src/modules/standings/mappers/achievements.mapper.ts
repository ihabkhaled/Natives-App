import type { SchemaOutput } from '@/packages/schema';

import type {
  achievementImportReportSchema,
  achievementResponseSchema,
  listAchievementsResponseSchema,
  teamHistoryResponseSchema,
} from '../schemas/achievements.schema';
import type {
  Achievement,
  AchievementImportReport,
  AchievementsPage,
  TeamHistoryPage,
} from '../types/achievements.types';

type AchievementDto = SchemaOutput<typeof achievementResponseSchema>;
type AchievementsListDto = SchemaOutput<typeof listAchievementsResponseSchema>;
type ImportReportDto = SchemaOutput<typeof achievementImportReportSchema>;
type HistoryDto = SchemaOutput<typeof teamHistoryResponseSchema>;

/**
 * Pure DTO → domain projection. The approval state, its record version, and
 * the rejection epitaph all arrive from the server — the client renders the
 * state machine and never advances it locally.
 */
export function mapAchievement(dto: AchievementDto): Achievement {
  return {
    achievementId: dto.achievementId,
    seasonId: dto.seasonId,
    competitionId: dto.competitionId,
    membershipId: dto.membershipId,
    category: dto.category,
    title: dto.title,
    description: dto.description,
    achievedOn: dto.achievedOn,
    evidenceReference: dto.evidenceReference,
    visibility: dto.visibility,
    status: dto.status,
    source: dto.source,
    importReference: dto.importReference,
    rejectionReason: dto.rejectionReason,
    recordVersion: dto.recordVersion,
    approvedBy: dto.approvedBy,
    approvedAtIso: dto.approvedAt,
  };
}

export function mapAchievementsPage(dto: AchievementsListDto): AchievementsPage {
  return {
    items: dto.items.map(mapAchievement),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

export function mapImportReport(dto: ImportReportDto): AchievementImportReport {
  return {
    dryRun: dto.dryRun,
    received: dto.received,
    imported: dto.imported,
    skippedDuplicate: dto.skippedDuplicate,
    rejectedInvalid: dto.rejectedInvalid,
    rows: dto.rows.map((row) => ({
      reference: row.reference,
      outcome: row.outcome,
      achievementId: row.achievementId,
    })),
  };
}

/** The cabinet is already privacy-projected server-side; nothing is filtered here. */
export function mapTeamHistoryPage(dto: HistoryDto): TeamHistoryPage {
  return {
    items: dto.items.map((entry) => ({
      achievementId: entry.achievementId,
      seasonId: entry.seasonId,
      competitionId: entry.competitionId,
      membershipId: entry.membershipId,
      category: entry.category,
      title: entry.title,
      achievedOn: entry.achievedOn,
    })),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

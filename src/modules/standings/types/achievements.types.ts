import type {
  AchievementCategory,
  AchievementImportOutcome,
  AchievementSource,
  AchievementStatus,
  AchievementTransition,
  AchievementVisibility,
} from '../constants/standings.constants';

/** A team or player achievement with its provenance and approval state. */
export interface Achievement {
  readonly achievementId: string;
  readonly seasonId: string | null;
  readonly competitionId: string | null;
  readonly membershipId: string | null;
  readonly category: AchievementCategory;
  readonly title: string;
  readonly description: string | null;
  readonly achievedOn: string;
  readonly evidenceReference: string | null;
  readonly visibility: AchievementVisibility;
  readonly status: AchievementStatus;
  readonly source: AchievementSource;
  readonly importReference: string | null;
  readonly rejectionReason: string | null;
  readonly recordVersion: number;
  readonly approvedBy: string | null;
  readonly approvedAtIso: string | null;
}

export interface AchievementsPage {
  readonly items: readonly Achievement[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** Facets of the achievements list read; null keeps a facet unfiltered. */
export interface AchievementsFilters {
  readonly status: AchievementStatus | null;
  readonly category: AchievementCategory | null;
}

export interface CreateAchievementCommand {
  readonly category: AchievementCategory;
  readonly title: string;
  readonly description: string | null;
  readonly achievedOn: string;
  readonly membershipId: string | null;
  readonly evidenceReference: string | null;
  readonly visibility: AchievementVisibility;
}

/** The optimistic-concurrency transition envelope the state machine accepts. */
export interface TransitionAchievementCommand {
  readonly transition: AchievementTransition;
  readonly expectedRecordVersion: number;
  readonly reason: string | null;
}

/** One parsed row of the historical import, pre-validated client-side. */
export interface AchievementImportRow {
  readonly reference: string;
  readonly category: AchievementCategory;
  readonly title: string;
  readonly achievedOn: string;
  readonly description: string | null;
  readonly visibility: AchievementVisibility | null;
}

export interface ImportAchievementsCommand {
  readonly dryRun: boolean;
  readonly rows: readonly AchievementImportRow[];
}

interface AchievementImportRowResult {
  readonly reference: string;
  readonly outcome: AchievementImportOutcome;
  readonly achievementId: string | null;
}

export interface AchievementImportReport {
  readonly dryRun: boolean;
  readonly received: number;
  readonly imported: number;
  readonly skippedDuplicate: number;
  readonly rejectedInvalid: number;
  readonly rows: readonly AchievementImportRowResult[];
}

/** One privacy-safe entry of the trophy cabinet. */
export interface TeamHistoryEntry {
  readonly achievementId: string;
  readonly seasonId: string | null;
  readonly competitionId: string | null;
  readonly membershipId: string | null;
  readonly category: AchievementCategory;
  readonly title: string;
  readonly achievedOn: string;
}

export interface TeamHistoryPage {
  readonly items: readonly TeamHistoryEntry[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** Facets of the cabinet read; null keeps a facet unfiltered. */
export interface TeamHistoryFilters {
  readonly category: AchievementCategory | null;
}

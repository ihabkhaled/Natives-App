import type {
  AuditOutcome,
  CatalogKind,
  ConfidenceLevel,
  JobStatus,
  RuleStatus,
  SeasonStatus,
  SettingKey,
  VenueStatus,
} from '../constants/admin.constants';

export interface EffectiveSetting {
  readonly settingKey: SettingKey;
  readonly effectiveFrom: string | null;
  /** Opaque server-owned JSON, rendered as text and never interpreted. */
  readonly value: unknown;
}

export interface SettingsSnapshot {
  readonly asOf: string;
  readonly settings: readonly EffectiveSetting[];
}

export interface SettingVersion {
  readonly id: string;
  readonly settingKey: SettingKey;
  readonly effectiveFrom: string;
  readonly value: unknown;
  readonly note: string | null;
  readonly createdAt: string;
}

export interface SettingVersionPage {
  readonly items: readonly SettingVersion[];
  readonly total: number;
}

export interface Season {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: SeasonStatus;
}

export interface Venue {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly timezone: string;
  readonly status: VenueStatus;
}

export interface CatalogEntry {
  readonly id: string;
  readonly catalog: CatalogKind;
  readonly key: string;
  readonly label: string;
  readonly referenceCount: number;
  readonly status: string;
}

export interface PointEntry {
  readonly activityCategory: string;
  /** Null means "not scored" — never coerced to zero. */
  readonly points: number | null;
  readonly dailyCap: number | null;
  readonly cooldownDays: number | null;
}

export interface GovernedRule {
  readonly ruleId: string;
  readonly ruleKey: string;
  readonly name: string;
  readonly description: string | null;
  readonly version: number;
  readonly status: RuleStatus;
  readonly pointEntries: readonly PointEntry[];
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly recordVersion: number;
}

export interface RulePage {
  readonly items: readonly GovernedRule[];
  readonly total: number;
}

interface ScoreExplanation {
  readonly completeness: number;
  readonly confidence: ConfidenceLevel;
  readonly formulaVersion: number;
}

export interface SimulationResult {
  readonly membershipId: string;
  readonly draft: ScoreExplanation;
  readonly published: ScoreExplanation | null;
  readonly delta: number | null;
}

export interface OutboxMetrics {
  readonly pending: number;
  readonly processing: number;
  readonly completed: number;
  readonly deadLettered: number;
}

/** No payload field exists here, by design. */
export interface DeadLetter {
  readonly eventId: string;
  readonly eventType: string;
  readonly attempts: number;
  readonly failedAt: string;
  readonly failureCode: string;
}

export interface JobHealth {
  readonly jobKey: string;
  readonly status: JobStatus;
  readonly lastRunAt: string | null;
  readonly failureCount: number;
}

/** The audit diff is reduced to a field count; values never reach the view. */
export interface AuditEntry {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly correlationId: string | null;
  readonly outcome: AuditOutcome;
  readonly changedFieldCount: number;
  readonly occurredAt: string;
}

export interface AuditPage {
  readonly items: readonly AuditEntry[];
  readonly total: number;
}

export interface CreateSettingVersionCommand {
  readonly settingKey: SettingKey;
  readonly effectiveFrom: string;
  readonly value: unknown;
  readonly note: string;
}

export interface RuleTransitionCommand {
  readonly ruleId: string;
  readonly transition: string;
  readonly expectedRecordVersion: number;
}

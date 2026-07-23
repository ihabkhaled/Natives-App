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
import type { SettingValueState } from '../constants/setting-values.constants';
import type { SettingVersionValue, TypedSettingValue } from './setting-values.types';

/** One platform super administrator: an audited privilege, not a directory row. */
export interface SuperAdmin {
  readonly assignmentId: string;
  readonly userId: string;
  readonly email: string;
  readonly displayName: string | null;
  /** Grant instant in UTC (ISO 8601). */
  readonly effectiveFromIso: string;
  /** Null for the seeded bootstrap administrator. */
  readonly grantedBy: string | null;
}

export interface SuperAdminRoster {
  readonly items: readonly SuperAdmin[];
  readonly total: number;
}

export interface EffectiveSetting {
  readonly settingKey: SettingKey;
  readonly effectiveFrom: string | null;
  /** Typed per key; null when not configured or the in-effect row is legacy. */
  readonly value: TypedSettingValue | null;
  /** Null only when the key is not configured. */
  readonly valueState: SettingValueState | null;
  /** Cross-setting issue codes, e.g. `weights_missing_status:<code>`. */
  readonly issues: readonly string[];
}

export interface SettingsSnapshot {
  readonly asOf: string;
  readonly settings: readonly EffectiveSetting[];
}

export interface SettingVersion {
  readonly id: string;
  readonly settingKey: SettingKey;
  readonly effectiveFrom: string;
  readonly value: SettingVersionValue;
  readonly note: string | null;
  readonly createdBy: string | null;
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
  /** Strict UTC instant (`...Z`); the form converts from Cairo wall time. */
  readonly effectiveFrom: string;
  readonly value: TypedSettingValue;
  readonly note: string;
  /**
   * Optimistic guard: id of the newest version the client saw for this key,
   * or null for "no versions yet". A mismatch is refused with 409.
   */
  readonly expectedHeadVersionId: string | null;
}

/** A dry run addresses one rule version for one member. */
export interface SimulationCommand {
  readonly ruleId: string;
  readonly membershipId: string;
}

export interface RuleTransitionCommand {
  readonly ruleId: string;
  readonly transition: string;
  readonly expectedRecordVersion: number;
}

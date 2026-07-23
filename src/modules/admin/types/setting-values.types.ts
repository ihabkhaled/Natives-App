import type {
  AttendanceStatusCode,
  NotificationChannel,
  NotificationEvent,
  NotificationRecipients,
  SettingColorToken,
} from '../constants/setting-values.constants';
import type { SettingKey } from '../constants/admin.constants';

/** One selectable attendance status: canonical code, labels, colour, flags. */
export interface AttendanceStatusEntry {
  readonly code: AttendanceStatusCode;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly color: SettingColorToken;
  readonly countsTowardMetrics: boolean;
  readonly allowSelfCheckIn: boolean;
  readonly active: boolean;
}

export interface AttendanceStatusesValue {
  readonly statuses: readonly AttendanceStatusEntry[];
}

export interface SessionTypeEntry {
  readonly code: string;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly color: SettingColorToken;
  readonly defaultDurationMinutes?: number | undefined;
  readonly active: boolean;
}

export interface SessionTypesValue {
  readonly types: readonly SessionTypeEntry[];
}

export interface AttendanceWeightsValue {
  readonly weights: Readonly<Record<string, number>>;
}

export interface ScaleBand {
  readonly key: string;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly from: number;
  readonly to: number;
}

export interface AssessmentScaleValue {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly bands?: readonly ScaleBand[] | undefined;
}

export interface BadgeTier {
  readonly key: string;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly threshold: number;
  readonly color: SettingColorToken;
}

export interface BadgeTiersValue {
  readonly tiers: readonly BadgeTier[];
}

interface RosterBound {
  readonly min?: number | undefined;
  readonly max: number;
}

export interface PositionLimit {
  readonly positionKey: string;
  readonly max: number;
}

export interface RosterLimitsValue {
  readonly roster: RosterBound;
  readonly matchSquad?: RosterBound | undefined;
  readonly perPosition?: readonly PositionLimit[] | undefined;
}

export interface NotificationRule {
  readonly event: NotificationEvent;
  readonly enabled: boolean;
  readonly channels: readonly NotificationChannel[];
  readonly leadHours?: number | undefined;
  readonly recipients: NotificationRecipients;
}

interface QuietHours {
  readonly start: string;
  readonly end: string;
}

export interface NotificationRulesValue {
  readonly rules: readonly NotificationRule[];
  readonly quietHours?: QuietHours | undefined;
}

export interface ReportBrandingValue {
  readonly displayName: string;
  readonly logoMediaKey?: string | undefined;
  readonly accentColor?: string | undefined;
  readonly footerText?: string | undefined;
  readonly contactEmail?: string | undefined;
}

/** The typed value for each setting key (the contract of record). */
export interface SettingValueByKey {
  readonly attendance_statuses: AttendanceStatusesValue;
  readonly session_types: SessionTypesValue;
  readonly attendance_weights: AttendanceWeightsValue;
  readonly assessment_scale: AssessmentScaleValue;
  readonly badge_tiers: BadgeTiersValue;
  readonly roster_limits: RosterLimitsValue;
  readonly notification_rules: NotificationRulesValue;
  readonly report_branding: ReportBrandingValue;
}

export type TypedSettingValue = SettingValueByKey[SettingKey];

/**
 * A stored version's document: typed when the row passed the per-key policy,
 * or the honest raw legacy document (never interpreted) when it predates it.
 */
export type SettingVersionValue =
  | { readonly state: 'valid'; readonly value: TypedSettingValue }
  | { readonly state: 'legacy'; readonly raw: unknown };

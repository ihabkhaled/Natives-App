import type { SelectFieldOption } from '@/shared/ui';

import type { SettingKey } from '../../constants/admin.constants';
import type { SettingColorToken } from '../../constants/setting-values.constants';
import type { SettingValueByKey } from '../../types/setting-values.types';

/** Every translated label the eight editors render, built once per screen. */
export interface SettingEditorLabels {
  readonly moveUp: string;
  readonly moveDown: string;
  readonly remove: string;
  readonly code: string;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly color: string;
  readonly active: string;
  readonly statusesAdd: string;
  readonly countsTowardMetrics: string;
  readonly allowSelfCheckIn: string;
  readonly typesAdd: string;
  readonly duration: string;
  readonly weightLabel: string;
  readonly scaleMin: string;
  readonly scaleMax: string;
  readonly scaleStep: string;
  readonly bandsHeading: string;
  readonly bandsAdd: string;
  readonly bandKey: string;
  readonly bandFrom: string;
  readonly bandTo: string;
  readonly tiersAdd: string;
  readonly tierKey: string;
  readonly threshold: string;
  readonly rosterHeading: string;
  readonly squadHeading: string;
  readonly rosterMin: string;
  readonly rosterMax: string;
  readonly squadMin: string;
  readonly squadMax: string;
  readonly squadFloorHint: string;
  readonly positionsHeading: string;
  readonly positionsAdd: string;
  readonly position: string;
  readonly positionMax: string;
  readonly enabled: string;
  readonly channelPush: string;
  readonly channelEmail: string;
  readonly recipients: string;
  readonly leadHours: string;
  readonly quietHoursHeading: string;
  readonly quietHoursUse: string;
  readonly quietStart: string;
  readonly quietEnd: string;
  readonly quietOvernight: string;
  readonly displayName: string;
  readonly accentColor: string;
  readonly footerText: string;
  readonly contactEmail: string;
  readonly logoKey: string;
  readonly previewHeading: string;
}

/** One derived weight row: an active counts-toward status at the instant. */
export interface WeightRowView {
  readonly code: string;
  readonly label: string;
}

export interface WeightsEditorContext {
  readonly rows: readonly WeightRowView[];
  /** Translated blocker when statuses are not configured at the instant. */
  readonly blockedNotice: string | null;
  /** Translated progress note while the as-of snapshot resolves. */
  readonly loadingNotice: string | null;
}

/** Everything the editors need beyond their own value: labels and options. */
export interface SettingEditorContext {
  readonly labels: SettingEditorLabels;
  readonly keyLabels: Readonly<Record<SettingKey, string>>;
  readonly colorOptions: readonly SelectFieldOption[];
  readonly statusOptions: readonly SelectFieldOption[];
  readonly recipientOptions: readonly SelectFieldOption[];
  readonly eventNames: Readonly<Record<string, string>>;
  readonly positionOptions: readonly SelectFieldOption[];
  readonly weights: WeightsEditorContext;
  /** Live "N points: 1 · 2 · …" preview for the assessment scale. */
  readonly scalePreview: string | null;
}

interface BindingFor<K extends SettingKey> {
  readonly settingKey: K;
  readonly value: SettingValueByKey[K];
  readonly onChange: (next: SettingValueByKey[K]) => void;
}

/** The discriminated editor binding: `settingKey` narrows value and change. */
export type SettingEditorBinding = { [K in SettingKey]: BindingFor<K> }[SettingKey];

/** Ordered-collection editors (rendered through `ReorderableRows`). */
export type CollectionEditorBinding = Extract<
  SettingEditorBinding,
  { settingKey: 'attendance_statuses' | 'session_types' | 'badge_tiers' | 'assessment_scale' }
>;

/** Form-shaped editors (weights, roster, notifications, branding). */
type FormEditorBinding = Exclude<SettingEditorBinding, CollectionEditorBinding>;

export interface SettingEditorSwitchProps {
  readonly binding: SettingEditorBinding;
  readonly context: SettingEditorContext;
}

export interface CollectionEditorSwitchProps {
  readonly binding: CollectionEditorBinding;
  readonly context: SettingEditorContext;
}

export interface FormEditorSwitchProps {
  readonly binding: FormEditorBinding;
  readonly context: SettingEditorContext;
}

interface EditorProps<K extends SettingKey> {
  readonly value: SettingValueByKey[K];
  readonly onChange: (next: SettingValueByKey[K]) => void;
  readonly context: SettingEditorContext;
}

export type AttendanceStatusesEditorProps = EditorProps<'attendance_statuses'>;
export type SessionTypesEditorProps = EditorProps<'session_types'>;
export type AttendanceWeightsEditorProps = EditorProps<'attendance_weights'>;
export type AssessmentScaleEditorProps = EditorProps<'assessment_scale'>;
export type BadgeTiersEditorProps = EditorProps<'badge_tiers'>;
export type RosterLimitsEditorProps = EditorProps<'roster_limits'>;
export type NotificationRulesEditorProps = EditorProps<'notification_rules'>;
export type ReportBrandingEditorProps = EditorProps<'report_branding'>;

/** Shared EN/AR label pair (+ optional colour token) fields for one entry. */
export interface EntryLabelFieldsProps {
  readonly idPrefix: string;
  readonly labels: SettingEditorLabels;
  readonly labelEn: string;
  readonly labelAr: string;
  /** Null hides the colour select (scale bands carry no colour). */
  readonly color: SettingColorToken | null;
  readonly colorOptions: readonly SelectFieldOption[];
  readonly onPatch: (patch: {
    readonly labelEn?: string;
    readonly labelAr?: string;
    readonly color?: SettingColorToken;
  }) => void;
}

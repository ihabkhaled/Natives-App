import { cairoWallTimeToUtcIso, formatCairoDateTime } from '@/packages/date';
import { isAppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import type { WeightRowView } from '../components/setting-editors/setting-editors.types';
import type { SettingKey } from '../constants/admin.constants';
import {
  PRESENT_FAMILY_STATUS_CODES,
  type AttendanceStatusCode,
} from '../constants/setting-values.constants';
import { parseTypedSettingValue } from '../schemas/setting-values.schema';
import type {
  AssessmentScaleValue,
  AttendanceStatusesValue,
  AttendanceWeightsValue,
  SettingValueByKey,
  TypedSettingValue,
} from '../types/setting-values.types';
import { describeValidationIssues } from './setting-validation.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface EffectiveFromResolution {
  readonly utcIso: string | null;
  readonly displayValue: string;
  readonly hint: string;
  readonly errorMessage: string | null;
}

/**
 * Resolve the chosen Cairo wall time into the strict-UTC instant the wire
 * carries, with honest presentation: the hint always shows the stored UTC
 * value, and a past or missing instant blocks the submit here.
 */
export function resolveEffectiveFrom(
  t: Translate,
  locale: string,
  wallTime: string,
  nowIsoValue: string,
): EffectiveFromResolution {
  if (wallTime === '') {
    return {
      utcIso: null,
      displayValue: '',
      hint: t(I18N_KEYS.settingForm.cairoHint, { utc: '—' }),
      errorMessage: t(I18N_KEYS.settingForm.pastError),
    };
  }
  const utcIso = cairoWallTimeToUtcIso(wallTime);
  return {
    utcIso,
    displayValue: formatCairoDateTime(utcIso, locale),
    hint: t(I18N_KEYS.settingForm.cairoHint, { utc: utcIso }),
    errorMessage: utcIso <= nowIsoValue ? t(I18N_KEYS.settingForm.pastError) : null,
  };
}

/** The weight rows derived from the statuses effective at an instant. */
export function weightRowsFromStatuses(
  statuses: TypedSettingValue | null,
  locale: string,
): readonly WeightRowView[] {
  if (statuses === null) {
    return [];
  }
  // Snapshot rows pair each key with its own value by construction.
  const value = statuses as AttendanceStatusesValue;
  return value.statuses
    .filter((entry) => entry.active && entry.countsTowardMetrics)
    .map((entry) => ({
      code: entry.code,
      label: locale === 'ar' ? entry.labelAr : entry.labelEn,
    }));
}

function weightCoverageIssues(
  t: Translate,
  rows: readonly WeightRowView[],
  weights: AttendanceWeightsValue,
): readonly string[] {
  const issues = rows
    .filter((row) => weights.weights[row.code] === undefined)
    .map((row) => t(I18N_KEYS.settingConstraints.weightsMissingStatus, { code: row.code }));
  const absent = weights.weights['absent' satisfies AttendanceStatusCode];
  const presentFamily = PRESENT_FAMILY_STATUS_CODES.map((code) => weights.weights[code]).filter(
    (weight): weight is number => weight !== undefined,
  );
  if (absent !== undefined && presentFamily.some((weight) => absent > weight)) {
    issues.push(t(I18N_KEYS.settingConstraints.absentWeightExceedsPresent));
  }
  return issues;
}

/**
 * Every translated blocker for the current draft: the per-key schema issues
 * plus the cross-setting weight rules the client can evaluate against the
 * rows derived at the chosen instant.
 */
export function collectDraftIssues(
  t: Translate,
  key: SettingKey,
  draft: TypedSettingValue,
  weightRows: readonly WeightRowView[] | null,
): readonly string[] {
  const parsed = parseTypedSettingValue(key, draft);
  if (!parsed.success) {
    return describeValidationIssues(t, parsed.issues);
  }
  if (key === 'attendance_weights' && weightRows !== null) {
    return weightCoverageIssues(t, weightRows, draft as AttendanceWeightsValue);
  }
  return [];
}

export type RawJsonParseResult =
  { readonly ok: true; readonly value: TypedSettingValue } | { readonly ok: false };

/**
 * Parse the privileged raw-JSON fallback through the same per-key schema.
 * Invalid JSON and schema-invalid documents never reach the editor state —
 * the disclosure is an affordance, not a validation bypass.
 */
export function parseRawSettingJson(key: SettingKey, text: string): RawJsonParseResult {
  let candidate: unknown;
  try {
    candidate = JSON.parse(text);
  } catch {
    return { ok: false };
  }
  const parsed = parseTypedSettingValue(key, candidate);
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
}

/** Live "N points: 1 · 2 · …" preview for the assessment-scale editor. */
export function describeScalePreview(
  t: Translate,
  key: SettingKey,
  draft: TypedSettingValue,
): string | null {
  if (key !== 'assessment_scale') {
    return null;
  }
  const scale = draft as AssessmentScaleValue;
  if (scale.step <= 0 || scale.max <= scale.min) {
    return null;
  }
  const points: number[] = [];
  for (let value = scale.min; value <= scale.max && points.length < 25; value += scale.step) {
    points.push(value);
  }
  return t(I18N_KEYS.settingEditors.scalePreview, {
    count: points.length,
    points: points.join(' · '),
  });
}

const STALE_MESSAGE_KEY = 'errors.teams.settingVersionStale';

/** The specific refusal copy for a failed schedule submit. */
export function describeSubmitError(t: Translate, error: unknown): string {
  if (isAppError(error) && error.messageKey === STALE_MESSAGE_KEY) {
    return t(I18N_KEYS.settingForm.staleToast);
  }
  if (isAppError(error) && error.code === 'CONFLICT') {
    return t(I18N_KEYS.settingForm.conflictToast);
  }
  return t(I18N_KEYS.adminSettings.addVersionFailedToast);
}

/** Drop weight keys outside the derived rows (per-key draft hygiene). */
export function alignDraftWithRows<K extends SettingKey>(
  key: K,
  draft: SettingValueByKey[K],
  rows: readonly WeightRowView[] | null,
): SettingValueByKey[K] {
  if (key !== 'attendance_weights' || rows === null) {
    return draft;
  }
  const allowed = new Set(rows.map((row) => row.code));
  const weights = draft as AttendanceWeightsValue;
  const entries = Object.entries(weights.weights).filter(([code]) => allowed.has(code));
  if (entries.length === Object.keys(weights.weights).length) {
    return draft;
  }
  return { weights: Object.fromEntries(entries) } as SettingValueByKey[K];
}

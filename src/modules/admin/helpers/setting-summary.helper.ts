import { I18N_KEYS } from '@/shared/i18n';

import type { SettingKey } from '../constants/admin.constants';
import type { EffectiveSetting } from '../types/admin.types';
import type { SettingValueByKey, TypedSettingValue } from '../types/setting-values.types';
import { describeSnapshotIssue } from './setting-validation.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;

// The mapper only ever pairs a key with its own parsed value, so the narrow
// per-branch reads below are sound by construction (no re-parse per render).
function narrow<K extends SettingKey>(_key: K, value: TypedSettingValue): SettingValueByKey[K] {
  return value as SettingValueByKey[K];
}

function summarizeStatuses(t: Translate, value: TypedSettingValue): string {
  const statuses = narrow('attendance_statuses', value).statuses;
  return t(I18N_KEYS.settingSummary.statuses, {
    total: statuses.length,
    active: statuses.filter((entry) => entry.active).length,
  });
}

function summarizeTypes(t: Translate, value: TypedSettingValue): string {
  const types = narrow('session_types', value).types;
  return t(I18N_KEYS.settingSummary.types, {
    total: types.length,
    active: types.filter((entry) => entry.active).length,
  });
}

function summarizeWeights(value: TypedSettingValue): string {
  const weights = narrow('attendance_weights', value).weights;
  return Object.entries(weights)
    .map(([code, weight]) => `${code} ${weight}`)
    .join(' · ');
}

function summarizeScale(t: Translate, value: TypedSettingValue): string {
  const scale = narrow('assessment_scale', value);
  const bands = scale.bands ?? [];
  const params = { min: scale.min, max: scale.max, step: scale.step, bands: bands.length };
  return bands.length === 0
    ? t(I18N_KEYS.settingSummary.scale, params)
    : t(I18N_KEYS.settingSummary.scaleBands, params);
}

function summarizeTiers(t: Translate, value: TypedSettingValue): string {
  const tiers = narrow('badge_tiers', value).tiers;
  return t(I18N_KEYS.settingSummary.tiers, {
    count: tiers.length,
    top: tiers.at(-1)?.threshold ?? 0,
  });
}

function summarizeRoster(t: Translate, value: TypedSettingValue): string {
  const limits = narrow('roster_limits', value);
  const parts = [t(I18N_KEYS.settingSummary.rosterMax, { max: limits.roster.max })];
  if (limits.matchSquad !== undefined) {
    parts.push(
      t(I18N_KEYS.settingSummary.rosterSquad, {
        min: limits.matchSquad.min ?? 1,
        max: limits.matchSquad.max,
      }),
    );
  }
  return parts.join(' · ');
}

function summarizeNotifications(t: Translate, value: TypedSettingValue): string {
  const rules = narrow('notification_rules', value).rules;
  return t(I18N_KEYS.settingSummary.notifications, {
    enabled: rules.filter((rule) => rule.enabled).length,
    total: rules.length,
  });
}

function summarizeBranding(t: Translate, value: TypedSettingValue): string {
  const branding = narrow('report_branding', value);
  return branding.accentColor === undefined
    ? branding.displayName
    : t(I18N_KEYS.settingSummary.branding, {
        name: branding.displayName,
        accent: branding.accentColor,
      });
}

type Summarizer = (t: Translate, value: TypedSettingValue) => string;

const SUMMARIZERS: Record<SettingKey, Summarizer> = {
  attendance_statuses: summarizeStatuses,
  session_types: summarizeTypes,
  attendance_weights: (_t, value) => summarizeWeights(value),
  assessment_scale: summarizeScale,
  badge_tiers: summarizeTiers,
  roster_limits: summarizeRoster,
  notification_rules: summarizeNotifications,
  report_branding: summarizeBranding,
};

/** One human line per typed value — never a serialized document. */
export function summarizeSettingValue(
  t: Translate,
  key: SettingKey,
  value: TypedSettingValue,
): string {
  return SUMMARIZERS[key](t, value);
}

export interface EffectiveSettingPresentation {
  readonly summary: string;
  /** Ionic colour token for the row chip, or null for a quiet row. */
  readonly tone: string | null;
  /** Translated cross-setting issues, ready to render as warnings. */
  readonly issues: readonly string[];
}

/** How one snapshot row reads: summary, warning tone, translated issues. */
export function describeEffectiveSetting(
  t: Translate,
  setting: EffectiveSetting,
): EffectiveSettingPresentation {
  const issues = setting.issues.map((issue) => describeSnapshotIssue(t, issue));
  const tone = setting.valueState === 'legacy' || issues.length > 0 ? 'warning' : null;
  if (setting.valueState === 'legacy') {
    return { summary: t(I18N_KEYS.settingSummary.legacyValue), tone, issues };
  }
  if (setting.value === null) {
    return { summary: t(I18N_KEYS.adminSettings.notSet), tone, issues };
  }
  return { summary: summarizeSettingValue(t, setting.settingKey, setting.value), tone, issues };
}

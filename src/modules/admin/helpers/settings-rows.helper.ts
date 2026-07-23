import { I18N_KEYS } from '@/shared/i18n';

import {
  CATALOG_LABEL_KEYS,
  SEASON_STATUS_LABEL_KEYS,
  SEASON_STATUS_TONES,
  SETTING_KEY_LABEL_KEYS,
} from '../constants/admin-labels.constants';
import type { CatalogEntry, EffectiveSetting, Season, Venue } from '../types/admin.types';
import type { AdminFactRowView } from '../types/admin-view.types';
import { describeEffectiveSetting } from './setting-summary.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;
type FormatInstant = (iso: string) => string;

function describeEffectiveDetail(
  t: Translate,
  formatInstant: FormatInstant,
  setting: EffectiveSetting,
  issues: readonly string[],
): string {
  const effective =
    setting.effectiveFrom === null
      ? t(I18N_KEYS.adminSettings.notSet)
      : `${t(I18N_KEYS.adminSettings.effectiveFromLabel)}: ${formatInstant(setting.effectiveFrom)}`;
  return [effective, ...issues].join(' · ');
}

/**
 * The Effective-now rows read as configuration, not serialization: one human
 * summary per key, a warning tone for legacy values and cross-setting
 * issues, and the issues themselves spelled out in the detail line.
 */
function buildEffectiveRows(
  t: Translate,
  formatInstant: FormatInstant,
  settings: readonly EffectiveSetting[],
): readonly AdminFactRowView[] {
  return settings.map((setting) => {
    const presentation = describeEffectiveSetting(t, setting);
    return {
      key: setting.settingKey,
      label: t(SETTING_KEY_LABEL_KEYS[setting.settingKey]),
      value: presentation.summary,
      detail: describeEffectiveDetail(t, formatInstant, setting, presentation.issues),
      tone: presentation.tone,
    };
  });
}

function buildSeasonRows(t: Translate, seasons: readonly Season[]): readonly AdminFactRowView[] {
  return seasons.map((season) => ({
    key: season.id,
    label: season.name,
    value: t(SEASON_STATUS_LABEL_KEYS[season.status]),
    detail: t(I18N_KEYS.adminSettings.seasonWindow, { from: season.startsOn, to: season.endsOn }),
    tone: SEASON_STATUS_TONES[season.status],
  }));
}

function buildVenueRows(t: Translate, venues: readonly Venue[]): readonly AdminFactRowView[] {
  return venues.map((venue) => ({
    key: venue.id,
    label: venue.name,
    value: venue.timezone,
    detail: venue.address ?? t(I18N_KEYS.adminSettings.venueNoAddress),
    tone: null,
  }));
}

function buildCatalogRows(
  t: Translate,
  entries: readonly CatalogEntry[],
): readonly AdminFactRowView[] {
  return entries.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.key,
    detail: t(I18N_KEYS.adminSettings.referenceCountLabel, { count: entry.referenceCount }),
    tone: null,
  }));
}

/** The setting-key picker, translated from the catalog rather than the wire. */
export function buildSettingKeyOptions(
  t: Translate,
  keys: readonly (keyof typeof SETTING_KEY_LABEL_KEYS)[],
): readonly { value: string; label: string }[] {
  return keys.map((key) => ({ value: key, label: t(SETTING_KEY_LABEL_KEYS[key]) }));
}

export function buildCatalogOptions(
  t: Translate,
  kinds: readonly (keyof typeof CATALOG_LABEL_KEYS)[],
): readonly { value: string; label: string }[] {
  return kinds.map((kind) => ({ value: kind, label: t(CATALOG_LABEL_KEYS[kind]) }));
}

export interface SettingsRowSources {
  readonly settings: readonly EffectiveSetting[] | undefined;
  readonly seasons: readonly Season[] | undefined;
  readonly venues: readonly Venue[] | undefined;
  readonly catalog: readonly CatalogEntry[] | undefined;
}

export interface SettingsRowGroups {
  readonly effectiveRows: readonly AdminFactRowView[];
  readonly seasonRows: readonly AdminFactRowView[];
  readonly venueRows: readonly AdminFactRowView[];
  readonly catalogRows: readonly AdminFactRowView[];
}

/** Every row group the settings screen renders, built in one pass. */
export function buildSettingsRowGroups(
  t: Translate,
  formatInstant: FormatInstant,
  sources: SettingsRowSources,
): SettingsRowGroups {
  return {
    effectiveRows: buildEffectiveRows(t, formatInstant, sources.settings ?? []),
    seasonRows: buildSeasonRows(t, sources.seasons ?? []),
    venueRows: buildVenueRows(t, sources.venues ?? []),
    catalogRows: buildCatalogRows(t, sources.catalog ?? []),
  };
}

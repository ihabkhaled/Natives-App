import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import { CATALOG_KINDS, SETTING_KEYS } from '../constants/admin.constants';
import { buildCatalogOptions, buildSettingKeyOptions } from './settings-rows.helper';

type Translate = (key: string) => string;

export interface SettingsLabels {
  readonly title: string;
  readonly subtitle: string;
  readonly effectiveHeading: string;
  readonly effectiveIntro: string;
  readonly settingKeyLabel: string;
  readonly settingKeyOptions: readonly SelectFieldOption[];
  readonly versionsHeading: string;
  readonly versionsIntro: string;
  readonly seasonsHeading: string;
  readonly seasonsIntro: string;
  readonly venuesHeading: string;
  readonly venuesIntro: string;
  readonly catalogHeading: string;
  readonly catalogIntro: string;
  readonly catalogLabel: string;
  readonly catalogOptions: readonly SelectFieldOption[];
}

/** Every static, translated label the settings screen renders. */
export function buildSettingsLabels(t: Translate): SettingsLabels {
  return {
    title: t(I18N_KEYS.adminSettings.title),
    subtitle: t(I18N_KEYS.adminSettings.subtitle),
    effectiveHeading: t(I18N_KEYS.adminSettings.effectiveHeading),
    effectiveIntro: t(I18N_KEYS.adminSettings.effectiveIntro),
    settingKeyLabel: t(I18N_KEYS.adminSettings.settingKeyLabel),
    settingKeyOptions: buildSettingKeyOptions(t, SETTING_KEYS),
    versionsHeading: t(I18N_KEYS.adminSettings.versionsHeading),
    versionsIntro: t(I18N_KEYS.adminSettings.versionsIntro),
    seasonsHeading: t(I18N_KEYS.adminSettings.seasonsHeading),
    seasonsIntro: t(I18N_KEYS.adminSettings.seasonsIntro),
    venuesHeading: t(I18N_KEYS.adminSettings.venuesHeading),
    venuesIntro: t(I18N_KEYS.adminSettings.venuesIntro),
    catalogHeading: t(I18N_KEYS.adminSettings.catalogHeading),
    catalogIntro: t(I18N_KEYS.adminSettings.catalogIntro),
    catalogLabel: t(I18N_KEYS.adminSettings.catalogFilterLabel),
    catalogOptions: buildCatalogOptions(t, CATALOG_KINDS),
  };
}

/** "As of" line for the effective snapshot, or an explicit "not set". */
export function describeAsOf(
  t: Translate,
  formatInstant: (iso: string) => string,
  snapshot: { readonly asOf: string } | undefined,
): string {
  return snapshot === undefined
    ? t(I18N_KEYS.adminSettings.notSet)
    : `${t(I18N_KEYS.adminSettings.asOfLabel)}: ${formatInstant(snapshot.asOf)}`;
}

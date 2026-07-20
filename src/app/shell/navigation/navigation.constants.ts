import { I18N_KEYS, type I18nKey } from '@/shared/i18n';
import { NAV_GROUP, type NavGroup } from '@/shared/types';

/** Translated section label for each sidebar group. */
export const NAV_GROUP_LABEL_KEYS: Record<NavGroup, I18nKey> = {
  [NAV_GROUP.Overview]: I18N_KEYS.nav.groupOverview,
  [NAV_GROUP.Team]: I18N_KEYS.nav.groupTeam,
  [NAV_GROUP.Manage]: I18N_KEYS.nav.groupManage,
};

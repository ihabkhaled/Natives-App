import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import type { AdminContextView, AdminHubCardView } from '../types/admin-view.types';

type Translate = (key: string) => string;

interface CardRule {
  readonly key: string;
  readonly path: string;
  readonly titleKey: string;
  readonly noteKey: string;
  readonly permitted: (context: AdminContextView) => boolean;
}

/**
 * The hub's destinations, each with the predicate its route guard uses. A
 * card the principal may not open is never rendered — the hub and the guard
 * read the same grants.
 */
const CARD_RULES: readonly CardRule[] = [
  {
    key: 'settings',
    path: APP_PATHS.adminSettings,
    titleKey: I18N_KEYS.adminConsole.cardSettings,
    noteKey: I18N_KEYS.adminConsole.cardSettingsNote,
    permitted: (context) => context.canReadSettings,
  },
  {
    key: 'roles',
    path: APP_PATHS.adminRoles,
    titleKey: I18N_KEYS.adminConsole.cardRoles,
    noteKey: I18N_KEYS.adminConsole.cardRolesNote,
    permitted: (context) => context.canManageRoles,
  },
  {
    key: 'rules',
    path: APP_PATHS.adminRules,
    titleKey: I18N_KEYS.adminConsole.cardRules,
    noteKey: I18N_KEYS.adminConsole.cardRulesNote,
    permitted: (context) => context.canManageRules,
  },
  {
    key: 'operations',
    path: APP_PATHS.adminOperations,
    titleKey: I18N_KEYS.adminConsole.cardOperations,
    noteKey: I18N_KEYS.adminConsole.cardOperationsNote,
    permitted: (context) => context.canReadAudit || context.canManageOutbox,
  },
  {
    key: 'platform',
    path: APP_PATHS.adminPlatform,
    titleKey: I18N_KEYS.adminConsole.cardPlatform,
    noteKey: I18N_KEYS.adminConsole.cardPlatformNote,
    permitted: (context) => context.canManagePlatform,
  },
];

export function buildHubCards(
  t: Translate,
  context: AdminContextView,
  open: (path: string) => void,
): readonly AdminHubCardView[] {
  return CARD_RULES.filter((rule) => rule.permitted(context)).map((rule) => ({
    key: rule.key,
    title: t(rule.titleKey),
    note: t(rule.noteKey),
    openLabel: t(I18N_KEYS.adminConsole.open),
    onOpen: () => {
      open(rule.path);
    },
  }));
}

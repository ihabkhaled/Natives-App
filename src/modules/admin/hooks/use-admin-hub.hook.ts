import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { ADMIN_CONSOLE_COPY } from '../constants/admin-labels.constants';
import { buildAdminScreenCopy } from '../helpers/admin-copy.helper';
import { buildHubCards } from '../helpers/hub-cards.helper';
import type { AdminHubView } from '../types/admin-view.types';
import { useAdminContext } from './use-admin-context.hook';

/**
 * The admin hub. Cards are filtered by the same grants the routes are guarded
 * on, so the hub never advertises a destination the guard would refuse.
 */
export function useAdminHub(): AdminHubView {
  const { t } = useAppTranslation();
  const context = useAdminContext();
  const navigation = useAppNavigation();
  const cards = buildHubCards(t, context, (path: string) => {
    navigation.push(path);
  });

  return {
    ...buildAdminScreenCopy(t, {
      keys: ADMIN_CONSOLE_COPY,
      error: null,
      isOffline: context.isOffline,
      onRetry: () => undefined,
      emptyTitleKey: I18N_KEYS.adminConsole.emptyTitle,
      emptyMessageKey: I18N_KEYS.adminConsole.emptyMessage,
    }),
    title: t(I18N_KEYS.admin.title),
    subtitle: t(I18N_KEYS.adminConsole.hubSubtitle),
    status: context.isLoading ? 'loading' : cards.length > 0 ? 'ready' : 'empty',
    cards,
  };
}

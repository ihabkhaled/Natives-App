import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { buildTryoutCard } from '../helpers/candidate-view.helper';
import { buildTryoutsScreenCopy, resolveTryoutsScreenStatus } from '../helpers/tryouts-copy.helper';
import { tryoutDetailPath } from '../routes/tryouts.paths';
import type { TryoutsListView } from '../types/tryouts-view.types';
import { useTryoutsContext } from './use-tryouts-context.hook';
import { useTryoutsQuery } from './use-tryouts-query.hook';

/** Prepared, translated view model for the staff tryout event list. */
export function useTryoutsList(): TryoutsListView {
  const { t, locale } = useAppTranslation();
  const context = useTryoutsContext();
  const navigation = useAppNavigation();

  const query = useTryoutsQuery(context.teamId);
  const items = query.data?.items ?? [];

  return {
    ...buildTryoutsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.tryouts.emptyTitle,
      emptyMessageKey: I18N_KEYS.tryouts.emptyMessage,
    }),
    title: t(I18N_KEYS.tryouts.title),
    subtitle: t(I18N_KEYS.tryouts.subtitle),
    status: resolveTryoutsScreenStatus(context, query, context.canManage, items.length > 0),
    backendPendingNotice: t(I18N_KEYS.tryouts.backendPendingNotice),
    items: items.map((item) =>
      buildTryoutCard(t, (iso: string) => formatCairoDateTime(iso, locale), item),
    ),
    onOpen: (tryoutId: string) => {
      navigation.push(tryoutDetailPath(tryoutId));
    },
  };
}

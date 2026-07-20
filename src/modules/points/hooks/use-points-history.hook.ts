import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { resolveAsyncViewStatus } from '@/shared/view';

import { buildPointsScreenCopy } from '../helpers/points-copy.helper';
import { buildPointsHistoryBody } from '../helpers/points-history-view.helper';
import type { PointsHistoryView } from '../types/points-view.types';
import { useMyPointsQuery } from './use-my-points-query.hook';
import { usePointsContext } from './use-points-context.hook';

/**
 * Prepared, translated view model for the personal points ledger: the server
 * total, every append-only entry (awards, reversals, and adjustments each as
 * their own row), the awarded badges, and the candidate thresholds ahead.
 */
export function usePointsHistory(): PointsHistoryView {
  const { t, locale } = useAppTranslation();
  const context = usePointsContext();
  const query = useMyPointsQuery(context.teamId);
  const summary = query.data ?? null;

  return {
    ...buildPointsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
    }),
    ...buildPointsHistoryBody(t, locale, summary),
    title: t(I18N_KEYS.points.historyTitle),
    subtitle: t(I18N_KEYS.points.historySubtitle),
    status: resolveAsyncViewStatus({
      isForbidden: !context.isLoading && !context.canReadOwnPoints,
      isLoading: context.isLoading || query.isLoading,
      hasError: query.error !== null,
      isOffline: context.isOffline,
      hasData: summary !== null,
      hasItems: summary !== null,
    }),
  };
}

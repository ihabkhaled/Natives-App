import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import { JERSEY_SCREEN_COPY_KEYS } from '../constants/jersey-copy.constants';
import { buildJerseyOrderDetailView } from '../helpers/jersey-detail-view.helper';
import {
  buildJerseyOrderRowViews,
  resolveJerseyOrdersPage,
} from '../helpers/jersey-order-view.helper';
import { buildJerseyOrdersQueryOptions } from '../queries/jersey.query';
import { jerseyPagePath } from '../routes/jersey.paths';
import type { JerseyOrdersPage } from '../types/jersey.types';
import type { JerseyScreenView } from '../types/jersey-view.types';
import { useJerseyContext } from './use-jersey-context.hook';
import { useJerseyOrderDetail } from './use-jersey-order-detail.hook';

const KEYS = I18N_KEYS.jersey;

/**
 * View model for the jersey orders screen: the team's supplier orders newest
 * first, and — for a manage holder who opens one — the packing list it
 * contains.
 *
 * Every call this screen makes is a read. It creates nothing and changes
 * nothing, so there is no confirmation to write and no state to lose.
 */
export function useJerseyScreen(): JerseyScreenView {
  const { t, locale } = useAppTranslation();
  const context = useJerseyContext();
  const detail = useJerseyOrderDetail({ teamId: context.teamId, canManage: context.canManage });

  const query = toRemoteQueryView<JerseyOrdersPage>(
    useAppQuery(buildJerseyOrdersQueryOptions(context.teamId, 0)),
  );
  const page = resolveJerseyOrdersPage(query.data);
  const rows = buildJerseyOrderRowViews(locale, page.items, {
    canOpen: context.canManage,
    openOrderId: detail.openOrderId,
  });
  const copy = buildScreenCopy(t, {
    keys: JERSEY_SCREEN_COPY_KEYS,
    error: query.error,
    isOffline: context.isOffline,
    onRetry: query.refetch,
    emptyTitleKey: KEYS.emptyTitle,
    emptyMessageKey: KEYS.emptyMessage,
  });

  return {
    ...copy,
    path: jerseyPagePath(),
    pageTitle: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    status: resolveScreenStatus(context, query, context.canRead, rows.length > 0),
    listHeading: t(KEYS.listHeading),
    listIntro: t(KEYS.listIntro),
    countLabel: t(KEYS.countLabel, { total: page.total }),
    // One sentence, whichever of the two order reads failed: an operator needs
    // to know the order did not open, not how the server phrased it.
    notice: detail.hasError ? t(KEYS.actionFailed) : null,
    rows,
    onToggleOrder: detail.toggle,
    detail: buildJerseyOrderDetailView({
      locale,
      loadingLabel: t(I18N_KEYS.common.loading),
      row: rows.find((row) => row.isOpen) ?? null,
      order: detail.order,
      lines: detail.lines,
      isLoading: detail.isLoading,
    }),
  };
}

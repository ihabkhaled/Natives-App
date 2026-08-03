import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, toRemoteQueryView } from '@/shared/view';

import { DATA_QUALITY_SCREEN_COPY_KEYS } from '../constants/data-quality-copy.constants';
import { buildAnomalyCardViews, resolveAnomaliesPage } from '../helpers/anomaly-view.helper';
import { buildAnomaliesQueryOptions } from '../queries/data-quality.query';
import { dataQualityPagePath } from '../routes/data-quality.paths';
import type { AnomaliesPage, AnomalyTransition } from '../types/data-quality.types';
import type { DataQualityScreenView } from '../types/data-quality-view.types';
import { useDataQualityActions } from './use-data-quality-actions.hook';
import { useDataQualityContext } from './use-data-quality-context.hook';
import { useRepairPreview } from './use-repair-preview.hook';

const KEYS = I18N_KEYS.dataQuality;

/**
 * View model for the data-quality operations queue: the anomaly list, the
 * lifecycle transitions each one offers, and the preview-then-apply repair
 * flow. Nothing is repaired without the operator seeing the impact first.
 */
export function useDataQualityScreen(): DataQualityScreenView {
  const { t } = useAppTranslation();
  const context = useDataQualityContext();
  const actions = useDataQualityActions(t, context.teamId);

  const query = toRemoteQueryView<AnomaliesPage>(
    useAppQuery(buildAnomaliesQueryOptions(context.teamId, 0)),
  );
  const page = resolveAnomaliesPage(query.data);
  const cards = buildAnomalyCardViews(t, page.items);
  const preview = useRepairPreview(t, context.teamId, {
    isApplying: actions.isApplying,
    onApply: actions.onApply,
  });

  return {
    ...buildScreenCopy(t, {
      keys: DATA_QUALITY_SCREEN_COPY_KEYS,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: KEYS.emptyTitle,
      emptyMessageKey: KEYS.emptyMessage,
    }),
    path: dataQualityPagePath(),
    pageTitle: t(KEYS.title),
    status: resolveAsyncViewStatus({
      isForbidden: !context.isLoading && !context.canManage,
      isLoading: context.isLoading || query.isLoading,
      hasError: query.error !== null,
      isOffline: context.isOffline,
      hasData: page.hasData,
      hasItems: cards.length > 0,
    }),
    queueHeading: t(KEYS.queueHeading),
    queueIntro: t(KEYS.queueIntro),
    countLabel: t(KEYS.countLabel, { total: page.total }),
    scanLabel: actions.isScanning ? t(KEYS.scanRunning) : t(KEYS.scanLabel),
    isScanning: actions.isScanning,
    onScan: actions.onScan,
    notice: actions.notice,
    cards,
    previewLabel: t(KEYS.previewLabel),
    onPreview: preview.open,
    onTransition: (anomalyId: string, key: AnomalyTransition): void => {
      const card = cards.find((entry) => entry.id === anomalyId);
      if (card !== undefined) {
        actions.onTransition({
          anomalyId,
          transition: key,
          expectedRecordVersion: card.recordVersion,
        });
      }
    },
    preview: preview.view,
  };
}

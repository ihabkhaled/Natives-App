import { useAppTranslation } from '@/packages/i18n';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import { buildMeasurementsPanel, buildScoreCardView } from '../helpers/self-insights-view.helper';
import type {
  MeasurementsPanelView,
  PerformanceScoreCardView,
  PerformanceTabId,
} from '../types/assessments-view.types';
import { useMyMeasurementsQuery } from './use-my-measurements-query.hook';
import { useMyScoreQuery } from './use-my-score-query.hook';

export interface SelfInsightsView {
  readonly scoreCard: PerformanceScoreCardView | null;
  readonly measurements: MeasurementsPanelView;
}

/**
 * The two analytics self reads behind their own grant: the own score card on
 * the scores tab and the measurement panel on its tab. Each query fires only
 * for its visible tab AND only once `analytics.read.self` is proven — a
 * member without the grant issues zero forbidden requests.
 */
export function useSelfInsights(
  teamId: string,
  activeTab: PerformanceTabId,
  permissions: readonly string[],
  arePermissionsLoading: boolean,
): SelfInsightsView {
  const { t, locale } = useAppTranslation();
  const canReadOwnAnalytics =
    !arePermissionsLoading && hasAllPermissions(permissions, [PERMISSIONS.analyticsReadSelf]);
  const score = useMyScoreQuery(teamId, canReadOwnAnalytics && activeTab === 'scores');
  const measurements = useMyMeasurementsQuery(
    teamId,
    canReadOwnAnalytics && activeTab === 'measurements',
  );
  return {
    scoreCard:
      canReadOwnAnalytics && activeTab === 'scores'
        ? buildScoreCardView({
            t,
            score: score.score,
            isLoading: score.isLoading,
            error: score.error,
          })
        : null,
    measurements: buildMeasurementsPanel({
      t,
      locale,
      history: measurements.history,
      isLoading: measurements.isLoading,
      error: measurements.error,
    }),
  };
}

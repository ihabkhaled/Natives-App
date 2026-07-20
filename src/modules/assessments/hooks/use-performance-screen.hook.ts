import { useState } from 'react';

import { useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';

import { resolveAssessmentsStatus } from '../helpers/assessment-list-view.helper';
import { canReadOwnAssessments, canReadOwnFeedback } from '../helpers/assessment-workflow.helper';
import { buildAssessmentsAsyncCopy, buildAssessmentsGuardCopy } from '../helpers/async-copy.helper';
import { buildFeedbackCard, buildGoalCard } from '../helpers/development-view.helper';
import { buildPerformanceCharts, buildPerformanceCopy } from '../helpers/performance-view.helper';
import type { PerformanceView } from '../types/assessments-view.types';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';
import { useDevelopmentActions } from './use-development-actions.hook';
import { useMyPerformanceQuery } from './use-my-performance-query.hook';

/**
 * Prepared, translated view model for the player performance screen: the
 * accessible trend and radar charts (each with a tabular alternative), the
 * published coach feedback with acknowledgement, and the development goals.
 */
export function usePerformanceScreen(): PerformanceView {
  const { t, locale } = useAppTranslation();
  const team = useAssessmentsTeamContext();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  const query = useMyPerformanceQuery(team.teamId);
  const catalog = useAssessmentCatalogQuery(team.teamId);
  const actions = useDevelopmentActions(team.teamId, query.goals);
  const [selectedMetricId, setSelectedMetricId] = useState('');

  const assessments = query.assessments ?? [];
  const showsFeedback = canReadOwnFeedback(permissions.permissions);

  return {
    ...buildAssessmentsAsyncCopy(t, query.error, !network.isOnline, query.refetch),
    ...buildAssessmentsGuardCopy(t),
    ...buildPerformanceCopy(t),
    ...buildPerformanceCharts(t, catalog.catalog, assessments, selectedMetricId),
    status: resolveAssessmentsStatus({
      isForbidden: !permissions.isLoading && !canReadOwnAssessments(permissions.permissions),
      hasData: query.assessments !== undefined && catalog.catalog !== undefined,
      hasItems: assessments.length > 0,
      isLoading: query.isLoading || catalog.isLoading || permissions.isLoading || team.isLoading,
      hasError: query.error !== null,
      isOffline: !network.isOnline,
    }),
    onSelectMetric: setSelectedMetricId,
    feedbackCards: showsFeedback
      ? query.feedback.map((feedback) => buildFeedbackCard(t, locale, feedback))
      : [],
    isAcknowledging: actions.isAcknowledging,
    onAcknowledge: actions.acknowledge,
    goals: query.goals.map((goal) => buildGoalCard(t, goal)),
    isTransitioningGoal: actions.isTransitioningGoal,
    onGoalTransition: actions.transitionGoal,
  };
}

import { useState } from 'react';

import { useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';

import { resolvePerformanceScreenStatus } from '../helpers/assessment-list-view.helper';
import {
  canFetchAssessmentCatalog,
  canReadOwnAssessments,
  canReadOwnFeedback,
} from '../helpers/assessment-workflow.helper';
import { buildAssessmentsAsyncCopy, buildAssessmentsGuardCopy } from '../helpers/async-copy.helper';
import { buildFeedbackCard, buildGoalCard } from '../helpers/development-view.helper';
import { buildPerformanceCharts, buildPerformanceCopy } from '../helpers/performance-view.helper';
import {
  buildPerformanceTabs,
  resolveActivePerformanceTab,
  resolveTabPath,
} from '../helpers/self-insights-view.helper';
import type { PerformanceView } from '../types/assessments-view.types';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';
import { useDevelopmentActions } from './use-development-actions.hook';
import { useMyPerformanceQuery } from './use-my-performance-query.hook';
import { useSelfInsights } from './use-self-insights.hook';

/**
 * Prepared, translated view model for the member performance area: three
 * deep-linkable tabs (scores + own score card, measurements, feedback), the
 * accessible charts, and the development goals. Every read is self-scoped;
 * the staff catalog only loads behind its own team grant (P1-5 rule).
 */
export function usePerformanceScreen(): PerformanceView {
  const { t, locale } = useAppTranslation();
  const team = useAssessmentsTeamContext();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  const navigation = useAppNavigation();
  const query = useMyPerformanceQuery(team.teamId);
  // The catalog endpoints need the staff-only `assessment.read.team` grant.
  // A member's screen renders from member-permitted data only: without the
  // grant the query never fires, so no forbidden request is ever issued and
  // the charts (which need catalog names and scales) degrade honestly.
  const canReadCatalog = canFetchAssessmentCatalog(permissions.isLoading, permissions.permissions);
  const catalog = useAssessmentCatalogQuery(team.teamId, canReadCatalog);
  const actions = useDevelopmentActions(team.teamId, query.goals);
  const [selectedMetricId, setSelectedMetricId] = useState('');

  const activeTab = resolveActivePerformanceTab(navigation.currentPath);
  const tabs = buildPerformanceTabs(t, permissions.permissions);
  const insights = useSelfInsights(
    team.teamId,
    activeTab,
    permissions.permissions,
    permissions.isLoading,
  );

  const assessments = query.assessments ?? [];
  const showsFeedback = canReadOwnFeedback(permissions.permissions);

  return {
    ...buildAssessmentsAsyncCopy(t, query.error, !network.isOnline, query.refetch),
    ...buildAssessmentsGuardCopy(t),
    ...buildPerformanceCopy(t),
    ...buildPerformanceCharts(t, catalog.catalog, assessments, selectedMetricId),
    ...insights,
    status: resolvePerformanceScreenStatus({
      isForbidden: !permissions.isLoading && !canReadOwnAssessments(permissions.permissions),
      hasAssessments: query.assessments !== undefined,
      hasItems: assessments.length > 0,
      canReadCatalog,
      hasCatalog: catalog.catalog !== undefined,
      isCatalogLoading: catalog.isLoading,
      isLoading: query.isLoading || permissions.isLoading || team.isLoading,
      hasError: query.error !== null,
      isOffline: !network.isOnline,
    }),
    tabs,
    activeTab,
    tabBarLabel: t(I18N_KEYS.assessments.performanceTitle),
    onTabChange: (tabId) => {
      const path = resolveTabPath(tabs, activeTab, tabId);
      if (path !== null) {
        navigation.push(path);
      }
    },
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

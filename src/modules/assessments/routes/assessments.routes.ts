import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AssessmentEntryContainer } from '../containers/assessment-entry.container';
import { AssessmentsContainer } from '../containers/assessments.container';
import { PerformanceContainer } from '../containers/performance.container';
import {
  assessmentEntryPattern,
  assessmentsPattern,
  performanceFeedbackPath,
  performanceMeasurementsPath,
  performancePath,
} from './assessments.paths';

function workspaceRoute(): AppRouteDefinition {
  return {
    path: assessmentsPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AssessmentsContainer,
    meta: {
      key: 'assessments',
      titleKey: I18N_KEYS.assessments.title,
      permissions: [PERMISSIONS.assessmentReadTeam],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 20,
        group: NAV_GROUP.Team,
        iconName: 'clipboard',
        labelKey: I18N_KEYS.assessments.navLabel,
      },
    },
  };
}

function entryRoute(): AppRouteDefinition {
  return {
    path: assessmentEntryPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AssessmentEntryContainer,
    meta: {
      key: 'assessment-entry',
      titleKey: I18N_KEYS.assessments.entryTitle,
      permissions: [PERMISSIONS.assessmentReadTeam],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function performanceRoute(): AppRouteDefinition {
  return {
    path: performancePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PerformanceContainer,
    meta: {
      key: 'performance',
      titleKey: I18N_KEYS.assessments.performanceTitle,
      permissions: [PERMISSIONS.assessmentReadSelfPublished],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 25,
        group: NAV_GROUP.Team,
        iconName: 'trendingUp',
        labelKey: I18N_KEYS.assessments.performanceNavLabel,
      },
    },
  };
}

/**
 * The measurements and feedback tabs of the same performance container. They
 * are deep-linkable routes with their own self-scope grants but deliberately
 * carry no nav entry: one "My performance" destination, three tabs inside it.
 */
function performanceMeasurementsRoute(): AppRouteDefinition {
  return {
    path: performanceMeasurementsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PerformanceContainer,
    meta: {
      key: 'performance-measurements',
      titleKey: I18N_KEYS.assessments.measurementsTitle,
      permissions: [PERMISSIONS.analyticsReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function performanceFeedbackRoute(): AppRouteDefinition {
  return {
    path: performanceFeedbackPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PerformanceContainer,
    meta: {
      key: 'performance-feedback',
      titleKey: I18N_KEYS.assessments.feedbackTitle,
      permissions: [PERMISSIONS.feedbackReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * Assessment workspace, entry, and player performance routes. Each is gated on
 * its own permission: the workspace screens on assessment.read.team, the player
 * screen on assessment.read.self.published, and the performance sub-tabs on
 * their own self grants. The guard blocks a direct URL for any persona without
 * the grant; the backend re-authorises every read.
 */
export function getAssessmentsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    workspaceRoute(),
    entryRoute(),
    performanceRoute(),
    performanceMeasurementsRoute(),
    performanceFeedbackRoute(),
  ];
}

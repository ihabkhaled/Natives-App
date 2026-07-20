import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { TrainingDetailContainer } from '../containers/training-detail.container';
import { TrainingReviewContainer } from '../containers/training-review.container';
import { TrainingContainer } from '../containers/training.container';
import { trainingPath, trainingReviewPath, trainingSubmissionPattern } from './training.paths';

function workspaceRoute(): AppRouteDefinition {
  return {
    path: trainingPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TrainingContainer,
    meta: {
      key: 'training',
      titleKey: I18N_KEYS.training.title,
      permissions: [PERMISSIONS.activityReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 30,
        group: NAV_GROUP.Team,
        iconName: 'trendingUp',
        labelKey: I18N_KEYS.training.navLabel,
      },
    },
  };
}

/**
 * The reviewer queue lives on its own top-level path, not under `/training/`,
 * so it can never be shadowed by the `:submissionId` detail pattern.
 */
function reviewRoute(): AppRouteDefinition {
  return {
    path: trainingReviewPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TrainingReviewContainer,
    meta: {
      key: 'training-review',
      titleKey: I18N_KEYS.training.reviewTitle,
      permissions: [PERMISSIONS.activityReview],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 35,
        group: NAV_GROUP.Manage,
        iconName: 'clipboard',
        labelKey: I18N_KEYS.training.reviewNavLabel,
      },
    },
  };
}

function detailRoute(): AppRouteDefinition {
  return {
    path: trainingSubmissionPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TrainingDetailContainer,
    meta: {
      key: 'training-submission',
      titleKey: I18N_KEYS.training.detailTitle,
      permissions: [PERMISSIONS.activityReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * External-training routes. The member screens are gated on
 * `activity.read.self`; the queue additionally requires `activity.review`.
 * The guard blocks a direct URL without the grant and the backend
 * re-authorizes every read and every decision.
 */
export function getTrainingRouteDefinitions(): readonly AppRouteDefinition[] {
  return [workspaceRoute(), reviewRoute(), detailRoute()];
}

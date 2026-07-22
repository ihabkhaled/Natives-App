import { useState } from 'react';

import { useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ALL_STATUSES_FILTER,
  buildStatusOptions,
  buildSummaryView,
  filterByStatus,
  resolveAssessmentsStatus,
} from '../helpers/assessment-list-view.helper';
import {
  canFetchAssessmentCatalog,
  canReadTeamAssessments,
} from '../helpers/assessment-workflow.helper';
import { buildAssessmentsAsyncCopy, buildAssessmentsGuardCopy } from '../helpers/async-copy.helper';
import { assessmentEntryPath } from '../routes/assessments.paths';
import type { AssessmentsView } from '../types/assessments-view.types';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';
import { useTeamAssessmentsQuery } from './use-team-assessments-query.hook';

/**
 * Prepared, translated view model for the assessment workspace: permission
 * gate, bounded page, status filter, and exactly one screen state.
 */
export function useAssessmentsWorkspace(): AssessmentsView {
  const { t, locale } = useAppTranslation();
  const team = useAssessmentsTeamContext();
  const permissions = useEffectivePermissions();
  const query = useTeamAssessmentsQuery(team.teamId);
  const catalog = useAssessmentCatalogQuery(
    team.teamId,
    canFetchAssessmentCatalog(permissions.isLoading, permissions.permissions),
  );
  const network = useNetworkStatus();
  const navigation = useAppNavigation();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES_FILTER);

  const allItems = query.page?.items ?? [];
  const matches = filterByStatus(allItems, statusFilter);

  return {
    ...buildAssessmentsAsyncCopy(t, query.error, !network.isOnline, query.refetch),
    ...buildAssessmentsGuardCopy(t),
    title: t(I18N_KEYS.assessments.title),
    subtitle: t(I18N_KEYS.assessments.subtitle),
    status: resolveAssessmentsStatus({
      isForbidden: !permissions.isLoading && !canReadTeamAssessments(permissions.permissions),
      hasData: query.page !== undefined,
      hasItems: allItems.length > 0,
      isLoading: query.isLoading || permissions.isLoading || team.isLoading,
      hasError: query.error !== null,
      isOffline: !network.isOnline,
    }),
    emptyTitle: t(I18N_KEYS.assessments.emptyTitle),
    emptyMessage: t(I18N_KEYS.assessments.emptyMessage),
    noMatchesTitle: t(I18N_KEYS.assessments.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.assessments.noMatchesMessage),
    listLabel: t(I18N_KEYS.assessments.listLabel),
    countLabel: t(I18N_KEYS.assessments.countSummary, {
      shown: matches.length,
      total: query.page?.total ?? allItems.length,
    }),
    statusFilterLabel: t(I18N_KEYS.assessments.statusFilterLabel),
    filterAllLabel: t(I18N_KEYS.assessments.filterAll),
    statusFilter,
    statusOptions: buildStatusOptions(t),
    items: matches.map((item) => buildSummaryView(t, locale, catalog.catalog, item)),
    hasMatches: matches.length > 0,
    onStatusFilterChange: setStatusFilter,
    onOpen: (assessmentId: string) => {
      navigation.push(assessmentEntryPath(assessmentId));
    },
  };
}

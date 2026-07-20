import { useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildCompleteness,
  buildEntryGroups,
  buildEntryHeader,
  buildGridCopy,
  buildRevisionViews,
  buildWorkflowActions,
  resolveEntryStatus,
  resolveTemplateMetricIds,
} from '../helpers/assessment-entry-view.helper';
import { toSaveableValues } from '../helpers/assessment-value.helper';
import { canReadTeamAssessments } from '../helpers/assessment-workflow.helper';
import { buildAssessmentsAsyncCopy, buildAssessmentsGuardCopy } from '../helpers/async-copy.helper';
import { ASSESSMENT_ID_PARAM, assessmentsPath } from '../routes/assessments.paths';
import type { AssessmentEntryView } from '../types/assessments-view.types';
import { useAssessmentCatalogQuery } from './use-assessment-catalog-query.hook';
import { useAssessmentDraft } from './use-assessment-draft.hook';
import { useAssessmentQuery } from './use-assessment-query.hook';
import { useAssessmentRevisionsQuery } from './use-assessment-revisions-query.hook';
import { useAssessmentWorkflowActions } from './use-assessment-workflow-actions.hook';
import { useAssessmentsTeamContext } from './use-assessments-team-context.hook';

/**
 * Prepared, translated view model for the assessment entry screen:
 * template-driven metric grid, explicit not-evaluated handling, completeness,
 * optimistic-concurrency save, and the permission-aware workflow bar.
 */
export function useAssessmentEntry(): AssessmentEntryView {
  const { t } = useAppTranslation();
  const assessmentId = useRouteParam(ASSESSMENT_ID_PARAM) ?? '';
  const team = useAssessmentsTeamContext();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  const navigation = useAppNavigation();
  const query = useAssessmentQuery(team.teamId, assessmentId);
  const catalog = useAssessmentCatalogQuery(team.teamId);
  const revisions = useAssessmentRevisionsQuery(team.teamId, assessmentId);
  const draft = useAssessmentDraft(query.detail);
  const actions = useAssessmentWorkflowActions(team.teamId, assessmentId);

  const header = buildEntryHeader(t, query.detail);
  const metricIds = resolveTemplateMetricIds(catalog.catalog, query.detail);

  return {
    ...buildAssessmentsAsyncCopy(t, query.error, !network.isOnline, query.refetch),
    ...buildAssessmentsGuardCopy(t),
    ...buildGridCopy(t),
    ...header,
    ...buildCompleteness(t, draft.draft, metricIds),
    title: t(I18N_KEYS.assessments.entryTitle),
    status: resolveEntryStatus({
      isForbidden: !permissions.isLoading && !canReadTeamAssessments(permissions.permissions),
      isMissing: query.error?.code === APP_ERROR_CODE.NotFound,
      hasDetail: query.detail !== undefined,
      hasCatalog: catalog.catalog !== undefined,
      isLoading: query.isLoading || catalog.isLoading || permissions.isLoading || team.isLoading,
      hasError: query.error !== null,
      isOffline: !network.isOnline,
    }),
    emptyTitle: t(I18N_KEYS.assessments.notFoundTitle),
    emptyMessage: t(I18N_KEYS.assessments.notFoundMessage),
    onBack: () => {
      navigation.push(assessmentsPath());
    },
    groups: buildEntryGroups(t, catalog.catalog, query.detail, draft.draft),
    summary: draft.summary,
    saveLabel: t(actions.isSaving ? I18N_KEYS.assessments.saving : I18N_KEYS.assessments.saveDraft),
    isSaving: actions.isSaving,
    workflowActions: buildWorkflowActions(t, query.detail, permissions.permissions),
    isTransitioning: actions.isTransitioning,
    revisions: buildRevisionViews(t, revisions.revisions),
    onScoreChange: draft.setScore,
    onNumericChange: draft.setNumeric,
    onTextChange: draft.setText,
    onNoteChange: draft.setNote,
    onClearValue: draft.clear,
    onSummaryChange: draft.setSummary,
    onSave: () => {
      actions.save({
        summary: draft.summary.trim() === '' ? null : draft.summary,
        values: toSaveableValues(draft.draft),
        expectedRecordVersion: query.detail?.assessment.recordVersion ?? 0,
      });
    },
    onWorkflowStep: (step) => {
      actions.run(step, query.detail?.assessment.recordVersion ?? 0);
    },
  };
}

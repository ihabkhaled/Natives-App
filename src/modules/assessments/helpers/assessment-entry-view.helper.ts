import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { WORKFLOW_BUTTONS } from '../constants/assessment-workflow.constants';
import type {
  AssessmentRevisionView,
  AssessmentsStatus,
  MetricGroupView,
  WorkflowActionView,
} from '../types/assessments-view.types';
import type {
  AssessmentCatalog,
  AssessmentDetail,
  AssessmentSummary,
  AssessmentValueDraft,
} from '../types/assessments.types';
import { resolveAssessmentsStatus, statusLabel, statusTone } from './assessment-list-view.helper';
import { countEvaluated } from './assessment-value.helper';
import {
  availableWorkflowSteps,
  isEditableStatus,
  isReadOnlyStatus,
} from './assessment-workflow.helper';
import { buildMetricGroups, templateMetricIds } from './metric-grid-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

export interface AssessmentEntryHeaderView {
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly revisionLabel: string;
  readonly playerLabel: string;
  readonly readOnlyLabel: string;
  readonly isEditable: boolean;
}

export interface AssessmentCompletenessView {
  readonly completenessValue: string;
  readonly completenessPercent: number;
}

export interface EntryStatusInput {
  readonly isForbidden: boolean;
  readonly isMissing: boolean;
  readonly hasDetail: boolean;
  readonly hasCatalog: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
}

/** Fold the entry screen inputs into the one state it presents. */
export function resolveEntryStatus(input: EntryStatusInput): AssessmentsStatus {
  return resolveAssessmentsStatus({
    isForbidden: input.isForbidden,
    isMissing: input.isMissing,
    hasData: input.hasDetail && input.hasCatalog,
    hasItems: input.hasDetail,
    isLoading: input.isLoading,
    hasError: input.hasError,
    isOffline: input.isOffline,
  });
}

/** Header facts for one record; safe defaults before the record resolves. */
export function buildEntryHeader(
  t: Translate,
  detail: AssessmentDetail | undefined,
): AssessmentEntryHeaderView {
  if (detail === undefined) {
    return {
      statusLabel: '',
      statusTone: 'medium',
      revisionLabel: '',
      playerLabel: '',
      readOnlyLabel: '',
      isEditable: false,
    };
  }
  const { assessment } = detail;
  return {
    statusLabel: statusLabel(t, assessment.status),
    statusTone: statusTone(assessment.status),
    revisionLabel: t(I18N_KEYS.assessments.revisionLabel, { revision: assessment.revision }),
    playerLabel: assessment.membershipId,
    readOnlyLabel: isReadOnlyStatus(assessment.status)
      ? t(I18N_KEYS.assessments.workflowReadOnly)
      : '',
    isEditable: isEditableStatus(assessment.status),
  };
}

/** Metric ids the template asks for, or nothing until both sides resolve. */
export function resolveTemplateMetricIds(
  catalog: AssessmentCatalog | undefined,
  detail: AssessmentDetail | undefined,
): readonly string[] {
  return catalog === undefined || detail === undefined
    ? []
    : templateMetricIds(catalog, detail.assessment.templateId);
}

/** The grouped, translated metric fields for the grid. */
export function buildEntryGroups(
  t: Translate,
  catalog: AssessmentCatalog | undefined,
  detail: AssessmentDetail | undefined,
  draft: Readonly<Record<string, AssessmentValueDraft>>,
): readonly MetricGroupView[] {
  return catalog === undefined || detail === undefined
    ? []
    : buildMetricGroups(t, catalog, detail.assessment.templateId, draft);
}

/** Completeness copy; a scored zero counts, an unevaluated metric does not. */
export function buildCompleteness(
  t: Translate,
  draft: Readonly<Record<string, AssessmentValueDraft>>,
  metricIds: readonly string[],
): AssessmentCompletenessView {
  const evaluated = countEvaluated(draft, metricIds);
  return {
    completenessValue: t(I18N_KEYS.assessments.completenessValue, {
      evaluated,
      total: metricIds.length,
    }),
    completenessPercent:
      metricIds.length === 0 ? 0 : Math.round((evaluated / metricIds.length) * 100),
  };
}

/** Only steps the lifecycle allows and the principal holds a grant for. */
export function buildWorkflowActions(
  t: Translate,
  detail: AssessmentDetail | undefined,
  permissions: readonly string[],
): readonly WorkflowActionView[] {
  if (detail === undefined) {
    return [];
  }
  return availableWorkflowSteps(detail.assessment.status, permissions).map((step) => ({
    step,
    label: t(WORKFLOW_BUTTONS[step].labelKey),
    tone: WORKFLOW_BUTTONS[step].tone,
    testId: WORKFLOW_BUTTONS[step].testId,
  }));
}

/** The revision family, translated for the history panel. */
export function buildRevisionViews(
  t: Translate,
  revisions: readonly AssessmentSummary[],
): readonly AssessmentRevisionView[] {
  return revisions.map((revision) => ({
    id: revision.id,
    label: t(I18N_KEYS.assessments.revisionLabel, { revision: revision.revision }),
    statusLabel: statusLabel(t, revision.status),
    statusTone: statusTone(revision.status),
  }));
}

/** The static grid copy shared by every field in the entry screen. */
export function buildGridCopy(t: Translate): {
  readonly gridLabel: string;
  readonly notEvaluatedLabel: string;
  readonly notEvaluatedHint: string;
  readonly clearLabel: string;
  readonly noteLabel: string;
  readonly notePlaceholder: string;
  readonly completenessLabel: string;
  readonly summaryLabel: string;
  readonly summaryPlaceholder: string;
  readonly workflowLabel: string;
  readonly revisionsLabel: string;
  readonly revisionsEmptyLabel: string;
  readonly periodLabel: string;
  readonly backLabel: string;
} {
  return {
    gridLabel: t(I18N_KEYS.assessments.metricGridLabel),
    notEvaluatedLabel: t(I18N_KEYS.assessments.metricNotEvaluated),
    notEvaluatedHint: t(I18N_KEYS.assessments.metricNotEvaluatedHint),
    clearLabel: t(I18N_KEYS.assessments.metricClearValue),
    noteLabel: t(I18N_KEYS.assessments.metricNoteLabel),
    notePlaceholder: t(I18N_KEYS.assessments.metricNotePlaceholder),
    completenessLabel: t(I18N_KEYS.assessments.completenessLabel),
    summaryLabel: t(I18N_KEYS.assessments.summaryLabel),
    summaryPlaceholder: t(I18N_KEYS.assessments.summaryPlaceholder),
    workflowLabel: t(I18N_KEYS.assessments.workflowLabel),
    revisionsLabel: t(I18N_KEYS.assessments.revisionsLabel),
    revisionsEmptyLabel: t(I18N_KEYS.assessments.revisionsEmpty),
    periodLabel: t(I18N_KEYS.assessments.periodLabel),
    backLabel: t(I18N_KEYS.assessments.back),
  };
}

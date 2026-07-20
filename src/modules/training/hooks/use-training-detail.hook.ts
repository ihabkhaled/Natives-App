import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import {
  findActivityType,
  readActivityTypes,
  readBuddies,
  readEvidence,
  readSubmission,
} from '../helpers/collection.helper';
import { buildDetailActions, buildDetailBody } from '../helpers/detail-view.helper';
import { resolveTrainingScreenStatus } from '../helpers/screen-status.helper';
import { buildBuddyItems, buildEvidenceItems } from '../helpers/submission-view.helper';
import { buildSubmissionHistory } from '../helpers/submission-workflow.helper';
import { buildTrainingScreenCopy } from '../helpers/training-copy.helper';
import { SUBMISSION_ID_PARAM, trainingPath } from '../routes/training.paths';
import type { TrainingDetailView } from '../types/training-view.types';
import { useActivityTypesQuery } from './use-activity-types-query.hook';
import { useSubmissionEvidenceQuery } from './use-submission-evidence-query.hook';
import { useSubmissionQuery } from './use-submission-query.hook';
import { useSubmissionWorkflow } from './use-submission-workflow.hook';
import { useTrainingContext } from './use-training-context.hook';

/**
 * Prepared, translated view model for one training claim: its details, the
 * evidence metadata, the buddies, the append-only history, and the workflow
 * actions its current status allows.
 */
export function useTrainingDetail(): TrainingDetailView {
  const { t, locale } = useAppTranslation();
  const submissionId = useRouteParam(SUBMISSION_ID_PARAM) ?? '';
  const context = useTrainingContext();
  const navigation = useAppNavigation();

  const detail = useSubmissionQuery(context.teamId, submissionId);
  const evidence = useSubmissionEvidenceQuery(context.teamId, submissionId);
  const catalog = useActivityTypesQuery(context.teamId);
  const submission = readSubmission(detail.data);
  const workflow = useSubmissionWorkflow(context.teamId, submission);
  const activityType = findActivityType(
    readActivityTypes(catalog.data),
    submission?.activityTypeId,
  );

  return {
    ...buildTrainingScreenCopy(t, {
      error: detail.error,
      isOffline: context.isOffline,
      onRetry: detail.refetch,
      emptyTitleKey: I18N_KEYS.training.notFoundTitle,
      emptyMessageKey: I18N_KEYS.training.notFoundMessage,
    }),
    ...buildDetailBody(t, submission, activityType),
    title: t(I18N_KEYS.training.detailTitle),
    backLabel: t(I18N_KEYS.training.back),
    status: resolveTrainingScreenStatus(context, detail, context.canRead, submission !== null),
    notFoundTitle: t(I18N_KEYS.training.notFoundTitle),
    notFoundMessage: t(I18N_KEYS.training.notFoundMessage),
    reviewNoteHeading: t(I18N_KEYS.training.reviewNoteHeading),
    reviewNote: null,
    evidenceHeading: t(I18N_KEYS.training.evidenceHeading),
    evidenceEmptyLabel: t(I18N_KEYS.training.evidenceEmpty),
    evidencePrivacyNotice: t(I18N_KEYS.training.evidencePrivacyNotice),
    evidence: buildEvidenceItems(t, readEvidence(evidence.data)),
    buddiesHeading: t(I18N_KEYS.training.buddiesHeading),
    buddiesEmptyLabel: t(I18N_KEYS.training.buddyEmpty),
    buddies: buildBuddyItems(t, locale, readBuddies(detail.data)),
    historyHeading: t(I18N_KEYS.training.historyHeading),
    historyIntro: t(I18N_KEYS.training.historyIntro),
    historyEmptyLabel: t(I18N_KEYS.training.historyEmpty),
    history: buildSubmissionHistory(t, locale, submission),
    actions: buildDetailActions(
      t,
      { submission, canSubmit: context.canSubmit, isBusy: workflow.isRunning },
      { onSubmit: workflow.submit, onWithdraw: workflow.withdraw },
    ),
    onBack: () => {
      navigation.replace(trainingPath());
    },
  };
}

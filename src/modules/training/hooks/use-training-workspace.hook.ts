import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ALL_STATUS_FILTER } from '../constants/training-form.constants';
import { SUBMISSION_STATUSES } from '../constants/training.constants';
import {
  buildTypeNameMap,
  filterByStatus,
  readActivityTypes,
  readPage,
} from '../helpers/collection.helper';
import { buildStatusOptions, buildSubmissionSummary } from '../helpers/submission-view.helper';
import { resolveTrainingScreenStatus } from '../helpers/screen-status.helper';
import { buildTrainingScreenCopy } from '../helpers/training-copy.helper';
import { useCreateSubmissionMutation } from '../mutations/use-create-submission-mutation.hook';
import { trainingSubmissionPath } from '../routes/training.paths';
import type { TrainingWorkspaceView } from '../types/training-view.types';
import { useActivityTypesQuery } from './use-activity-types-query.hook';
import { useBuddySection } from './use-buddy-section.hook';
import { useMySubmissionsQuery } from './use-my-submissions-query.hook';
import { useTrainingComposer } from './use-training-composer.hook';
import { useTrainingContext } from './use-training-context.hook';

/**
 * Prepared, translated view model for the member training workspace: the
 * composer, the bounded claim list with its status filter, and exactly one
 * screen state.
 */
export function useTrainingWorkspace(): TrainingWorkspaceView {
  const { t, locale } = useAppTranslation();
  const context = useTrainingContext();
  const navigation = useAppNavigation();
  const toast = useAppToast();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS_FILTER);

  const catalog = useActivityTypesQuery(context.teamId);
  const submissions = useMySubmissionsQuery(context.teamId);
  const buddies = useBuddySection(context.teamId);

  const create = useCreateSubmissionMutation(context.teamId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.draftSavedToast), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.actionFailedToast), tone: 'danger' });
    },
  });

  const activityTypes = readActivityTypes(catalog.data);
  const composer = useTrainingComposer({
    activityTypes,
    buddyOptions: [],
    isSaving: create.isRunning,
    onSave: create.run,
  });

  const typeNames = buildTypeNameMap(activityTypes);
  const page = readPage(submissions.data);
  const matches = filterByStatus(page.items, statusFilter, ALL_STATUS_FILTER);

  return {
    ...buildTrainingScreenCopy(t, {
      error: submissions.error,
      isOffline: context.isOffline,
      onRetry: submissions.refetch,
      emptyTitleKey: I18N_KEYS.training.emptyTitle,
      emptyMessageKey: I18N_KEYS.training.emptyMessage,
    }),
    title: t(I18N_KEYS.training.title),
    subtitle: t(I18N_KEYS.training.subtitle),
    status: resolveTrainingScreenStatus(
      context,
      submissions,
      context.canRead,
      page.items.length > 0,
    ),
    composer,
    buddies,
    listLabel: t(I18N_KEYS.training.title),
    countLabel: t(I18N_KEYS.training.countSummary, {
      shown: matches.length,
      total: page.total,
    }),
    statusFilterLabel: t(I18N_KEYS.training.queueStatusFilter),
    statusFilter,
    statusOptions: buildStatusOptions(t, SUBMISSION_STATUSES, I18N_KEYS.training.queueFilterAll),
    items: matches.map((item) => buildSubmissionSummary(t, locale, typeNames, item)),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.training.queueEmptyTitle),
    noMatchesMessage: t(I18N_KEYS.training.queueEmptyMessage),
    onStatusFilterChange: setStatusFilter,
    onOpen: (submissionId: string) => {
      navigation.push(trainingSubmissionPath(submissionId));
    },
  };
}

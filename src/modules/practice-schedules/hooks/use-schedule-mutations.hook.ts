import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert } from '@/shared/ui';

import { SCHEDULE_GENERATE_COPY_KEYS } from '../constants/practice-schedules-copy.constants';
import { confirmThenRun } from '../helpers/schedule-confirm.helper';
import { describeGeneration } from '../helpers/generate-outcome.helper';
import { toCarryOverFields } from '../mappers/practice-schedules.mapper';
import { useArchiveScheduleMutation } from '../mutations/use-archive-schedule-mutation.hook';
import { useCreateScheduleMutation } from '../mutations/use-create-schedule-mutation.hook';
import { useGenerateScheduleMutation } from '../mutations/use-generate-schedule-mutation.hook';
import { useUpdateScheduleMutation } from '../mutations/use-update-schedule-mutation.hook';
import { practiceScheduleDetailPath, practiceSchedulesPath } from '../routes/practice-schedules.paths';
import type { PracticeSchedule, ScheduleDraft } from '../types/practice-schedules.types';
import type { ScheduleActionMessageView } from '../types/practice-schedules-view.types';

const KEYS = I18N_KEYS.practiceSchedules;

export interface UseScheduleMutationsOptions {
  readonly teamId: string;
  readonly scheduleId: string | null;
  readonly schedule: PracticeSchedule | undefined;
}

export interface ScheduleMutationsView {
  readonly isSaving: boolean;
  readonly isDeleting: boolean;
  readonly isGenerating: boolean;
  readonly messages: readonly ScheduleActionMessageView[];
  readonly onValidSubmit: (draft: ScheduleDraft) => void;
  readonly onDelete: () => void;
  readonly onGenerate: () => void;
}

/**
 * Every write the detail screen can make: save (create or update), delete,
 * and generate. Split out of the screen hook so the read side (query,
 * permissions, form loading) and the write side each stay under the
 * complexity budget on their own.
 */
export function useScheduleMutations(options: UseScheduleMutationsOptions): ScheduleMutationsView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const { confirm } = useConfirmAlert();
  const [messages, setMessages] = useState<readonly ScheduleActionMessageView[]>([]);
  const mutationScope = { teamId: options.teamId, scheduleId: options.scheduleId ?? '' };

  const failed = (): void => {
    setMessages([{ id: 'failed', text: t(KEYS.actionFailed) }]);
  };

  const create = useCreateScheduleMutation(options.teamId, {
    // Replace, not push: the coach should not land back on a blank "new"
    // form by pressing back after the pattern was just created.
    onSuccess: (created) => {
      navigation.replace(practiceScheduleDetailPath(created.id));
    },
    onError: failed,
  });
  const update = useUpdateScheduleMutation(mutationScope, {
    onSuccess: () => {
      setMessages([{ id: 'saved', text: t(KEYS.saveSuccess) }]);
    },
    onError: failed,
  });
  const archive = useArchiveScheduleMutation(mutationScope, {
    onSuccess: () => {
      navigation.push(practiceSchedulesPath());
    },
    onError: failed,
  });
  const generate = useGenerateScheduleMutation(mutationScope, {
    onSuccess: (result) => {
      const outcome = describeGeneration(result, SCHEDULE_GENERATE_COPY_KEYS);
      setMessages([{ id: 'generate', text: t(outcome.key, outcome.params) }]);
    },
    onError: failed,
  });

  return {
    isSaving: create.isRunning || update.isRunning,
    isDeleting: archive.isRunning,
    isGenerating: generate.isRunning,
    messages,
    onValidSubmit: (draft) => {
      if (options.schedule === undefined) {
        create.run(draft);
        return;
      }
      update.run({
        params: { teamId: options.teamId, scheduleId: options.schedule.id },
        draft,
        status: options.schedule.status,
        expectedVersion: options.schedule.version,
        carryOver: toCarryOverFields(options.schedule),
      });
    },
    onDelete: () => {
      confirmThenRun(
        confirm,
        {
          header: t(KEYS.deleteConfirmTitle),
          message: t(KEYS.deleteConfirmMessage),
          confirmLabel: t(KEYS.deleteConfirmCta),
          cancelLabel: t(KEYS.deleteCancel),
        },
        archive.run,
      );
    },
    onGenerate: () => {
      confirmThenRun(
        confirm,
        {
          header: t(KEYS.generateConfirmTitle),
          message: t(KEYS.generateConfirmMessage),
          confirmLabel: t(KEYS.generateConfirmCta),
          cancelLabel: t(KEYS.generateCancel),
        },
        generate.run,
      );
    },
  };
}

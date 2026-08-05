import { useMemo, useState } from 'react';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import {
  draftWeekdays,
  resolveCanGenerate,
  resolveDetailHasError,
  resolveDetailIsForbidden,
  resolveDetailIsLoading,
  resolveDetailReadEnabled,
} from '../helpers/schedule-detail-context.helper';
import { buildScheduleDetailView } from '../helpers/schedule-detail-view.helper';
import {
  toggleWeekday,
  toScheduleDraft,
  toScheduleFormValues,
} from '../helpers/schedule-form.helper';
import { toScheduleDraftFromSchedule } from '../mappers/practice-schedules.mapper';
import { buildScheduleDetailQueryOptions } from '../queries/practice-schedules.query';
import { practiceSchedulesPath } from '../routes/practice-schedules.paths';
import type { PracticeSchedule } from '../types/practice-schedules.types';
import type { PracticeScheduleDetailScreenView } from '../types/practice-schedules-view.types';
import { useScheduleForm } from './use-schedule-form.hook';
import { useScheduleMutations } from './use-schedule-mutations.hook';

/**
 * The create/edit screen for one recurring pattern, plus delete and generate.
 *
 * `scheduleId === null` is the create route (`/practice-schedules/new`): no
 * read fires, and the form starts blank. Otherwise this is the edit route,
 * and the loaded record seeds both the form and the fields the form never
 * shows, so saving never silently clears configuration nobody touched.
 *
 * Gated on `practice.manage`, same as the list. The backend re-authorizes
 * every call regardless.
 */
export function usePracticeScheduleDetailScreen(
  scheduleId: string | null,
): PracticeScheduleDetailScreenView {
  const { t } = useAppTranslation();
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const navigation = useAppNavigation();

  const isCreateMode = scheduleId === null;
  const canManage = hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]);
  const contextLoading = scope.isLoading || permissions.isLoading;

  const detailQuery = useAppQuery<PracticeSchedule>({
    ...buildScheduleDetailQueryOptions(scope.teamId, scheduleId ?? ''),
    enabled: resolveDetailReadEnabled({ isCreateMode, contextLoading, canManage }),
  });
  const schedule = detailQuery.data;

  const draft = useMemo(
    () => (schedule === undefined ? null : toScheduleDraftFromSchedule(schedule)),
    [schedule],
  );
  const formValues = useMemo(() => toScheduleFormValues(draft), [draft]);

  // Weekday selection starts from the loaded draft but is then locally
  // mutable (toggled), so it cannot be pure derived state. Adjusted during
  // render — comparing against the previous draft reference — rather than in
  // an Effect, which would cost an extra render and risk the two pieces of
  // state drifting apart between the read landing and the Effect running.
  const [seenDraft, setSeenDraft] = useState(draft);
  const [weekdaysState, setWeekdaysState] = useState<readonly number[]>(draftWeekdays(draft));
  if (draft !== seenDraft) {
    setSeenDraft(draft);
    setWeekdaysState(draftWeekdays(draft));
  }

  const mutations = useScheduleMutations({ teamId: scope.teamId, scheduleId, schedule });
  const form = useScheduleForm({
    values: formValues,
    onValidSubmit: (values) => {
      mutations.onValidSubmit(toScheduleDraft(values, weekdaysState));
    },
  });

  return buildScheduleDetailView(t, {
    schedule,
    isLoading: resolveDetailIsLoading({
      contextLoading,
      isCreateMode,
      isPending: detailQuery.isPending,
    }),
    isForbidden: resolveDetailIsForbidden(permissions.isLoading, canManage),
    hasError: resolveDetailHasError(isCreateMode, detailQuery.isError),
    isCreateMode,
    onBack: () => {
      navigation.push(practiceSchedulesPath());
    },
    formBindings: form,
    weekdays: weekdaysState,
    onWeekdayToggle: (day) => {
      setWeekdaysState((current) => toggleWeekday(current, day));
    },
    isSaving: mutations.isSaving,
    isDeleting: mutations.isDeleting,
    canDelete: schedule !== undefined,
    onDelete: mutations.onDelete,
    isGenerating: mutations.isGenerating,
    canGenerate: resolveCanGenerate(schedule),
    onGenerate: mutations.onGenerate,
    messages: mutations.messages,
  });
}

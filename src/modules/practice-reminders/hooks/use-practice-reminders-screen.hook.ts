import { useState } from 'react';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import {
  REMINDER_DISPATCH_COPY_KEYS,
  REMINDER_TEST_COPY_KEYS,
} from '../constants/practice-reminders-copy.constants';
import { describeDispatch, describeTest } from '../helpers/reminder-outcome.helper';
import { buildRemindersView } from '../helpers/reminders-view.helper';
import { useDispatchRemindersMutation } from '../mutations/use-dispatch-reminders-mutation.hook';
import { useTestReminderMutation } from '../mutations/use-test-reminder-mutation.hook';
import { buildReminderStatusQueryOptions } from '../queries/practice-reminders.query';
import type {
  PracticeRemindersScreenView,
  ReminderMessageView,
} from '../types/practice-reminders-view.types';
import type { ReminderStatus } from '../types/practice-reminders.types';

const KEYS = I18N_KEYS.practiceReminders;

/**
 * The reminders screen for one practice session.
 *
 * Gated on `practice.manage`, not `practice.read`: reading the agenda of a
 * session you attend is reasonable, but seeing who has not replied — and being
 * able to mail them — is a coach's job. The backend re-authorizes every call
 * regardless; this only decides what is worth rendering.
 *
 * The hook wires; `buildRemindersView` does the copy.
 */
export function usePracticeRemindersScreen(sessionId: string): PracticeRemindersScreenView {
  const { t } = useAppTranslation();
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const [messages, setMessages] = useState<readonly ReminderMessageView[]>([]);

  const canManage = hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]);
  const contextLoading = scope.isLoading || permissions.isLoading;

  const statusQuery = useAppQuery<ReminderStatus>({
    ...buildReminderStatusQueryOptions(scope.teamId, sessionId),
    enabled: !contextLoading && canManage && sessionId !== '',
  });

  const failed = (): void => {
    setMessages([{ id: 'failed', text: t(KEYS.actionFailed) }]);
  };

  const mutationScope = { teamId: scope.teamId, sessionId };

  const dispatch = useDispatchRemindersMutation(mutationScope, {
    onSuccess: (result) => {
      setMessages(
        describeDispatch(result, REMINDER_DISPATCH_COPY_KEYS).map((outcome, index) => ({
          id: `dispatch-${String(index)}`,
          text: t(outcome.key, outcome.params),
        })),
      );
    },
    onError: failed,
  });

  const selfTest = useTestReminderMutation(mutationScope, {
    onSuccess: (result) => {
      setMessages([{ id: 'test', text: t(describeTest(result, REMINDER_TEST_COPY_KEYS)) }]);
    },
    onError: failed,
  });

  return buildRemindersView(t, {
    status: statusQuery.data,
    isLoading: contextLoading || statusQuery.isPending,
    isForbidden: !permissions.isLoading && !canManage,
    hasError: statusQuery.isError,
    isDispatching: dispatch.isRunning,
    isRefreshing: statusQuery.isFetching,
    isTesting: selfTest.isRunning,
    onDispatch: dispatch.run,
    onTest: selfTest.run,
    messages,
  });
}

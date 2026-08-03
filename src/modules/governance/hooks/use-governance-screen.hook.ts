import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, toRemoteQueryView } from '@/shared/view';

import { GOVERNANCE_SCREEN_COPY_KEYS } from '../constants/governance-copy.constants';
import {
  buildMeetingCardViews,
  buildTaskCardViews,
  resolveMeetingsPage,
  resolveTasksPage,
} from '../helpers/governance-view.helper';
import { buildMeetingsQueryOptions, buildTasksQueryOptions } from '../queries/governance.query';
import { governancePagePath } from '../routes/governance.paths';
import type { GovernanceMeetingsPage, GovernanceTasksPage } from '../types/governance.types';
import type { GovernanceScreenView } from '../types/governance-view.types';
import { useGovernanceContext } from './use-governance-context.hook';

const KEYS = I18N_KEYS.governance;

/**
 * View model for the governance screen: the board's meetings and the tasks
 * they raised, read side by side. Both lists come from the server already
 * filtered by each record's visibility.
 */
export function useGovernanceScreen(): GovernanceScreenView {
  const { t } = useAppTranslation();
  const context = useGovernanceContext();

  const meetingsQuery = toRemoteQueryView<GovernanceMeetingsPage>(
    useAppQuery(buildMeetingsQueryOptions(context.teamId, 0)),
  );
  const tasksQuery = toRemoteQueryView<GovernanceTasksPage>(
    useAppQuery(buildTasksQueryOptions(context.teamId, 0)),
  );

  const meetingsPage = resolveMeetingsPage(meetingsQuery.data);
  const tasksPage = resolveTasksPage(tasksQuery.data);
  const meetings = buildMeetingCardViews(t, meetingsPage.items);
  const tasks = buildTaskCardViews(t, tasksPage.items);
  const error = meetingsQuery.error ?? tasksQuery.error;

  return {
    ...buildScreenCopy(t, {
      keys: GOVERNANCE_SCREEN_COPY_KEYS,
      error,
      isOffline: context.isOffline,
      onRetry: meetingsQuery.refetch,
      emptyTitleKey: KEYS.emptyTitle,
      emptyMessageKey: KEYS.emptyMessage,
    }),
    path: governancePagePath(),
    pageTitle: t(KEYS.title),
    status: resolveAsyncViewStatus({
      isForbidden: !context.isLoading && !context.canRead,
      isLoading: context.isLoading || meetingsQuery.isLoading || tasksQuery.isLoading,
      hasError: error !== null,
      isOffline: context.isOffline,
      // Both lists must have arrived. The screen promises meetings AND tasks,
      // so reporting ready when one failed would hide the failure behind the
      // half that worked.
      hasData: meetingsPage.hasData && tasksPage.hasData,
      hasItems: meetings.length > 0 || tasks.length > 0,
    }),
    meetingsHeading: t(KEYS.meetingsHeading),
    meetingsIntro: t(KEYS.meetingsIntro),
    meetingCountLabel: t(KEYS.meetingCountLabel, { total: meetingsPage.total }),
    meetings,
    tasksHeading: t(KEYS.tasksHeading),
    tasksIntro: t(KEYS.tasksIntro),
    taskCountLabel: t(KEYS.taskCountLabel, { total: tasksPage.total }),
    tasks,
  };
}

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import { buildSchedulesListView } from '../helpers/schedule-list-view.helper';
import { buildScheduleListQueryOptions } from '../queries/practice-schedules.query';
import { practiceScheduleDetailPath, practiceScheduleNewPath } from '../routes/practice-schedules.paths';
import type { PracticeScheduleListPage } from '../types/practice-schedules.types';
import type { PracticeSchedulesListScreenView } from '../types/practice-schedules-view.types';

/**
 * The team's recurring-pattern catalogue.
 *
 * Gated on `practice.manage`: the pattern behind a session is a coach's
 * configuration, not roster information. The backend re-authorizes every
 * call regardless; this only decides what is worth rendering.
 */
export function usePracticeSchedulesListScreen(): PracticeSchedulesListScreenView {
  const { t } = useAppTranslation();
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const navigation = useAppNavigation();

  const canManage = hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]);
  const contextLoading = scope.isLoading || permissions.isLoading;

  const listQuery = useAppQuery<PracticeScheduleListPage>({
    ...buildScheduleListQueryOptions(scope.teamId),
    enabled: !contextLoading && canManage && scope.teamId !== '',
  });

  return buildSchedulesListView(t, {
    page: listQuery.data,
    isLoading: contextLoading || listQuery.isPending,
    isForbidden: !permissions.isLoading && !canManage,
    hasError: listQuery.isError,
    onNew: () => {
      navigation.push(practiceScheduleNewPath());
    },
    onOpen: (scheduleId) => {
      navigation.push(practiceScheduleDetailPath(scheduleId));
    },
    detailPathFor: practiceScheduleDetailPath,
  });
}

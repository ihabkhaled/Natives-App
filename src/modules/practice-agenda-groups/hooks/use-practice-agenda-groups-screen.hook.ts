import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import { buildAgendaGroupsView } from '../helpers/agenda-groups-view.helper';
import { buildAgendaGroupsPlanQueryOptions } from '../queries/practice-agenda-groups.query';
import type { AgendaGroupsPlan } from '../types/practice-agenda-groups.types';
import type { PracticeAgendaGroupsScreenView } from '../types/practice-agenda-groups-view.types';
import { useAgendaGroupsActions } from './use-agenda-groups-actions.hook';
import { useAgendaGroupsForms } from './use-agenda-groups-forms.hook';

/**
 * View model for one session's groups and resolved plan.
 *
 * Gated on `practice.manage` alone, unlike `practice-agenda`'s `practice.read`
 * split: the plan endpoint this reads is documented as including the coach's
 * private notes, and group assignment is a coach's roster decision the same
 * way sending a reminder is — a member attending the session has no reason to
 * see either. The backend re-authorizes every call regardless.
 *
 * The hook wires; `buildAgendaGroupsView` does the copy.
 */
export function usePracticeAgendaGroupsScreen(sessionId: string): PracticeAgendaGroupsScreenView {
  const { t } = useAppTranslation();
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const forms = useAgendaGroupsForms();

  const canManage = hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]);
  const contextLoading = scope.isLoading || permissions.isLoading;

  const planQuery = useAppQuery<AgendaGroupsPlan>({
    ...buildAgendaGroupsPlanQueryOptions(scope.teamId, sessionId),
    enabled: !contextLoading && canManage && sessionId !== '',
  });

  const mutationScope = { teamId: scope.teamId, sessionId };
  const actions = useAgendaGroupsActions(t, mutationScope, forms);

  return buildAgendaGroupsView(t, {
    plan: planQuery.data,
    isLoading: contextLoading || planQuery.isPending,
    isForbidden: !permissions.isLoading && !canManage,
    hasError: planQuery.isError,
    notice: actions.notice,
    isMutating: actions.isMutating,
    createForm: forms.createForm,
    onCreateFieldChange: forms.setCreateField,
    onCreateSubmit: actions.onCreateSubmit,
    copySourceSessionId: forms.copySourceSessionId,
    onCopySourceChange: forms.setCopySourceSessionId,
    onCopySubmit: actions.onCopySubmit,
    addMemberValues: forms.addMemberValues,
    onAddMemberValueChange: forms.setAddMemberValue,
    onAddMember: actions.onAddMember,
    onRemoveMember: actions.onRemoveMember,
    onRemoveGroup: actions.onRemoveGroup,
  });
}

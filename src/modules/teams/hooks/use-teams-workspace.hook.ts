import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import { TEAMS_SCREEN_COPY } from '../helpers/teams-copy.helper';
import { resolveTeamTransitionErrorKey } from '../helpers/teams-error.helper';
import { buildTeamsCopy } from '../helpers/teams-editor-view.helper';
import { buildTeamRows } from '../helpers/teams-rows.helper';
import { teamsQueryKeys } from '../queries/teams.keys';
import { buildTeamsQueryOptions } from '../queries/teams.query';
import { transitionTeam } from '../services/transition-team.service';
import type { Team } from '../types/teams.types';
import type { TeamsWorkspaceView } from '../types/teams-view.types';
import { useLifecycleTransition } from './use-lifecycle-transition.hook';
import { useTeamEditor } from './use-team-editor.hook';
import { useTeamFormState } from './use-team-form-state.hook';
import { useTeamsContext } from './use-teams-context.hook';

/**
 * Browse every team on the platform, and create, rename, or move one through
 * its lifecycle.
 *
 * The gates are platform-scoped on purpose: `team.browse.all` to read the
 * collection and `team.create` to add to it. A team administrator holds
 * neither, and the backend answers 403 for both — so the screen says so plainly
 * instead of rendering controls the server will refuse. That mismatch between
 * what the shell offers and what the API allows is exactly the drift that has
 * already shipped dead screens here twice.
 */
export function useTeamsWorkspace(): TeamsWorkspaceView {
  const { t } = useAppTranslation();
  const context = useTeamsContext();
  const form = useTeamFormState();
  const query = toRemoteQueryView(
    useAppQuery<readonly Team[]>(buildTeamsQueryOptions(context.canBrowseAllTeams)),
  );
  const teams = query.data ?? [];
  const lifecycle = useLifecycleTransition({
    run: (request) => transitionTeam(request.id, request.transition, request.expectedVersion),
    invalidateKey: teamsQueryKeys.list(),
    confirmTitle: t(I18N_KEYS.teamsAdmin.transitionConfirmTitle),
    confirmCta: t(I18N_KEYS.teamsAdmin.transitionConfirmCta),
    cancelLabel: t(I18N_KEYS.teamsAdmin.cancelLabel),
    successMessage: t(I18N_KEYS.teamsAdmin.transitionedToast),
    resolveErrorMessage: (error) => t(resolveTeamTransitionErrorKey(error)),
  });
  return {
    ...buildScreenCopy(t, {
      keys: TEAMS_SCREEN_COPY,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.teamsAdmin.emptyTitle,
      emptyMessageKey: I18N_KEYS.teamsAdmin.emptyMessage,
    }),
    ...buildTeamsCopy(t),
    status: resolveScreenStatus(context, query, context.canBrowseAllTeams, teams.length > 0),
    notice: context.canCreateTeams ? null : t(I18N_KEYS.teamsAdmin.createForbiddenNotice),
    canManage: context.canManageTeams,
    canCreate: context.canCreateTeams,
    rows: buildTeamRows(t, teams, {
      canManage: context.canManageTeams && !lifecycle.isRunning,
      onEdit: form.openEdit,
      onTransition: (team, transition) => {
        lifecycle.request({ id: team.id, transition, expectedVersion: team.version });
      },
    }),
    onOpenCreate: form.openCreate,
    editor: useTeamEditor(form, context.canManageTeams, context.canCreateTeams),
  };
}

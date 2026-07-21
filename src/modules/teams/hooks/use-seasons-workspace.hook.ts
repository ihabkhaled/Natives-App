import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import { SEASONS_SCREEN_COPY } from '../helpers/teams-copy.helper';
import { resolveSeasonTransitionErrorKey } from '../helpers/teams-error.helper';
import { buildSeasonsCopy } from '../helpers/teams-editor-view.helper';
import { buildSeasonRows } from '../helpers/teams-rows.helper';
import { teamsQueryKeys } from '../queries/teams.keys';
import { buildSeasonsQueryOptions } from '../queries/teams.query';
import { transitionSeason } from '../services/transition-season.service';
import type { Season } from '../types/teams.types';
import type { SeasonsWorkspaceView } from '../types/teams-view.types';
import { useLifecycleTransition } from './use-lifecycle-transition.hook';
import { useSeasonEditor } from './use-season-editor.hook';
import { useSeasonFormState } from './use-season-form-state.hook';
import { useTeamsContext } from './use-teams-context.hook';

/**
 * The seasons a team competes in: list, create, edit, and move through the
 * draft → active → closed → archived lifecycle.
 *
 * Reading is `team.read`; every write is `season.manage`, matching the seasons
 * controller. Exactly one season may be active per team, so activating a second
 * comes back as a 409 the screen explains in place rather than retrying.
 */
export function useSeasonsWorkspace(): SeasonsWorkspaceView {
  const { t } = useAppTranslation();
  const context = useTeamsContext();
  const form = useSeasonFormState();
  const query = toRemoteQueryView(
    useAppQuery<readonly Season[]>(buildSeasonsQueryOptions(context.teamId, context.canReadTeams)),
  );
  const seasons = query.data ?? [];
  const lifecycle = useLifecycleTransition({
    run: (request) =>
      transitionSeason({
        teamId: context.teamId,
        seasonId: request.id,
        transition: request.transition,
        expectedVersion: request.expectedVersion,
      }),
    invalidateKey: teamsQueryKeys.seasons(context.teamId),
    confirmTitle: t(I18N_KEYS.seasonsAdmin.transitionConfirmTitle),
    confirmCta: t(I18N_KEYS.seasonsAdmin.transitionConfirmCta),
    cancelLabel: t(I18N_KEYS.seasonsAdmin.cancelLabel),
    successMessage: t(I18N_KEYS.seasonsAdmin.transitionedToast),
    resolveErrorMessage: (error) => t(resolveSeasonTransitionErrorKey(error)),
  });
  return {
    ...buildScreenCopy(t, {
      keys: SEASONS_SCREEN_COPY,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.seasonsAdmin.emptyTitle,
      emptyMessageKey: I18N_KEYS.seasonsAdmin.emptyMessage,
    }),
    ...buildSeasonsCopy(t),
    status: resolveScreenStatus(context, query, context.canReadTeams, seasons.length > 0),
    notice:
      lifecycle.errorMessage ??
      (context.canManageSeasons ? null : t(I18N_KEYS.seasonsAdmin.readOnlyNotice)),
    canManage: context.canManageSeasons,
    rows: buildSeasonRows(t, seasons, {
      canManage: context.canManageSeasons && !lifecycle.isRunning,
      onEdit: form.openEdit,
      onTransition: (season, transition) => {
        lifecycle.request({ id: season.id, transition, expectedVersion: season.version });
      },
    }),
    onOpenCreate: form.openCreate,
    editor: useSeasonEditor(context.teamId, form, context.canManageSeasons),
  };
}

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import {
  PRACTICE_AGENDA_CONTROL_KEYS,
  PRACTICE_AGENDA_SCREEN_COPY_KEYS,
} from '../constants/practice-agenda-copy.constants';
import { buildAgendaBlockViews } from '../helpers/agenda-block-view.helper';
import { resolveAgendaState } from '../helpers/agenda-order.helper';
import { buildPracticeAgendaQueryOptions } from '../queries/practice-agenda.query';
import { practiceAgendaPath } from '../routes/practice-agenda.paths';
import type { PracticeAgenda } from '../types/practice-agenda.types';
import type { PracticeAgendaScreenView } from '../types/practice-agenda-view.types';
import { useAgendaBlockOrder } from './use-agenda-block-order.hook';
import { usePracticeAgendaActions } from './use-practice-agenda-actions.hook';
import { usePracticeAgendaContext } from './use-practice-agenda-context.hook';

const KEYS = I18N_KEYS.practiceAgenda;

/**
 * View model for one session's plan: the blocks in running order, the stations
 * inside each, and the two commands a coach issues while planning or while the
 * session is under way.
 */
export function usePracticeAgendaScreen(sessionId: string): PracticeAgendaScreenView {
  const { t } = useAppTranslation();
  const context = usePracticeAgendaContext();
  const scope = { teamId: context.teamId, sessionId };
  const actions = usePracticeAgendaActions(t, scope);

  const query = toRemoteQueryView<PracticeAgenda>(
    useAppQuery(buildPracticeAgendaQueryOptions(context.teamId, sessionId)),
  );
  const agenda = resolveAgendaState(query.data);
  const order = useAgendaBlockOrder({
    scope,
    blocks: agenda.blocks,
    version: agenda.version,
    onSaved: actions.clearNotice,
    onFailed: actions.reportFailure,
  });
  const blocks = buildAgendaBlockViews(t, order.blocks);

  return {
    ...buildScreenCopy(t, {
      keys: PRACTICE_AGENDA_SCREEN_COPY_KEYS,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: KEYS.emptyTitle,
      emptyMessageKey: KEYS.emptyMessage,
    }),
    path: practiceAgendaPath(sessionId),
    pageTitle: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    // Read, not manage: a member without the planning grant still sees the
    // plan, and loses only the controls that would change it.
    status: resolveScreenStatus(context, query, context.canRead, blocks.length > 0),
    listHeading: t(KEYS.listHeading),
    listIntro: t(KEYS.listIntro),
    countLabel: t(KEYS.countLabel, { total: blocks.length }),
    moveUpLabel: t(PRACTICE_AGENDA_CONTROL_KEYS.moveUp),
    moveDownLabel: t(PRACTICE_AGENDA_CONTROL_KEYS.moveDown),
    removeStationLabel: t(PRACTICE_AGENDA_CONTROL_KEYS.removeStation),
    canEdit: context.canManage,
    isSaving: order.isSaving || actions.isRemoving,
    notice: actions.notice,
    blocks,
    onMoveBlock: order.move,
    onRemoveStation: actions.onRemoveStation,
  };
}

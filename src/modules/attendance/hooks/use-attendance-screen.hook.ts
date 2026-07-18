import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';

import { buildAttendanceScreenView } from '../helpers/attendance-view-model.helper';
import type { AttendanceScreenView } from '../types/attendance-view.types';
import { useAttendanceActions } from './use-attendance-actions.hook';
import { useAttendanceEditor } from './use-attendance-editor.hook';
import { useAttendanceHistoryQuery } from './use-attendance-history-query.hook';
import { useAttendanceQueueReplay } from './use-attendance-queue-replay.hook';
import { useAttendanceSheetQuery } from './use-attendance-sheet-query.hook';
import { useAttendanceTeamContext } from './use-attendance-team-context.hook';

export function useAttendanceScreen(sessionId: string): AttendanceScreenView {
  const { t, locale } = useAppTranslation();
  const network = useNetworkStatus();
  const team = useAttendanceTeamContext();
  const query = useAttendanceSheetQuery(team.teamId, sessionId);
  const queue = useAttendanceQueueReplay(team.teamId, sessionId, network.isOnline);
  const editor = useAttendanceEditor(query.sheet?.items ?? [], queue.operations);
  const actions = useAttendanceActions({
    teamId: team.teamId,
    sessionId,
    isOnline: network.isOnline,
    sheet: query.sheet,
    editor,
    queue,
    onRefetch: query.refetch,
  });
  const history = useAttendanceHistoryQuery(team.teamId, sessionId, actions.historyMembershipId);
  return buildAttendanceScreenView({
    t,
    locale,
    sessionId,
    sheet: query.sheet,
    error: query.error,
    isLoading: team.isLoading || query.isLoading,
    isOffline: !network.isOnline,
    editor,
    queue: queue.operations,
    isReplaying: queue.isReplaying,
    isSubmitting: actions.isSubmitting,
    isFinalizing: actions.isFinalizing,
    isCorrecting: actions.isCorrecting,
    historyMembershipId: actions.historyMembershipId,
    history: history.revisions,
    isHistoryLoading: history.isLoading,
    actions: actions.actions,
  });
}

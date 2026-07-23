import { useState } from 'react';

import { useUpcomingPracticesQuery, type PracticeSessionSummary } from '@/modules/practice';
import { isInstantInPast, nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useNetworkStatus } from '@/platform';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import {
  ATTENDANCE_SELF_HISTORY_MAX_ITEMS,
  ATTENDANCE_SELF_HISTORY_PAGE_SIZE,
} from '../constants/attendance.constants';
import { buildMyAttendanceScreenView } from '../helpers/my-attendance-view-model.helper';
import { useCheckInMutation } from '../mutations/use-check-in-mutation.hook';
import {
  buildMyAttendanceHistoryQueryOptions,
  buildMyAttendanceQueryOptions,
  buildMyParticipationQueryOptions,
} from '../queries/attendance-self.query';
import type { MyAttendanceScreenView } from '../types/attendance-view.types';
import type {
  AttendanceParticipation,
  AttendanceSelfHistoryPage,
  AttendanceSelfRecord,
} from '../types/attendance.types';
import { useAttendanceTeamContext } from './use-attendance-team-context.hook';

/** The next session a member could still check in to: not cancelled, not over. */
function pickNextSession(
  sessions: readonly PracticeSessionSummary[] | undefined,
  referenceIso: string,
): PracticeSessionSummary | null {
  return (
    sessions?.find(
      (session) =>
        session.status !== 'cancelled' && !isInstantInPast(session.endAtIso, referenceIso),
    ) ?? null
  );
}

/**
 * The member "My attendance" screen: own participation summary, the
 * server-ruled per-session self check-in, and the bounded own-history list.
 * PRIVACY RULE (prompt 240): this hook reads ONLY self-scoped endpoints — it
 * never fires the roster or any staff read.
 */
export function useMyAttendanceScreen(): MyAttendanceScreenView {
  const { t, locale } = useAppTranslation();
  const network = useNetworkStatus();
  const toast = useAppToast();
  const team = useAttendanceTeamContext();
  const [note, setNote] = useState('');
  const [historyLimit, setHistoryLimit] = useState(ATTENDANCE_SELF_HISTORY_PAGE_SIZE);
  const reference = nowIso();

  const participation = useAppQuery<AttendanceParticipation>(
    buildMyParticipationQueryOptions(team.teamId, null),
  );
  const history = useAppQuery<AttendanceSelfHistoryPage>(
    buildMyAttendanceHistoryQueryOptions(team.teamId, historyLimit),
  );
  const upcoming = useUpcomingPracticesQuery(team.teamId);
  const nextSession = pickNextSession(upcoming.sessions, reference);
  const self = useAppQuery<AttendanceSelfRecord>(
    buildMyAttendanceQueryOptions(team.teamId, nextSession?.id ?? ''),
  );
  const mutation = useCheckInMutation(team.teamId, nextSession?.id ?? '', {
    onSuccess: () => {
      setNote('');
      void toast.showToast({
        message: t(I18N_KEYS.attendance.checkInSuccessToast),
        tone: 'success',
      });
    },
    onError: (error) => {
      // A 409 means the window closed or the sheet locked while we looked at
      // it; refetching shows the server's ruling instead of a raw failure.
      const message =
        error.code === APP_ERROR_CODE.Conflict
          ? t(I18N_KEYS.attendance.checkInWindowClosedError)
          : t(I18N_KEYS.states.errorTitle);
      void toast.showToast({ message, tone: 'danger' });
      void self.refetch();
    },
  });

  return buildMyAttendanceScreenView({
    t,
    locale,
    isOffline: !network.isOnline,
    isLoading: team.isLoading || participation.isPending,
    participation: participation.data,
    participationError: participation.error === null ? null : toAppError(participation.error),
    onRetry: () => {
      void participation.refetch();
    },
    nextSession,
    selfRecord: self.data,
    isSelfLoading: self.isPending,
    noteValue: note,
    isSubmitting: mutation.isSubmitting,
    onNoteChange: setNote,
    onCheckIn: () => {
      mutation.checkIn(note.trim() === '' ? null : note.trim());
    },
    history: history.data,
    isHistoryLoading: history.isPending,
    canGrowHistory: historyLimit < ATTENDANCE_SELF_HISTORY_MAX_ITEMS,
    onLoadMoreHistory: () => {
      setHistoryLimit((current) =>
        Math.min(current + ATTENDANCE_SELF_HISTORY_PAGE_SIZE, ATTENDANCE_SELF_HISTORY_MAX_ITEMS),
      );
    },
  });
}

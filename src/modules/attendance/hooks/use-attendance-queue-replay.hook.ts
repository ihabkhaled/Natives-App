import { useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@/packages/query';

import { ATTENDANCE_QUEUE_STATE } from '../constants/attendance.constants';
import { attendanceQueryKeys } from '../queries/attendance.keys';
import { replayAttendanceQueue } from '../services/replay-attendance-queue.service';
import { selectSessionQueue } from '../store/attendance-queue.selectors';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import type { AttendanceQueuedOperation } from '../types/attendance.types';

export interface AttendanceQueueReplayView {
  readonly operations: readonly AttendanceQueuedOperation[];
  readonly isReplaying: boolean;
  readonly retryFailed: () => void;
  readonly resolveConflict: (membershipId: string) => void;
}

export function useAttendanceQueueReplay(
  teamId: string,
  sessionId: string,
  isOnline: boolean,
): AttendanceQueueReplayView {
  const queryClient = useQueryClient();
  const allOperations = useAttendanceQueueStore((state) => state.operations);
  const isReplayingRef = useRef(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const operations = useMemo(
    () =>
      selectSessionQueue(
        { ...useAttendanceQueueStore.getState(), operations: allOperations },
        teamId,
        sessionId,
      ),
    [allOperations, sessionId, teamId],
  );
  const replayable = useMemo(
    () =>
      operations.filter(
        (operation) =>
          operation.state === ATTENDANCE_QUEUE_STATE.pending ||
          operation.state === ATTENDANCE_QUEUE_STATE.retrying,
      ),
    [operations],
  );

  useEffect(() => {
    if (!isOnline || replayable.length === 0 || isReplayingRef.current) {
      return;
    }
    isReplayingRef.current = true;
    setIsReplaying(true);
    void replayAttendanceQueue(replayable).finally(() => {
      isReplayingRef.current = false;
      setIsReplaying(false);
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.sheet(teamId, sessionId),
      });
    });
  }, [isOnline, queryClient, replayable, sessionId, teamId]);

  return {
    operations,
    isReplaying,
    retryFailed: () => {
      const store = useAttendanceQueueStore.getState();
      for (const operation of operations) {
        if (operation.state === ATTENDANCE_QUEUE_STATE.failed) {
          store.setOperationState(operation.operationId, ATTENDANCE_QUEUE_STATE.pending, false);
        }
      }
    },
    resolveConflict: (membershipId) => {
      useAttendanceQueueStore.getState().removeForMember(teamId, sessionId, membershipId);
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.sheet(teamId, sessionId),
      });
    },
  };
}

import { createPersistedAppStore } from '@/packages/state';
import { createPreferencesStorageAdapter } from '@/platform';
import { STORAGE_KEYS } from '@/shared/config';

import {
  ATTENDANCE_QUEUE_LIMIT,
  ATTENDANCE_QUEUE_STATE,
  type AttendanceQueueState,
} from '../constants/attendance.constants';
import {
  ATTENDANCE_QUEUE_STORE_VERSION,
  migratePersistedAttendanceQueue,
} from './attendance-queue.migrations';
import type { AttendanceQueuedOperation } from '../types/attendance.types';

export interface AttendanceQueueStoreState {
  readonly operations: readonly AttendanceQueuedOperation[];
  readonly enqueue: (operations: readonly AttendanceQueuedOperation[]) => void;
  readonly setOperationState: (
    operationId: string,
    state: AttendanceQueueState,
    incrementRetry: boolean,
  ) => void;
  readonly remove: (operationId: string) => void;
  readonly removeForMember: (teamId: string, sessionId: string, membershipId: string) => void;
  readonly clear: () => void;
}

function mergeOperations(
  current: readonly AttendanceQueuedOperation[],
  incoming: readonly AttendanceQueuedOperation[],
): readonly AttendanceQueuedOperation[] {
  const incomingMembers = new Set(
    incoming.map((item) => `${item.teamId}:${item.sessionId}:${item.membershipId}`),
  );
  const retained = current.filter(
    (item) => !incomingMembers.has(`${item.teamId}:${item.sessionId}:${item.membershipId}`),
  );
  return [...retained, ...incoming].slice(-ATTENDANCE_QUEUE_LIMIT);
}

/**
 * Native-safe bounded mutation queue. Preferences stores approved attendance
 * marks only; restricted note/evidence fields are not part of this state.
 */
export const useAttendanceQueueStore = createPersistedAppStore<AttendanceQueueStoreState>(
  (set) => ({
    operations: [],
    enqueue: (operations) => {
      set((state) => ({ operations: mergeOperations(state.operations, operations) }));
    },
    setOperationState: (operationId, state, incrementRetry) => {
      set((current) => ({
        operations: current.operations.map((operation) =>
          operation.operationId === operationId
            ? {
                ...operation,
                state,
                retryCount: operation.retryCount + (incrementRetry ? 1 : 0),
              }
            : operation,
        ),
      }));
    },
    remove: (operationId) => {
      set((state) => ({
        operations: state.operations.filter((operation) => operation.operationId !== operationId),
      }));
    },
    removeForMember: (teamId, sessionId, membershipId) => {
      set((state) => ({
        operations: state.operations.filter(
          (operation) =>
            operation.teamId !== teamId ||
            operation.sessionId !== sessionId ||
            operation.membershipId !== membershipId,
        ),
      }));
    },
    clear: () => {
      set({ operations: [] });
    },
  }),
  {
    storageKey: STORAGE_KEYS.attendanceQueue,
    version: ATTENDANCE_QUEUE_STORE_VERSION,
    storage: createPreferencesStorageAdapter(),
    migrate: (persisted, fromVersion) =>
      migratePersistedAttendanceQueue(persisted, fromVersion) as AttendanceQueueStoreState,
    validate: (persisted) =>
      migratePersistedAttendanceQueue(
        persisted,
        ATTENDANCE_QUEUE_STORE_VERSION,
      ) as AttendanceQueueStoreState,
    partialize: (state) => ({ operations: state.operations }),
  },
);

export const INITIAL_ATTENDANCE_QUEUE_STATE = ATTENDANCE_QUEUE_STATE.pending;

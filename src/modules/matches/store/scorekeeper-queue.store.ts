import { createPersistedAppStore } from '@/packages/state';
import { createPreferencesStorageAdapter } from '@/platform';
import { STORAGE_KEYS } from '@/shared/config';

import {
  SCOREKEEPER_QUEUE_LIMIT,
  type ScorekeeperQueueState,
} from '../constants/matches.constants';
import {
  SCOREKEEPER_QUEUE_STORE_VERSION,
  migratePersistedScorekeeperQueue,
} from './scorekeeper-queue.migrations';
import type { ScorekeeperEnqueueOutcome, ScorekeeperQueuedOperation } from '../types/matches.types';

export interface ScorekeeperQueueStoreState {
  readonly operations: readonly ScorekeeperQueuedOperation[];
  /**
   * Append one command. At the limit the append is REFUSED (`at-limit`) and
   * nothing is dropped: silently evicting the oldest point would publish a
   * wrong final score, so the UI blocks scoring and shows recovery guidance
   * instead.
   */
  readonly enqueue: (operation: ScorekeeperQueuedOperation) => ScorekeeperEnqueueOutcome;
  readonly setOperationState: (
    operationId: string,
    state: ScorekeeperQueueState,
    incrementRetry: boolean,
  ) => void;
  readonly markConflict: (operationId: string, serverScore: string) => void;
  readonly remove: (operationId: string) => void;
  readonly clearForMatch: (teamId: string, matchId: string) => void;
  readonly clear: () => void;
}

function withOperation(
  operations: readonly ScorekeeperQueuedOperation[],
  operationId: string,
  change: (operation: ScorekeeperQueuedOperation) => ScorekeeperQueuedOperation,
): readonly ScorekeeperQueuedOperation[] {
  return operations.map((operation) =>
    operation.operationId === operationId ? change(operation) : operation,
  );
}

/**
 * Native-safe bounded scorekeeper queue, persisted through Preferences so an
 * app restart mid-match replays exactly the actions the field recorded. Each
 * entry carries its owning user id; nothing here is shared across accounts.
 */
export const useScorekeeperQueueStore = createPersistedAppStore<ScorekeeperQueueStoreState>(
  (set, get) => ({
    operations: [],
    enqueue: (operation) => {
      if (get().operations.length >= SCOREKEEPER_QUEUE_LIMIT) {
        return 'at-limit';
      }
      set((state) => ({ operations: [...state.operations, operation] }));
      return 'accepted';
    },
    setOperationState: (operationId, state, incrementRetry) => {
      set((current) => ({
        operations: withOperation(current.operations, operationId, (operation) => ({
          ...operation,
          state,
          retryCount: operation.retryCount + (incrementRetry ? 1 : 0),
        })),
      }));
    },
    markConflict: (operationId, serverScore) => {
      set((current) => ({
        operations: withOperation(current.operations, operationId, (operation) => ({
          ...operation,
          state: 'conflict',
          conflictServerScore: serverScore,
        })),
      }));
    },
    remove: (operationId) => {
      set((state) => ({
        operations: state.operations.filter((operation) => operation.operationId !== operationId),
      }));
    },
    clearForMatch: (teamId, matchId) => {
      set((state) => ({
        operations: state.operations.filter(
          (operation) => operation.teamId !== teamId || operation.matchId !== matchId,
        ),
      }));
    },
    clear: () => {
      set({ operations: [] });
    },
  }),
  {
    storageKey: STORAGE_KEYS.scorekeeperQueue,
    version: SCOREKEEPER_QUEUE_STORE_VERSION,
    storage: createPreferencesStorageAdapter(),
    migrate: (persisted, fromVersion) =>
      migratePersistedScorekeeperQueue(persisted, fromVersion) as ScorekeeperQueueStoreState,
    validate: (persisted) =>
      migratePersistedScorekeeperQueue(
        persisted,
        SCOREKEEPER_QUEUE_STORE_VERSION,
      ) as ScorekeeperQueueStoreState,
    partialize: (state) => ({ operations: state.operations }),
  },
);

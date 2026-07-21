import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@/packages/query';

import { SCOREKEEPER_QUEUE_STATE } from '../constants/matches.constants';
import { matchesQueryKeys } from '../queries/matches.keys';
import { replayScorekeeperQueue } from '../services/replay-scorekeeper-queue.service';
import {
  selectConflictOperations,
  selectHasForeignQueue,
  selectIsQueueAtLimit,
  selectOwnedMatchQueue,
  selectReplayableOperations,
} from '../store/scorekeeper-queue.selectors';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';

export interface ScorekeeperQueueView {
  /** Only the signed-in scorekeeper's own operations for this match. */
  readonly operations: readonly ScorekeeperQueuedOperation[];
  readonly conflicts: readonly ScorekeeperQueuedOperation[];
  readonly pendingCount: number;
  readonly isReplaying: boolean;
  readonly isAtLimit: boolean;
  /** True when the device still holds another account's unsent actions. */
  readonly hasForeignQueue: boolean;
  readonly hasFailed: boolean;
  readonly retryFailed: () => void;
  readonly discardConflict: (operationId: string) => void;
  readonly reloadAuthoritative: () => void;
}

/**
 * Owns the offline scorekeeper queue for one match.
 *
 * Reads are scoped to the signed-in user, so a logout or account switch leaves
 * the previous scorekeeper's operations invisible and unsent. Replay runs
 * automatically once connectivity returns, in recorded order, reusing each
 * original operation id so a retry is a server-side replay rather than a
 * second point.
 */
export function useScorekeeperQueue(
  ownerUserId: string,
  teamId: string,
  matchId: string,
  isOnline: boolean,
): ScorekeeperQueueView {
  const queryClient = useQueryClient();
  const allOperations = useScorekeeperQueueStore((state) => state.operations);
  const isReplayingRef = useRef(false);
  const [isReplaying, setIsReplaying] = useState(false);

  const operations = useMemo(
    () => selectOwnedMatchQueue(allOperations, ownerUserId, teamId, matchId),
    [allOperations, matchId, ownerUserId, teamId],
  );
  const replayable = useMemo(() => selectReplayableOperations(operations), [operations]);
  const conflicts = useMemo(() => selectConflictOperations(operations), [operations]);

  const refreshAuthoritative = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: matchesQueryKeys.detail(teamId, matchId),
    });
  }, [matchId, queryClient, teamId]);

  useEffect(() => {
    if (!isOnline || replayable.length === 0 || isReplayingRef.current) {
      return;
    }
    isReplayingRef.current = true;
    setIsReplaying(true);
    void replayScorekeeperQueue(replayable).finally(() => {
      isReplayingRef.current = false;
      setIsReplaying(false);
      refreshAuthoritative();
    });
  }, [isOnline, refreshAuthoritative, replayable]);

  return {
    operations,
    conflicts,
    pendingCount: replayable.length,
    isReplaying,
    isAtLimit: selectIsQueueAtLimit(allOperations),
    hasForeignQueue: selectHasForeignQueue(allOperations, ownerUserId),
    hasFailed: operations.some((operation) => operation.state === SCOREKEEPER_QUEUE_STATE.Failed),
    retryFailed: () => {
      const store = useScorekeeperQueueStore.getState();
      for (const operation of operations) {
        if (operation.state === SCOREKEEPER_QUEUE_STATE.Failed) {
          store.setOperationState(operation.operationId, SCOREKEEPER_QUEUE_STATE.Pending, false);
        }
      }
    },
    // Discarding is the operator explicitly choosing the server's record over
    // the queued one. Nothing is merged and nothing is resubmitted.
    discardConflict: (operationId: string) => {
      useScorekeeperQueueStore.getState().remove(operationId);
      refreshAuthoritative();
    },
    reloadAuthoritative: refreshAuthoritative,
  };
}

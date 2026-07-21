import { safeParseWithSchema } from '@/packages/schema';

import { persistedScorekeeperQueueSchema } from './scorekeeper-queue.schema';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';

export const SCOREKEEPER_QUEUE_STORE_VERSION = 1;

export interface PersistedScorekeeperQueue {
  readonly operations: readonly ScorekeeperQueuedOperation[];
}

const EMPTY_QUEUE: PersistedScorekeeperQueue = { operations: [] };

/**
 * Restore the queue a restart left behind.
 *
 * A payload written by a newer build, or one that fails validation, is
 * discarded rather than half-trusted: a partially understood scoring queue
 * would replay the wrong points.
 */
export function migratePersistedScorekeeperQueue(
  persisted: unknown,
  fromVersion: number,
): PersistedScorekeeperQueue {
  if (fromVersion > SCOREKEEPER_QUEUE_STORE_VERSION) {
    return EMPTY_QUEUE;
  }
  const parsed = safeParseWithSchema(persistedScorekeeperQueueSchema, persisted);
  return parsed.success ? parsed.data : EMPTY_QUEUE;
}

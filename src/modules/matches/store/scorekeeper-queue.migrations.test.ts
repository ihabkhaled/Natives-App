import { describe, expect, it } from 'vitest';

import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { SCOREKEEPER_QUEUE_LIMIT } from '../constants/matches.constants';
import {
  migratePersistedScorekeeperQueue,
  SCOREKEEPER_QUEUE_STORE_VERSION,
} from './scorekeeper-queue.migrations';

describe('migratePersistedScorekeeperQueue', () => {
  it('restores a valid queue written by this version', () => {
    const operation = buildQueuedOperation();

    const restored = migratePersistedScorekeeperQueue(
      { operations: [operation] },
      SCOREKEEPER_QUEUE_STORE_VERSION,
    );

    expect(restored.operations).toStrictEqual([operation]);
  });

  it('restores a correction payload across a restart', () => {
    const operation = buildQueuedOperation({
      kind: 'void',
      payload: { kind: 'void', eventId: 'event-7', reason: 'double tap' },
    });

    const restored = migratePersistedScorekeeperQueue(
      { operations: [operation] },
      SCOREKEEPER_QUEUE_STORE_VERSION,
    );

    expect(restored.operations).toStrictEqual([operation]);
  });

  it('discards a payload written by a newer build rather than half-trusting it', () => {
    const restored = migratePersistedScorekeeperQueue(
      { operations: [buildQueuedOperation()] },
      SCOREKEEPER_QUEUE_STORE_VERSION + 1,
    );

    expect(restored.operations).toStrictEqual([]);
  });

  it('discards a payload that fails validation', () => {
    expect(
      migratePersistedScorekeeperQueue({ operations: [{ operationId: 'short' }] }, 1).operations,
    ).toStrictEqual([]);
  });

  it('discards a persisted queue above the bound', () => {
    const operations = Array.from({ length: SCOREKEEPER_QUEUE_LIMIT + 1 }, (_unused, index) =>
      buildQueuedOperation({ operationId: `op-${String(index).padStart(8, '0')}` }),
    );

    expect(migratePersistedScorekeeperQueue({ operations }, 1).operations).toStrictEqual([]);
  });

  it('discards a payload that is not an object', () => {
    expect(migratePersistedScorekeeperQueue(null, 1).operations).toStrictEqual([]);
  });
});

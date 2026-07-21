import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/shared/config';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { SCOREKEEPER_QUEUE_LIMIT } from '../constants/matches.constants';
import { useScorekeeperQueueStore } from './scorekeeper-queue.store';

/** Capacitor Preferences prefixes every web key with its storage group. */
const PERSISTED_KEY = `CapacitorStorage.${STORAGE_KEYS.scorekeeperQueue}`;

function operations() {
  return useScorekeeperQueueStore.getState().operations;
}

function flushStorageWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

beforeEach(() => {
  useScorekeeperQueueStore.getState().clear();
});

afterEach(() => {
  useScorekeeperQueueStore.getState().clear();
  localStorage.clear();
});

describe('useScorekeeperQueueStore', () => {
  it('appends commands in the order the field recorded them', () => {
    const store = useScorekeeperQueueStore.getState();
    store.enqueue(buildQueuedOperation({ operationId: 'op-a-000001' }));
    store.enqueue(buildQueuedOperation({ operationId: 'op-b-000001' }));

    expect(operations().map((operation) => operation.operationId)).toStrictEqual([
      'op-a-000001',
      'op-b-000001',
    ]);
  });

  it('BLOCKS at the limit instead of dropping the oldest point', () => {
    const store = useScorekeeperQueueStore.getState();
    for (let index = 0; index < SCOREKEEPER_QUEUE_LIMIT; index += 1) {
      store.enqueue(buildQueuedOperation({ operationId: `op-${String(index).padStart(8, '0')}` }));
    }

    const outcome = useScorekeeperQueueStore
      .getState()
      .enqueue(buildQueuedOperation({ operationId: 'op-overflow1' }));

    expect(outcome).toBe('at-limit');
    expect(operations()).toHaveLength(SCOREKEEPER_QUEUE_LIMIT);
    expect(operations()[0]?.operationId).toBe('op-00000000');
    expect(operations().some((operation) => operation.operationId === 'op-overflow1')).toBe(false);
  });

  it('accepts a command below the limit', () => {
    expect(useScorekeeperQueueStore.getState().enqueue(buildQueuedOperation())).toBe('accepted');
  });

  it('updates state and increments the retry count only when asked', () => {
    const store = useScorekeeperQueueStore.getState();
    store.enqueue(buildQueuedOperation({ operationId: 'op-a-000001' }));

    useScorekeeperQueueStore.getState().setOperationState('op-a-000001', 'retrying', false);
    expect(operations()[0]?.retryCount).toBe(0);

    useScorekeeperQueueStore.getState().setOperationState('op-a-000001', 'pending', true);
    expect(operations()[0]?.retryCount).toBe(1);
    expect(operations()[0]?.state).toBe('pending');
  });

  it('records the server score alongside a conflict so both records are visible', () => {
    useScorekeeperQueueStore.getState().enqueue(buildQueuedOperation({ operationId: 'op-c-1234' }));

    useScorekeeperQueueStore.getState().markConflict('op-c-1234', '9-6');

    expect(operations()[0]?.state).toBe('conflict');
    expect(operations()[0]?.conflictServerScore).toBe('9-6');
  });

  it('removes one operation and clears a whole match', () => {
    const store = useScorekeeperQueueStore.getState();
    store.enqueue(buildQueuedOperation({ operationId: 'op-a-000001' }));
    store.enqueue(buildQueuedOperation({ operationId: 'op-b-000001', matchId: 'match-9' }));

    useScorekeeperQueueStore.getState().remove('op-a-000001');
    expect(operations()).toHaveLength(1);

    useScorekeeperQueueStore.getState().clearForMatch('team-natives', 'match-9');
    expect(operations()).toStrictEqual([]);
  });

  it('leaves other matches alone when clearing one match', () => {
    const store = useScorekeeperQueueStore.getState();
    store.enqueue(buildQueuedOperation({ operationId: 'op-a-000001' }));

    useScorekeeperQueueStore.getState().clearForMatch('team-other', 'match-1');

    expect(operations()).toHaveLength(1);
  });

  it('survives an app restart with the queue intact', async () => {
    useScorekeeperQueueStore
      .getState()
      .enqueue(buildQueuedOperation({ operationId: 'op-restart01' }));
    await flushStorageWork();

    vi.resetModules();
    const restarted = (await import('./scorekeeper-queue.store')).useScorekeeperQueueStore;
    await flushStorageWork();

    expect(restarted.getState().operations.map((operation) => operation.operationId)).toStrictEqual(
      ['op-restart01'],
    );
  });

  it('persists nothing beyond the queue itself', async () => {
    useScorekeeperQueueStore.getState().enqueue(buildQueuedOperation());
    await flushStorageWork();

    const raw = JSON.parse(localStorage.getItem(PERSISTED_KEY) ?? '{}') as {
      state: Record<string, unknown>;
    };

    expect(Object.keys(raw.state)).toStrictEqual(['operations']);
  });
});

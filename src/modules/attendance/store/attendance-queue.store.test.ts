import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/shared/config';
import { makeQueuedOperation } from '@/tests/msw/attendance-domain.fixture';

import { useAttendanceQueueStore } from './attendance-queue.store';

/** Capacitor Preferences prefixes every web key with its storage group. */
const PERSISTED_KEY = `CapacitorStorage.${STORAGE_KEYS.attendanceQueue}`;

function operations() {
  return useAttendanceQueueStore.getState().operations;
}

/** Let the async Preferences adapter finish its pending write. */
function flushStorageWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function seedPersisted(queued: readonly unknown[], version: number): void {
  localStorage.setItem(PERSISTED_KEY, JSON.stringify({ state: { operations: queued }, version }));
}

async function importFreshStore(): Promise<typeof useAttendanceQueueStore> {
  vi.resetModules();
  const module = await import('./attendance-queue.store');
  return module.useAttendanceQueueStore;
}

beforeEach(() => {
  useAttendanceQueueStore.getState().clear();
});

afterEach(() => {
  useAttendanceQueueStore.getState().clear();
});

describe('useAttendanceQueueStore', () => {
  it('replaces a queued operation for the same member and retains other members', () => {
    const store = useAttendanceQueueStore.getState();
    store.enqueue([makeQueuedOperation({ operationId: 'op-a', membershipId: 'm-1' })]);
    store.enqueue([makeQueuedOperation({ operationId: 'op-b', membershipId: 'm-1' })]);
    store.enqueue([makeQueuedOperation({ operationId: 'op-c', membershipId: 'm-2' })]);

    expect(operations().map((operation) => operation.operationId)).toEqual(['op-b', 'op-c']);
  });

  it('updates an operation state and increments the retry count only when requested', () => {
    const store = useAttendanceQueueStore.getState();
    store.enqueue([makeQueuedOperation({ operationId: 'op-a', retryCount: 0 })]);

    store.setOperationState('op-a', 'retrying', true);
    expect(operations()[0]).toMatchObject({ state: 'retrying', retryCount: 1 });

    store.setOperationState('op-a', 'failed', false);
    expect(operations()[0]).toMatchObject({ state: 'failed', retryCount: 1 });

    store.setOperationState('op-missing', 'conflict', true);
    expect(operations()[0]?.state).toBe('failed');
  });

  it('removes an operation by id and by member scope', () => {
    const store = useAttendanceQueueStore.getState();
    store.enqueue([
      makeQueuedOperation({ operationId: 'op-a', membershipId: 'm-1' }),
      makeQueuedOperation({ operationId: 'op-b', membershipId: 'm-2' }),
    ]);

    store.remove('op-a');
    expect(operations().map((operation) => operation.operationId)).toEqual(['op-b']);

    store.removeForMember('team-1', 'sess-1', 'm-2');
    expect(operations()).toHaveLength(0);
  });

  it('clears the whole queue', () => {
    const store = useAttendanceQueueStore.getState();
    store.enqueue([makeQueuedOperation()]);

    store.clear();

    expect(operations()).toHaveLength(0);
  });

  it('migrates and rehydrates a queue persisted at an older version', async () => {
    await flushStorageWork();
    seedPersisted([makeQueuedOperation({ operationId: 'op-persisted' })], 0);

    const store = await importFreshStore();

    await vi.waitFor(() => {
      expect(store.getState().operations.map((operation) => operation.operationId)).toContain(
        'op-persisted',
      );
    });
  });
});

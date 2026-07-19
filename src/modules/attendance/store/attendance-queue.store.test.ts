import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { makeQueuedOperation } from '@/tests/msw/attendance-domain.fixture';

import { useAttendanceQueueStore } from './attendance-queue.store';

function operations() {
  return useAttendanceQueueStore.getState().operations;
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
});

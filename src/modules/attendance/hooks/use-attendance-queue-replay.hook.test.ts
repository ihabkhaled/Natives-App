import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as QueryModule from '@/packages/query';
import { makeQueuedOperation } from '@/tests/msw/attendance-domain.fixture';

import { replayAttendanceQueue } from '../services/replay-attendance-queue.service';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import { useAttendanceQueueReplay } from './use-attendance-queue-replay.hook';

const { queryClientStub } = vi.hoisted(() => ({
  queryClientStub: { invalidateQueries: vi.fn() },
}));

vi.mock('@/packages/query', async (importOriginal) => ({
  ...(await importOriginal<typeof QueryModule>()),
  useQueryClient: () => queryClientStub,
}));
vi.mock('../services/replay-attendance-queue.service', () => ({ replayAttendanceQueue: vi.fn() }));

function enqueue(...operations: Parameters<typeof makeQueuedOperation>[0][]): void {
  useAttendanceQueueStore
    .getState()
    .enqueue(operations.map((overrides) => makeQueuedOperation(overrides)));
}

beforeEach(() => {
  vi.clearAllMocks();
  useAttendanceQueueStore.getState().clear();
  vi.mocked(replayAttendanceQueue).mockResolvedValue({
    succeededOperationIds: [],
    conflictOperationIds: [],
    failedOperationIds: [],
  });
});

describe('useAttendanceQueueReplay', () => {
  it('replays pending session operations while online and refreshes the sheet after', async () => {
    enqueue({ operationId: 'op-1', membershipId: 'm-1', state: 'pending' });

    renderHook(() => useAttendanceQueueReplay('team-1', 'sess-1', true));

    await waitFor(() => {
      expect(replayAttendanceQueue).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(queryClientStub.invalidateQueries).toHaveBeenCalled();
    });
  });

  it('never replays while offline', () => {
    enqueue({ state: 'pending' });

    renderHook(() => useAttendanceQueueReplay('team-1', 'sess-1', false));

    expect(replayAttendanceQueue).not.toHaveBeenCalled();
  });

  it('never replays when nothing is pending or retrying', () => {
    enqueue({ state: 'failed' });

    renderHook(() => useAttendanceQueueReplay('team-1', 'sess-1', true));

    expect(replayAttendanceQueue).not.toHaveBeenCalled();
  });

  it('requeues only failed operations, leaving other queued marks untouched', () => {
    enqueue(
      { operationId: 'op-failed', membershipId: 'm-1', state: 'failed' },
      { operationId: 'op-retrying', membershipId: 'm-2', state: 'retrying' },
    );

    const { result } = renderHook(() => useAttendanceQueueReplay('team-1', 'sess-1', false));
    act(() => {
      result.current.retryFailed();
    });

    const queued = useAttendanceQueueStore.getState().operations;
    expect(queued.find((operation) => operation.operationId === 'op-failed')).toMatchObject({
      state: 'pending',
    });
    expect(queued.find((operation) => operation.operationId === 'op-retrying')).toMatchObject({
      state: 'retrying',
    });
  });

  it('drops a member from the queue and refreshes the sheet when a conflict is resolved', () => {
    enqueue({ operationId: 'op-conflict', membershipId: 'm-9', state: 'conflict' });

    const { result } = renderHook(() => useAttendanceQueueReplay('team-1', 'sess-1', false));
    act(() => {
      result.current.resolveConflict('m-9');
    });

    expect(useAttendanceQueueStore.getState().operations).toHaveLength(0);
    expect(queryClientStub.invalidateQueries).toHaveBeenCalled();
  });
});

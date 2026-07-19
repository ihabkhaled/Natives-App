import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';

import { makeQueuedOperation } from '@/tests/msw/attendance-domain.fixture';
import { makeRecordDto } from '@/tests/msw/attendance-wire.fixture';
import { requestAttendanceRecord } from '../gateways/attendance.gateway';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import { replayAttendanceQueue } from './replay-attendance-queue.service';

vi.mock('../gateways/attendance.gateway', () => ({ requestAttendanceRecord: vi.fn() }));

function operationState(operationId: string): string | undefined {
  return useAttendanceQueueStore
    .getState()
    .operations.find((operation) => operation.operationId === operationId)?.state;
}

beforeEach(() => {
  useAttendanceQueueStore.getState().clear();
});

afterEach(() => {
  vi.clearAllMocks();
  useAttendanceQueueStore.getState().clear();
});

describe('replayAttendanceQueue', () => {
  it('records a pending operation and removes it on success', async () => {
    const op = makeQueuedOperation({ operationId: 'op-ok' });
    useAttendanceQueueStore.getState().enqueue([op]);
    vi.mocked(requestAttendanceRecord).mockResolvedValue(makeRecordDto());

    const result = await replayAttendanceQueue([op]);

    expect(result.succeededOperationIds).toEqual(['op-ok']);
    expect(useAttendanceQueueStore.getState().operations).toHaveLength(0);
  });

  it('skips operations already flagged as conflicts without replaying them', async () => {
    const op = makeQueuedOperation({ operationId: 'op-skip', state: 'conflict' });

    const result = await replayAttendanceQueue([op]);

    expect(result.conflictOperationIds).toEqual(['op-skip']);
    expect(requestAttendanceRecord).not.toHaveBeenCalled();
  });

  it('marks a live version conflict returned by the backend', async () => {
    const op = makeQueuedOperation({ operationId: 'op-conflict' });
    useAttendanceQueueStore.getState().enqueue([op]);
    vi.mocked(requestAttendanceRecord).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );

    const result = await replayAttendanceQueue([op]);

    expect(result.conflictOperationIds).toEqual(['op-conflict']);
    expect(operationState('op-conflict')).toBe('conflict');
  });

  it('returns a transient failure to pending for a retry below the ceiling', async () => {
    const op = makeQueuedOperation({ operationId: 'op-retry', retryCount: 0 });
    useAttendanceQueueStore.getState().enqueue([op]);
    vi.mocked(requestAttendanceRecord).mockRejectedValue(new Error('offline'));

    const result = await replayAttendanceQueue([op]);

    expect(result.failedOperationIds).toEqual(['op-retry']);
    expect(operationState('op-retry')).toBe('pending');
  });

  it('flags a failure as permanently failed once retries are exhausted', async () => {
    const op = makeQueuedOperation({ operationId: 'op-dead', retryCount: 2 });
    useAttendanceQueueStore.getState().enqueue([op]);
    vi.mocked(requestAttendanceRecord).mockRejectedValue(new Error('offline'));

    const result = await replayAttendanceQueue([op]);

    expect(result.failedOperationIds).toEqual(['op-dead']);
    expect(operationState('op-dead')).toBe('failed');
  });
});

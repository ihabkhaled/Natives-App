import { describe, expect, it } from 'vitest';

import { makeQueuedOperation } from '@/tests/msw/attendance-domain.fixture';

import type { AttendanceQueueStoreState } from './attendance-queue.store';
import { selectSessionQueue } from './attendance-queue.selectors';
import type { AttendanceQueuedOperation } from '../types/attendance.types';

function stateWith(operations: readonly AttendanceQueuedOperation[]): AttendanceQueueStoreState {
  return {
    operations,
    enqueue: () => undefined,
    setOperationState: () => undefined,
    remove: () => undefined,
    removeForMember: () => undefined,
    clear: () => undefined,
  };
}

describe('selectSessionQueue', () => {
  it('returns only operations scoped to the requested team and session', () => {
    const state = stateWith([
      makeQueuedOperation({ operationId: 'op-1' }),
      makeQueuedOperation({ operationId: 'op-2', sessionId: 'sess-2' }),
      makeQueuedOperation({ operationId: 'op-3', teamId: 'team-2' }),
    ]);

    const scoped = selectSessionQueue(state, 'team-1', 'sess-1');

    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.operationId).toBe('op-1');
  });

  it('returns an empty list when nothing matches the scope', () => {
    expect(selectSessionQueue(stateWith([]), 'team-1', 'sess-1')).toEqual([]);
  });
});

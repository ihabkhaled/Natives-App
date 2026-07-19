import { describe, expect, it } from 'vitest';

import {
  ATTENDANCE_QUEUE_STORE_VERSION,
  migratePersistedAttendanceQueue,
} from './attendance-queue.migrations';

const VALID_OPERATION = {
  operationId: 'op-1',
  teamId: 'team-1',
  sessionId: 'sess-1',
  membershipId: 'm-1',
  status: 'present_on_time',
  latenessMinutes: null,
  excuseCategory: null,
  expectedVersion: 1,
  state: 'pending',
  retryCount: 0,
  createdAtIso: '2026-07-26T15:05:00.000Z',
};

describe('migratePersistedAttendanceQueue', () => {
  it('keeps a valid persisted queue at the current version', () => {
    const result = migratePersistedAttendanceQueue(
      { operations: [VALID_OPERATION] },
      ATTENDANCE_QUEUE_STORE_VERSION,
    );

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0]?.operationId).toBe('op-1');
  });

  it('discards state persisted by a newer, unknown version', () => {
    expect(
      migratePersistedAttendanceQueue(
        { operations: [VALID_OPERATION] },
        ATTENDANCE_QUEUE_STORE_VERSION + 1,
      ),
    ).toEqual({ operations: [] });
  });

  it('resets to an empty queue when the persisted shape is invalid', () => {
    expect(
      migratePersistedAttendanceQueue(
        { operations: [{ broken: true }] },
        ATTENDANCE_QUEUE_STORE_VERSION,
      ),
    ).toEqual({ operations: [] });
    expect(migratePersistedAttendanceQueue(null, ATTENDANCE_QUEUE_STORE_VERSION)).toEqual({
      operations: [],
    });
  });
});

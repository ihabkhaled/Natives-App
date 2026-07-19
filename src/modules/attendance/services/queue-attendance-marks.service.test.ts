import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AttendanceMark } from '../types/attendance.types';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import { queueAttendanceMarks } from './queue-attendance-marks.service';

const MARKS: readonly AttendanceMark[] = [
  {
    membershipId: 'm-1',
    status: 'present_late',
    latenessMinutes: 6,
    excuseCategory: null,
    expectedVersion: 1,
  },
];

beforeEach(() => {
  useAttendanceQueueStore.getState().clear();
});

afterEach(() => {
  useAttendanceQueueStore.getState().clear();
});

describe('queueAttendanceMarks', () => {
  it('creates pending, correlation-tagged operations and enqueues them', () => {
    const operations = queueAttendanceMarks('team-1', 'sess-1', MARKS);

    expect(operations).toHaveLength(1);
    expect(operations[0]).toMatchObject({
      membershipId: 'm-1',
      teamId: 'team-1',
      sessionId: 'sess-1',
      state: 'pending',
      retryCount: 0,
    });
    expect(operations[0]?.operationId).toEqual(expect.any(String));
    expect(operations[0]?.createdAtIso).toEqual(expect.any(String));
    expect(useAttendanceQueueStore.getState().operations).toHaveLength(1);
  });
});

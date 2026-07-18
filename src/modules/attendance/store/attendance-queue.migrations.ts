import { safeParseWithSchema } from '@/packages/schema';

import { persistedAttendanceQueueSchema } from './attendance-queue.schema';
import type { AttendanceQueuedOperation } from '../types/attendance.types';

export const ATTENDANCE_QUEUE_STORE_VERSION = 1;

export interface PersistedAttendanceQueue {
  readonly operations: readonly AttendanceQueuedOperation[];
}

const EMPTY_QUEUE: PersistedAttendanceQueue = { operations: [] };

export function migratePersistedAttendanceQueue(
  persisted: unknown,
  fromVersion: number,
): PersistedAttendanceQueue {
  if (fromVersion > ATTENDANCE_QUEUE_STORE_VERSION) {
    return EMPTY_QUEUE;
  }
  const parsed = safeParseWithSchema(persistedAttendanceQueueSchema, persisted);
  return parsed.success ? parsed.data : EMPTY_QUEUE;
}

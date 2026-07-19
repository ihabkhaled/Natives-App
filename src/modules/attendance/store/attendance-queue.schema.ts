import { schemaBuilder } from '@/packages/schema';

const statusSchema = schemaBuilder.enum([
  'present_on_time',
  'present_late',
  'excused',
  'injured',
  'absent',
  'remote_approved',
  'other_approved',
]);
const excuseSchema = schemaBuilder.enum([
  'injury',
  'illness',
  'work',
  'travel',
  'personal',
  'other',
]);
const queueStateSchema = schemaBuilder.enum(['pending', 'retrying', 'conflict', 'failed']);

const attendanceQueuedOperationSchema = schemaBuilder.object({
  operationId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  sessionId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: statusSchema,
  latenessMinutes: schemaBuilder.number().int().min(0).max(1440).nullable(),
  excuseCategory: excuseSchema.nullable(),
  expectedVersion: schemaBuilder.number().int().positive().nullable(),
  state: queueStateSchema,
  retryCount: schemaBuilder.number().int().nonnegative(),
  createdAtIso: schemaBuilder.iso.datetime({ offset: true }),
});

export const persistedAttendanceQueueSchema = schemaBuilder.object({
  operations: schemaBuilder.array(attendanceQueuedOperationSchema).max(50),
});

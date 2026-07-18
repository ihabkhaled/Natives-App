import { schemaBuilder } from '@/packages/schema';

const isoInstant = schemaBuilder.iso.datetime({ offset: true });
const attendanceStatusSchema = schemaBuilder.enum([
  'present_on_time',
  'present_late',
  'excused',
  'injured',
  'absent',
  'remote_approved',
  'other_approved',
]);
const excuseCategorySchema = schemaBuilder.enum([
  'injury',
  'illness',
  'work',
  'travel',
  'personal',
  'other',
]);
const attendanceSourceSchema = schemaBuilder.enum(['self', 'coach', 'admin', 'import', 'system']);
const sheetStateSchema = schemaBuilder.enum(['open', 'finalized', 'corrected']);

export const attendanceRecordResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: attendanceStatusSchema.nullable(),
  checkInAt: isoInstant.nullable(),
  checkOutAt: isoInstant.nullable(),
  latenessMinutes: schemaBuilder.number().nonnegative().nullable(),
  excuseCategory: excuseCategorySchema.nullable(),
  source: attendanceSourceSchema.nullable(),
  recordedAt: isoInstant.nullable(),
  version: schemaBuilder.number().int().nonnegative().nullable(),
});

export const attendanceRosterEntryResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  userId: schemaBuilder.string().min(1).nullable(),
  status: attendanceStatusSchema.nullable(),
  checkInAt: isoInstant.nullable(),
  latenessMinutes: schemaBuilder.number().nonnegative().nullable(),
  excuseCategory: excuseCategorySchema.nullable(),
  source: attendanceSourceSchema.nullable(),
  version: schemaBuilder.number().int().nonnegative().nullable(),
});

export const attendanceSheetResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  state: sheetStateSchema,
  finalizedAt: isoInstant.nullable(),
  version: schemaBuilder.number().int().nonnegative().nullable(),
  items: schemaBuilder.array(attendanceRosterEntryResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive().max(100),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const bulkAttendanceResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(attendanceRecordResponseSchema),
  recorded: schemaBuilder.number().int().nonnegative(),
});

export const attendanceStatusResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  state: sheetStateSchema,
  finalizedAt: isoInstant.nullable(),
  recordCount: schemaBuilder.number().int().nonnegative(),
  version: schemaBuilder.number().int().positive(),
});

export const attendanceRevisionResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  fromStatus: attendanceStatusSchema.nullable(),
  toStatus: attendanceStatusSchema,
  latenessMinutes: schemaBuilder.number().nonnegative().nullable(),
  excuseCategory: excuseCategorySchema.nullable(),
  source: attendanceSourceSchema,
  isCorrection: schemaBuilder.boolean(),
  correctionReason: schemaBuilder.string().nullable(),
  actorUserId: schemaBuilder.string().nullable(),
  occurredAt: isoInstant,
});

export const attendanceHistoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(attendanceRevisionResponseSchema),
});

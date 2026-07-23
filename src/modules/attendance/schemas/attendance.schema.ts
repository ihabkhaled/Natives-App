import { schemaBuilder } from '@/packages/schema';

const isoInstant = schemaBuilder.iso.datetime({ offset: true });

/** Wire enums shared with the self-service schemas (single source, no drift). */
export const attendanceStatusSchema = schemaBuilder.enum([
  'present_on_time',
  'present_late',
  'excused',
  'injured',
  'absent',
  'remote_approved',
  'other_approved',
]);
export const excuseCategorySchema = schemaBuilder.enum([
  'injury',
  'illness',
  'work',
  'travel',
  'personal',
  'other',
]);
export const attendanceSourceSchema = schemaBuilder.enum([
  'self',
  'coach',
  'admin',
  'import',
  'system',
]);
export const sheetStateSchema = schemaBuilder.enum(['open', 'finalized', 'corrected']);

/** The bounded page envelope every attendance list response shares. */
export const boundedPageEnvelopeSchema = {
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive().max(100),
  offset: schemaBuilder.number().int().nonnegative(),
};

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

const attendanceRosterEntryResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  userId: schemaBuilder.string().min(1).nullable(),
  displayName: schemaBuilder.string().nullable(),
  rsvpStatus: schemaBuilder.enum(['going', 'not_going', 'maybe', 'no_response']).nullable(),
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
  ...boundedPageEnvelopeSchema,
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

const attendanceRevisionResponseSchema = schemaBuilder.object({
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

import { schemaBuilder } from '@/packages/schema';

import {
  attendanceRecordResponseSchema,
  attendanceSourceSchema,
  attendanceStatusSchema,
  boundedPageEnvelopeSchema,
  excuseCategorySchema,
  sheetStateSchema,
} from './attendance.schema';

/**
 * Wire contracts for the member self-service reads. `attendanceSelfRecordSchema`
 * is the record DTO plus the server-ruled `selfCheckIn` eligibility block
 * (contract 1.6.0): always present, nullable because only the own-record read
 * computes it — writes and roster rows honestly carry `null`.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const selfCheckInEligibilitySchema = schemaBuilder.object({
  state: schemaBuilder.enum(['not_open', 'open', 'closed', 'locked', 'recorded']),
  opensAt: isoInstant,
  closesAt: isoInstant,
});

export const attendanceSelfRecordSchema = attendanceRecordResponseSchema.extend({
  selfCheckIn: selfCheckInEligibilitySchema.nullable(),
});

/**
 * Exact mirror of `AttendanceSelfHistoryResponseDto`: the caller's own record
 * joined onto every started, non-cancelled session, newest first. A null
 * status means "not recorded" (never zero-filled); a null sheetState means no
 * sheet exists yet.
 */
export const attendanceSelfHistoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(
    schemaBuilder.object({
      sessionId: schemaBuilder.string().min(1),
      startsAt: isoInstant,
      endsAt: isoInstant,
      sessionType: schemaBuilder.string(),
      status: attendanceStatusSchema.nullable(),
      latenessMinutes: schemaBuilder.number().nonnegative().nullable(),
      excuseCategory: excuseCategorySchema.nullable(),
      source: attendanceSourceSchema.nullable(),
      recordedAt: isoInstant.nullable(),
      sheetState: sheetStateSchema.nullable(),
    }),
  ),
  ...boundedPageEnvelopeSchema,
});

/**
 * Exact mirror of `ParticipationResponseDto`: counts, the unrounded rate plus
 * its display twin, and the cited rule. `null` rates mean "not enough data" and
 * are never rendered as zero.
 */
export const participationResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  eligibleSessions: schemaBuilder.number().int().nonnegative(),
  excludedSessions: schemaBuilder.number().int().nonnegative(),
  denominator: schemaBuilder.number().int().nonnegative(),
  attended: schemaBuilder.number().int().nonnegative(),
  onTime: schemaBuilder.number().int().nonnegative(),
  late: schemaBuilder.number().int().nonnegative(),
  excused: schemaBuilder.number().int().nonnegative(),
  injured: schemaBuilder.number().int().nonnegative(),
  absent: schemaBuilder.number().int().nonnegative(),
  remoteApproved: schemaBuilder.number().int().nonnegative(),
  otherApproved: schemaBuilder.number().int().nonnegative(),
  attendanceRate: schemaBuilder.number().nullable(),
  attendanceRatePercent: schemaBuilder.number().nullable(),
  weightedPresentPoints: schemaBuilder.number(),
  latePenaltyPoints: schemaBuilder.number(),
  absentPenaltyPoints: schemaBuilder.number(),
  pointsContribution: schemaBuilder.number().nullable(),
  ruleVersion: schemaBuilder.string(),
  ruleStatus: schemaBuilder.enum(['candidate', 'approved']),
});

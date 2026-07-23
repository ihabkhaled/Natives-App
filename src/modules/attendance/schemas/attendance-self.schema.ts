import { schemaBuilder } from '@/packages/schema';

import { attendanceRecordResponseSchema } from './attendance.schema';

/**
 * Wire contracts for the member self-service reads. `attendanceSelfRecordSchema`
 * is the coach record DTO plus an OPTIONAL `selfCheckIn` eligibility block: the
 * deployed backend does not send it yet (Wave B1), so the client tolerates its
 * absence instead of inventing a shape the server never returned.
 */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const selfCheckInEligibilitySchema = schemaBuilder.object({
  state: schemaBuilder.enum(['not_open', 'open', 'closed', 'locked', 'recorded']),
  opensAt: isoInstant.nullable(),
  closesAt: isoInstant.nullable(),
});

export const attendanceSelfRecordSchema = attendanceRecordResponseSchema.extend({
  selfCheckIn: selfCheckInEligibilitySchema.nullable().optional(),
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

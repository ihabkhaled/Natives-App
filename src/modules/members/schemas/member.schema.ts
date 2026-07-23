import { schemaBuilder } from '@/packages/schema';

import {
  INVITATION_STATUSES,
  MEMBER_ROLE_SLUG_MAX_LENGTH,
  MEMBER_ROLE_SLUG_PATTERN,
} from '../constants/members.constants';

/** Exact runtime mirrors of the generated NestJS members DTOs. */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const membershipStatusSchema = schemaBuilder.enum([
  'invited',
  'active',
  'inactive',
  'suspended',
  'left',
  'archived',
  'anonymized',
]);

const playerGenderSchema = schemaBuilder.enum(['man', 'woman', 'nonbinary', 'undisclosed']);

const ageClassificationSchema = schemaBuilder.enum([
  'u17',
  'u20',
  'senior',
  'masters',
  'grand_masters',
]);

const aliasSourceSchema = schemaBuilder.enum(['manual', 'import']);

const memberAudienceSchema = schemaBuilder.enum(['public', 'teammate', 'self', 'coach', 'admin']);

/**
 * OPEN team-role slug: shape-validated only. The role catalog is server-owned
 * and may grow at any time; a newly seeded slug must parse here without a
 * client release ("role catalog changes do not break frontend parsing").
 */
const memberRoleSchema = schemaBuilder
  .string()
  .regex(MEMBER_ROLE_SLUG_PATTERN)
  .max(MEMBER_ROLE_SLUG_MAX_LENGTH);

export const memberDirectoryItemSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  status: membershipStatusSchema,
  displayName: schemaBuilder.string(),
  nickname: schemaBuilder.string().nullable(),
  jerseyNumber: schemaBuilder.number().int().nullable(),
  positions: schemaBuilder.array(schemaBuilder.string()),
  hasAvatar: schemaBuilder.boolean(),
});

export const memberDirectoryListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(memberDirectoryItemSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const memberViewResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  audience: memberAudienceSchema,
  status: membershipStatusSchema,
  displayName: schemaBuilder.string(),
  nickname: schemaBuilder.string().nullable(),
  positions: schemaBuilder.array(schemaBuilder.string()),
  jerseyNumber: schemaBuilder.number().int().nullable(),
  division: schemaBuilder.string().nullable(),
  hasAvatar: schemaBuilder.boolean(),
  preferredName: schemaBuilder.string().nullable(),
  fullNameAr: schemaBuilder.string().nullable(),
  gender: playerGenderSchema.nullable(),
  fullName: schemaBuilder.string().nullable(),
  jerseySize: schemaBuilder.string().nullable(),
  email: schemaBuilder.string().nullable(),
  phone: schemaBuilder.string().nullable(),
  heightCm: schemaBuilder.number().nullable(),
  weightKg: schemaBuilder.number().nullable(),
  ageClassification: ageClassificationSchema.nullable(),
  dateOfBirth: schemaBuilder.string().nullable(),
  statusReason: schemaBuilder.string().nullable(),
  createdBy: schemaBuilder.string().nullable(),
  updatedBy: schemaBuilder.string().nullable(),
  version: schemaBuilder.number().int().nullable(),
});

export const membershipResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  userId: schemaBuilder.string().nullable(),
  status: membershipStatusSchema,
  statusReason: schemaBuilder.string().nullable(),
  statusEffectiveAt: isoInstant,
  joinedAt: isoInstant.nullable(),
  leftAt: isoInstant.nullable(),
  anonymizedAt: isoInstant.nullable(),
  createdBy: schemaBuilder.string().nullable(),
  updatedBy: schemaBuilder.string().nullable(),
  createdAt: isoInstant,
  updatedAt: isoInstant,
  deletedAt: isoInstant.nullable(),
  version: schemaBuilder.number().int().nonnegative(),
});

export const memberStatusEventResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  fromStatus: membershipStatusSchema.nullable(),
  toStatus: membershipStatusSchema,
  reason: schemaBuilder.string().nullable(),
  actorUserId: schemaBuilder.string().nullable(),
  effectiveAt: isoInstant,
  occurredAt: isoInstant,
});

export const memberHistoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(memberStatusEventResponseSchema),
});

export const aliasResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  alias: schemaBuilder.string().min(1),
  source: aliasSourceSchema,
  createdAt: isoInstant,
});

export const aliasListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(aliasResponseSchema),
});

export const avatarTicketResponseSchema = schemaBuilder.object({
  mediaId: schemaBuilder.string().min(1),
  storageKey: schemaBuilder.string().min(1),
  uploadUrl: schemaBuilder.string().min(1),
  expiresAt: isoInstant,
});

export const avatarAccessResponseSchema = schemaBuilder.object({
  url: schemaBuilder.string().nullable(),
  expiresAt: isoInstant.nullable(),
});

export const memberRolesResponseSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  roles: schemaBuilder.array(memberRoleSchema),
  assignableRoles: schemaBuilder.array(memberRoleSchema),
});

/**
 * The identity layer's response to creating (or resending) an invitation.
 *
 * `token` is the one-time plaintext token, returned exactly once so an admin
 * can hand the accept link over manually when email delivery is not wired up
 * (the dev console adapter). It is never persisted and never logged.
 */
export const invitationDeliveryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  email: schemaBuilder.string().min(1),
  /** Identity access level; kept as an open string for wire compatibility. */
  role: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(INVITATION_STATUSES),
  /** Team the invitee joins at acceptance; null for platform-scoped invites. */
  teamId: schemaBuilder.string().min(1).nullable(),
  /** Team-role slug acceptance grants — the receipt shows this back. */
  teamRole: memberRoleSchema,
  expiresAt: isoInstant,
  createdAt: isoInstant,
  token: schemaBuilder.string().min(1),
});

/**
 * The roles the acting principal may grant in a team, with server display
 * metadata. Everything is an open string: labels and privilege descriptions
 * are server-driven so the client never hard-codes the catalog.
 */
export const assignableRolesResponseSchema = schemaBuilder.object({
  teamId: schemaBuilder.string().min(1),
  roles: schemaBuilder.array(
    schemaBuilder.object({
      slug: memberRoleSchema,
      displayName: schemaBuilder.string(),
      description: schemaBuilder.string(),
    }),
  ),
});

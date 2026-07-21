import { schemaBuilder } from '@/packages/schema';

import { ACCOUNT_STATE, INVITATION_ROLE, MEMBERSHIP_SCOPE_STATUSES } from '../types/auth.types';

/**
 * One team/season scope the principal belongs to, exactly as `GET /auth/me`
 * and `POST /auth/login` return it (backend `AuthMembershipDto`). The season
 * triple is nullable on purpose: a team may legitimately have no season, and
 * a missing season must not be invented or downgraded into a team-less
 * principal.
 */
export const authMembershipDtoSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  teamSlug: schemaBuilder.string().min(1),
  teamName: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1).nullable(),
  seasonSlug: schemaBuilder.string().min(1).nullable(),
  seasonName: schemaBuilder.string().min(1).nullable(),
  status: schemaBuilder.enum(MEMBERSHIP_SCOPE_STATUSES),
  roles: schemaBuilder.array(schemaBuilder.string()),
});

/** Wire contracts shared by remote NestJS mode and MSW mock mode. */
export const authUserDtoSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  email: schemaBuilder.email(),
  displayName: schemaBuilder.string().min(1),
  permissions: schemaBuilder.array(schemaBuilder.string()),
  accountState: schemaBuilder.enum([
    ACCOUNT_STATE.Active,
    ACCOUNT_STATE.Pending,
    ACCOUNT_STATE.Suspended,
  ]),
  onboardingComplete: schemaBuilder.boolean(),
  memberships: schemaBuilder.array(authMembershipDtoSchema),
});

export const authTokensDtoSchema = schemaBuilder.object({
  accessToken: schemaBuilder.string().min(1),
  refreshToken: schemaBuilder.string().min(1),
});

export const loginResponseSchema = schemaBuilder.object({
  tokens: authTokensDtoSchema,
  user: authUserDtoSchema,
});

export const refreshResponseSchema = schemaBuilder.object({
  accessToken: schemaBuilder.string().min(1),
  refreshToken: schemaBuilder.string().min(1),
  refreshTokenExpiresAt: schemaBuilder.iso.datetime({ offset: true }),
  userId: schemaBuilder.string().min(1),
});

export const logoutResponseSchema = schemaBuilder.object({
  message: schemaBuilder.string().min(1),
});

/** Generic acknowledgement envelope for forgot/reset/revoke endpoints. */
export const authAckSchema = schemaBuilder.object({
  message: schemaBuilder.string().min(1),
});

export const invitationDetailsDtoSchema = schemaBuilder.object({
  email: schemaBuilder.email(),
  role: schemaBuilder.enum([INVITATION_ROLE.Admin, INVITATION_ROLE.User]),
  inviterName: schemaBuilder.string().min(1).nullable(),
  expiresAt: schemaBuilder.iso.datetime({ offset: true }),
});

export const sessionDtoSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  device: schemaBuilder.string(),
  approxLocation: schemaBuilder.string(),
  lastActiveAt: schemaBuilder.string().min(1),
  current: schemaBuilder.boolean(),
});

export const sessionListResponseSchema = schemaBuilder.object({
  sessions: schemaBuilder.array(sessionDtoSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const revokeOthersResponseSchema = schemaBuilder.object({
  revokedCount: schemaBuilder.number().int().nonnegative(),
});

/**
 * The principal's effective permissions IN ONE SCOPE.
 *
 * `/auth/me` carries only globally-granted permissions; a team-scoped role
 * (team_admin, coach, …) contributes nothing to it. Asking this endpoint with
 * the active `teamId` is the only way to learn what the principal may
 * actually do inside that team.
 */
export const effectivePermissionsResponseSchema = schemaBuilder.object({
  permissions: schemaBuilder.array(schemaBuilder.string()),
});

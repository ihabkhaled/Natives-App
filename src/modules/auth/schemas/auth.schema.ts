import { schemaBuilder } from '@/packages/schema';

import { ACCOUNT_STATE, INVITATION_ROLE } from '../types/auth.types';

const authMembershipDtoSchema = schemaBuilder.object({
  teamId: schemaBuilder.string().min(1),
  teamName: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  seasonName: schemaBuilder.string().min(1),
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

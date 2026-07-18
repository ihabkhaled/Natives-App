import { schemaBuilder } from '@/packages/schema';

import { ACCOUNT_STATE } from '../types/auth.types';

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
  tokens: authTokensDtoSchema,
});

export const logoutResponseSchema = schemaBuilder.object({
  success: schemaBuilder.boolean(),
});

/** Generic acknowledgement envelope for forgot/reset/revoke endpoints. */
export const authAckSchema = schemaBuilder.object({
  success: schemaBuilder.boolean(),
});

export const invitationDetailsDtoSchema = schemaBuilder.object({
  email: schemaBuilder.email(),
  teamName: schemaBuilder.string().min(1),
  inviterName: schemaBuilder.string().min(1),
  expiresAt: schemaBuilder.string().min(1),
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
});

export const revokeOthersResponseSchema = schemaBuilder.object({
  revokedCount: schemaBuilder.number().int().nonnegative(),
});

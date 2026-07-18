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

import { schemaBuilder } from '@/packages/schema';

/** Wire contracts shared by remote NestJS mode and MSW mock mode. */
export const authUserDtoSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  email: schemaBuilder.email(),
  displayName: schemaBuilder.string().min(1),
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

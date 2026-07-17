import type { SchemaOutput } from '@/packages/schema';
import type { TokenPair } from '@/packages/http';

import type { authUserDtoSchema, loginResponseSchema } from '../schemas/auth.schema';
import type { AuthUser } from '../types/auth.types';

export interface AuthSession {
  readonly user: AuthUser;
  readonly tokens: TokenPair;
}

export function mapUserDtoToAuthUser(dto: SchemaOutput<typeof authUserDtoSchema>): AuthUser {
  return {
    id: dto.id,
    email: dto.email.toLowerCase(),
    displayName: dto.displayName.trim(),
  };
}

export function mapLoginResponseToSession(
  dto: SchemaOutput<typeof loginResponseSchema>,
): AuthSession {
  return {
    user: mapUserDtoToAuthUser(dto.user),
    tokens: {
      accessToken: dto.tokens.accessToken,
      refreshToken: dto.tokens.refreshToken,
    },
  };
}

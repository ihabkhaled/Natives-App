import type { SchemaOutput } from '@/packages/schema';
import type { TokenPair } from '@/packages/http';

import type {
  authUserDtoSchema,
  loginResponseSchema,
  refreshResponseSchema,
} from '../schemas/auth.schema';
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
    permissions: dto.permissions,
    accountState: dto.accountState,
    onboardingComplete: dto.onboardingComplete,
    memberships: dto.memberships,
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

export function mapAuthSessionResponseToTokens(
  dto: SchemaOutput<typeof refreshResponseSchema>,
): TokenPair {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
  };
}

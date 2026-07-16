import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestCurrentUser } from '../gateways/auth.gateway';
import { mapUserDtoToAuthUser } from '../mappers/auth.mapper';
import type { AuthUser } from '../types/auth.types';

/** Use case: load the authenticated user's profile. */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const dto = await requestCurrentUser();
    return mapUserDtoToAuthUser(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

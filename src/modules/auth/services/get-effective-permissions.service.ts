import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestEffectivePermissions } from '../gateways/auth.gateway';

/**
 * Use case: what the signed-in principal may actually do inside one team.
 *
 * This is the authorization source the shell reasons about. `/auth/me` is not:
 * it reports only globally-granted permissions, so a team administrator read
 * from it looks exactly like an ordinary member and every team-scoped screen
 * silently disappears from the navigation.
 */
export async function getEffectivePermissions(teamId: string): Promise<readonly string[]> {
  try {
    const dto = await requestEffectivePermissions(teamId);
    return dto.permissions;
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

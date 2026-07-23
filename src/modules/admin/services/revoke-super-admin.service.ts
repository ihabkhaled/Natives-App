import { runRequest } from '@/shared/errors';

import { requestRevokeSuperAdmin } from '../gateways/platform-admins.gateway';

/**
 * Use case: revoke one user's global SUPER_ADMIN assignment. The backend
 * refuses to remove the LAST super administrator with a 409
 * (`errors.rbac.lastSuperAdmin`) — surfaced as dedicated privilege copy, not
 * a generic conflict. Resolves `true` so the mutation carries a value.
 */
export function revokeSuperAdmin(userId: string): Promise<boolean> {
  return runRequest(async () => {
    await requestRevokeSuperAdmin(userId);
    return true;
  });
}

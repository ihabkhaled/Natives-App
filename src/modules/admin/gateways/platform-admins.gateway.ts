import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { superAdminPath, superAdminsPath } from '../constants/admin-api.constants';
import {
  superAdminEntryResponseSchema,
  superAdminListResponseSchema,
} from '../schemas/platform-admins.schema';

type SuperAdminEntryDto = SchemaOutput<typeof superAdminEntryResponseSchema>;
type SuperAdminListDto = SchemaOutput<typeof superAdminListResponseSchema>;

/** The current platform super administrators, ordered by effective-from. */
export function requestSuperAdmins(): Promise<SuperAdminListDto> {
  return getAppHttpClient().get(superAdminsPath(), superAdminListResponseSchema);
}

/**
 * Grant SUPER_ADMIN globally. The reason is mandatory and audited server-side;
 * the call is idempotent — promoting an existing super admin returns the live
 * assignment rather than duplicating it.
 */
export function requestPromoteSuperAdmin(
  userId: string,
  reason: string,
): Promise<SuperAdminEntryDto> {
  return getAppHttpClient().post(
    superAdminsPath(),
    { userId, reason },
    superAdminEntryResponseSchema,
  );
}

/** Revoke one user's global SUPER_ADMIN assignment (409 when they are the last). */
export function requestRevokeSuperAdmin(userId: string): Promise<void> {
  return getAppHttpClient().delete(superAdminPath(userId));
}

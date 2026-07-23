import { runRequest } from '@/shared/errors';

import { requestPromoteSuperAdmin } from '../gateways/platform-admins.gateway';
import { mapSuperAdmin } from '../mappers/platform-admins.mapper';
import type { SuperAdmin } from '../types/admin.types';

/**
 * Use case: grant global SUPER_ADMIN with a mandatory audited reason. This is
 * the ONLY path that can create a super administrator — a team invitation or
 * a team role replace is structurally refused by the backend.
 */
export function promoteSuperAdmin(userId: string, reason: string): Promise<SuperAdmin> {
  return runRequest(async () => mapSuperAdmin(await requestPromoteSuperAdmin(userId, reason)));
}

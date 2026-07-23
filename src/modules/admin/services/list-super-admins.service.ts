import { runRequest } from '@/shared/errors';

import { requestSuperAdmins } from '../gateways/platform-admins.gateway';
import { mapSuperAdminRoster } from '../mappers/platform-admins.mapper';
import type { SuperAdminRoster } from '../types/admin.types';

/** Use case: the current platform super administrators. */
export function listSuperAdmins(): Promise<SuperAdminRoster> {
  return runRequest(async () => mapSuperAdminRoster(await requestSuperAdmins()));
}

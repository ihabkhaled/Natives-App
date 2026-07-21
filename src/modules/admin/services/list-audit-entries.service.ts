import { runRequest } from '@/shared/errors';

import { requestAuditEntries } from '../gateways/operations.gateway';
import { mapAuditPage } from '../mappers/operations.mapper';
import type { AuditPage } from '../types/admin.types';

/** Use case: one bounded page of the team audit log. */
export function listAuditEntries(teamId: string): Promise<AuditPage> {
  return runRequest(async () => mapAuditPage(await requestAuditEntries(teamId)));
}

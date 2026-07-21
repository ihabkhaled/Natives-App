import { runRequest } from '@/shared/errors';

import { requestCatalogEntries } from '../gateways/catalog.gateway';
import { mapCatalogEntries } from '../mappers/settings.mapper';
import type { CatalogEntry } from '../types/admin.types';

/** Use case: one reference catalog (divisions, formats, or positions). */
export function listCatalogEntries(
  teamId: string,
  catalog: string,
): Promise<readonly CatalogEntry[]> {
  return runRequest(async () => mapCatalogEntries(await requestCatalogEntries(teamId, catalog)));
}

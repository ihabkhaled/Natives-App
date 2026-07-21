import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { catalogEntriesPath, seasonsPath, venuesPath } from '../constants/admin-api.constants';
import { ADMIN_LIMITS } from '../constants/admin.constants';
import {
  catalogEntryListResponseSchema,
  seasonListResponseSchema,
  venueListResponseSchema,
} from '../schemas/settings.schema';

type SeasonListDto = SchemaOutput<typeof seasonListResponseSchema>;
type VenueListDto = SchemaOutput<typeof venueListResponseSchema>;
type CatalogListDto = SchemaOutput<typeof catalogEntryListResponseSchema>;

export function requestSeasons(teamId: string): Promise<SeasonListDto> {
  return getAppHttpClient().get(seasonsPath(teamId), seasonListResponseSchema, {
    params: { limit: ADMIN_LIMITS.seasons, offset: 0 },
  });
}

export function requestVenues(teamId: string): Promise<VenueListDto> {
  return getAppHttpClient().get(venuesPath(teamId), venueListResponseSchema, {
    params: { limit: ADMIN_LIMITS.venues, offset: 0 },
  });
}

export function requestCatalogEntries(teamId: string, catalog: string): Promise<CatalogListDto> {
  return getAppHttpClient().get(catalogEntriesPath(teamId), catalogEntryListResponseSchema, {
    params: { catalog, limit: ADMIN_LIMITS.catalogEntries, offset: 0 },
  });
}

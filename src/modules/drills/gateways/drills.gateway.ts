import { getAppHttpClient } from '@/packages/http';

import { drillArchivePath, drillPath, drillsListPath } from '../constants/drills-api.constants';
import { toCreateDrillDto, toUpdateDrillDto } from '../mappers/drills.mapper';
import { drillResponseSchema, listDrillsResponseSchema } from '../schemas/drills.schema';
import type {
  ArchiveDrillCommand,
  CreateDrillCommand,
  Drill,
  DrillsPage,
  DrillsQuery,
  UpdateDrillCommand,
} from '../types/drills.types';

/** One bounded page of the team's drill catalogue. */
export function requestDrills(query: DrillsQuery): Promise<DrillsPage> {
  return getAppHttpClient().get(drillsListPath(query.teamId), listDrillsResponseSchema, {
    params: { limit: query.limit, offset: query.offset },
  });
}

export function requestDrill(teamId: string, drillId: string): Promise<Drill> {
  return getAppHttpClient().get(drillPath(teamId, drillId), drillResponseSchema);
}

export function requestCreateDrill(command: CreateDrillCommand): Promise<Drill> {
  return getAppHttpClient().post(
    drillsListPath(command.teamId),
    toCreateDrillDto(command),
    drillResponseSchema,
  );
}

export function requestUpdateDrill(command: UpdateDrillCommand): Promise<Drill> {
  return getAppHttpClient().patch(
    drillPath(command.teamId, command.drillId),
    toUpdateDrillDto(command),
    drillResponseSchema,
  );
}

/**
 * Retire a drill. No request body: the archive route is a bare lifecycle
 * transition, not a field write, so there is nothing to send but the id.
 */
export function requestArchiveDrill(command: ArchiveDrillCommand): Promise<Drill> {
  return getAppHttpClient().post(
    drillArchivePath(command.teamId, command.drillId),
    {},
    drillResponseSchema,
  );
}

import { DRILL_NEW_ID, DRILLS_PAGE_PARAMS } from '../constants/drills.constants';
import { getDrill } from '../services/get-drill.service';
import { listDrills } from '../services/list-drills.service';
import type { Drill, DrillsPage } from '../types/drills.types';
import { drillsQueryKeys } from './drills.keys';

/**
 * Query options for the bounded first page of the team's catalogue.
 * `enabled` guards the still-resolving team scope: a route rendered before
 * the active team is known must not fire a read at `/teams//drills`.
 */
export function buildDrillsListQueryOptions(teamId: string): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<DrillsPage>;
  readonly enabled: boolean;
} {
  return {
    queryKey: drillsQueryKeys.list(teamId),
    queryFn: (): Promise<DrillsPage> =>
      listDrills({ teamId, limit: DRILLS_PAGE_PARAMS.limit, offset: DRILLS_PAGE_PARAMS.offset }),
    enabled: teamId !== '',
  };
}

/**
 * Query options for one drill. `enabled` also excludes the `new` sentinel: the
 * create screen renders a blank form and must never fetch a drill that does
 * not exist.
 */
export function buildDrillQueryOptions(
  teamId: string,
  drillId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<Drill>;
  readonly enabled: boolean;
} {
  return {
    queryKey: drillsQueryKeys.detail(teamId, drillId),
    queryFn: (): Promise<Drill> => getDrill(teamId, drillId),
    enabled: teamId !== '' && drillId !== '' && drillId !== DRILL_NEW_ID,
  };
}

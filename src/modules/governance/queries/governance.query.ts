import { GOVERNANCE_PAGE_SIZE } from '../constants/governance.constants';
import { listGovernanceMeetings } from '../services/list-governance-meetings.service';
import { listGovernanceTasks } from '../services/list-governance-tasks.service';
import type { GovernanceMeetingsPage, GovernanceTasksPage } from '../types/governance.types';
import { governanceQueryKeys } from './governance.keys';

export function buildMeetingsQueryOptions(
  teamId: string,
  offset: number,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<GovernanceMeetingsPage>;
} {
  return {
    queryKey: governanceQueryKeys.meetings(teamId, offset),
    queryFn: (): Promise<GovernanceMeetingsPage> =>
      listGovernanceMeetings({ teamId, limit: GOVERNANCE_PAGE_SIZE, offset }),
  };
}

export function buildTasksQueryOptions(
  teamId: string,
  offset: number,
): { readonly queryKey: readonly unknown[]; readonly queryFn: () => Promise<GovernanceTasksPage> } {
  return {
    queryKey: governanceQueryKeys.tasks(teamId, offset),
    queryFn: (): Promise<GovernanceTasksPage> =>
      listGovernanceTasks({ teamId, limit: GOVERNANCE_PAGE_SIZE, offset }),
  };
}

import { getAppHttpClient } from '@/packages/http';

import {
  governanceMeetingPath,
  governanceMeetingsPath,
  governanceTaskPath,
  governanceTasksPath,
} from '../constants/governance-api.constants';
import {
  governanceMeetingResponseSchema,
  governanceTaskResponseSchema,
  listGovernanceMeetingsResponseSchema,
  listGovernanceTasksResponseSchema,
} from '../schemas/governance.schema';
import type {
  GovernanceMeeting,
  GovernanceMeetingsPage,
  GovernanceQuery,
  GovernanceTask,
  GovernanceTasksPage,
} from '../types/governance.types';

/** The meetings the caller may see — the server applies visibility, not the client. */
export function requestGovernanceMeetings(query: GovernanceQuery): Promise<GovernanceMeetingsPage> {
  return getAppHttpClient().get(
    governanceMeetingsPath(query.teamId),
    listGovernanceMeetingsResponseSchema,
    { params: { limit: query.limit, offset: query.offset } },
  );
}

export function requestGovernanceMeeting(
  teamId: string,
  meetingId: string,
): Promise<GovernanceMeeting> {
  return getAppHttpClient().get(
    governanceMeetingPath(teamId, meetingId),
    governanceMeetingResponseSchema,
  );
}

export function requestGovernanceTasks(query: GovernanceQuery): Promise<GovernanceTasksPage> {
  return getAppHttpClient().get(
    governanceTasksPath(query.teamId),
    listGovernanceTasksResponseSchema,
    { params: { limit: query.limit, offset: query.offset } },
  );
}

export function requestGovernanceTask(teamId: string, taskId: string): Promise<GovernanceTask> {
  return getAppHttpClient().get(governanceTaskPath(teamId, taskId), governanceTaskResponseSchema);
}

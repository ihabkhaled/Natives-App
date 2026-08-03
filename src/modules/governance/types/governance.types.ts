import type { SchemaOutput } from '@/packages/schema';

import type {
  MEETING_STATUSES,
  MEETING_VISIBILITIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../constants/governance.constants';
import type {
  governanceMeetingResponseSchema,
  governanceTaskResponseSchema,
  listGovernanceMeetingsResponseSchema,
  listGovernanceTasksResponseSchema,
} from '../schemas/governance.schema';

export type MeetingStatus = (typeof MEETING_STATUSES)[number];
export type MeetingVisibility = (typeof MEETING_VISIBILITIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type GovernanceMeeting = SchemaOutput<typeof governanceMeetingResponseSchema>;
export type GovernanceMeetingsPage = SchemaOutput<typeof listGovernanceMeetingsResponseSchema>;
export type GovernanceTask = SchemaOutput<typeof governanceTaskResponseSchema>;
export type GovernanceTasksPage = SchemaOutput<typeof listGovernanceTasksResponseSchema>;

/** One page request against a governance list. */
export interface GovernanceQuery {
  readonly teamId: string;
  readonly limit: number;
  readonly offset: number;
}

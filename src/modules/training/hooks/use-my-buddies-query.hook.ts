import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMyBuddiesQueryOptions } from '../queries/training.query';
import type { TrainingBuddyPage } from '../types/training.types';

/** Buddy credits waiting on (or answered by) the caller. */
export function useMyBuddiesQuery(teamId: string): RemoteQueryView<TrainingBuddyPage> {
  return toRemoteQueryView(useAppQuery<TrainingBuddyPage>(buildMyBuddiesQueryOptions(teamId)));
}

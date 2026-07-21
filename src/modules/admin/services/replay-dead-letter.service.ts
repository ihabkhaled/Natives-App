import { runRequest } from '@/shared/errors';

import { requestReplayEvent } from '../gateways/operations.gateway';

/** Use case: re-queue one dead-lettered event by id. */
export function replayDeadLetter(eventId: string): Promise<boolean> {
  return runRequest(async () => (await requestReplayEvent(eventId)).requeued);
}

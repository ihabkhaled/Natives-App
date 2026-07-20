import { requestTryout } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapTryoutEvent } from '../mappers/tryout.mapper';
import type { TryoutEvent } from '../types/tryouts.types';

/** Use case: one tryout event with its capacity and waitlist counts. */
export function getTryout(teamId: string, tryoutId: string): Promise<TryoutEvent> {
  return runRequest(async () => mapTryoutEvent(await requestTryout(teamId, tryoutId)));
}

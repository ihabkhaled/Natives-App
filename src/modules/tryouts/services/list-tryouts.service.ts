import { requestTryouts } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapTryoutEventPage } from '../mappers/tryout.mapper';
import type { TryoutEventPage } from '../types/tryouts.types';

/** Use case: one bounded page of the team tryout events. */
export function listTryouts(teamId: string): Promise<TryoutEventPage> {
  return runRequest(async () => mapTryoutEventPage(await requestTryouts(teamId)));
}

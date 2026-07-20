import { requestPublicTryoutEvents } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapTryoutEventPage } from '../mappers/tryout.mapper';
import type { TryoutEventPage } from '../types/tryouts.types';

/** Use case: the public list of tryout events open to registration. */
export function listPublicTryoutEvents(): Promise<TryoutEventPage> {
  return runRequest(async () => mapTryoutEventPage(await requestPublicTryoutEvents()));
}

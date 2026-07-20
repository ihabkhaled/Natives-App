import { requestOpponents } from '../gateways/competitions.gateway';
import { runRequest } from '@/shared/errors';
import { mapOpponentPage } from '../mappers/competition.mapper';
import type { OpponentPage } from '../types/competitions.types';

/** Use case: the team's opponent directory, without any contact detail. */
export function listOpponents(teamId: string): Promise<OpponentPage> {
  return runRequest(async () => mapOpponentPage(await requestOpponents(teamId)));
}

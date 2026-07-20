import { requestSquadSelections } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSelectionPage } from '../mappers/squad.mapper';
import type { SquadSelectionPage } from '../types/competitions.types';

/** Use case: the squad's current selections, including override provenance. */
export function listSquadSelections(teamId: string, squadId: string): Promise<SquadSelectionPage> {
  return runRequest(async () => mapSelectionPage(await requestSquadSelections(teamId, squadId)));
}

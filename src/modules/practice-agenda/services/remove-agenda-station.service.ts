import { requestStationRemoval } from '../gateways/practice-agenda.gateway';
import type { RemoveStationCommand } from '../types/practice-agenda.types';

/** Drop one station from a block of the plan. */
export function removeAgendaStation(command: RemoveStationCommand): Promise<void> {
  return requestStationRemoval(command);
}

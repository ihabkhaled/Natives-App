import { runRequest } from '@/shared/errors';

import { requestCreateDrill } from '../gateways/drills.gateway';
import type { CreateDrillCommand, Drill } from '../types/drills.types';

/** Use case: add a reusable drill to the team's catalogue. */
export function createDrill(command: CreateDrillCommand): Promise<Drill> {
  return runRequest(() => requestCreateDrill(command));
}

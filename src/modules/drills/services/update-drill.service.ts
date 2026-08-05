import { runRequest } from '@/shared/errors';

import { requestUpdateDrill } from '../gateways/drills.gateway';
import type { Drill, UpdateDrillCommand } from '../types/drills.types';

/** Use case: edit a catalogue drill, guarded by its optimistic version. */
export function updateDrill(command: UpdateDrillCommand): Promise<Drill> {
  return runRequest(() => requestUpdateDrill(command));
}

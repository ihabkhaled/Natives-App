import { runRequest } from '@/shared/errors';

import { requestDrill } from '../gateways/drills.gateway';
import type { Drill } from '../types/drills.types';

/** Use case: read one catalogue drill. */
export function getDrill(teamId: string, drillId: string): Promise<Drill> {
  return runRequest(() => requestDrill(teamId, drillId));
}

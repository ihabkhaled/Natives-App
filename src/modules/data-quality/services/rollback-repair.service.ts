import { requestRollbackRepair } from '../gateways/data-quality.gateway';
import type { Repair, RepairCommand } from '../types/data-quality.types';

/** Undoes an applied repair; only offered when the preview said it is reversible. */
export function rollbackRepair(command: RepairCommand): Promise<Repair> {
  return requestRollbackRepair(command);
}

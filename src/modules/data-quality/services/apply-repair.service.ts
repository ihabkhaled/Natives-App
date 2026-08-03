import { requestApplyRepair } from '../gateways/data-quality.gateway';
import type { Repair, RepairCommand } from '../types/data-quality.types';

/** Applies the previewed repair. Only reachable after the operator saw the impact. */
export function applyRepair(command: RepairCommand): Promise<Repair> {
  return requestApplyRepair(command);
}

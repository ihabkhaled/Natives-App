import { requestRepairPreview } from '../gateways/data-quality.gateway';
import type { RepairCommand, RepairPreview } from '../types/data-quality.types';

/** What the repair would change. A read: it never mutates anything. */
export function previewRepair(command: RepairCommand): Promise<RepairPreview> {
  return requestRepairPreview(command);
}

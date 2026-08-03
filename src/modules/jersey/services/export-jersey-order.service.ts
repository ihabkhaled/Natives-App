import { requestJerseyOrderSupplierExport } from '../gateways/jersey.gateway';
import type { JerseyOrderRef, SupplierExport } from '../types/jersey.types';

/**
 * The packing list for one order. Reading it changes nothing, but it is the
 * only read that returns members' printed names and numbers — so it is
 * requested for one order on demand, never for the whole list.
 */
export function exportJerseyOrder(ref: JerseyOrderRef): Promise<SupplierExport> {
  return requestJerseyOrderSupplierExport(ref);
}

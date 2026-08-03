import { requestJerseyOrder } from '../gateways/jersey.gateway';
import type { JerseyOrder, JerseyOrderRef } from '../types/jersey.types';

/**
 * The authoritative record for one order. The list is a snapshot; opening an
 * order re-reads it so the operator judges its current state, not the state it
 * had when the page loaded.
 */
export function getJerseyOrder(ref: JerseyOrderRef): Promise<JerseyOrder> {
  return requestJerseyOrder(ref);
}

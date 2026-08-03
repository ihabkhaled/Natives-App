import { requestJerseyInventory } from '../gateways/jersey.gateway';
import type { JerseyInventoryPage, JerseyPageQuery } from '../types/jersey.types';

/** One page of stock levels, keyed by product and size. */
export function listJerseyInventory(query: JerseyPageQuery): Promise<JerseyInventoryPage> {
  return requestJerseyInventory(query);
}

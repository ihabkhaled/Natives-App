import { requestJerseyOrders } from '../gateways/jersey.gateway';
import type { JerseyOrdersPage, JerseyPageQuery } from '../types/jersey.types';

/** One page of supplier orders. */
export function listJerseyOrders(query: JerseyPageQuery): Promise<JerseyOrdersPage> {
  return requestJerseyOrders(query);
}

import { requestJerseyProducts } from '../gateways/jersey.gateway';
import type { JerseyPageQuery, JerseyProductsPage } from '../types/jersey.types';

/** One page of the team's apparel catalogue, as the server orders it. */
export function listJerseyProducts(query: JerseyPageQuery): Promise<JerseyProductsPage> {
  return requestJerseyProducts(query);
}

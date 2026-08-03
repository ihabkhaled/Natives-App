import { JERSEY_ORDER_PAGE_SIZE } from '../constants/jersey.constants';
import { listJerseyOrders } from '../services/list-jersey-orders.service';
import type { JerseyOrdersPage } from '../types/jersey.types';
import { jerseyQueryKeys } from './jersey.keys';

/** Query options for one page of supplier orders. */
export function buildJerseyOrdersQueryOptions(
  teamId: string,
  offset: number,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<JerseyOrdersPage>;
} {
  return {
    queryKey: jerseyQueryKeys.orders(teamId, offset),
    queryFn: (): Promise<JerseyOrdersPage> =>
      listJerseyOrders({ teamId, limit: JERSEY_ORDER_PAGE_SIZE, offset }),
  };
}

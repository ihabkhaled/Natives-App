import { describe, expect, it, vi } from 'vitest';

import { JERSEY_ORDER_PAGE_SIZE } from '../constants/jersey.constants';
import { jerseyQueryKeys } from './jersey.keys';
import { buildJerseyOrdersQueryOptions } from './jersey.query';

vi.mock('../services/list-jersey-orders.service', () => ({
  listJerseyOrders: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
}));

describe('buildJerseyOrdersQueryOptions', () => {
  it('keys the read by team and page offset', () => {
    expect(buildJerseyOrdersQueryOptions('t1', 20).queryKey).toEqual(
      jerseyQueryKeys.orders('t1', 20),
    );
  });

  it('asks for exactly one page', async () => {
    const { listJerseyOrders } = await import('../services/list-jersey-orders.service');
    await buildJerseyOrdersQueryOptions('t1', 40).queryFn();

    expect(listJerseyOrders).toHaveBeenCalledWith({
      teamId: 't1',
      limit: JERSEY_ORDER_PAGE_SIZE,
      offset: 40,
    });
  });
});

describe('jerseyQueryKeys', () => {
  it('scopes every key under the team so switching teams cannot reuse a cache', () => {
    expect(jerseyQueryKeys.orders('t1', 0)).toEqual(['jersey', 'team', 't1', 'orders', 0]);
    expect(jerseyQueryKeys.order('t1', 'o1')).toEqual(['jersey', 'team', 't1', 'order', 'o1']);
    expect(jerseyQueryKeys.all).toEqual(['jersey']);
  });

  it('keeps the packing list on its own branch, away from the order record', () => {
    // Refreshing an order must not silently re-fetch the personal data in it.
    expect(jerseyQueryKeys.supplierExport('t1', 'o1')).not.toEqual(
      jerseyQueryKeys.order('t1', 'o1'),
    );
    expect(jerseyQueryKeys.supplierExport('t1', 'o1')).toContain('supplier-export');
  });
});

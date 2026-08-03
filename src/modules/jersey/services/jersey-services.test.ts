import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/jersey.gateway';
import { addJerseyOrderItem } from './add-jersey-order-item.service';
import { createJerseyOrder } from './create-jersey-order.service';
import { exportJerseyOrder } from './export-jersey-order.service';
import { getJerseyOrder } from './get-jersey-order.service';
import { listJerseyInventory } from './list-jersey-inventory.service';
import { listJerseyOrders } from './list-jersey-orders.service';
import { listJerseyProducts } from './list-jersey-products.service';

vi.mock('../gateways/jersey.gateway', () => ({
  requestJerseyProducts: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
  requestJerseyInventory: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
  requestJerseyOrders: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
  requestJerseyOrder: vi.fn().mockResolvedValue({}),
  requestCreateJerseyOrder: vi.fn().mockResolvedValue({}),
  requestAddJerseyOrderItem: vi.fn().mockResolvedValue({}),
  requestJerseyOrderSupplierExport: vi.fn().mockResolvedValue({ lines: [] }),
}));

const PAGE = { teamId: 't1', limit: 20, offset: 0 };
const REF = { teamId: 't1', orderId: 'o1' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('jersey services', () => {
  it('lists the catalogue, the stock and the orders through their own use cases', async () => {
    await listJerseyProducts(PAGE);
    await listJerseyInventory(PAGE);
    await listJerseyOrders(PAGE);

    expect(gateway.requestJerseyProducts).toHaveBeenCalledWith(PAGE);
    expect(gateway.requestJerseyInventory).toHaveBeenCalledWith(PAGE);
    expect(gateway.requestJerseyOrders).toHaveBeenCalledWith(PAGE);
  });

  it('re-reads one order rather than trusting the list snapshot', async () => {
    await getJerseyOrder(REF);

    expect(gateway.requestJerseyOrder).toHaveBeenCalledWith(REF);
  });

  it('opens a draft order for the season it belongs to', async () => {
    await createJerseyOrder({
      teamId: 't1',
      seasonId: 's1',
      reference: 'UN-2026-HOME',
      supplier: null,
      notes: null,
    });

    expect(gateway.requestCreateJerseyOrder).toHaveBeenCalledOnce();
  });

  it('adds a line straight through, personalization included', async () => {
    await addJerseyOrderItem({
      ...REF,
      productId: 'p1',
      size: 'l',
      quantity: 1,
      membershipId: null,
      printedName: 'NOUR',
      number: 12,
    });

    expect(gateway.requestAddJerseyOrderItem).toHaveBeenCalledOnce();
  });

  it('pulls the packing list for one order only', async () => {
    await exportJerseyOrder(REF);

    expect(gateway.requestJerseyOrderSupplierExport).toHaveBeenCalledWith(REF);
  });
});

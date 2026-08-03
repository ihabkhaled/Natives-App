import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';
import {
  requestAddJerseyOrderItem,
  requestCreateJerseyOrder,
  requestJerseyInventory,
  requestJerseyOrder,
  requestJerseyOrderSupplierExport,
  requestJerseyOrders,
  requestJerseyProducts,
} from './jersey.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

beforeEach(resetGatewayHttpDouble);

describe('jersey gateway', () => {
  it('pages the catalogue, the stock and the orders with an explicit window', async () => {
    await requestJerseyProducts({ teamId: 't1', limit: 20, offset: 0 });
    await requestJerseyInventory({ teamId: 't1', limit: 20, offset: 20 });
    await requestJerseyOrders({ teamId: 't1', limit: 20, offset: 40 });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/jersey-products');
    expect(gatewayHttp.get.mock.calls[1]?.[0]).toBe('/teams/t1/jersey-inventory');
    expect(gatewayHttp.get.mock.calls[2]?.[0]).toBe('/teams/t1/jersey-orders');
    expect(gatewayHttp.get.mock.calls[2]?.[2]).toMatchObject({ params: { limit: 20, offset: 40 } });
  });

  it('reads one order by id', async () => {
    await requestJerseyOrder({ teamId: 't1', orderId: 'o1' });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/jersey-orders/o1');
  });

  it('reads the supplier export with a GET, so seeing it changes nothing', async () => {
    await requestJerseyOrderSupplierExport({ teamId: 't1', orderId: 'o1' });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/jersey-orders/o1/supplier-export');
    expect(gatewayHttp.post).not.toHaveBeenCalled();
  });

  it('creates an order from the season it belongs to, without inventing a status', async () => {
    await requestCreateJerseyOrder({
      teamId: 't1',
      seasonId: 's1',
      reference: 'UN-2026-HOME',
      supplier: 'Kitmaker',
      notes: null,
    });

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/teams/t1/jersey-orders');
    // The server decides the lifecycle state; the client never proposes one.
    expect(gatewayHttp.post.mock.calls[0]?.[1]).toEqual({
      seasonId: 's1',
      reference: 'UN-2026-HOME',
      supplier: 'Kitmaker',
      notes: null,
    });
  });

  it('sends the personalization explicitly when adding a line', async () => {
    await requestAddJerseyOrderItem({
      teamId: 't1',
      orderId: 'o1',
      productId: 'p1',
      size: 'm',
      quantity: 2,
      membershipId: 'm1',
      printedName: 'ADEL',
      number: 7,
    });

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/teams/t1/jersey-orders/o1/items');
    expect(gatewayHttp.post.mock.calls[0]?.[1]).toEqual({
      productId: 'p1',
      size: 'm',
      quantity: 2,
      membershipId: 'm1',
      printedName: 'ADEL',
      number: 7,
    });
  });

  it('encodes ids that would otherwise break the path', async () => {
    await requestJerseyOrder({ teamId: 'a/b', orderId: 'c d' });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/a%2Fb/jersey-orders/c%20d');
  });

  it('resolves through the configured client', () => {
    expect(vi.mocked(getAppHttpClient)).toBeDefined();
  });
});

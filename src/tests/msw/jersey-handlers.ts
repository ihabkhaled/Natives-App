import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import {
  MOCK_JERSEY_EXPORT_LINES,
  MOCK_JERSEY_INVENTORY,
  MOCK_JERSEY_ORDERS,
  MOCK_JERSEY_PRODUCTS,
} from './jersey.fixture';
import { apiUrl, failRequest, pathParam, readJsonBody, readPaging } from './mock-request.helper';
import { has } from './persona-permissions.helper';

const TEAM_BASE = '/teams/:teamId';

/** The line body a caller posts; every field but the product and size is optional. */
interface AddItemBody {
  readonly productId?: string;
  readonly size?: string;
  readonly quantity?: number;
  readonly membershipId?: string | null;
  readonly printedName?: string | null;
  readonly number?: number | null;
}

/** One bounded page of a fixture list, mirroring the API's own envelope. */
function pagedResponse(request: Request, items: readonly unknown[]): Response {
  const { limit, offset } = readPaging(request);
  return HttpResponse.json({
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  });
}

/**
 * NestJS-shaped jersey handlers.
 *
 * The grant split is the contract's, not a client invention: reading products,
 * stock and orders is `jersey.read`, while creating an order, adding a line,
 * and pulling the supplier export — the only response carrying members'
 * printed names — all require `jersey.manage`.
 */
export const jerseyHandlers = [
  http.get(apiUrl(`${TEAM_BASE}/jersey-products`), ({ request }) =>
    has(request, PERMISSIONS.jerseyRead)
      ? pagedResponse(request, MOCK_JERSEY_PRODUCTS)
      : failRequest(403, 'FORBIDDEN', '/jersey-products'),
  ),
  http.get(apiUrl(`${TEAM_BASE}/jersey-inventory`), ({ request }) =>
    has(request, PERMISSIONS.jerseyRead)
      ? pagedResponse(request, MOCK_JERSEY_INVENTORY)
      : failRequest(403, 'FORBIDDEN', '/jersey-inventory'),
  ),
  http.get(apiUrl(`${TEAM_BASE}/jersey-orders`), ({ request }) =>
    has(request, PERMISSIONS.jerseyRead)
      ? pagedResponse(request, MOCK_JERSEY_ORDERS)
      : failRequest(403, 'FORBIDDEN', '/jersey-orders'),
  ),
  http.post(apiUrl(`${TEAM_BASE}/jersey-orders`), async ({ request }) => {
    if (!has(request, PERMISSIONS.jerseyManage)) {
      return failRequest(403, 'FORBIDDEN', '/jersey-orders');
    }
    const body = await readJsonBody<{ reference?: string; supplier?: string | null }>(request);
    // A new order is always a draft: the API refuses to open one in any other
    // state, and the mock must not pretend otherwise.
    return HttpResponse.json(
      {
        ...MOCK_JERSEY_ORDERS[0],
        orderId: 'order-new',
        reference: body.reference ?? 'UN-DRAFT',
        supplier: body.supplier ?? null,
        status: 'draft',
        recordVersion: 1,
      },
      { status: 201 },
    );
  }),
  http.get(apiUrl(`${TEAM_BASE}/jersey-orders/:orderId`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.jerseyRead)) {
      return failRequest(403, 'FORBIDDEN', '/jersey-orders/:orderId');
    }
    const orderId = pathParam(params, 'orderId');
    const found = MOCK_JERSEY_ORDERS.find((order) => order.orderId === orderId);
    return found === undefined
      ? failRequest(404, 'NOT_FOUND', '/jersey-orders/:orderId')
      : HttpResponse.json(found);
  }),
  http.post(apiUrl(`${TEAM_BASE}/jersey-orders/:orderId/items`), async ({ request, params }) => {
    if (!has(request, PERMISSIONS.jerseyManage)) {
      return failRequest(403, 'FORBIDDEN', '/jersey-orders/:orderId/items');
    }
    const body = await readJsonBody<AddItemBody>(request);
    return HttpResponse.json(buildItem(pathParam(params, 'orderId'), body), { status: 201 });
  }),
  http.get(apiUrl(`${TEAM_BASE}/jersey-orders/:orderId/supplier-export`), ({ request, params }) =>
    has(request, PERMISSIONS.jerseyManage)
      ? HttpResponse.json({
          orderId: pathParam(params, 'orderId'),
          reference: MOCK_JERSEY_ORDERS[1]?.reference ?? 'UN-2026-HOME',
          lines: MOCK_JERSEY_EXPORT_LINES,
        })
      : failRequest(403, 'FORBIDDEN', '/jersey-orders/:orderId/supplier-export'),
  ),
];

/** The line the API echoes back, with its server-assigned defaults filled in. */
function buildItem(orderId: string, body: AddItemBody): Record<string, unknown> {
  return {
    itemId: 'item-new',
    orderId,
    productId: body.productId ?? 'product-1',
    membershipId: body.membershipId ?? null,
    kitType: 'home',
    size: body.size ?? 'm',
    sleeves: 'short',
    division: 'open',
    printedName: body.printedName ?? null,
    number: body.number ?? null,
    quantity: body.quantity ?? 1,
    createdAt: '2026-08-02T09:00:00.000Z',
  };
}

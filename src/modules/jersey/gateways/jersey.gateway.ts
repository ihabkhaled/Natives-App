import { getAppHttpClient } from '@/packages/http';

import {
  jerseyInventoryPath,
  jerseyOrderItemsPath,
  jerseyOrderPath,
  jerseyOrderSupplierExportPath,
  jerseyOrdersPath,
  jerseyProductsPath,
} from '../constants/jersey-api.constants';
import {
  jerseyOrderItemResponseSchema,
  jerseyOrderResponseSchema,
  listJerseyInventoryResponseSchema,
  listJerseyOrdersResponseSchema,
  listJerseyProductsResponseSchema,
  supplierExportResponseSchema,
} from '../schemas/jersey.schema';
import type {
  AddJerseyOrderItemCommand,
  CreateJerseyOrderCommand,
  JerseyInventoryPage,
  JerseyOrder,
  JerseyOrderItem,
  JerseyOrderRef,
  JerseyOrdersPage,
  JerseyPageQuery,
  JerseyProductsPage,
  SupplierExport,
} from '../types/jersey.types';

function pageParams(query: JerseyPageQuery): { params: { limit: number; offset: number } } {
  return { params: { limit: query.limit, offset: query.offset } };
}

export function requestJerseyProducts(query: JerseyPageQuery): Promise<JerseyProductsPage> {
  return getAppHttpClient().get(
    jerseyProductsPath(query.teamId),
    listJerseyProductsResponseSchema,
    pageParams(query),
  );
}

export function requestJerseyInventory(query: JerseyPageQuery): Promise<JerseyInventoryPage> {
  return getAppHttpClient().get(
    jerseyInventoryPath(query.teamId),
    listJerseyInventoryResponseSchema,
    pageParams(query),
  );
}

export function requestJerseyOrders(query: JerseyPageQuery): Promise<JerseyOrdersPage> {
  return getAppHttpClient().get(
    jerseyOrdersPath(query.teamId),
    listJerseyOrdersResponseSchema,
    pageParams(query),
  );
}

/** The authoritative record for one order, re-read when it is opened. */
export function requestJerseyOrder(ref: JerseyOrderRef): Promise<JerseyOrder> {
  return getAppHttpClient().get(
    jerseyOrderPath(ref.teamId, ref.orderId),
    jerseyOrderResponseSchema,
  );
}

/** Creates a draft. A draft commits the team to nothing until it is submitted. */
export function requestCreateJerseyOrder(command: CreateJerseyOrderCommand): Promise<JerseyOrder> {
  return getAppHttpClient().post(
    jerseyOrdersPath(command.teamId),
    {
      seasonId: command.seasonId,
      reference: command.reference,
      supplier: command.supplier,
      notes: command.notes,
    },
    jerseyOrderResponseSchema,
  );
}

/**
 * Adds one line to a draft order. The backend refuses this once the order has
 * left draft, and no route removes a line again, so a line added here is a
 * line the team is committed to.
 */
export function requestAddJerseyOrderItem(
  command: AddJerseyOrderItemCommand,
): Promise<JerseyOrderItem> {
  return getAppHttpClient().post(
    jerseyOrderItemsPath(command.teamId, command.orderId),
    {
      productId: command.productId,
      size: command.size,
      quantity: command.quantity,
      membershipId: command.membershipId,
      printedName: command.printedName,
      number: command.number,
    },
    jerseyOrderItemResponseSchema,
  );
}

/**
 * The packing list an outside supplier receives. A GET — reading it changes
 * nothing — but a privileged one: it is the only route that returns members'
 * printed names and numbers.
 */
export function requestJerseyOrderSupplierExport(ref: JerseyOrderRef): Promise<SupplierExport> {
  return getAppHttpClient().get(
    jerseyOrderSupplierExportPath(ref.teamId, ref.orderId),
    supplierExportResponseSchema,
  );
}

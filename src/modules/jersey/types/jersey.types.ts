import type { SchemaOutput } from '@/packages/schema';

import type { JERSEY_ORDER_STATUSES, JERSEY_SIZES } from '../constants/jersey.constants';
import type {
  jerseyInventoryResponseSchema,
  jerseyOrderItemResponseSchema,
  jerseyOrderResponseSchema,
  jerseyProductResponseSchema,
  listJerseyInventoryResponseSchema,
  listJerseyOrdersResponseSchema,
  listJerseyProductsResponseSchema,
  supplierExportLineSchema,
  supplierExportResponseSchema,
} from '../schemas/jersey.schema';

/**
 * Only the two dimensions the client reasons about have a named type: the
 * lifecycle it tones by, and the size a line is ordered in. The rest of the
 * enumerations live in the schema, where they are validated but never branched
 * on — naming them here would imply a decision the client does not make.
 */
export type JerseyOrderStatus = (typeof JERSEY_ORDER_STATUSES)[number];
export type JerseySize = (typeof JERSEY_SIZES)[number];

export type JerseyProduct = SchemaOutput<typeof jerseyProductResponseSchema>;
export type JerseyProductsPage = SchemaOutput<typeof listJerseyProductsResponseSchema>;
export type JerseyInventoryEntry = SchemaOutput<typeof jerseyInventoryResponseSchema>;
export type JerseyInventoryPage = SchemaOutput<typeof listJerseyInventoryResponseSchema>;
export type JerseyOrder = SchemaOutput<typeof jerseyOrderResponseSchema>;
export type JerseyOrdersPage = SchemaOutput<typeof listJerseyOrdersResponseSchema>;
export type JerseyOrderItem = SchemaOutput<typeof jerseyOrderItemResponseSchema>;
export type SupplierExportLine = SchemaOutput<typeof supplierExportLineSchema>;
export type SupplierExport = SchemaOutput<typeof supplierExportResponseSchema>;

/** One bounded page request against any team-scoped jersey list. */
export interface JerseyPageQuery {
  readonly teamId: string;
  readonly limit: number;
  readonly offset: number;
}

/** The pair that identifies one order everywhere below the list. */
export interface JerseyOrderRef {
  readonly teamId: string;
  readonly orderId: string;
}

/**
 * A new draft order. `seasonId` comes from the caller's active team scope
 * rather than a picker: an order always belongs to the season being worked on.
 */
export interface CreateJerseyOrderCommand {
  readonly teamId: string;
  readonly seasonId: string;
  readonly reference: string;
  readonly supplier: string | null;
  readonly notes: string | null;
}

/**
 * One line added to a draft order. `printedName` and `number` are the
 * personalization the supplier export later reveals, so they are named
 * explicitly here rather than travelling inside an opaque payload.
 */
export interface AddJerseyOrderItemCommand {
  readonly teamId: string;
  readonly orderId: string;
  readonly productId: string;
  readonly size: JerseySize;
  readonly quantity: number;
  readonly membershipId: string | null;
  readonly printedName: string | null;
  readonly number: number | null;
}

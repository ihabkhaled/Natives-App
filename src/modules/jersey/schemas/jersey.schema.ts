import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  JERSEY_DIVISIONS,
  JERSEY_KIT_TYPES,
  JERSEY_ORDER_STATUSES,
  JERSEY_PAYMENT_STATUSES,
  JERSEY_PRODUCT_STATUSES,
  JERSEY_SIZES,
  JERSEY_SLEEVES,
} from '../constants/jersey.constants';

/**
 * Wire contracts for team apparel, shared by remote NestJS mode and MSW mock
 * mode.
 *
 * `name`, `productKey`, `reference` and `supplier` are server-authored strings
 * rendered verbatim; only the lifecycle and garment dimensions are enumerated,
 * because the screen orders, tones and joins on those.
 */
export const jerseyProductResponseSchema = schemaBuilder.object({
  productId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  productKey: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  kitType: schemaBuilder.enum(JERSEY_KIT_TYPES),
  supplier: schemaBuilder.string().nullable(),
  customizable: schemaBuilder.boolean(),
  status: schemaBuilder.enum(JERSEY_PRODUCT_STATUSES),
  createdBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listJerseyProductsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(jerseyProductResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * Stock for one product in one size. `onHand` is what the cupboard holds now;
 * `issued` and `returned` are cumulative movements, not a current balance, so
 * they are never subtracted from each other here.
 */
export const jerseyInventoryResponseSchema = schemaBuilder.object({
  inventoryId: schemaBuilder.string().min(1),
  productId: schemaBuilder.string().min(1),
  size: schemaBuilder.enum(JERSEY_SIZES),
  kitType: schemaBuilder.enum(JERSEY_KIT_TYPES),
  onHand: schemaBuilder.number().int().nonnegative(),
  issued: schemaBuilder.number().int().nonnegative(),
  returned: schemaBuilder.number().int().nonnegative(),
  recordVersion: schemaBuilder.number().int().positive(),
  updatedAt: isoInstantField,
});

export const listJerseyInventoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(jerseyInventoryResponseSchema),
  ...pagedEnvelopeFields,
});

export const jerseyOrderResponseSchema = schemaBuilder.object({
  orderId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  reference: schemaBuilder.string().min(1),
  supplier: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(JERSEY_ORDER_STATUSES),
  paymentStatus: schemaBuilder.enum(JERSEY_PAYMENT_STATUSES),
  external: schemaBuilder.boolean(),
  notes: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  createdBy: schemaBuilder.string().nullable(),
  completedAt: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listJerseyOrdersResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(jerseyOrderResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * One line of an order. `membershipId` ties the line to a person, which is why
 * it is present here and deliberately absent from the supplier export below.
 */
export const jerseyOrderItemResponseSchema = schemaBuilder.object({
  itemId: schemaBuilder.string().min(1),
  orderId: schemaBuilder.string().min(1),
  productId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().nullable(),
  kitType: schemaBuilder.enum(JERSEY_KIT_TYPES),
  size: schemaBuilder.enum(JERSEY_SIZES),
  sleeves: schemaBuilder.enum(JERSEY_SLEEVES),
  division: schemaBuilder.enum(JERSEY_DIVISIONS),
  printedName: schemaBuilder.string().nullable(),
  number: schemaBuilder.number().int().nonnegative().nullable(),
  quantity: schemaBuilder.number().int().positive(),
  createdAt: isoInstantField,
});

/**
 * What the supplier is allowed to see: the garment, and the name and number to
 * print on it. No membership id, no contact detail — the backend strips the
 * identity and the client must not put it back.
 */
export const supplierExportLineSchema = schemaBuilder.object({
  productName: schemaBuilder.string().min(1),
  kitType: schemaBuilder.enum(JERSEY_KIT_TYPES),
  size: schemaBuilder.enum(JERSEY_SIZES),
  sleeves: schemaBuilder.enum(JERSEY_SLEEVES),
  printedName: schemaBuilder.string().nullable(),
  number: schemaBuilder.number().int().nonnegative().nullable(),
  quantity: schemaBuilder.number().int().positive(),
});

export const supplierExportResponseSchema = schemaBuilder.object({
  orderId: schemaBuilder.string().min(1),
  reference: schemaBuilder.string().min(1),
  lines: schemaBuilder.array(supplierExportLineSchema),
});

import type {
  JerseyInventoryEntry,
  JerseyOrder,
  JerseyProduct,
  SupplierExportLine,
} from '@/modules/jersey';

/**
 * The apparel catalogue: one customizable match kit and one plain training
 * top, plus a retired product — an archived item still appears on old orders,
 * so the screen has to cope with one.
 */
export const MOCK_JERSEY_PRODUCTS: readonly JerseyProduct[] = [
  {
    productId: 'product-1',
    teamId: 'team-1',
    seasonId: 'season-1',
    productKey: 'home-2026',
    name: 'Home jersey 2026',
    kitType: 'home',
    supplier: 'Kitmaker Cairo',
    customizable: true,
    status: 'active',
    createdBy: 'user-1',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    productId: 'product-2',
    teamId: 'team-1',
    seasonId: 'season-1',
    productKey: 'training-2026',
    name: 'Training top 2026',
    kitType: 'training',
    supplier: 'Kitmaker Cairo',
    customizable: false,
    status: 'active',
    createdBy: 'user-1',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    productId: 'product-3',
    teamId: 'team-1',
    seasonId: null,
    productKey: 'away-2025',
    name: 'Away jersey 2025',
    kitType: 'away',
    supplier: null,
    customizable: true,
    status: 'archived',
    createdBy: null,
    createdAt: '2025-02-01T09:00:00.000Z',
    updatedAt: '2025-11-01T09:00:00.000Z',
  },
];

/** Stock the team already holds, per product and size. */
export const MOCK_JERSEY_INVENTORY: readonly JerseyInventoryEntry[] = [
  {
    inventoryId: 'inventory-1',
    productId: 'product-1',
    size: 'm',
    kitType: 'home',
    onHand: 6,
    issued: 14,
    returned: 2,
    recordVersion: 3,
    updatedAt: '2026-07-20T09:00:00.000Z',
  },
  {
    inventoryId: 'inventory-2',
    productId: 'product-1',
    size: 'l',
    kitType: 'home',
    onHand: 0,
    issued: 9,
    returned: 0,
    recordVersion: 2,
    updatedAt: '2026-07-20T09:00:00.000Z',
  },
  {
    inventoryId: 'inventory-3',
    productId: 'product-2',
    size: 's',
    kitType: 'training',
    onHand: 11,
    issued: 3,
    returned: 1,
    recordVersion: 1,
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
];

/**
 * Three orders across the lifecycle, deliberately out of chronological order
 * in the fixture so anything that renders them has to sort rather than
 * inherit the array.
 */
export const MOCK_JERSEY_ORDERS: readonly JerseyOrder[] = [
  {
    orderId: 'order-2',
    teamId: 'team-1',
    seasonId: 'season-1',
    reference: 'UN-2026-TRAINING',
    supplier: 'Kitmaker Cairo',
    status: 'draft',
    paymentStatus: 'unset',
    external: false,
    notes: null,
    recordVersion: 1,
    createdBy: 'user-1',
    completedAt: null,
    createdAt: '2026-07-28T09:00:00.000Z',
    updatedAt: '2026-07-28T09:00:00.000Z',
  },
  {
    orderId: 'order-1',
    teamId: 'team-1',
    seasonId: 'season-1',
    reference: 'UN-2026-HOME',
    supplier: 'Kitmaker Cairo',
    status: 'ordered',
    paymentStatus: 'partial',
    external: false,
    notes: 'Numbers confirmed with the captains.',
    recordVersion: 4,
    createdBy: 'user-1',
    completedAt: null,
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
  },
  {
    orderId: 'order-3',
    teamId: 'team-1',
    seasonId: 'season-1',
    reference: 'UN-2025-AWAY',
    supplier: null,
    status: 'completed',
    paymentStatus: 'paid',
    external: true,
    notes: null,
    recordVersion: 7,
    createdBy: null,
    completedAt: '2025-12-01T09:00:00.000Z',
    createdAt: '2025-10-01T09:00:00.000Z',
    updatedAt: '2025-12-01T09:00:00.000Z',
  },
];

/**
 * The packing list for `order-1`: two personalized shirts and one anonymous
 * spare, so a consumer sees both the lines that carry a member's identity to
 * the supplier and the ones that do not.
 */
export const MOCK_JERSEY_EXPORT_LINES: readonly SupplierExportLine[] = [
  {
    productName: 'Home jersey 2026',
    kitType: 'home',
    size: 'm',
    sleeves: 'short',
    printedName: 'ADEL',
    number: 7,
    quantity: 1,
  },
  {
    productName: 'Home jersey 2026',
    kitType: 'home',
    size: 'l',
    sleeves: 'long',
    printedName: 'NOUR',
    number: 12,
    quantity: 1,
  },
  {
    productName: 'Home jersey 2026',
    kitType: 'home',
    size: 'xl',
    sleeves: 'short',
    printedName: null,
    number: null,
    quantity: 4,
  },
];

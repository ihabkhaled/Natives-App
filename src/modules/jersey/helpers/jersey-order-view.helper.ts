import { formatCairoDate } from '@/packages/date';

import type { JerseyOrder, JerseyOrderStatus, JerseyOrdersPage } from '../types/jersey.types';
import type { JerseyOrderRowView } from '../types/jersey-view.types';

/**
 * Tone per lifecycle state. Colour carries the one thing an operator scans
 * for: whether the order still needs someone to act. Everything from
 * `submitted` to `ordered` is waiting on a human, `cancelled` is a dead end,
 * and `completed` is done.
 */
const STATUS_TONES: Readonly<Record<JerseyOrderStatus, string>> = {
  draft: 'medium',
  submitted: 'warning',
  approved: 'warning',
  ordered: 'warning',
  received: 'primary',
  issued: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

/** Which colour one lifecycle state wears, wherever it is rendered. */
export function resolveJerseyOrderStatusTone(status: JerseyOrderStatus): string {
  return STATUS_TONES[status];
}

/**
 * Newest first, exactly as the screen promises. Ties break on the order id so
 * two orders created in the same second never swap places between renders.
 */
function byNewestFirst(left: JerseyOrder, right: JerseyOrder): number {
  const byCreated = right.createdAt.localeCompare(left.createdAt);
  return byCreated === 0 ? left.orderId.localeCompare(right.orderId) : byCreated;
}

/** What the caller may do with the list, decided once for every row. */
interface JerseyRowContext {
  /** Opening an order reveals members' printed names, so it needs `jersey.manage`. */
  readonly canOpen: boolean;
  readonly openOrderId: string;
}

/**
 * The orders list as rows.
 *
 * A row carries nothing personal: reference, supplier and lifecycle state are
 * team facts. The names and numbers live one level down, behind the manage
 * grant, so a `jersey.read` holder can track an order without reading who is
 * in it.
 */
export function buildJerseyOrderRowViews(
  locale: string,
  orders: readonly JerseyOrder[],
  context: JerseyRowContext,
): readonly JerseyOrderRowView[] {
  return [...orders].sort(byNewestFirst).map((order) => ({
    id: order.orderId,
    reference: order.reference,
    statusLabel: order.status,
    statusTone: resolveJerseyOrderStatusTone(order.status),
    supplier: order.supplier,
    placedLabel: formatCairoDate(order.createdAt, locale),
    canOpen: context.canOpen,
    isOpen: context.canOpen && context.openOrderId === order.orderId,
  }));
}

/**
 * The page's items and total, defaulted once so the screen reads neither
 * twice. The total is the server's, not the page length: a bounded page of 20
 * must never be reported as the whole history.
 */
export function resolveJerseyOrdersPage(page: JerseyOrdersPage | undefined): {
  readonly items: readonly JerseyOrder[];
  readonly total: number;
} {
  return {
    items: page?.items ?? [],
    total: page?.total ?? 0,
  };
}

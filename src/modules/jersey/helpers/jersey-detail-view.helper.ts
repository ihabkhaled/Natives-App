import type { JerseyOrder, SupplierExportLine } from '../types/jersey.types';
import type { JerseyOrderDetailView, JerseyOrderRowView } from '../types/jersey-view.types';
import { buildJerseyOrderLineViews } from './jersey-export-view.helper';
import { resolveJerseyOrderStatusTone } from './jersey-order-view.helper';

/** Everything the opened order's panel is assembled from. */
interface JerseyDetailViewInput {
  readonly locale: string;
  readonly loadingLabel: string;
  /** The row that was opened, or null when nothing is open. */
  readonly row: JerseyOrderRowView | null;
  /** The freshly re-read record; undefined until it lands. */
  readonly order: JerseyOrder | undefined;
  readonly lines: readonly SupplierExportLine[];
  readonly isLoading: boolean;
}

/**
 * The opened order's panel.
 *
 * The row's own values stand in until the fresh record arrives, so the panel
 * has a real heading to be labelled by from the first frame. Once the record
 * lands it wins outright: the list is a snapshot, and an order an operator has
 * deliberately opened should be judged on what the server says right now.
 */
export function buildJerseyOrderDetailView(
  input: JerseyDetailViewInput,
): JerseyOrderDetailView | null {
  const row = input.row;
  if (row === null) {
    return null;
  }
  const order = input.order;
  return {
    orderId: row.id,
    reference: order?.reference ?? row.reference,
    statusLabel: order?.status ?? row.statusLabel,
    statusTone: order === undefined ? row.statusTone : resolveJerseyOrderStatusTone(order.status),
    isLoading: input.isLoading,
    loadingLabel: input.loadingLabel,
    lines: buildJerseyOrderLineViews(input.locale, input.lines),
  };
}

import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** One row of the orders list. Everything here is safe for a `jersey.read` holder. */
export interface JerseyOrderRowView {
  readonly id: string;
  readonly reference: string;
  /** Server-authored lifecycle token; see the README on pending copy. */
  readonly statusLabel: string;
  readonly statusTone: string;
  /** Absent rather than blank when the order has no supplier yet. */
  readonly supplier: string | null;
  readonly placedLabel: string;
  /** False without `jersey.manage` — opening reveals members' printed names. */
  readonly canOpen: boolean;
  readonly isOpen: boolean;
}

/**
 * One line of the supplier packing list. `personalization` is null for a plain
 * stock line, which is what makes a personalized line visible at a glance.
 */
export interface JerseyOrderLineView {
  readonly id: string;
  readonly productName: string;
  readonly kitLabel: string;
  readonly sizeLabel: string;
  readonly sleevesLabel: string;
  readonly quantityLabel: string;
  readonly personalization: string | null;
}

/** The opened order: its authoritative record plus the lines it contains. */
export interface JerseyOrderDetailView {
  readonly orderId: string;
  readonly reference: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly lines: readonly JerseyOrderLineView[];
}

export interface JerseyScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly countLabel: string;
  readonly notice: string | null;
  readonly rows: readonly JerseyOrderRowView[];
  readonly onToggleOrder: (orderId: string) => void;
  readonly detail: JerseyOrderDetailView | null;
}

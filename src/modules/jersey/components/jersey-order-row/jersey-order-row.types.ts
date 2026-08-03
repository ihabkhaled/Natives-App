import type { JerseyOrderDetailView, JerseyOrderRowView } from '../../types/jersey-view.types';

export interface JerseyOrderRowProps {
  readonly view: JerseyOrderRowView;
  /** The packing list, present only for the row that is open. */
  readonly detail: JerseyOrderDetailView | null;
  readonly onToggle: (orderId: string) => void;
}

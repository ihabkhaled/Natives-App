import { StatusChip } from '@/shared/ui';

import type { JerseyOrderSummaryProps } from './jersey-order-summary.types';

/**
 * What one order looks like from the outside: its reference, who is making it,
 * when it was raised — and its state, but only while it is closed. Opening the
 * order re-reads the record, and the panel's chip is the authority from then
 * on; two chips disagreeing would be worse than one.
 *
 * Spans rather than headings and paragraphs: this block renders inside the
 * row's toggle button, which may only contain phrasing content.
 */
export function JerseyOrderSummary(props: JerseyOrderSummaryProps): React.JSX.Element {
  const { view } = props;
  return (
    <>
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{view.reference}</span>
        {view.isOpen ? null : <StatusChip label={view.statusLabel} tone={view.statusTone} />}
      </span>
      {view.supplier === null ? null : (
        <span className="app-muted-text text-sm">{view.supplier}</span>
      )}
      <span className="app-muted-text text-xs">{view.placedLabel}</span>
    </>
  );
}

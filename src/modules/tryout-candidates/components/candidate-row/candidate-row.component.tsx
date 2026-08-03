import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { CandidateRowProps } from './candidate-row.types';

/**
 * One candidate in the list: their name, where they stand, and when they
 * turned up. Nothing else — a list is where personal detail would leak in
 * bulk, so the row has no contact or readiness line to render.
 *
 * The whole row is the control, so opening someone's record is one deliberate
 * press rather than a small link inside a busy card.
 */
export function CandidateRow(props: CandidateRowProps): React.JSX.Element {
  const { view } = props;
  return (
    <button
      type="button"
      className="app-surface-card app-tryout-candidates__row flex w-full flex-col items-start gap-2 p-4 text-start"
      data-testid={`${TEST_IDS.tryoutCandidatesRow}-${view.candidateId}`}
      aria-pressed={view.isSelected}
      onClick={() => {
        props.onSelect(view.candidateId);
      }}
    >
      <span className="flex w-full flex-wrap items-center gap-2">
        <StatusChip label={view.statusLabel} tone={view.statusTone} />
        <span className="text-sm font-semibold">{view.displayName}</span>
      </span>
      {view.checkedInLabel === null ? null : (
        <span className="app-tryout-candidates__row-detail text-xs">{view.checkedInLabel}</span>
      )}
    </button>
  );
}

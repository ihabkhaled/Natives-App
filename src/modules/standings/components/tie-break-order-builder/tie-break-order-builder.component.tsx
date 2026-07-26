import { TEST_IDS } from '@/shared/config';
import { ReorderableRows } from '@/shared/ui';

import type { TieBreakOrderBuilderProps } from './tie-break-order-builder.types';

/**
 * The ordered tie-break criteria of a rule version, editable with move
 * up/down buttons (touch- and keyboard-operable — never drag-only). Array
 * order is the order of record the backend stores.
 */
export function TieBreakOrderBuilder(props: TieBreakOrderBuilderProps): React.JSX.Element {
  const { view } = props;
  return (
    <ReorderableRows
      testId={TEST_IDS.ruleFormTieBreaks}
      ariaLabel={view.tieBreakHeading}
      addLabel={null}
      onAdd={null}
      rows={view.tieBreakRows.map((row, index) => ({
        key: row.key,
        content: <span>{row.label}</span>,
        moveUpLabel: view.moveUpLabel,
        moveDownLabel: view.moveDownLabel,
        canMoveUp: index > 0,
        canMoveDown: index < view.tieBreakRows.length - 1,
        onMoveUp: () => {
          view.onMoveTieBreak(index, -1);
        },
        onMoveDown: () => {
          view.onMoveTieBreak(index, 1);
        },
        removeLabel: null,
        onRemove: null,
      }))}
    />
  );
}

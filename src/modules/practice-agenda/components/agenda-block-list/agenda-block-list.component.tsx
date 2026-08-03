import { TEST_IDS } from '@/shared/config';
import { ReorderableRows } from '@/shared/ui';

import { AgendaBlockRow } from '../agenda-block-row';
import type { AgendaBlockListProps } from './agenda-block-list.types';

/**
 * The plan in running order, rearranged with move up/down rather than drag —
 * keyboard- and touch-operable, and identical in RTL, where vertical arrows
 * still mean what they say.
 *
 * The arrows go quiet while a move is in flight. A second move would carry the
 * version the first one is about to spend, so the server would refuse it and
 * the coach would watch their own change roll back; waiting one round trip is
 * the honest alternative. Blocks are never removable here: this screen plans
 * the order and the stations, not the existence of a block.
 */
export function AgendaBlockList(props: AgendaBlockListProps): React.JSX.Element {
  return (
    <ReorderableRows
      testId={TEST_IDS.practiceAgendaView}
      rowTestId={TEST_IDS.practiceAgendaRow}
      ariaLabel={props.ariaLabel}
      addLabel={null}
      onAdd={null}
      rows={props.blocks.map((block, index) => ({
        key: block.id,
        content: (
          <AgendaBlockRow
            view={block}
            removeStationLabel={props.removeStationLabel}
            canEdit={props.canEdit}
            onRemoveStation={props.onRemoveStation}
          />
        ),
        moveUpLabel: props.moveUpLabel,
        moveDownLabel: props.moveDownLabel,
        canMoveUp: props.canEdit && !props.isSaving && index > 0,
        canMoveDown: props.canEdit && !props.isSaving && index < props.blocks.length - 1,
        onMoveUp: () => {
          props.onMoveBlock(index, -1);
        },
        onMoveDown: () => {
          props.onMoveBlock(index, 1);
        },
        removeLabel: null,
        onRemove: null,
      }))}
    />
  );
}

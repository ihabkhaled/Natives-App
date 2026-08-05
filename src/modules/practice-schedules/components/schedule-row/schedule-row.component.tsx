import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { ScheduleRowProps } from './schedule-row.types';

/** One recurring pattern: its name, a one-line summary, and its status. */
export function ScheduleRow(props: ScheduleRowProps): React.JSX.Element {
  const { item } = props;
  return (
    <li className="app-record-list__row" data-testid={TEST_IDS.practiceScheduleRow}>
      <div className="app-record-list__main">
        <AppButton
          label={item.name}
          tone="ghost"
          onClick={() => {
            props.onOpen(item.id);
          }}
        />
        <IonNote>{item.summary}</IonNote>
      </div>
      {item.isArchived ? <StatusChip label={item.statusLabel} tone="medium" /> : null}
    </li>
  );
}

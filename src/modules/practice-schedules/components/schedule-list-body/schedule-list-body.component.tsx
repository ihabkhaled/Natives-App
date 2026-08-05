import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState } from '@/shared/ui';

import { ScheduleRow } from '../schedule-row';
import type { ScheduleListBodyProps } from './schedule-list-body.types';

/**
 * The loaded list: the "new schedule" action always shown, and either the
 * pattern rows or a "none yet" empty state below it.
 */
export function ScheduleListBody(props: ScheduleListBodyProps): React.JSX.Element {
  return (
    <>
      <div className="flex justify-end">
        <AppButton
          label={props.newLabel}
          tone="primary"
          onClick={props.onNew}
          testId={TEST_IDS.practiceSchedulesNew}
        />
      </div>

      {props.hasSchedules ? (
        <>
          <IonNote>{props.countLabel}</IonNote>
          <ul
            className="app-record-list"
            data-testid={TEST_IDS.practiceSchedulesList}
            aria-label={props.countLabel}
          >
            {props.rows.map((row) => (
              <ScheduleRow key={row.id} item={row} onOpen={props.onOpen} />
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          title={props.emptyTitle}
          message={props.emptyMessage}
          testId={TEST_IDS.practiceSchedulesEmpty}
        />
      )}
    </>
  );
}

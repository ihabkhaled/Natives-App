import { IonNote, IonSelect, IonSelectOption } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { AttendanceStatus } from '../../constants/attendance.constants';
import { ATTENDANCE_FILTER_ALL_VALUE } from './attendance-toolbar.constants';
import type { AttendanceToolbarProps } from './attendance-toolbar.types';

export function AttendanceToolbar(props: AttendanceToolbarProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-[color:var(--ion-color-light-shade)] bg-[color:var(--ion-card-background)] p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <AppInput
          label={props.searchLabel}
          name="attendance-search"
          value={props.searchValue}
          placeholder={props.searchPlaceholder}
          autocomplete="off"
          testId={TEST_IDS.attendanceSearch}
          onValueChange={props.onSearchChange}
        />
        <IonSelect
          data-testid={TEST_IDS.attendanceFilter}
          label={props.filterLabel}
          labelPlacement="stacked"
          fill="outline"
          value={props.filterValue ?? ATTENDANCE_FILTER_ALL_VALUE}
          onIonChange={(event) => {
            const value = event.detail.value as string;
            props.onFilterChange(
              value === ATTENDANCE_FILTER_ALL_VALUE ? null : (value as AttendanceStatus),
            );
          }}
        >
          <IonSelectOption value={ATTENDANCE_FILTER_ALL_VALUE}>
            {props.filterAllLabel}
          </IonSelectOption>
          {props.statusOptions.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3">
          <input
            type="checkbox"
            data-testid={TEST_IDS.attendanceSelectAll}
            aria-label={props.selectAllVisibleLabel}
            onChange={props.onSelectAllVisible}
          />
          <span>{props.selectAllVisibleLabel}</span>
        </label>
        <IonNote className="font-semibold">{props.selectedCountLabel}</IonNote>
        <AppButton
          label={props.markAllPresentLabel}
          testId={TEST_IDS.attendanceMarkAllPresent}
          onClick={props.onMarkAllPresent}
        />
        <AppButton
          label={props.markSelectedPresentLabel}
          tone="secondary"
          testId={TEST_IDS.attendanceMarkSelectedPresent}
          onClick={props.onMarkSelectedPresent}
        />
        <AppButton
          label={props.markSelectedAbsentLabel}
          tone="danger"
          testId={TEST_IDS.attendanceMarkSelectedAbsent}
          onClick={props.onMarkSelectedAbsent}
        />
        <AppButton
          label={props.undoLabel}
          tone="secondary"
          disabled={!props.canUndo}
          testId={TEST_IDS.attendanceUndo}
          onClick={props.onUndo}
        />
      </div>
    </section>
  );
}

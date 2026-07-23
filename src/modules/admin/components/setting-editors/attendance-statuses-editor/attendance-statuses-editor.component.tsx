import { IonCheckbox } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { moveArrayItem, ReorderableRows, SelectField } from '@/shared/ui';

import {
  addStatusEntry,
  buildRowControls,
  patchStatusEntry,
  statusCodePatch,
  statusOptionsFor,
  unusedStatusCodes,
} from '../../../helpers/setting-editor-values.helper';
import type { AttendanceStatusEntry } from '../../../types/setting-values.types';
import { EntryLabelFields } from '../entry-label-fields';
import type { AttendanceStatusesEditorProps } from '../setting-editors.types';

/**
 * The canonical-seven status list: ordered, bilingual, colour-coded, and
 * archived by toggle — never deleted, because history references the code.
 */
export function AttendanceStatusesEditor(props: AttendanceStatusesEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const statuses = props.value.statuses;
  const move = (index: number, offset: -1 | 1): void => {
    props.onChange({ statuses: moveArrayItem(statuses, index, offset) });
  };
  const patch = (index: number, entryPatch: Partial<AttendanceStatusEntry>): void => {
    props.onChange(patchStatusEntry(props.value, index, entryPatch));
  };
  return (
    <ReorderableRows
      ariaLabel={props.context.keyLabels.attendance_statuses}
      addLabel={labels.statusesAdd}
      addDisabled={unusedStatusCodes(props.value).length === 0}
      onAdd={() => {
        props.onChange(addStatusEntry(props.value));
      }}
      testId={TEST_IDS.adminSettingEditor}
      rowTestId={TEST_IDS.adminEditorRow}
      addTestId={TEST_IDS.adminEditorAdd}
      rows={statuses.map((entry, index) => ({
        key: entry.code,
        ...buildRowControls({
          index,
          count: statuses.length,
          labels,
          onMove: move,
          onRemove: null,
        }),
        content: (
          <div className="app-editor-entry">
            <SelectField
              label={labels.code}
              value={entry.code}
              options={statusOptionsFor(props.context.statusOptions, props.value, entry.code)}
              testId={`${TEST_IDS.adminEditorRow}-code-${index}`}
              onChange={(raw) => {
                patch(index, statusCodePatch(raw));
              }}
            />
            <EntryLabelFields
              idPrefix={`status-${index}`}
              labels={labels}
              labelEn={entry.labelEn}
              labelAr={entry.labelAr}
              color={entry.color}
              colorOptions={props.context.colorOptions}
              onPatch={(fieldPatch) => {
                patch(index, fieldPatch);
              }}
            />
            <IonCheckbox
              checked={entry.countsTowardMetrics}
              labelPlacement="end"
              onIonChange={(event) => {
                patch(index, { countsTowardMetrics: event.detail.checked });
              }}
            >
              {labels.countsTowardMetrics}
            </IonCheckbox>
            <IonCheckbox
              checked={entry.allowSelfCheckIn}
              labelPlacement="end"
              onIonChange={(event) => {
                patch(index, { allowSelfCheckIn: event.detail.checked });
              }}
            >
              {labels.allowSelfCheckIn}
            </IonCheckbox>
            <IonCheckbox
              checked={entry.active}
              labelPlacement="end"
              onIonChange={(event) => {
                patch(index, { active: event.detail.checked });
              }}
            >
              {labels.active}
            </IonCheckbox>
          </div>
        ),
      }))}
    />
  );
}

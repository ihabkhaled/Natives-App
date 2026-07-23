import { IonCheckbox } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput, moveArrayItem, removeArrayItem, ReorderableRows } from '@/shared/ui';

import { numericInputValue, parseIntegerInput } from '../../../helpers/numeric-input.helper';
import {
  addSessionType,
  buildRowControls,
  patchSessionType,
} from '../../../helpers/setting-editor-values.helper';
import type { SessionTypeEntry } from '../../../types/setting-values.types';
import { EntryLabelFields } from '../entry-label-fields';
import type { SessionTypesEditorProps } from '../setting-editors.types';

/**
 * Free-coded session types: ordered rows with bilingual labels, a colour
 * token, and an optional default duration for the planner to prefill.
 */
export function SessionTypesEditor(props: SessionTypesEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const types = props.value.types;
  const move = (index: number, offset: -1 | 1): void => {
    props.onChange({ types: moveArrayItem(types, index, offset) });
  };
  const remove = (index: number): void => {
    props.onChange({ types: removeArrayItem(types, index) });
  };
  const patch = (index: number, entryPatch: Partial<SessionTypeEntry>): void => {
    props.onChange(patchSessionType(props.value, index, entryPatch));
  };
  return (
    <ReorderableRows
      ariaLabel={props.context.keyLabels.session_types}
      addLabel={labels.typesAdd}
      onAdd={() => {
        props.onChange(addSessionType(props.value));
      }}
      testId={TEST_IDS.adminSettingEditor}
      rowTestId={TEST_IDS.adminEditorRow}
      addTestId={TEST_IDS.adminEditorAdd}
      rows={types.map((entry, index) => ({
        key: entry.code,
        ...buildRowControls({
          index,
          count: types.length,
          labels,
          onMove: move,
          onRemove: remove,
        }),
        content: (
          <div className="app-editor-entry">
            <AppInput
              label={labels.code}
              name={`type-code-${index}`}
              value={entry.code}
              testId={`${TEST_IDS.adminEditorRow}-code-${index}`}
              onValueChange={(code) => {
                patch(index, { code });
              }}
            />
            <EntryLabelFields
              idPrefix={`type-${index}`}
              colorOptions={props.context.colorOptions}
              color={entry.color}
              labelAr={entry.labelAr}
              labelEn={entry.labelEn}
              labels={labels}
              onPatch={(fieldPatch) => {
                patch(index, fieldPatch);
              }}
            />
            <IonCheckbox
              checked={entry.active}
              labelPlacement="end"
              onIonChange={(event) => {
                patch(index, { active: event.detail.checked });
              }}
            >
              {labels.active}
            </IonCheckbox>
            <AppInput
              label={labels.duration}
              name={`type-duration-${index}`}
              type="number"
              value={numericInputValue(entry.defaultDurationMinutes)}
              testId={`${TEST_IDS.adminEditorRow}-duration-${index}`}
              onValueChange={(raw) => {
                patch(index, { defaultDurationMinutes: parseIntegerInput(raw) });
              }}
            />
          </div>
        ),
      }))}
    />
  );
}

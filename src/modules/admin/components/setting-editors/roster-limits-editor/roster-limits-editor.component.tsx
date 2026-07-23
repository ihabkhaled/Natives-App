import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  AppInput,
  moveArrayItem,
  removeArrayItem,
  ReorderableRows,
  SelectField,
} from '@/shared/ui';

import { integerFieldPatch, numericInputValue } from '../../../helpers/numeric-input.helper';
import {
  addPositionLimit,
  patchPositionLimit,
  patchRosterLimits,
  positionRows,
  withPositions,
} from '../../../helpers/setting-editor-form-values.helper';
import { buildRowControls, firstOptionValue } from '../../../helpers/setting-editor-values.helper';
import type { RosterLimitsEditorProps } from '../setting-editors.types';

/**
 * Squad arithmetic with guardrails: the roster caps the squad, the squad
 * never drops below a full line of 7, and per-position caps select from the
 * team's own position catalog rather than free text.
 */
export function RosterLimitsEditor(props: RosterLimitsEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const positions = positionRows(props.value);
  const bound = (
    group: 'roster' | 'matchSquad',
    field: 'min' | 'max',
    label: string,
  ): React.JSX.Element => (
    <AppInput
      label={label}
      name={`${group}-${field}`}
      type="number"
      value={numericInputValue(props.value[group]?.[field])}
      testId={`${TEST_IDS.adminSettingEditor}-${group}-${field}`}
      onValueChange={(raw) => {
        props.onChange(patchRosterLimits(props.value, group, field, raw));
      }}
    />
  );
  return (
    <div className="app-editor-entry" data-testid={TEST_IDS.adminSettingEditor}>
      <IonNote>{labels.rosterHeading}</IonNote>
      {bound('roster', 'min', labels.rosterMin)}
      {bound('roster', 'max', labels.rosterMax)}
      <IonNote>{labels.squadHeading}</IonNote>
      {bound('matchSquad', 'min', labels.squadMin)}
      {bound('matchSquad', 'max', labels.squadMax)}
      <IonNote>{labels.squadFloorHint}</IonNote>
      <IonNote>{labels.positionsHeading}</IonNote>
      <ReorderableRows
        ariaLabel={labels.positionsHeading}
        addLabel={labels.positionsAdd}
        addDisabled={props.context.positionOptions.length === 0}
        onAdd={() => {
          props.onChange(
            addPositionLimit(props.value, firstOptionValue(props.context.positionOptions)),
          );
        }}
        rowTestId={TEST_IDS.adminEditorRow}
        addTestId={TEST_IDS.adminEditorAdd}
        rows={positions.map((row, index) => ({
          key: `${row.positionKey}-${index}`,
          ...buildRowControls({
            index,
            count: positions.length,
            labels,
            onMove: (from, offset) => {
              props.onChange(withPositions(props.value, moveArrayItem(positions, from, offset)));
            },
            onRemove: (target) => {
              props.onChange(withPositions(props.value, removeArrayItem(positions, target)));
            },
          }),
          content: (
            <div className="app-editor-entry">
              <SelectField
                label={labels.position}
                value={row.positionKey}
                options={props.context.positionOptions}
                testId={`${TEST_IDS.adminEditorRow}-position-${index}`}
                onChange={(positionKey) => {
                  props.onChange(patchPositionLimit(props.value, index, { positionKey }));
                }}
              />
              <AppInput
                label={labels.positionMax}
                name={`position-max-${index}`}
                type="number"
                value={numericInputValue(row.max)}
                testId={`${TEST_IDS.adminEditorRow}-position-max-${index}`}
                onValueChange={(raw) => {
                  props.onChange(
                    patchPositionLimit(props.value, index, integerFieldPatch('max', raw)),
                  );
                }}
              />
            </div>
          ),
        }))}
      />
    </div>
  );
}

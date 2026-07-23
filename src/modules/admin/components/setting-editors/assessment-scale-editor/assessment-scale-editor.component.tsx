import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput, moveArrayItem, removeArrayItem, ReorderableRows } from '@/shared/ui';

import { integerFieldPatch, numericInputValue } from '../../../helpers/numeric-input.helper';
import { scaleFieldPatch, withBands } from '../../../helpers/setting-editor-form-values.helper';
import {
  addScaleBand,
  buildRowControls,
  patchScaleBand,
} from '../../../helpers/setting-editor-values.helper';
import type { ScaleBand } from '../../../types/setting-values.types';
import { EntryLabelFields } from '../entry-label-fields';
import type { AssessmentScaleEditorProps } from '../setting-editors.types';

/**
 * The rating scale: min/max/step with a live points preview, plus optional
 * ascending, non-overlapping bands. Gaps are legal; overlap is flagged.
 */
export function AssessmentScaleEditor(props: AssessmentScaleEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const bands = props.value.bands ?? [];
  const patchBand = (index: number, bandPatch: Partial<ScaleBand>): void => {
    props.onChange(withBands(props.value, patchScaleBand(bands, index, bandPatch)));
  };
  return (
    <div className="app-editor-entry" data-testid={TEST_IDS.adminSettingEditor}>
      <AppInput
        label={labels.scaleMin}
        name="scale-min"
        type="number"
        value={numericInputValue(props.value.min)}
        testId={`${TEST_IDS.adminSettingEditor}-min`}
        onValueChange={(raw) => {
          props.onChange(scaleFieldPatch(props.value, 'min', raw));
        }}
      />
      <AppInput
        label={labels.scaleMax}
        name="scale-max"
        type="number"
        value={numericInputValue(props.value.max)}
        testId={`${TEST_IDS.adminSettingEditor}-max`}
        onValueChange={(raw) => {
          props.onChange(scaleFieldPatch(props.value, 'max', raw));
        }}
      />
      <AppInput
        label={labels.scaleStep}
        name="scale-step"
        type="number"
        value={numericInputValue(props.value.step)}
        testId={`${TEST_IDS.adminSettingEditor}-step`}
        onValueChange={(raw) => {
          props.onChange(scaleFieldPatch(props.value, 'step', raw));
        }}
      />
      {props.context.scalePreview === null ? null : (
        <IonNote data-testid={`${TEST_IDS.adminSettingEditor}-preview`}>
          {props.context.scalePreview}
        </IonNote>
      )}
      <IonNote>{labels.bandsHeading}</IonNote>
      <ReorderableRows
        ariaLabel={labels.bandsHeading}
        addLabel={labels.bandsAdd}
        onAdd={() => {
          props.onChange(withBands(props.value, addScaleBand(bands, props.value.max)));
        }}
        rowTestId={TEST_IDS.adminEditorRow}
        addTestId={TEST_IDS.adminEditorAdd}
        rows={bands.map((band, index) => ({
          key: band.key,
          ...buildRowControls({
            index,
            count: bands.length,
            labels,
            onMove: (from, offset) => {
              props.onChange(withBands(props.value, moveArrayItem(bands, from, offset)));
            },
            onRemove: (target) => {
              props.onChange(withBands(props.value, removeArrayItem(bands, target)));
            },
          }),
          content: (
            <div className="app-editor-entry">
              <AppInput
                label={labels.bandKey}
                name={`band-key-${index}`}
                value={band.key}
                testId={`${TEST_IDS.adminEditorRow}-band-key-${index}`}
                onValueChange={(key) => {
                  patchBand(index, { key });
                }}
              />
              <EntryLabelFields
                idPrefix={`band-${index}`}
                labels={labels}
                labelEn={band.labelEn}
                labelAr={band.labelAr}
                color={null}
                colorOptions={props.context.colorOptions}
                onPatch={(fieldPatch) => {
                  patchBand(index, fieldPatch);
                }}
              />
              <AppInput
                label={labels.bandFrom}
                name={`band-from-${index}`}
                type="number"
                value={numericInputValue(band.from)}
                testId={`${TEST_IDS.adminEditorRow}-band-from-${index}`}
                onValueChange={(raw) => {
                  patchBand(index, integerFieldPatch('from', raw));
                }}
              />
              <AppInput
                label={labels.bandTo}
                name={`band-to-${index}`}
                type="number"
                value={numericInputValue(band.to)}
                testId={`${TEST_IDS.adminEditorRow}-band-to-${index}`}
                onValueChange={(raw) => {
                  patchBand(index, integerFieldPatch('to', raw));
                }}
              />
            </div>
          ),
        }))}
      />
    </div>
  );
}

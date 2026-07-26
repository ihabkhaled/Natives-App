import { IonSelect, IonSelectOption } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { DimensionPickerProps } from './dimension-picker.types';

/**
 * The grouped dimension select ("Team health" / "Performance" / "Match").
 * Player screens receive an already-filtered group list — applicability is
 * data prepared upstream, never a conditional here.
 */
export function DimensionPicker(props: DimensionPickerProps): React.JSX.Element {
  const { controls } = props;
  return (
    <IonSelect
      data-testid={TEST_IDS.analyticsDimensionSelect}
      label={controls.dimensionLabel}
      value={controls.dimensionValue}
      onIonChange={(event) => {
        controls.onDimensionChange(event.detail.value as string);
      }}
    >
      {controls.dimensionGroups.flatMap((group) =>
        group.options.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {`${group.label} — ${option.label}`}
          </IonSelectOption>
        )),
      )}
    </IonSelect>
  );
}

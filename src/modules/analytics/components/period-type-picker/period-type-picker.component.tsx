import { TEST_IDS } from '@/shared/config';
import { SelectField } from '@/shared/ui';

import type { PeriodTypePickerProps } from './period-type-picker.types';

/**
 * The period-type control. A select rather than six segments keeps the
 * control usable at phone widths while every period type stays reachable.
 */
export function PeriodTypePicker(props: PeriodTypePickerProps): React.JSX.Element {
  const { controls } = props;
  return (
    <SelectField
      testId={TEST_IDS.analyticsPeriodSelect}
      label={controls.periodLabel}
      value={controls.periodValue}
      options={controls.periodOptions}
      onChange={controls.onPeriodChange}
    />
  );
}

import { buildPickerBindings, PickerField } from '../picker-field';
import { extractDateTimeValue } from './datetime-field.helper';
import type { AppDateTimeFieldProps } from './datetime-field.types';

/**
 * The design system's date-and-time picker: the shared `PickerField` shell
 * with a `date-time` presentation. The value is an Africa/Cairo wall time —
 * what a coach means when they say "August 1st at 18:00" — and `min` refuses
 * instants already in the past, mirroring the backend's no-backdating rule.
 */
export function AppDateTimeField(props: AppDateTimeFieldProps): React.JSX.Element {
  const { value, onValueChange, min, locale, ...base } = props;
  return (
    <PickerField
      {...base}
      hasValue={value !== ''}
      presentation="date-time"
      bindings={buildPickerBindings({ value, min, locale })}
      onPickerChange={(raw) => {
        onValueChange(extractDateTimeValue(raw));
      }}
    />
  );
}

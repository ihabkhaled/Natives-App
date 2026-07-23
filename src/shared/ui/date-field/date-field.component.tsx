import { buildPickerBindings, PickerField } from '../picker-field';
import { extractDateValue } from './date-field.helper';
import type { AppDateFieldProps } from './date-field.types';

/**
 * The design system's date picker: the shared `PickerField` shell with a
 * date-only presentation. `max` blocks future days to mirror the backend's
 * "not in the future" rule at the edge; the change handler drops any time
 * part so the wire value stays date-only.
 */
export function AppDateField(props: AppDateFieldProps): React.JSX.Element {
  const { value, onValueChange, max, min, locale, ...base } = props;
  return (
    <PickerField
      {...base}
      hasValue={value !== ''}
      presentation="date"
      bindings={buildPickerBindings({ value, max, min, locale })}
      onPickerChange={(raw) => {
        onValueChange(extractDateValue(raw));
      }}
    />
  );
}

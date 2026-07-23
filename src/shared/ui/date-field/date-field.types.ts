import type { PickerFieldBaseProps } from '../picker-field';

export interface AppDateFieldProps extends PickerFieldBaseProps {
  /** Selected date as `YYYY-MM-DD`, or `''` when nothing is chosen yet. */
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** Inclusive latest selectable day (`YYYY-MM-DD`); blocks future dates. */
  readonly max?: string | undefined;
  /** Inclusive earliest selectable day (`YYYY-MM-DD`). */
  readonly min?: string | undefined;
  /** BCP-47 locale for the calendar's month and weekday names. */
  readonly locale?: string | undefined;
}

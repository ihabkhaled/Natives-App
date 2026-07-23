import type { PickerFieldBaseProps } from '../picker-field';

export interface AppDateTimeFieldProps extends PickerFieldBaseProps {
  /**
   * Selected Africa/Cairo wall time as `YYYY-MM-DDTHH:mm`, or `''` when
   * nothing is chosen yet. The owning hook converts to a strict-UTC instant
   * at submit time, so an implicit-timezone value can never reach the wire.
   */
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** Inclusive earliest selectable wall time; blocks scheduling in the past. */
  readonly min?: string | undefined;
  /** BCP-47 locale for the calendar's month and weekday names. */
  readonly locale?: string | undefined;
}

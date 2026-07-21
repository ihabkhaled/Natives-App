export interface AppDateFieldProps {
  /** Visible, screen-reader-associated field label. */
  readonly label: string;
  /**
   * Stable DOM id shared by the trigger button and the calendar, so
   * `ion-datetime-button` can open its paired `ion-datetime`.
   */
  readonly datetimeId: string;
  /** Selected date as `YYYY-MM-DD`, or `''` when nothing is chosen yet. */
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** Inclusive latest selectable day (`YYYY-MM-DD`); blocks future dates. */
  readonly max?: string | undefined;
  /** Inclusive earliest selectable day (`YYYY-MM-DD`). */
  readonly min?: string | undefined;
  /** BCP-47 locale for the calendar's month and weekday names. */
  readonly locale?: string | undefined;
  readonly hint?: string | undefined;
  readonly errorMessage?: string | undefined;
  /** Test id for the field wrapper. */
  readonly testId?: string | undefined;
  /** Test id for the calendar control itself (drives change in tests). */
  readonly inputTestId?: string | undefined;
}

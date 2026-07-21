export interface AppDateFieldProps {
  /** Visible, screen-reader-associated field label. */
  readonly label: string;
  /**
   * Stable DOM id shared by the trigger button and the calendar, so the
   * trigger, the dialog, and every aria relationship resolve to one field.
   */
  readonly datetimeId: string;
  /** Selected date as `YYYY-MM-DD`, or `''` when nothing is chosen yet. */
  readonly value: string;
  /**
   * The selected day already formatted for reading (locale-aware). Empty while
   * nothing is chosen — the trigger then shows `placeholder` instead, so the
   * control never claims a date the form does not actually hold.
   */
  readonly displayValue: string;
  /** Call-to-action shown while no date is chosen, e.g. "Select a date". */
  readonly placeholder: string;
  /** Accessible name for the trigger's action, e.g. "Open the date picker". */
  readonly openLabel: string;
  /** Heading shown above the calendar inside the picker dialog. */
  readonly dialogTitle: string;
  /** Label for the dialog's dismiss control. */
  readonly closeLabel: string;
  /** Whether the picker dialog is open; the owning hook holds this state. */
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
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

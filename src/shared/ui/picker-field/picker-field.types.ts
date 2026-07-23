/** Every derived DOM id for one picker field, built from its stable id. */
export interface PickerFieldIds {
  readonly label: string;
  readonly value: string;
  readonly panel: string;
  readonly hint: string;
  readonly error: string;
}

/**
 * The props every calendar-style field shares: the trigger copy, the dialog
 * copy, the open/dismiss protocol, and the guidance/error notes. Concrete
 * fields (date, date-time) add their own value semantics on top.
 */
export interface PickerFieldBaseProps {
  /** Visible, screen-reader-associated field label. */
  readonly label: string;
  /**
   * Stable DOM id shared by the trigger button and the calendar, so the
   * trigger, the dialog, and every aria relationship resolve to one field.
   */
  readonly datetimeId: string;
  /**
   * The selected value already formatted for reading (locale-aware). Empty
   * while nothing is chosen — the trigger then shows `placeholder` instead,
   * so the control never claims a value the form does not actually hold.
   */
  readonly displayValue: string;
  /** Call-to-action shown while nothing is chosen, e.g. "Select a date". */
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
  readonly hint?: string | undefined;
  readonly errorMessage?: string | undefined;
  /** Test id for the field wrapper. */
  readonly testId?: string | undefined;
  /** Test id for the calendar control itself (drives change in tests). */
  readonly inputTestId?: string | undefined;
}

type PickerPresentation = 'date' | 'date-time';

export interface PickerFieldProps extends PickerFieldBaseProps {
  readonly hasValue: boolean;
  readonly presentation: PickerPresentation;
  /** Optional `ion-datetime` attributes, prepared by the concrete field. */
  readonly bindings: Readonly<Record<string, string>>;
  readonly onPickerChange: (value: string | string[] | null | undefined) => void;
}

/** The optional `ion-datetime` attributes a concrete field may bind. */
export interface PickerBindingSource {
  readonly value: string;
  readonly max?: string | undefined;
  readonly min?: string | undefined;
  readonly locale?: string | undefined;
}

/** The note props the trigger's `aria-describedby` is derived from. */
export interface PickerNoteSource {
  readonly hint?: string | undefined;
  readonly errorMessage?: string | undefined;
}

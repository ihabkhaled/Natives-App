import { useState } from 'react';

import { formatDate } from '@/packages/date';

export interface ComposerDatePickerView {
  /**
   * The chosen day formatted for reading, or `''` while none is chosen. Empty
   * stays empty on purpose: an unset date must reach the field as "select a
   * date", never as today's date dressed up as a choice the user made.
   */
  readonly displayValue: string;
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly dismiss: () => void;
  /** Wraps a value change so choosing a day commits and closes in one gesture. */
  readonly choose: (value: string, commit: (value: string) => void) => void;
}

/** Open/closed state and the read-friendly rendering of the performed-on day. */
export function useComposerDatePicker(value: string, locale: string): ComposerDatePickerView {
  const [isOpen, setIsOpen] = useState(false);
  return {
    displayValue: value === '' ? '' : formatDate(value, locale),
    isOpen,
    open: () => {
      setIsOpen(true);
    },
    dismiss: () => {
      setIsOpen(false);
    },
    choose: (next, commit) => {
      commit(next);
      setIsOpen(false);
    },
  };
}

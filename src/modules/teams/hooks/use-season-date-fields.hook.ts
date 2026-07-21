import { formatDate } from '@/packages/date';
import { getActiveLocale } from '@/packages/i18n';

import type { AdminDateFieldView } from '../types/teams-view.types';
import type { SeasonFormState } from './use-season-form-state.hook';

type Translate = (key: string) => string;

/** The two season date fields, and which errors belong to each. */
export interface SeasonDateErrors {
  readonly startsOn: string | null;
  readonly endsOn: string | null;
}

export interface SeasonDateFieldsView {
  readonly startsOn: AdminDateFieldView;
  readonly endsOn: AdminDateFieldView;
}

/**
 * The season window's two date fields. Choosing a day commits and collapses the
 * calendar; only one of the two may be open at a time, so the calendars never
 * stack.
 */
export function useSeasonDateFields(
  t: Translate,
  form: SeasonFormState,
  labels: { readonly startsOnKey: string; readonly endsOnKey: string },
  errors: SeasonDateErrors,
): SeasonDateFieldsView {
  const locale = getActiveLocale();
  const field = (spec: {
    readonly which: 'startsOn' | 'endsOn';
    readonly labelKey: string;
    readonly value: string;
    readonly onChange: (next: string) => void;
    readonly errorKey: string | null;
  }): AdminDateFieldView => {
    const { which, labelKey, value, onChange, errorKey } = spec;
    return {
      label: t(labelKey),
      value,
      displayValue: value === '' ? '' : formatDate(value, locale),
      isOpen: form.openDatePicker === which,
      onOpen: () => {
        form.setOpenDatePicker(which);
      },
      onDismiss: () => {
        form.setOpenDatePicker(null);
      },
      onChange: (next) => {
        onChange(next);
        form.setOpenDatePicker(null);
      },
      error: form.isSubmitted && errorKey !== null ? t(errorKey) : null,
    };
  };
  return {
    startsOn: field({
      which: 'startsOn',
      labelKey: labels.startsOnKey,
      value: form.startsOn,
      onChange: form.setStartsOn,
      errorKey: errors.startsOn,
    }),
    endsOn: field({
      which: 'endsOn',
      labelKey: labels.endsOnKey,
      value: form.endsOn,
      onChange: form.setEndsOn,
      errorKey: errors.endsOn,
    }),
  };
}

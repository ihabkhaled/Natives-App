import type { PickerBindingSource, PickerFieldIds, PickerNoteSource } from './picker-field.types';

/** Every derived DOM id for one field, built from its single stable id. */
export function buildPickerFieldIds(datetimeId: string): PickerFieldIds {
  return {
    label: `${datetimeId}-label`,
    value: `${datetimeId}-value`,
    panel: `${datetimeId}-panel`,
    hint: `${datetimeId}-hint`,
    error: `${datetimeId}-error`,
  };
}

/**
 * The optional attributes for the underlying `ion-datetime`, collapsed into
 * one object so the components stay declarative and below the complexity
 * budget. Only the props that were actually provided are emitted, so Ionic
 * keeps its own defaults for the rest (an empty `value` stays uncontrolled).
 */
export function buildPickerBindings(source: PickerBindingSource): Record<string, string> {
  return {
    ...(source.value === '' ? {} : { value: source.value }),
    ...(source.max === undefined ? {} : { max: source.max }),
    ...(source.min === undefined ? {} : { min: source.min }),
    ...(source.locale === undefined ? {} : { locale: source.locale }),
  };
}

/**
 * The ids the trigger points `aria-describedby` at. The hint and the error
 * are separate nodes so a screen reader announces the guidance and the
 * failure, in that order, without either replacing the field's own name.
 */
export function buildPickerDescribedBy(
  source: PickerNoteSource,
  ids: PickerFieldIds,
): string | undefined {
  const described = [
    source.hint === undefined ? null : ids.hint,
    source.errorMessage === undefined ? null : ids.error,
  ].filter((id): id is string => id !== null);
  return described.length === 0 ? undefined : described.join(' ');
}

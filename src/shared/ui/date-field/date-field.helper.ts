import type { AppDateFieldProps } from './date-field.types';

/**
 * Normalize the value an `ion-datetime` reports on change to a date-only
 * `YYYY-MM-DD` string. Ionic can emit a single ISO string, an array (multi-date
 * mode, unused here), or null/undefined when cleared; a `date` presentation may
 * still carry a time part, which we drop so the wire value stays date-only.
 */
export function extractDateValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return extractDateValue(value[0]);
  }
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const timeSeparator = value.indexOf('T');
  return timeSeparator === -1 ? value : value.slice(0, timeSeparator);
}

/**
 * The optional attributes for the underlying `ion-datetime`, collapsed into one
 * object so the component stays declarative and below the complexity budget.
 * Only the props that were actually provided are emitted, so Ionic keeps its own
 * defaults for the rest (an empty `value` stays uncontrolled/placeholder).
 */
export function buildDatetimeBindings(
  props: AppDateFieldProps,
  errorId: string,
): Record<string, string> {
  return {
    ...(props.value === '' ? {} : { value: props.value }),
    ...(props.max === undefined ? {} : { max: props.max }),
    ...(props.min === undefined ? {} : { min: props.min }),
    ...(props.locale === undefined ? {} : { locale: props.locale }),
    ...(props.errorMessage === undefined ? {} : { 'aria-describedby': errorId }),
  };
}

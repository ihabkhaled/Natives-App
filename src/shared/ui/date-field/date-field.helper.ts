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

/** Minute-precise wall time keeps `YYYY-MM-DDTHH:mm` (16 characters). */
const WALL_TIME_LENGTH = 16;

/**
 * Normalize the value an `ion-datetime` reports on change to a minute-precise
 * wall-time string (`YYYY-MM-DDTHH:mm`). Unlike the date-only field, the time
 * part is the point: it is kept, and only seconds/fractions are trimmed.
 */
export function extractDateTimeValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return extractDateTimeValue(value[0]);
  }
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return value.length > WALL_TIME_LENGTH ? value.slice(0, WALL_TIME_LENGTH) : value;
}

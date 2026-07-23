import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * The single presentation timezone. Instants are persisted and transported in
 * UTC; the client renders them in Africa/Cairo unless a user explicitly picks
 * another zone (not yet supported). Centralising the zone here keeps every
 * feature consistent and makes DST behaviour testable in one place.
 */
export const PRESENTATION_TIME_ZONE = 'Africa/Cairo';

function withLocale(isoDateTime: string, locale: string): dayjs.Dayjs {
  return dayjs(isoDateTime).locale(locale);
}

function inCairo(isoDateTime: string, locale: string): dayjs.Dayjs {
  return dayjs.utc(isoDateTime).tz(PRESENTATION_TIME_ZONE).locale(locale);
}

export function isValidIsoDateTime(isoDateTime: string): boolean {
  return dayjs(isoDateTime).isValid();
}

export function formatDate(isoDateTime: string, locale: string): string {
  return withLocale(isoDateTime, locale).format('LL');
}

export function formatDateTime(isoDateTime: string, locale: string): string {
  return withLocale(isoDateTime, locale).format('LLL');
}

export function formatRelativeToNow(isoDateTime: string, locale: string): string {
  return withLocale(isoDateTime, locale).fromNow();
}

/** Long date + time rendered in Africa/Cairo (e.g. "18 July 2026 5:00 PM"). */
export function formatCairoDateTime(isoDateTime: string, locale: string): string {
  return inCairo(isoDateTime, locale).format('LLL');
}

/** Time-of-day rendered in Africa/Cairo (e.g. "5:00 PM"). */
export function formatCairoTime(isoDateTime: string, locale: string): string {
  return inCairo(isoDateTime, locale).format('LT');
}

/** Long date rendered in Africa/Cairo (e.g. "18 July 2026"). */
export function formatCairoDate(isoDateTime: string, locale: string): string {
  return inCairo(isoDateTime, locale).format('LL');
}

/** Weekday + long date rendered in Africa/Cairo (day-section headers). */
export function formatCairoWeekdayDate(isoDateTime: string, locale: string): string {
  return inCairo(isoDateTime, locale).format('dddd, LL');
}

/**
 * Stable calendar-day bucket (YYYY-MM-DD) for the Cairo day the instant falls
 * on. Grouping by this key keeps a late-evening UTC instant on its correct
 * local day instead of drifting to the next calendar date.
 */
export function cairoDayKey(isoDateTime: string): string {
  return dayjs.utc(isoDateTime).tz(PRESENTATION_TIME_ZONE).format('YYYY-MM-DD');
}

/** True when `isoDateTime` is strictly before `referenceIso` (pure comparator). */
export function isInstantInPast(isoDateTime: string, referenceIso: string): boolean {
  return dayjs(isoDateTime).isBefore(dayjs(referenceIso));
}

/** Cairo wall-time strings use the minute-precise ISO local shape. */
const CAIRO_WALL_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

/**
 * Convert a Cairo wall time (`YYYY-MM-DDTHH:mm`) to the strict-UTC instant
 * the API stores. DST-aware: the same wall hour maps to UTC+3 in Egyptian
 * summer and UTC+2 in winter, so an implicit-timezone bug cannot recur at
 * this edge.
 */
export function cairoWallTimeToUtcIso(wallTime: string): string {
  return dayjs.tz(wallTime, PRESENTATION_TIME_ZONE).utc().toISOString();
}

/** Render a stored UTC instant as the Cairo wall time a form edits. */
export function utcIsoToCairoWallTime(isoDateTime: string): string {
  return dayjs.utc(isoDateTime).tz(PRESENTATION_TIME_ZONE).format(CAIRO_WALL_TIME_FORMAT);
}

/** The current Cairo wall time (the impure clock read for datetime forms). */
export function nowCairoWallTime(): string {
  return dayjs().tz(PRESENTATION_TIME_ZONE).format(CAIRO_WALL_TIME_FORMAT);
}

/** The current instant as a UTC ISO 8601 string (the one impure clock read). */
export function nowIso(): string {
  return new Date().toISOString();
}

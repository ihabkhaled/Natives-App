import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

function withLocale(isoDateTime: string, locale: string): dayjs.Dayjs {
  return dayjs(isoDateTime).locale(locale);
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

import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatDate, formatDateTime, formatRelativeToNow, isValidIsoDateTime } from './date.facade';

// Offset-free timestamps: the formatters render in the runtime timezone, so
// pinning an offset would make these assertions depend on the CI machine.
const ISO_DATE_TIME = '2024-03-15T10:30:00';
const ONE_HOUR_LATER = '2024-03-15T11:30:00';

afterEach(() => {
  vi.useRealTimers();
});

describe('isValidIsoDateTime', () => {
  it('accepts a full ISO timestamp', () => {
    expect(isValidIsoDateTime('2024-03-15T10:30:00.000Z')).toBe(true);
  });

  it('accepts a date-only ISO string', () => {
    expect(isValidIsoDateTime('2024-03-15')).toBe(true);
  });

  it('rejects unparseable text', () => {
    expect(isValidIsoDateTime('not-a-date')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidIsoDateTime('')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats a long date in English', () => {
    expect(formatDate(ISO_DATE_TIME, 'en')).toBe('March 15, 2024');
  });

  it('formats a long date in Arabic', () => {
    expect(formatDate(ISO_DATE_TIME, 'ar')).toBe('15 مارس 2024');
  });
});

describe('formatDateTime', () => {
  it('formats a long date and time in English', () => {
    expect(formatDateTime(ISO_DATE_TIME, 'en')).toBe('March 15, 2024 10:30 AM');
  });

  it('formats a long date and time in Arabic', () => {
    expect(formatDateTime(ISO_DATE_TIME, 'ar')).toBe('15 مارس 2024 10:30');
  });
});

describe('formatRelativeToNow', () => {
  it('describes the past relative to now in English', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(ONE_HOUR_LATER));

    expect(formatRelativeToNow(ISO_DATE_TIME, 'en')).toBe('an hour ago');
  });

  it('describes the past relative to now in Arabic', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(ONE_HOUR_LATER));

    expect(formatRelativeToNow(ISO_DATE_TIME, 'ar')).toBe('منذ ساعة واحدة');
  });

  it('describes the future relative to now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(ISO_DATE_TIME));

    expect(formatRelativeToNow(ONE_HOUR_LATER, 'en')).toBe('in an hour');
  });
});

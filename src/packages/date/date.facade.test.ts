import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  cairoDayKey,
  formatCairoDate,
  formatCairoDateTime,
  formatCairoTime,
  formatCairoWeekdayDate,
  formatDate,
  formatDateTime,
  formatRelativeToNow,
  isInstantInPast,
  isValidIsoDateTime,
  nowIso,
  PRESENTATION_TIME_ZONE,
} from './date.facade';

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

// UTC instants with an explicit Z: presented in Africa/Cairo (UTC+3 in July
// under Egypt's reinstated DST, UTC+2 in January) so the assertions are
// deterministic regardless of the CI machine's timezone.
const SUMMER_UTC = '2026-07-18T14:00:00.000Z';
const SUMMER_LATE_UTC = '2026-07-18T22:30:00.000Z';
const WINTER_LATE_UTC = '2026-01-18T22:30:00.000Z';

describe('PRESENTATION_TIME_ZONE', () => {
  it('is Africa/Cairo', () => {
    expect(PRESENTATION_TIME_ZONE).toBe('Africa/Cairo');
  });
});

describe('formatCairoTime', () => {
  it('renders the Cairo wall-clock time in English', () => {
    expect(formatCairoTime(SUMMER_UTC, 'en')).toBe('5:00 PM');
  });

  it('rolls a late-evening UTC instant into Cairo winter time', () => {
    expect(formatCairoTime(WINTER_LATE_UTC, 'en')).toBe('12:30 AM');
  });
});

describe('formatCairoDate', () => {
  it('renders the Cairo calendar date in English', () => {
    expect(formatCairoDate(SUMMER_UTC, 'en')).toBe('July 18, 2026');
  });
});

describe('formatCairoDateTime', () => {
  it('renders the Cairo date and time in English', () => {
    expect(formatCairoDateTime(SUMMER_UTC, 'en')).toBe('July 18, 2026 5:00 PM');
  });

  it('renders the Cairo date and time in Arabic', () => {
    expect(formatCairoDateTime(SUMMER_UTC, 'ar')).toBe('18 يوليو 2026 17:00');
  });
});

describe('formatCairoWeekdayDate', () => {
  it('renders the Cairo weekday and long date', () => {
    expect(formatCairoWeekdayDate(SUMMER_UTC, 'en')).toBe('Saturday, July 18, 2026');
  });
});

describe('cairoDayKey', () => {
  it('buckets an afternoon instant on its Cairo day', () => {
    expect(cairoDayKey(SUMMER_UTC)).toBe('2026-07-18');
  });

  it('buckets a late-evening UTC instant on the next Cairo day', () => {
    expect(cairoDayKey(SUMMER_LATE_UTC)).toBe('2026-07-19');
  });
});

describe('isInstantInPast', () => {
  it('is true when the instant precedes the reference', () => {
    expect(isInstantInPast('2026-07-18T10:00:00.000Z', '2026-07-18T12:00:00.000Z')).toBe(true);
  });

  it('is false when the instant follows the reference', () => {
    expect(isInstantInPast('2026-07-18T14:00:00.000Z', '2026-07-18T12:00:00.000Z')).toBe(false);
  });

  it('is false when the instant equals the reference', () => {
    expect(isInstantInPast('2026-07-18T12:00:00.000Z', '2026-07-18T12:00:00.000Z')).toBe(false);
  });
});

describe('nowIso', () => {
  it('returns the current instant as a UTC ISO string', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-18T12:00:00.000Z'));

    expect(nowIso()).toBe('2026-07-18T12:00:00.000Z');
  });
});

import { describe, expect, it } from 'vitest';

import { extractDateTimeValue } from './datetime-field.helper';

describe('extractDateTimeValue', () => {
  it('keeps the date and the minute-precise time', () => {
    expect(extractDateTimeValue('2026-08-01T18:30')).toBe('2026-08-01T18:30');
  });

  it('trims seconds and fractions down to minute precision', () => {
    expect(extractDateTimeValue('2026-08-01T18:30:45')).toBe('2026-08-01T18:30');
    expect(extractDateTimeValue('2026-08-01T18:30:45.500')).toBe('2026-08-01T18:30');
  });

  it('takes the first entry when the control reports an array', () => {
    expect(extractDateTimeValue(['2026-08-01T18:30:00', '2026-08-02T10:00:00'])).toBe(
      '2026-08-01T18:30',
    );
  });

  it('maps a cleared value to an empty string', () => {
    expect(extractDateTimeValue(null)).toBe('');
    expect(extractDateTimeValue(undefined)).toBe('');
    expect(extractDateTimeValue('')).toBe('');
    expect(extractDateTimeValue([])).toBe('');
  });
});

import { describe, expect, it } from 'vitest';

import { extractDateValue } from './date-field.helper';

describe('extractDateValue', () => {
  it('passes a date-only string through unchanged', () => {
    expect(extractDateValue('2026-07-11')).toBe('2026-07-11');
  });

  it('drops a time part so the wire value stays date-only', () => {
    expect(extractDateValue('2026-07-11T00:00:00')).toBe('2026-07-11');
    expect(extractDateValue('2026-07-11T23:59:59.999+02:00')).toBe('2026-07-11');
  });

  it('takes the first entry when the control reports an array', () => {
    expect(extractDateValue(['2026-07-11', '2026-07-12'])).toBe('2026-07-11');
  });

  it('maps a cleared value to an empty string', () => {
    expect(extractDateValue(null)).toBe('');
    expect(extractDateValue(undefined)).toBe('');
    expect(extractDateValue('')).toBe('');
    expect(extractDateValue([])).toBe('');
  });
});

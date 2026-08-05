import { describe, expect, it } from 'vitest';

import { DRILL_FIELD_LIMITS } from '../constants/drills.constants';
import { isValidDurationInput, parseDurationInput } from './drill-duration.helper';

describe('parseDurationInput', () => {
  it('parses a whole-number string', () => {
    expect(parseDurationInput('15')).toBe(15);
  });

  it('treats a blank field as no default duration', () => {
    expect(parseDurationInput('')).toBeNull();
    expect(parseDurationInput('   ')).toBeNull();
  });

  it('rejects a non-integer value', () => {
    expect(parseDurationInput('12.5')).toBeNull();
    expect(parseDurationInput('abc')).toBeNull();
  });
});

describe('isValidDurationInput', () => {
  it('accepts a blank field, since the duration is optional', () => {
    expect(isValidDurationInput('')).toBe(true);
  });

  it('accepts a value inside the wire bounds', () => {
    expect(isValidDurationInput(String(DRILL_FIELD_LIMITS.durationMin))).toBe(true);
    expect(isValidDurationInput(String(DRILL_FIELD_LIMITS.durationMax))).toBe(true);
  });

  it('rejects a value below the minimum', () => {
    expect(isValidDurationInput(String(DRILL_FIELD_LIMITS.durationMin - 1))).toBe(false);
  });

  it('rejects a value above the maximum', () => {
    expect(isValidDurationInput(String(DRILL_FIELD_LIMITS.durationMax + 1))).toBe(false);
  });

  it('rejects a non-numeric value', () => {
    expect(isValidDurationInput('fifteen')).toBe(false);
  });
});

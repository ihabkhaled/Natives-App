import { describe, expect, it } from 'vitest';

import {
  buildSelfEditInitialValues,
  normalizeOptionalText,
  normalizeRequiredName,
  parseJerseyInput,
} from './member-form.helper';

describe('member-form.helper', () => {
  it('parses jersey input', () => {
    expect(parseJerseyInput('')).toBeNull();
    expect(parseJerseyInput('abc')).toBeNull();
    expect(parseJerseyInput('12')).toBe(12);
  });

  it('normalizes required and optional text', () => {
    expect(normalizeRequiredName('  ')).toBeNull();
    expect(normalizeRequiredName(' Omar ')).toBe('Omar');
    expect(normalizeOptionalText('')).toBeNull();
    expect(normalizeOptionalText(' x ')).toBe('x');
  });

  it('seeds self-edit values from a profile or blanks', () => {
    expect(buildSelfEditInitialValues(undefined)).toEqual({
      fullName: '',
      nickname: '',
      jersey: '',
    });
    expect(
      buildSelfEditInitialValues({
        fullName: null,
        displayName: 'Omar',
        nickname: null,
        jerseyNumber: 7,
      }),
    ).toEqual({ fullName: 'Omar', nickname: '', jersey: '7' });
    expect(
      buildSelfEditInitialValues({
        fullName: 'Omar Hassan',
        displayName: 'Omar',
        nickname: 'O',
        jerseyNumber: null,
      }),
    ).toEqual({ fullName: 'Omar Hassan', nickname: 'O', jersey: '' });
  });
});

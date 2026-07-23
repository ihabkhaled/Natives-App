import { describe, expect, it } from 'vitest';

import {
  integerFieldPatch,
  numericInputValue,
  parseDecimalInput,
  parseIntegerInput,
} from './numeric-input.helper';

describe('parseIntegerInput', () => {
  it('parses a plain integer and trims whitespace', () => {
    expect(parseIntegerInput(' 42 ')).toBe(42);
  });

  it('treats empty, fractional, and non-numeric entries as not provided', () => {
    expect(parseIntegerInput('')).toBeUndefined();
    expect(parseIntegerInput('4.5')).toBeUndefined();
    expect(parseIntegerInput('abc')).toBeUndefined();
  });
});

describe('parseDecimalInput', () => {
  it('parses decimals and refuses non-finite entries', () => {
    expect(parseDecimalInput('0.5')).toBe(0.5);
    expect(parseDecimalInput('')).toBeUndefined();
    expect(parseDecimalInput('abc')).toBeUndefined();
  });
});

describe('numericInputValue', () => {
  it('renders a number and an honest empty string for none', () => {
    expect(numericInputValue(7)).toBe('7');
    expect(numericInputValue(undefined)).toBe('');
  });
});

describe('integerFieldPatch', () => {
  it('builds a one-field patch for a parsable entry', () => {
    expect(integerFieldPatch('threshold', '250')).toEqual({ threshold: 250 });
  });

  it('keeps the previous number for an unparsable entry', () => {
    expect(integerFieldPatch('threshold', 'nope')).toEqual({});
  });
});

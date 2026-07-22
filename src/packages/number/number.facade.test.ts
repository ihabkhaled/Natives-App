import { describe, expect, it } from 'vitest';

import { formatNumber, formatPercent, formatScorePair, formatSignedNumber } from './number.facade';

const ENGLISH = 'en';
const ARABIC = 'ar';

/** Arabic-Indic digits (U+0660-U+0669), which this app never renders. */
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/u;

/** U+2068 / U+2069 — the isolate pair `formatScorePair` wraps a score in. */
const FIRST_STRONG_ISOLATE = '⁨';
const POP_DIRECTIONAL_ISOLATE = '⁩';

describe('formatNumber', () => {
  it('groups thousands for English', () => {
    expect(formatNumber(1234567, ENGLISH)).toBe('1,234,567');
  });

  it('keeps small ranks and jersey numbers unadorned', () => {
    expect(formatNumber(7, ENGLISH)).toBe('7');
    expect(formatNumber(7, ARABIC)).toBe('7');
  });

  it('renders Arabic with Latin digits so scores stay scannable', () => {
    expect(formatNumber(1234, ARABIC)).toMatch(/1.?234/u);
    expect(formatNumber(1234, ARABIC)).not.toMatch(ARABIC_INDIC_DIGITS);
  });

  it('rounds away fractions rather than showing a partial point', () => {
    expect(formatNumber(12.6, ENGLISH)).toBe('13');
  });

  it('reuses the cached formatter for a repeated locale', () => {
    expect(formatNumber(42, ENGLISH)).toBe(formatNumber(42, ENGLISH));
  });
});

describe('formatSignedNumber', () => {
  it('writes an explicit plus for a gain', () => {
    expect(formatSignedNumber(5, ENGLISH)).toBe('+5');
  });

  it('writes a minus for a deduction', () => {
    expect(formatSignedNumber(-3, ENGLISH)).toBe('-3');
  });

  it('leaves zero unsigned', () => {
    expect(formatSignedNumber(0, ENGLISH)).toBe('0');
  });

  it('keeps Latin digits in Arabic', () => {
    expect(formatSignedNumber(12, ARABIC)).toContain('12');
  });
});

describe('formatPercent', () => {
  it('reads a 0-100 API value as a percentage', () => {
    expect(formatPercent(76, ENGLISH)).toBe('76%');
  });

  it('rounds to a whole percent', () => {
    expect(formatPercent(75.6, ENGLISH)).toBe('76%');
  });

  it('formats zero as a real measured zero', () => {
    expect(formatPercent(0, ENGLISH)).toBe('0%');
  });

  it('emits the bidi marks an Arabic paragraph needs around the sign', () => {
    const arabic = formatPercent(76, ARABIC);
    expect(arabic).toContain('76');
    expect(arabic).toContain('%');
    expect(arabic).not.toBe('76%');
  });
});

describe('formatScorePair', () => {
  it('renders our score first, separated by an en dash', () => {
    expect(formatScorePair(8, 6, ENGLISH)).toBe(
      `${FIRST_STRONG_ISOLATE}8 – 6${POP_DIRECTIONAL_ISOLATE}`,
    );
  });

  it('isolates the run so RTL cannot reverse the result', () => {
    const arabic = formatScorePair(8, 6, ARABIC);
    expect(arabic.startsWith(FIRST_STRONG_ISOLATE)).toBe(true);
    expect(arabic.endsWith(POP_DIRECTIONAL_ISOLATE)).toBe(true);
    expect(arabic.indexOf('8')).toBeLessThan(arabic.indexOf('6'));
  });

  it('renders a goalless match as two zeros, never as empty', () => {
    expect(formatScorePair(0, 0, ENGLISH)).toContain('0 – 0');
  });
});

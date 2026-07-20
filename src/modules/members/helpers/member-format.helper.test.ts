import { describe, expect, it } from 'vitest';

import {
  formatAgeClassification,
  formatGender,
  formatHeight,
  formatJerseyLabel,
  formatPositionsSummary,
  formatWeight,
} from './member-format.helper';

const t = (key: string): string => key;

describe('member-format.helper', () => {
  it('formats jersey label or null', () => {
    expect(formatJerseyLabel(t, 7)).toBe('members.jerseyLabel');
    expect(formatJerseyLabel(t, null)).toBeNull();
  });

  it('summarizes positions or null when empty', () => {
    expect(formatPositionsSummary(['a', 'b'])).toBe('a · b');
    expect(formatPositionsSummary([])).toBeNull();
  });

  it('formats gender and age or null', () => {
    expect(formatGender(t, 'man')).toBe('members.genderMan');
    expect(formatGender(t, null)).toBeNull();
    expect(formatAgeClassification(t, 'senior')).toBe('members.ageSenior');
    expect(formatAgeClassification(t, null)).toBeNull();
  });

  it('formats height and weight or null', () => {
    expect(formatHeight(t, 182)).toBe('members.heightUnit');
    expect(formatHeight(t, null)).toBeNull();
    expect(formatWeight(t, 78)).toBe('members.weightUnit');
    expect(formatWeight(t, null)).toBeNull();
  });
});

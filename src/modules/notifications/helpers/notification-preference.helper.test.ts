import { describe, expect, it } from 'vitest';

import type { NotificationPreference } from '../types/notifications.types';
import { buildPreferenceMatrix, isValidLocalTime } from './notification-preference.helper';

const STORED: NotificationPreference[] = [
  { category: 'practice', channel: 'email', enabled: true },
  { category: 'practice', channel: 'push', enabled: false },
];

describe('buildPreferenceMatrix', () => {
  const matrix = buildPreferenceMatrix(STORED);

  it('renders one row per catalog category, not per persisted row', () => {
    expect(matrix.map((row) => row.category)).toEqual([
      'member_lifecycle',
      'practice',
      'attendance',
      'system',
    ]);
  });

  it('renders one cell per channel', () => {
    expect(matrix[0]?.cells.map((cell) => cell.channel)).toEqual(['in_app', 'email', 'push']);
  });

  it('locks the in-app channel on every category', () => {
    for (const row of matrix) {
      expect(row.cells[0]?.locked).toBe(true);
      expect(row.cells[0]?.enabled).toBe(true);
    }
  });

  it('locks every channel of the mandatory security category', () => {
    const system = matrix.find((row) => row.category === 'system');

    expect(system?.hasLockedCell).toBe(true);
    expect(system?.cells.every((cell) => cell.locked && cell.enabled)).toBe(true);
  });

  it('does not flag an optional category as mandatory', () => {
    expect(matrix.find((row) => row.category === 'practice')?.hasLockedCell).toBe(false);
  });

  it('reflects the stored value for an optional cell', () => {
    const practice = matrix.find((row) => row.category === 'practice');

    expect(practice?.cells.find((cell) => cell.channel === 'email')?.enabled).toBe(true);
    expect(practice?.cells.find((cell) => cell.channel === 'push')?.enabled).toBe(false);
  });

  it('shows a channel the server never persisted as explicitly off', () => {
    const attendance = matrix.find((row) => row.category === 'attendance');

    expect(attendance?.cells.find((cell) => cell.channel === 'email')?.enabled).toBe(false);
  });
});

describe('isValidLocalTime', () => {
  it('accepts a 24-hour wall-clock time', () => {
    expect(isValidLocalTime('22:00')).toBe(true);
    expect(isValidLocalTime('00:00')).toBe(true);
    expect(isValidLocalTime('23:59')).toBe(true);
  });

  it('rejects anything that is not a 24-hour wall-clock time', () => {
    expect(isValidLocalTime('24:00')).toBe(false);
    expect(isValidLocalTime('7:00')).toBe(false);
    expect(isValidLocalTime('22:60')).toBe(false);
    expect(isValidLocalTime('')).toBe(false);
  });
});

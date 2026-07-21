import { describe, expect, it, vi } from 'vitest';

import type { NotificationPreference } from '../types/notifications.types';
import { buildPreferenceRows } from './preference-view.helper';

const t = (key: string): string => key;

const STORED: NotificationPreference[] = [
  { category: 'practice', channel: 'email', enabled: true },
];

describe('buildPreferenceRows', () => {
  it('labels every category and channel through the catalog', () => {
    const rows = buildPreferenceRows(t, STORED, vi.fn());

    expect(rows.map((row) => row.categoryLabel)).toEqual([
      'notifications.categoryMemberLifecycle',
      'notifications.categoryPractice',
      'notifications.categoryAttendance',
      'notifications.categorySystem',
    ]);
    expect(rows[0]?.cells.map((cell) => cell.channelLabel)).toEqual([
      'notifications.channelInApp',
      'notifications.channelEmail',
      'notifications.channelPush',
    ]);
  });

  it('badges the mandatory category as always on', () => {
    const rows = buildPreferenceRows(t, STORED, vi.fn());

    expect(rows.find((row) => row.key === 'system')?.mandatoryLabel).toBe(
      'notifications.mandatoryBadge',
    );
    expect(rows.find((row) => row.key === 'practice')?.mandatoryLabel).toBeNull();
  });

  it('toggles an optional cell to the opposite of its current value', () => {
    const toggle = vi.fn();
    const rows = buildPreferenceRows(t, STORED, toggle);
    const practiceEmail = rows
      .find((row) => row.key === 'practice')
      ?.cells.find((cell) => cell.key === 'practice-email');

    practiceEmail?.onToggle();

    expect(toggle).toHaveBeenCalledWith({
      category: 'practice',
      channel: 'email',
      enabled: false,
    });
  });

  it('never emits a command for a locked cell', () => {
    const toggle = vi.fn();
    const rows = buildPreferenceRows(t, STORED, toggle);

    rows.find((row) => row.key === 'system')?.cells.forEach((cell) => {
      cell.onToggle();
    });
    rows.find((row) => row.key === 'practice')?.cells[0]?.onToggle();

    expect(toggle).not.toHaveBeenCalled();
  });
});

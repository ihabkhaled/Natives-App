import { describe, expect, it } from 'vitest';

import type { PracticeSchedule } from '../types/practice-schedules.types';
import { buildScheduleRow } from './schedule-row.helper';

const t = (key: string): string => key;

const BASE: PracticeSchedule = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1, 3],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  defaultCapacity: null,
  visibility: 'team',
  organizerUserId: null,
  notes: null,
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: [],
  status: 'active',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  updatedAtIso: '2026-01-01T00:00:00.000Z',
  version: 1,
};

describe('buildScheduleRow', () => {
  it('joins frequency, weekdays, and start time into one summary', () => {
    const row = buildScheduleRow(t, BASE, '/practice-schedules/s1');

    expect(row.summary).toBe(
      'practiceSchedules.frequencyWeekly · practiceSchedules.weekdayMon, practiceSchedules.weekdayWed · 18:00',
    );
    expect(row.id).toBe('s1');
    expect(row.name).toBe('Evening practice');
    expect(row.detailPath).toBe('/practice-schedules/s1');
  });

  it('omits the weekdays segment for a one-off pattern', () => {
    const row = buildScheduleRow(t, { ...BASE, frequency: 'one_off', weekdays: [] }, '/x');

    expect(row.summary).toBe('practiceSchedules.frequencyOneOff · 18:00');
  });

  it('flags an archived schedule', () => {
    const row = buildScheduleRow(t, { ...BASE, status: 'archived' }, '/x');

    expect(row.isArchived).toBe(true);
    expect(row.statusLabel).toBe('practiceSchedules.statusArchived');
  });

  it('does not flag an active schedule as archived', () => {
    const row = buildScheduleRow(t, BASE, '/x');

    expect(row.isArchived).toBe(false);
  });
});

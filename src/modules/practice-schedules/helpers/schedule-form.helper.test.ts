import { describe, expect, it } from 'vitest';

import type { ScheduleDraft } from '../types/practice-schedules.types';
import {
  buildWeekdayOptions,
  EMPTY_SCHEDULE_FORM_VALUES,
  toggleWeekday,
  toScheduleDraft,
  toScheduleFormValues,
} from './schedule-form.helper';

const t = (key: string): string => key;

const DRAFT: ScheduleDraft = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly',
  weekdays: [1, 3],
  intervalWeeks: 2,
  startTimeLocal: '18:00',
  durationMinutes: 90,
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team',
  defaultCapacity: 24,
  notes: 'Bring both jerseys.',
};

describe('toScheduleFormValues', () => {
  it('returns the blank defaults for a null draft', () => {
    expect(toScheduleFormValues(null)).toEqual(EMPTY_SCHEDULE_FORM_VALUES);
  });

  it('renders every number in a draft as its decimal text', () => {
    const values = toScheduleFormValues(DRAFT);

    expect(values.intervalWeeks).toBe('2');
    expect(values.durationMinutes).toBe('90');
    expect(values.defaultCapacity).toBe('24');
    expect(values.notes).toBe('Bring both jerseys.');
  });

  it('renders a null capacity and null notes as empty strings', () => {
    const values = toScheduleFormValues({ ...DRAFT, defaultCapacity: null, notes: null });

    expect(values.defaultCapacity).toBe('');
    expect(values.notes).toBe('');
  });
});

describe('toScheduleDraft', () => {
  it('parses the submitted strings back into a draft, trimmed', () => {
    const draft = toScheduleDraft(
      {
        name: '  Evening practice  ',
        sessionType: 'practice',
        frequency: 'weekly',
        intervalWeeks: '2',
        startTimeLocal: '18:00',
        durationMinutes: '90',
        timezone: 'Africa/Cairo',
        generationStart: '2026-01-01',
        generationUntil: '2026-03-01',
        visibility: 'team',
        defaultCapacity: '24',
        notes: '  Bring both jerseys.  ',
      },
      [1, 3],
    );

    expect(draft).toEqual(DRAFT);
  });

  it('collapses a blank capacity and blank notes to null', () => {
    const draft = toScheduleDraft(
      {
        name: 'x',
        sessionType: 'x',
        frequency: 'one_off',
        intervalWeeks: '1',
        startTimeLocal: '09:00',
        durationMinutes: '60',
        timezone: 'Africa/Cairo',
        generationStart: '2026-01-01',
        generationUntil: '2026-01-02',
        visibility: 'team',
        defaultCapacity: '',
        notes: '   ',
      },
      [],
    );

    expect(draft.defaultCapacity).toBeNull();
    expect(draft.notes).toBeNull();
  });
});

describe('toggleWeekday', () => {
  it('adds a day that was not selected, keeping the list sorted', () => {
    expect(toggleWeekday([1, 5], 3)).toEqual([1, 3, 5]);
  });

  it('drops a day that was already selected', () => {
    expect(toggleWeekday([1, 3, 5], 3)).toEqual([1, 5]);
  });
});

describe('buildWeekdayOptions', () => {
  it('marks every day selected that the draft currently includes', () => {
    const options = buildWeekdayOptions(t, [0, 6]);

    expect(options).toHaveLength(7);
    expect(options[0]).toEqual({ value: 0, label: 'practiceSchedules.weekdaySun', selected: true });
    expect(options[1]?.selected).toBe(false);
    expect(options[6]).toEqual({ value: 6, label: 'practiceSchedules.weekdaySat', selected: true });
  });
});

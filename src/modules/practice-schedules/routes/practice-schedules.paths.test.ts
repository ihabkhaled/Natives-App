import { describe, expect, it } from 'vitest';

import {
  practiceScheduleDetailPath,
  practiceScheduleDetailPattern,
  practiceScheduleNewPath,
  practiceSchedulesPath,
} from './practice-schedules.paths';

describe('practice-schedules paths', () => {
  it('exposes the list path', () => {
    expect(practiceSchedulesPath()).toBe('/practice-schedules');
  });

  it('exposes the literal create path', () => {
    expect(practiceScheduleNewPath()).toBe('/practice-schedules/new');
  });

  it('exposes the detail pattern with its parameter unresolved', () => {
    expect(practiceScheduleDetailPattern()).toBe('/practice-schedules/:scheduleId');
  });

  it('resolves the detail pattern for one schedule', () => {
    expect(practiceScheduleDetailPath('s1')).toBe('/practice-schedules/s1');
  });

  it('encodes the id so a stray slash cannot invent a route segment', () => {
    expect(practiceScheduleDetailPath('s/1')).toBe('/practice-schedules/s%2F1');
  });
});

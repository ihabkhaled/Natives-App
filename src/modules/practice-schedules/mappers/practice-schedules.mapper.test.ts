import { describe, expect, it } from 'vitest';

import type { PracticeSchedule, ScheduleDraft } from '../types/practice-schedules.types';
import {
  toCarryOverFields,
  toCreateScheduleBody,
  toGenerationResult,
  toPracticeSchedule,
  toPracticeScheduleListPage,
  toScheduleDraftFromSchedule,
  toUpdateScheduleBody,
} from './practice-schedules.mapper';

const DTO = {
  id: 's1',
  teamId: 't1',
  seasonId: 'season-1',
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly' as const,
  intervalWeeks: 1,
  weekdays: [1, 3],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: 15,
  rsvpCutoffMinutes: 120,
  defaultVenueId: 'venue-1',
  defaultField: 'Field A',
  defaultCapacity: 24,
  visibility: 'team' as const,
  organizerUserId: 'user-1',
  notes: 'Bring both jerseys.',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: ['2026-02-01'],
  status: 'active' as const,
  createdBy: 'user-1',
  updatedBy: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  version: 3,
};

describe('toPracticeSchedule', () => {
  it('renames the wire instants to the …Iso convention and keeps every field', () => {
    const schedule = toPracticeSchedule(DTO);

    expect(schedule.createdAtIso).toBe(DTO.createdAt);
    expect(schedule.updatedAtIso).toBe(DTO.updatedAt);
    expect(schedule.id).toBe('s1');
    expect(schedule.weekdays).toEqual([1, 3]);
    expect(schedule.version).toBe(3);
  });
});

describe('toPracticeScheduleListPage', () => {
  it('maps every item and keeps the paging envelope', () => {
    const page = toPracticeScheduleListPage({ items: [DTO], total: 1, limit: 20, offset: 0 });

    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe('s1');
    expect(page.total).toBe(1);
    expect(page.limit).toBe(20);
    expect(page.offset).toBe(0);
  });
});

describe('toGenerationResult', () => {
  it('drops the individual sessions, keeping only the two counts', () => {
    const result = toGenerationResult({
      created: 2,
      skipped: 1,
      sessions: [{ id: 'sess-1' } as never],
    });

    expect(result).toEqual({ created: 2, skipped: 1 });
  });
});

const DRAFT: ScheduleDraft = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly',
  weekdays: [1, 3],
  intervalWeeks: 1,
  startTimeLocal: '18:00',
  durationMinutes: 90,
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team',
  defaultCapacity: 24,
  notes: 'Bring both jerseys.',
};

describe('toCreateScheduleBody', () => {
  it('carries every required field plus the optional ones the draft set', () => {
    const body = toCreateScheduleBody(DRAFT);

    expect(body.name).toBe('Evening practice');
    expect(body.defaultCapacity).toBe(24);
    expect(body.notes).toBe('Bring both jerseys.');
    expect(body.status).toBeUndefined();
    expect(body.expectedVersion).toBeUndefined();
  });

  it('omits an unset capacity and blank notes rather than sending null', () => {
    const body = toCreateScheduleBody({ ...DRAFT, defaultCapacity: null, notes: null });

    expect(body.defaultCapacity).toBeUndefined();
    expect(body.notes).toBeUndefined();
  });
});

describe('toUpdateScheduleBody', () => {
  it('carries status, expectedVersion, and every carried-over field', () => {
    const schedule: PracticeSchedule = toPracticeSchedule(DTO);
    const body = toUpdateScheduleBody({
      draft: DRAFT,
      status: 'active',
      expectedVersion: 3,
      carryOver: toCarryOverFields(schedule),
    });

    expect(body.status).toBe('active');
    expect(body.expectedVersion).toBe(3);
    expect(body.defaultVenueId).toBe('venue-1');
    expect(body.organizerUserId).toBe('user-1');
    expect(body.seasonId).toBe('season-1');
    expect(body.exceptions).toEqual(['2026-02-01']);
  });
});

describe('toCarryOverFields', () => {
  it('reads the fields the form never shows straight off the record', () => {
    const schedule = toPracticeSchedule(DTO);

    expect(toCarryOverFields(schedule)).toEqual({
      meetOffsetMinutes: 15,
      rsvpCutoffMinutes: 120,
      defaultVenueId: 'venue-1',
      defaultField: 'Field A',
      organizerUserId: 'user-1',
      seasonId: 'season-1',
      exceptions: ['2026-02-01'],
    });
  });
});

describe('toScheduleDraftFromSchedule', () => {
  it('extracts exactly the fields the form edits', () => {
    const schedule = toPracticeSchedule(DTO);

    expect(toScheduleDraftFromSchedule(schedule)).toEqual(DRAFT);
  });
});

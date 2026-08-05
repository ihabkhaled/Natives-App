import { describe, expect, it } from 'vitest';

import type { PracticeSchedule, ScheduleDraft } from '../types/practice-schedules.types';
import {
  draftWeekdays,
  resolveCanGenerate,
  resolveDetailHasError,
  resolveDetailIsForbidden,
  resolveDetailIsLoading,
  resolveDetailReadEnabled,
} from './schedule-detail-context.helper';

describe('resolveDetailReadEnabled', () => {
  it('never enables the read in create mode', () => {
    expect(
      resolveDetailReadEnabled({ isCreateMode: true, contextLoading: false, canManage: true }),
    ).toBe(false);
  });

  it('waits for the team/permission context before reading', () => {
    expect(
      resolveDetailReadEnabled({ isCreateMode: false, contextLoading: true, canManage: true }),
    ).toBe(false);
  });

  it('withholds the read from a principal without the grant', () => {
    expect(
      resolveDetailReadEnabled({ isCreateMode: false, contextLoading: false, canManage: false }),
    ).toBe(false);
  });

  it('enables the read once every condition clears', () => {
    expect(
      resolveDetailReadEnabled({ isCreateMode: false, contextLoading: false, canManage: true }),
    ).toBe(true);
  });
});

describe('resolveDetailIsLoading', () => {
  it('is loading while the team/permission context resolves, even in create mode', () => {
    expect(
      resolveDetailIsLoading({ contextLoading: true, isCreateMode: true, isPending: false }),
    ).toBe(true);
  });

  it('is never blocked on a read that never fires in create mode', () => {
    expect(
      resolveDetailIsLoading({ contextLoading: false, isCreateMode: true, isPending: true }),
    ).toBe(false);
  });

  it('is loading while the detail read is still pending in edit mode', () => {
    expect(
      resolveDetailIsLoading({ contextLoading: false, isCreateMode: false, isPending: true }),
    ).toBe(true);
  });

  it('is ready once the context and the read have both settled', () => {
    expect(
      resolveDetailIsLoading({ contextLoading: false, isCreateMode: false, isPending: false }),
    ).toBe(false);
  });
});

describe('resolveDetailHasError', () => {
  it('never reports an error in create mode', () => {
    expect(resolveDetailHasError(true, true)).toBe(false);
  });

  it('reports a failed read in edit mode', () => {
    expect(resolveDetailHasError(false, true)).toBe(true);
  });
});

describe('resolveDetailIsForbidden', () => {
  it('never reports forbidden while permissions are still resolving', () => {
    expect(resolveDetailIsForbidden(true, false)).toBe(false);
  });

  it('reports forbidden once permissions resolved without the grant', () => {
    expect(resolveDetailIsForbidden(false, false)).toBe(true);
  });

  it('never reports forbidden once permissions resolved with the grant', () => {
    expect(resolveDetailIsForbidden(false, true)).toBe(false);
  });
});

const SCHEDULE: PracticeSchedule = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1],
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

describe('resolveCanGenerate', () => {
  it('allows generate for an active schedule', () => {
    expect(resolveCanGenerate(SCHEDULE)).toBe(true);
  });

  it('refuses generate for an archived schedule', () => {
    expect(resolveCanGenerate({ ...SCHEDULE, status: 'archived' })).toBe(false);
  });

  it('refuses generate before a record has loaded', () => {
    expect(resolveCanGenerate(undefined)).toBe(false);
  });
});

describe('draftWeekdays', () => {
  it('reads the weekdays off a loaded draft', () => {
    const draft: ScheduleDraft = {
      name: SCHEDULE.name,
      sessionType: SCHEDULE.sessionType,
      frequency: SCHEDULE.frequency,
      weekdays: SCHEDULE.weekdays,
      intervalWeeks: SCHEDULE.intervalWeeks,
      startTimeLocal: SCHEDULE.startTimeLocal,
      durationMinutes: SCHEDULE.durationMinutes,
      timezone: SCHEDULE.timezone,
      generationStart: SCHEDULE.generationStart,
      generationUntil: SCHEDULE.generationUntil,
      visibility: SCHEDULE.visibility,
      defaultCapacity: null,
      notes: null,
    };
    expect(draftWeekdays(draft)).toEqual([1]);
  });

  it('starts blank when there is no draft yet', () => {
    expect(draftWeekdays(null)).toEqual([]);
  });
});

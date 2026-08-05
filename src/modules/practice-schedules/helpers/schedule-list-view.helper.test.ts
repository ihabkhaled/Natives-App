import { describe, expect, it, vi } from 'vitest';

import type { PracticeScheduleListPage } from '../types/practice-schedules.types';
import { buildSchedulesListView } from './schedule-list-view.helper';

const t = (key: string, params?: Readonly<Record<string, number>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

const PAGE: PracticeScheduleListPage = {
  items: [
    {
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
    },
  ],
  total: 1,
  limit: 20,
  offset: 0,
};

describe('buildSchedulesListView', () => {
  it('turns a loaded page into one row per schedule', () => {
    const view = buildSchedulesListView(t, {
      page: PAGE,
      isLoading: false,
      isForbidden: false,
      hasError: false,
      onNew: vi.fn(),
      onOpen: vi.fn(),
      detailPathFor: (id) => `/practice-schedules/${id}`,
    });

    expect(view.rows).toHaveLength(1);
    expect(view.rows[0]?.detailPath).toBe('/practice-schedules/s1');
    expect(view.hasSchedules).toBe(true);
    expect(view.countLabel).toBe('practiceSchedules.countLabel:{"count":1}');
  });

  it('falls back to an empty page before the query has data', () => {
    const view = buildSchedulesListView(t, {
      page: undefined,
      isLoading: true,
      isForbidden: false,
      hasError: false,
      onNew: vi.fn(),
      onOpen: vi.fn(),
      detailPathFor: (id) => `/practice-schedules/${id}`,
    });

    expect(view.rows).toEqual([]);
    expect(view.hasSchedules).toBe(false);
  });

  it('carries the loading, forbidden, and error flags straight through', () => {
    const view = buildSchedulesListView(t, {
      page: undefined,
      isLoading: true,
      isForbidden: true,
      hasError: true,
      onNew: vi.fn(),
      onOpen: vi.fn(),
      detailPathFor: (id) => id,
    });

    expect(view.isLoading).toBe(true);
    expect(view.isForbidden).toBe(true);
    expect(view.hasError).toBe(true);
  });
});

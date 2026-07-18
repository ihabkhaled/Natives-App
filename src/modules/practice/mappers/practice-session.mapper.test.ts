import { describe, expect, it } from 'vitest';

import type { SchemaOutput } from '@/packages/schema';

import type {
  practiceSessionDetailSchema,
  practiceSessionSummarySchema,
} from '../schemas/practice-session.schema';
import {
  mapPracticeSessionDetail,
  mapPracticeSessionListPage,
  mapPracticeSessionSummary,
  mapRsvpState,
  mapUpcomingPractices,
} from './practice-session.mapper';

type SummaryDto = SchemaOutput<typeof practiceSessionSummarySchema>;
type DetailDto = SchemaOutput<typeof practiceSessionDetailSchema>;

const SUMMARY: SummaryDto = {
  id: 'sess-1',
  type: 'practice',
  title: 'Evening practice',
  status: 'scheduled',
  startAt: '2026-07-26T15:00:00.000Z',
  endAt: '2026-07-26T17:00:00.000Z',
  meetAt: null,
  rsvpDeadlineAt: '2026-07-25T12:00:00.000Z',
  venueName: 'Zamalek Club Field',
  capacity: 24,
  myRsvpStatus: 'no_response',
  waitlisted: false,
  changeKind: null,
};

const DETAIL: DetailDto = {
  id: 'sess-1',
  type: 'scrimmage',
  title: null,
  status: 'rescheduled',
  startAt: '2026-07-26T15:00:00.000Z',
  endAt: '2026-07-26T17:00:00.000Z',
  meetAt: '2026-07-26T14:30:00.000Z',
  rsvpDeadlineAt: '2026-07-25T12:00:00.000Z',
  venue: {
    id: 'venue-1',
    name: 'Zamalek Club Field',
    addressLine: '26th of July St',
    mapUrl: 'https://maps.example.com/?q=zamalek',
    notes: 'Gate 3',
  },
  instructions: 'Bring jerseys',
  capacity: 20,
  counts: { going: 12, maybe: 3, notGoing: 2, waitlist: 1 },
  agenda: [{ id: 'a1', labelKey: 'practice.typeThrowing', durationMinutes: 30 }],
  rsvp: {
    status: 'going',
    reasonCategory: 'travel',
    respondedAt: '2026-07-24T10:00:00.000Z',
    version: 2,
    waitlisted: true,
    waitlistPosition: 3,
    deadlineAt: '2026-07-25T12:00:00.000Z',
    canRespond: true,
  },
  changeKind: 'venue_changed',
  updatedAt: '2026-07-24T09:00:00.000Z',
};

describe('mapRsvpState', () => {
  it('renames wire instants to the iso convention', () => {
    const state = mapRsvpState(DETAIL.rsvp);

    expect(state.respondedAtIso).toBe('2026-07-24T10:00:00.000Z');
    expect(state.deadlineAtIso).toBe('2026-07-25T12:00:00.000Z');
    expect(state.waitlistPosition).toBe(3);
  });
});

describe('mapPracticeSessionSummary', () => {
  it('renames the start and deadline instants', () => {
    const summary = mapPracticeSessionSummary(SUMMARY);

    expect(summary.startAtIso).toBe(SUMMARY.startAt);
    expect(summary.rsvpDeadlineAtIso).toBe(SUMMARY.rsvpDeadlineAt);
    expect(summary.meetAtIso).toBeNull();
  });
});

describe('mapPracticeSessionListPage', () => {
  it('maps items and carries pagination metadata', () => {
    const page = mapPracticeSessionListPage({
      items: [SUMMARY],
      page: 2,
      pageSize: 20,
      total: 21,
      hasMore: true,
    });

    expect(page.items).toHaveLength(1);
    expect(page.hasMore).toBe(true);
    expect(page.total).toBe(21);
  });
});

describe('mapUpcomingPractices', () => {
  it('maps the bounded upcoming list', () => {
    expect(mapUpcomingPractices({ items: [SUMMARY] })).toHaveLength(1);
  });
});

describe('mapPracticeSessionDetail', () => {
  it('maps a full detail with venue, counts, and agenda', () => {
    const detail = mapPracticeSessionDetail(DETAIL);

    expect(detail.venue?.name).toBe('Zamalek Club Field');
    expect(detail.counts?.going).toBe(12);
    expect(detail.agenda[0]?.durationMinutes).toBe(30);
    expect(detail.rsvp.status).toBe('going');
    expect(detail.updatedAtIso).toBe(DETAIL.updatedAt);
  });

  it('preserves null venue and null counts', () => {
    const detail = mapPracticeSessionDetail({ ...DETAIL, venue: null, counts: null, agenda: [] });

    expect(detail.venue).toBeNull();
    expect(detail.counts).toBeNull();
    expect(detail.agenda).toEqual([]);
  });
});

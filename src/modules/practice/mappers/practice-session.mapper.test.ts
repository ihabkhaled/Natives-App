import { describe, expect, it } from 'vitest';

import type { SchemaOutput } from '@/packages/schema';

import { PRACTICE_TYPE, RSVP_STATUS } from '../constants/practice.constants';
import type {
  practiceRsvpResponseSchema,
  practiceSessionResponseSchema,
} from '../schemas/practice-session.schema';
import {
  filterPracticePageByRsvp,
  filterPracticePageByType,
  mapPracticeSessionDetail,
  mapPracticeSessionListPage,
  mapPracticeSessionSummary,
  mapRsvpState,
  mapRsvpUpdate,
  toBackendSessionType,
} from './practice-session.mapper';

type SessionDto = SchemaOutput<typeof practiceSessionResponseSchema>;
type RsvpDto = SchemaOutput<typeof practiceRsvpResponseSchema>;

const SESSION: SessionDto = {
  cancellationReason: null,
  capacity: 24,
  createdAt: '2026-07-18T09:00:00.000Z',
  createdBy: null,
  endsAt: '2026-07-26T17:00:00.000Z',
  field: null,
  id: 'sess-1',
  meetAt: null,
  notes: null,
  occurrenceDate: '2026-07-26',
  organizerUserId: null,
  rsvpCutoffAt: '2026-07-25T12:00:00.000Z',
  scheduleId: null,
  seasonId: 'season-1',
  sessionType: 'practice',
  startsAt: '2026-07-26T15:00:00.000Z',
  status: 'published',
  teamId: 'team-1',
  timezone: 'Africa/Cairo',
  updatedAt: '2026-07-18T09:00:00.000Z',
  updatedBy: null,
  venueId: null,
  version: 2,
  visibility: 'team',
};

const RSVP: RsvpDto = {
  membershipId: 'membership-1',
  sessionId: SESSION.id,
  status: 'going',
  reasonCategory: 'travel',
  note: null,
  noteVisibility: null,
  respondedAt: '2026-07-24T10:00:00.000Z',
  source: 'self',
  version: 2,
  waitlisted: true,
};

describe('mapRsvpState', () => {
  it('combines the RSVP resource with session response policy', () => {
    const state = mapRsvpState(RSVP, SESSION.rsvpCutoffAt, true);

    expect(state.respondedAtIso).toBe(RSVP.respondedAt);
    expect(state.deadlineAtIso).toBe(SESSION.rsvpCutoffAt);
    expect(state.waitlistPosition).toBeNull();
    expect(state.canRespond).toBe(true);
  });
});

describe('mapRsvpUpdate', () => {
  it('keeps only authoritative fields returned by the mutation', () => {
    expect(mapRsvpUpdate(RSVP)).toEqual({
      status: 'going',
      reasonCategory: 'travel',
      respondedAtIso: RSVP.respondedAt,
      version: 2,
      waitlisted: true,
    });
  });
});

describe('mapPracticeSessionSummary', () => {
  it('maps exact backend names into the calendar domain', () => {
    const summary = mapPracticeSessionSummary(SESSION, RSVP);

    expect(summary.startAtIso).toBe(SESSION.startsAt);
    expect(summary.myRsvpStatus).toBe(RSVP.status);
    expect(summary.status).toBe('scheduled');
    expect(summary.venueName).toBeNull();
  });

  it('maps unknown backend session types to custom', () => {
    expect(
      mapPracticeSessionSummary({ ...SESSION, sessionType: 'beach-ultimate' }, RSVP).type,
    ).toBe(PRACTICE_TYPE.custom);
  });

  it.each([
    ['rescheduled', 'rescheduled', 'rescheduled'],
    ['cancelled', 'cancelled', 'cancelled'],
  ] as const)('maps %s lifecycle state', (wireStatus, status, changeKind) => {
    const summary = mapPracticeSessionSummary({ ...SESSION, status: wireStatus }, RSVP);
    expect(summary.status).toBe(status);
    expect(summary.changeKind).toBe(changeKind);
  });
});

describe('mapPracticeSessionListPage', () => {
  it('maps offset pagination and joins RSVP resources by session id', () => {
    const page = mapPracticeSessionListPage(
      { items: [SESSION], limit: 20, offset: 20, total: 45 },
      [RSVP],
    );

    expect(page.items).toHaveLength(1);
    expect(page.page).toBe(2);
    expect(page.hasMore).toBe(true);
  });

  it('drops a session that has no matching RSVP resource', () => {
    const page = mapPracticeSessionListPage(
      { items: [SESSION], limit: 20, offset: 0, total: 1 },
      [],
    );
    expect(page.items).toEqual([]);
    expect(page.hasMore).toBe(false);
  });
});

describe('mapPracticeSessionDetail', () => {
  it('combines session and RSVP without inventing unavailable projections', () => {
    const detail = mapPracticeSessionDetail(SESSION, RSVP);

    expect(detail.rsvp.status).toBe('going');
    expect(detail.venue).toBeNull();
    expect(detail.counts).toBeNull();
    expect(detail.agenda).toEqual([]);
    expect(detail.instructions).toBeNull();
  });

  it('closes RSVP policy for a completed session', () => {
    expect(
      mapPracticeSessionDetail({ ...SESSION, status: 'completed' }, RSVP).rsvp.canRespond,
    ).toBe(false);
  });
});

describe('practice page filters', () => {
  const page = mapPracticeSessionListPage(
    {
      items: [SESSION, { ...SESSION, id: 'sess-2', sessionType: 'fitness' }],
      limit: 20,
      offset: 0,
      total: 2,
    },
    [RSVP, { ...RSVP, sessionId: 'sess-2', status: RSVP_STATUS.maybe }],
  );

  it('keeps the page unchanged when filters are absent', () => {
    expect(filterPracticePageByRsvp(page, null)).toBe(page);
    expect(filterPracticePageByType(page, null)).toBe(page);
  });

  it('filters the joined page by RSVP and mapped type', () => {
    expect(filterPracticePageByRsvp(page, RSVP_STATUS.maybe).items).toHaveLength(1);
    expect(filterPracticePageByType(page, PRACTICE_TYPE.fitness).items).toHaveLength(1);
  });

  it('uses server sessionType except for the custom fallback', () => {
    expect(toBackendSessionType(PRACTICE_TYPE.practice)).toBe('practice');
    expect(toBackendSessionType(PRACTICE_TYPE.custom)).toBeNull();
    expect(toBackendSessionType(null)).toBeNull();
  });
});

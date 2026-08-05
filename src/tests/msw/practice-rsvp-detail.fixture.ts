type JsonObject = Record<string, unknown>;

interface MockParticipant {
  membershipId: string;
  status: string;
  waitlisted: boolean;
  source: string;
  respondedAt: string;
}

interface MockRevision {
  id: string;
  membershipId: string;
  fromStatus: string | null;
  toStatus: string;
  reasonCategory: string | null;
  note: string | null;
  waitlisted: boolean;
  source: string;
  isOverride: boolean;
  overrideReason: string | null;
  actorUserId: string | null;
  occurredAt: string;
}

const MOCK_ACTOR_ID = 'coach-mock-1';
const SESSION_CAPACITY = 20;

/**
 * Five participants covering every RSVP status and both response sources
 * (self and coach), so a roster read, the override flow, and the history
 * panel each have something real to show. `member-3` already carries one
 * coach override so a fresh read proves the history panel renders a prior
 * revision, not only one an in-session override just created.
 */
function initialParticipants(): MockParticipant[] {
  return [
    {
      membershipId: 'member-1',
      status: 'going',
      waitlisted: false,
      source: 'self',
      respondedAt: '2026-07-20T09:00:00.000Z',
    },
    {
      membershipId: 'member-2',
      status: 'maybe',
      waitlisted: false,
      source: 'self',
      respondedAt: '2026-07-20T10:00:00.000Z',
    },
    {
      membershipId: 'member-3',
      status: 'not_going',
      waitlisted: false,
      source: 'coach',
      respondedAt: '2026-07-21T08:00:00.000Z',
    },
    {
      membershipId: 'member-4',
      status: 'no_response',
      waitlisted: false,
      source: 'system',
      respondedAt: '2026-07-19T00:00:00.000Z',
    },
    {
      membershipId: 'member-5',
      status: 'going',
      waitlisted: true,
      source: 'self',
      respondedAt: '2026-07-20T11:00:00.000Z',
    },
  ];
}

function initialRevisions(): Map<string, MockRevision[]> {
  return new Map([
    [
      'member-1',
      [
        {
          id: 'rev-member-1-1',
          membershipId: 'member-1',
          fromStatus: null,
          toStatus: 'going',
          reasonCategory: null,
          note: null,
          waitlisted: false,
          source: 'self',
          isOverride: false,
          overrideReason: null,
          actorUserId: null,
          occurredAt: '2026-07-20T09:00:00.000Z',
        },
      ],
    ],
    [
      'member-3',
      [
        {
          id: 'rev-member-3-1',
          membershipId: 'member-3',
          fromStatus: 'no_response',
          toStatus: 'not_going',
          reasonCategory: 'work',
          note: null,
          waitlisted: false,
          source: 'coach',
          isOverride: true,
          overrideReason: 'Reported unavailable through the team chat.',
          actorUserId: MOCK_ACTOR_ID,
          occurredAt: '2026-07-21T08:00:00.000Z',
        },
      ],
    ],
  ]);
}

let participants = initialParticipants();
let revisionsByMembership = initialRevisions();

export function resetMockRsvpDetailState(): void {
  participants = initialParticipants();
  revisionsByMembership = initialRevisions();
}

export function readMockRsvpParticipants(limit: number, offset: number, status: string | null): JsonObject {
  const filtered = status === null ? participants : participants.filter((p) => p.status === status);
  const items = filtered.slice(offset, offset + limit);
  return { items, total: filtered.length, limit, offset };
}

export function readMockRsvpSummary(sessionId: string): JsonObject {
  const going = participants.filter((p) => p.status === 'going').length;
  const maybe = participants.filter((p) => p.status === 'maybe').length;
  const notGoing = participants.filter((p) => p.status === 'not_going').length;
  const noResponse = participants.filter((p) => p.status === 'no_response').length;
  const waitlisted = participants.filter((p) => p.waitlisted).length;
  return {
    sessionId,
    capacity: SESSION_CAPACITY,
    going,
    maybe,
    notGoing,
    noResponse,
    waitlisted,
    spotsRemaining: Math.max(0, SESSION_CAPACITY - going),
  };
}

/**
 * Apply an override and append the revision it produced. Returns `null` for
 * a membership id the roster does not hold, so the handler can answer a
 * clean 404 rather than inventing a record.
 */
export function applyMockRsvpOverride(
  sessionId: string,
  membershipId: string,
  body: JsonObject,
): JsonObject | null {
  const participant = participants.find((p) => p.membershipId === membershipId);
  if (participant === undefined) {
    return null;
  }
  const fromStatus = participant.status;
  const status = String(body['status']);
  const reasonCategory = typeof body['reasonCategory'] === 'string' ? body['reasonCategory'] : null;
  const note = typeof body['note'] === 'string' ? body['note'] : null;
  const noteVisibility = typeof body['noteVisibility'] === 'string' ? body['noteVisibility'] : null;
  const reason = typeof body['reason'] === 'string' ? body['reason'] : '';

  participant.status = status;
  participant.source = 'coach';
  participant.respondedAt = new Date().toISOString();

  const history = revisionsByMembership.get(membershipId) ?? [];
  history.push({
    id: `rev-${membershipId}-${String(history.length + 1)}`,
    membershipId,
    fromStatus,
    toStatus: status,
    reasonCategory,
    note,
    waitlisted: participant.waitlisted,
    source: 'coach',
    isOverride: true,
    overrideReason: reason,
    actorUserId: MOCK_ACTOR_ID,
    occurredAt: participant.respondedAt,
  });
  revisionsByMembership.set(membershipId, history);

  return {
    sessionId,
    membershipId,
    status,
    reasonCategory,
    note,
    noteVisibility,
    source: 'coach',
    waitlisted: participant.waitlisted,
    respondedAt: participant.respondedAt,
    version: history.length,
  };
}

export function readMockRsvpHistory(membershipId: string): JsonObject {
  return { items: revisionsByMembership.get(membershipId) ?? [] };
}

import type {
  Competition,
  EligibilityCandidate,
  Fixture,
  Opponent,
  Squad,
  SquadAvailability,
  SquadSelection,
} from '@/modules/competitions';

/** Deterministic competition-domain builders shared by unit tests. */
export function buildCompetition(overrides: Partial<Competition> = {}): Competition {
  return {
    competitionId: 'comp-1',
    name: 'Cairo Ultimate League',
    competitionType: 'league',
    status: 'active',
    genderDivision: 'mixed',
    organizerName: 'EFDF',
    externalRef: null,
    startsOn: '2026-09-04',
    endsOn: '2026-12-18',
    description: 'Nine-week mixed league.',
    cancellationReason: null,
    recordVersion: 2,
    ...overrides,
  };
}

export function buildFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    fixtureId: 'fx-1',
    opponentId: 'opp-1',
    stageId: 'stage-1',
    roundId: 'round-1',
    venueId: 'Maadi pitch 2',
    homeAway: 'home',
    scheduledAt: '2026-09-04T15:00:00.000Z',
    status: 'scheduled',
    rescheduleCount: 0,
    rescheduleReason: null,
    cancellationReason: null,
    ...overrides,
  };
}

export function buildOpponent(overrides: Partial<Opponent> = {}): Opponent {
  return {
    opponentId: 'opp-1',
    name: 'Nile Nomads',
    shortName: 'NIL',
    notes: null,
    status: 'active',
    ...overrides,
  };
}

export function buildSquad(overrides: Partial<Squad> = {}): Squad {
  return {
    squadId: 'squad-1',
    competitionId: 'comp-1',
    name: 'League squad',
    status: 'draft',
    attendanceThresholdPct: 70,
    policyVersion: 'squad-policy-v3',
    selectionDeadline: '2026-09-02T18:00:00.000Z',
    notes: null,
    revision: 1,
    recordVersion: 2,
    ...overrides,
  };
}

export function buildCandidate(
  overrides: Partial<EligibilityCandidate> = {},
): EligibilityCandidate {
  return {
    membershipId: 'm-1',
    fullName: 'Omar Hassan',
    jerseyNumber: 7,
    attendancePct: 92,
    availability: 'available',
    selected: false,
    overall: 'passed',
    flagged: false,
    signals: [
      { code: 'attendance', status: 'passed' },
      { code: 'jersey', status: 'unknown' },
    ],
    ...overrides,
  };
}

export function buildSelection(overrides: Partial<SquadSelection> = {}): SquadSelection {
  return {
    selectionId: 'sel-1',
    membershipId: 'm-1',
    selectionRole: 'player',
    status: 'selected',
    eligibilityOverridden: false,
    overrideReason: null,
    recordVersion: 1,
    ...overrides,
  };
}

export function buildAvailability(overrides: Partial<SquadAvailability> = {}): SquadAvailability {
  return {
    availabilityId: 'av-1',
    membershipId: 'm-1',
    availability: 'available',
    reason: null,
    source: 'self',
    updatedAt: '2026-07-08T09:00:00.000Z',
    ...overrides,
  };
}

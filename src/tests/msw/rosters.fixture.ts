import type {
  rosterEntryListResponseSchema,
  rosterEntryResponseSchema,
  rosterListResponseSchema,
  rosterResponseSchema,
  rosterSnapshotListResponseSchema,
  rosterValidationResponseSchema,
} from '@/modules/competitions';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_COMPETITIONS } from './competitions.fixture';
import { MOCK_SQUADS } from './squads.fixture';

type RosterDto = SchemaOutput<typeof rosterResponseSchema>;
type RosterListDto = SchemaOutput<typeof rosterListResponseSchema>;
type EntryDto = SchemaOutput<typeof rosterEntryResponseSchema>;
type EntryListDto = SchemaOutput<typeof rosterEntryListResponseSchema>;
type ValidationDto = SchemaOutput<typeof rosterValidationResponseSchema>;
type SnapshotListDto = SchemaOutput<typeof rosterSnapshotListResponseSchema>;

export const MOCK_ROSTERS = {
  competitionRosterId: '11000000-0000-4000-8000-000000000001',
  matchRosterId: '11000000-0000-4000-8000-000000000002',
  lockedRosterId: '11000000-0000-4000-8000-000000000003',
} as const;

const CREATED_AT = '2026-07-12T09:00:00.000Z';

function roster(overrides: Partial<RosterDto> & { rosterId: string }): RosterDto {
  return {
    teamId: MOCK_COMPETITIONS.teamId,
    seasonId: MOCK_COMPETITIONS.seasonId,
    competitionId: MOCK_COMPETITIONS.leagueId,
    fixtureId: null,
    squadId: MOCK_SQUADS.draftId,
    rosterKind: 'competition',
    name: 'League competition roster',
    status: 'draft',
    division: 'mixed',
    minSize: 12,
    maxSize: 20,
    minWomen: 5,
    requireCaptain: true,
    policyVersion: 'roster-policy-v2',
    selectionDeadline: '2026-09-02T18:00:00.000Z',
    notes: 'Travelling squad only.',
    revision: 1,
    recordVersion: 2,
    revisionReason: null,
    publishedAt: null,
    lockedAt: null,
    revisedAt: null,
    archivedAt: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  };
}

function entry(overrides: Partial<EntryDto> & { entryId: string; membershipId: string }): EntryDto {
  return {
    rosterId: MOCK_ROSTERS.competitionRosterId,
    jerseyNumber: 7,
    entryRole: 'player',
    lineAssignment: 'any',
    fieldPosition: 'handler',
    genderBucket: 'men',
    status: 'selected',
    availability: 'available',
    selectionReason: null,
    constraintOverridden: false,
    overrideReason: null,
    removalReason: null,
    removedAt: null,
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  };
}

/**
 * Three entries covering the honest cases: a full record, one with no jersey
 * and no declared availability, and one added past a constraint with a reason.
 */
const ENTRY_SEEDS: readonly EntryDto[] = [
  entry({
    entryId: '12000000-0000-4000-8000-000000000001',
    membershipId: MOCK_SQUADS.eligibleMembershipId,
    entryRole: 'captain',
  }),
  entry({
    entryId: '12000000-0000-4000-8000-000000000002',
    membershipId: MOCK_SQUADS.unknownMembershipId,
    jerseyNumber: null,
    availability: null,
    fieldPosition: 'unspecified',
    genderBucket: 'unknown',
  }),
  entry({
    entryId: '12000000-0000-4000-8000-000000000003',
    membershipId: MOCK_SQUADS.failedMembershipId,
    jerseyNumber: 12,
    lineAssignment: 'defense',
    genderBucket: 'women',
    constraintOverridden: true,
    overrideReason: 'Needed for handler depth.',
  }),
];

let rosters = new Map<string, RosterDto>();
let entries = new Map<string, EntryDto[]>();

export function resetMockRostersState(): void {
  rosters = new Map([
    [MOCK_ROSTERS.competitionRosterId, roster({ rosterId: MOCK_ROSTERS.competitionRosterId })],
    [
      MOCK_ROSTERS.matchRosterId,
      roster({
        rosterId: MOCK_ROSTERS.matchRosterId,
        rosterKind: 'match',
        name: 'Round 1 match roster',
        fixtureId: 'a0000000-0000-4000-8000-000000000001',
        status: 'published',
        division: 'open',
        minWomen: null,
        requireCaptain: false,
        notes: null,
        publishedAt: CREATED_AT,
      }),
    ],
    [
      MOCK_ROSTERS.lockedRosterId,
      roster({
        rosterId: MOCK_ROSTERS.lockedRosterId,
        rosterKind: 'match',
        name: 'Round 2 match roster',
        status: 'locked',
        revision: 2,
        publishedAt: CREATED_AT,
        lockedAt: CREATED_AT,
      }),
    ],
  ]);
  entries = new Map([[MOCK_ROSTERS.competitionRosterId, [...ENTRY_SEEDS]]]);
}

resetMockRostersState();

export function rostersResponse(): RosterListDto {
  const items = [...rosters.values()];
  return { items, total: items.length, limit: 50, offset: 0 };
}

export function rosterResponse(rosterId: string): RosterDto | null {
  return rosters.get(rosterId) ?? null;
}

export function rosterEntriesResponse(rosterId: string): EntryListDto {
  const items = entries.get(rosterId) ?? [];
  return { items, total: items.length, limit: 100, offset: 0 };
}

/**
 * The server-side verdict. The seeded roster is below its minimum size and
 * has a player with no jersey, so the preview has something honest to show.
 */
export function rosterValidationResponse(rosterId: string): ValidationDto {
  const items = entries.get(rosterId) ?? [];
  const selected = items.filter((item) => item.status === 'selected');
  const record = rosters.get(rosterId);
  const missingJersey = selected.filter((item) => item.jerseyNumber === null).length;
  const belowMinimum = selected.length < (record?.minSize ?? 0);
  return {
    rosterId,
    policyVersion: 'roster-policy-v2',
    status: record?.status ?? 'draft',
    composition: {
      selected: selected.length,
      women: selected.filter((item) => item.genderBucket === 'women').length,
      men: selected.filter((item) => item.genderBucket === 'men').length,
      mixed: 0,
      unknownGender: selected.filter((item) => item.genderBucket === 'unknown').length,
      offense: selected.filter((item) => item.lineAssignment === 'offense').length,
      defense: selected.filter((item) => item.lineAssignment === 'defense').length,
      flexible: selected.filter((item) => item.lineAssignment === 'any').length,
      captains: selected.filter((item) => item.entryRole === 'captain').length,
      spiritCaptains: 0,
      missingJersey,
      duplicateJerseys: 0,
      unavailableSelected: 0,
    },
    violations: [
      ...(belowMinimum
        ? [{ code: 'min_size' as const, severity: 'error' as const, count: selected.length }]
        : []),
      ...(missingJersey > 0
        ? [{ code: 'missing_jersey' as const, severity: 'warning' as const, count: missingJersey }]
        : []),
    ],
    publishable: !belowMinimum,
  };
}

export function rosterSnapshotsResponse(rosterId: string): SnapshotListDto {
  const items =
    rosterId === MOCK_ROSTERS.lockedRosterId
      ? [
          {
            snapshotId: '13000000-0000-4000-8000-000000000001',
            rosterId,
            revision: 2,
            reason: 'locked' as const,
            rosterStatus: 'locked' as const,
            entryCount: 14,
            checksum: 'sha256:deadbeef',
            takenAt: CREATED_AT,
          },
        ]
      : [];
  return { items, total: items.length, limit: 50, offset: 0 };
}

export function removeRosterEntryRecord(rosterId: string, membershipId: string): EntryDto | null {
  const items = entries.get(rosterId) ?? [];
  const found = items.find((item) => item.membershipId === membershipId);
  if (found === undefined) {
    return null;
  }
  const withdrawn: EntryDto = { ...found, status: 'withdrawn', removedAt: CREATED_AT };
  entries.set(
    rosterId,
    items.map((item) => (item.membershipId === membershipId ? withdrawn : item)),
  );
  return withdrawn;
}

const NEXT_ROSTER_STATUS = {
  publish: 'published',
  archive: 'archived',
  lock: 'locked',
} as const;

export function transitionRosterRecord(
  rosterId: string,
  intent: keyof typeof NEXT_ROSTER_STATUS,
  expectedRecordVersion: number,
): RosterDto | 'not-found' | 'conflict' {
  const record = rosters.get(rosterId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  const next: RosterDto = {
    ...record,
    status: NEXT_ROSTER_STATUS[intent],
    recordVersion: record.recordVersion + 1,
    publishedAt: intent === 'publish' ? CREATED_AT : record.publishedAt,
    lockedAt: intent === 'lock' ? CREATED_AT : record.lockedAt,
  };
  rosters.set(rosterId, next);
  return next;
}

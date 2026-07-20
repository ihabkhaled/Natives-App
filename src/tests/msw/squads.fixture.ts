import type {
  availabilityListResponseSchema,
  availabilityResponseSchema,
  eligibilityReportResponseSchema,
  selectionListResponseSchema,
  selectionResponseSchema,
  squadListResponseSchema,
  squadResponseSchema,
} from '@/modules/competitions';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_COMPETITIONS } from './competitions.fixture';
import { CANDIDATE_SEEDS, MOCK_CANDIDATES, overallFor } from './squads-candidates.fixture';

type SquadDto = SchemaOutput<typeof squadResponseSchema>;
type SquadListDto = SchemaOutput<typeof squadListResponseSchema>;
type EligibilityDto = SchemaOutput<typeof eligibilityReportResponseSchema>;
type CandidateDto = EligibilityDto['candidates'][number];
type SelectionDto = SchemaOutput<typeof selectionResponseSchema>;
type SelectionListDto = SchemaOutput<typeof selectionListResponseSchema>;
type AvailabilityDto = SchemaOutput<typeof availabilityResponseSchema>;
type AvailabilityListDto = SchemaOutput<typeof availabilityListResponseSchema>;

export const MOCK_SQUADS = {
  draftId: 'b0000000-0000-4000-8000-000000000001',
  publishedId: 'b0000000-0000-4000-8000-000000000002',
  lockedId: 'b0000000-0000-4000-8000-000000000003',
  ...MOCK_CANDIDATES,
} as const;

const CREATED_AT = '2026-06-10T09:00:00.000Z';
const UPDATED_AT = '2026-07-08T09:00:00.000Z';
const SELF_MEMBERSHIP_ID = MOCK_CANDIDATES.eligibleMembershipId;

function squad(overrides: Partial<SquadDto> & { squadId: string }): SquadDto {
  return {
    teamId: MOCK_COMPETITIONS.teamId,
    seasonId: MOCK_COMPETITIONS.seasonId,
    competitionId: MOCK_COMPETITIONS.leagueId,
    name: 'League squad — week 1',
    status: 'draft',
    attendanceThresholdPct: 70,
    policyVersion: 'squad-policy-v3',
    selectionDeadline: '2026-09-02T18:00:00.000Z',
    notes: 'Two handlers must travel with the group.',
    revision: 1,
    recordVersion: 2,
    publishedAt: null,
    lockedAt: null,
    archivedAt: null,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

let squads = new Map<string, SquadDto>();
let selections = new Map<string, SelectionDto>();
let availability: AvailabilityDto[] = [];
let overriddenIds = new Set<string>();

function candidates(): CandidateDto[] {
  return CANDIDATE_SEEDS.map((seed) => ({
    ...seed,
    selected: selections.has(seed.membershipId),
    overall: overallFor(seed.membershipId, overriddenIds.has(seed.membershipId)),
  }));
}

function selection(membershipId: string, overrideReason: string | null): SelectionDto {
  return {
    selectionId: `d0000000-0000-4000-8000-${membershipId.slice(-12)}`,
    squadId: MOCK_SQUADS.draftId,
    teamId: MOCK_COMPETITIONS.teamId,
    membershipId,
    selectionRole: 'player',
    status: 'selected',
    reason: null,
    eligibilityOverridden: overrideReason !== null,
    overrideReason,
    eligibilitySnapshot: 'squad-policy-v3',
    removedAt: null,
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function seedSquads(): Map<string, SquadDto> {
  return new Map([
    [MOCK_SQUADS.draftId, squad({ squadId: MOCK_SQUADS.draftId })],
    [
      MOCK_SQUADS.publishedId,
      squad({
        squadId: MOCK_SQUADS.publishedId,
        name: 'League squad — week 2',
        status: 'published',
        revision: 2,
        publishedAt: UPDATED_AT,
      }),
    ],
    [
      MOCK_SQUADS.lockedId,
      squad({
        squadId: MOCK_SQUADS.lockedId,
        name: 'Championship squad',
        status: 'locked',
        competitionId: null,
        selectionDeadline: null,
        notes: null,
        revision: 3,
        publishedAt: UPDATED_AT,
        lockedAt: UPDATED_AT,
      }),
    ],
  ]);
}

export function resetMockSquadsState(): void {
  squads = seedSquads();
  selections = new Map([
    [MOCK_SQUADS.selectedMembershipId, selection(MOCK_SQUADS.selectedMembershipId, null)],
  ]);
  overriddenIds = new Set();
  availability = [
    {
      availabilityId: 'e0000000-0000-4000-8000-000000000001',
      squadId: MOCK_SQUADS.draftId,
      teamId: MOCK_COMPETITIONS.teamId,
      membershipId: SELF_MEMBERSHIP_ID,
      availability: 'available',
      reason: null,
      source: 'self',
      recordVersion: 1,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
  ];
}

resetMockSquadsState();

export function squadsResponse(): SquadListDto {
  const items = [...squads.values()];
  return { items, total: items.length, limit: 50, offset: 0 };
}

export function squadResponse(squadId: string): SquadDto | null {
  return squads.get(squadId) ?? null;
}

export function eligibilityResponse(squadId: string): EligibilityDto {
  const list = candidates();
  const selectedCount = list.filter((candidate) => candidate.selected).length;
  return {
    squadId,
    policyVersion: 'squad-policy-v3',
    attendanceThresholdPct: 70,
    candidates: list,
    selectedGenderRatio: {
      men: selectedCount,
      women: 0,
      mixed: 0,
      unknown: 0,
      total: selectedCount,
      balanced: selectedCount === 0,
    },
    total: list.length,
    limit: 100,
    offset: 0,
  };
}

export function selectionsResponse(): SelectionListDto {
  const items = [...selections.values()];
  return { items, total: items.length, limit: 100, offset: 0 };
}

export function availabilityResponse(): AvailabilityListDto {
  return { items: availability, total: availability.length, limit: 100, offset: 0 };
}

export function selectCandidate(membershipId: string, overrideReason: string | null): SelectionDto {
  const record = selection(membershipId, overrideReason);
  selections.set(membershipId, record);
  if (overrideReason !== null) {
    overriddenIds.add(membershipId);
  }
  return record;
}

export function removeCandidate(membershipId: string): SelectionDto | null {
  const record = selections.get(membershipId);
  if (record === undefined) {
    return null;
  }
  selections.delete(membershipId);
  overriddenIds.delete(membershipId);
  return { ...record, status: 'removed', removedAt: UPDATED_AT };
}

export function declareAvailability(
  value: AvailabilityDto['availability'],
  reason: string | null,
): AvailabilityDto {
  const record: AvailabilityDto = {
    availabilityId: 'e0000000-0000-4000-8000-000000000009',
    squadId: MOCK_SQUADS.draftId,
    teamId: MOCK_COMPETITIONS.teamId,
    membershipId: SELF_MEMBERSHIP_ID,
    availability: value,
    reason,
    source: 'self',
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
  availability = [
    ...availability.filter((item) => item.membershipId !== SELF_MEMBERSHIP_ID),
    record,
  ];
  return record;
}

const NEXT_STATUS = {
  publish: 'published',
  lock: 'locked',
  revise: 'draft',
  archive: 'archived',
} as const;

export function transitionSquadRecord(
  squadId: string,
  transition: keyof typeof NEXT_STATUS,
  expectedRecordVersion: number,
): SquadDto | 'not-found' | 'conflict' {
  const record = squads.get(squadId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  const next: SquadDto = {
    ...record,
    status: NEXT_STATUS[transition],
    recordVersion: record.recordVersion + 1,
    revision: transition === 'revise' ? record.revision + 1 : record.revision,
    publishedAt: transition === 'publish' ? UPDATED_AT : record.publishedAt,
    lockedAt: transition === 'lock' ? UPDATED_AT : null,
  };
  squads.set(squadId, next);
  return next;
}

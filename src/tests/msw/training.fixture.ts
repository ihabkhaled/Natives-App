import type { SchemaOutput } from '@/packages/schema';
import type {
  activityTypeListResponseSchema,
  submissionDetailResponseSchema,
  submissionListResponseSchema,
} from '@/modules/training';

type TypeListDto = SchemaOutput<typeof activityTypeListResponseSchema>;
type DetailDto = SchemaOutput<typeof submissionDetailResponseSchema>;
type ListDto = SchemaOutput<typeof submissionListResponseSchema>;
type SubmissionDto = DetailDto['submission'];

export const MOCK_TRAINING = {
  teamId: 'team-natives',
  membershipId: '10000000-0000-4000-8000-000000000001',
  otherMembershipId: '10000000-0000-4000-8000-000000000002',
  draftId: '20000000-0000-4000-8000-000000000001',
  submittedId: '20000000-0000-4000-8000-000000000002',
  changesRequestedId: '20000000-0000-4000-8000-000000000003',
  approvedId: '20000000-0000-4000-8000-000000000004',
  reviewerOwnId: '20000000-0000-4000-8000-000000000005',
  reviewerMembershipId: 'membership-natives-1',
  gymTypeId: '30000000-0000-4000-8000-000000000001',
  wfdfTypeId: '30000000-0000-4000-8000-000000000002',
  throwingTypeId: '30000000-0000-4000-8000-000000000003',
} as const;

const CREATED_AT = '2026-07-10T09:00:00.000Z';
const UPDATED_AT = '2026-07-12T09:00:00.000Z';

/**
 * Catalog. `wfdf-accreditation` is deliberately `pointsApproval: 'pending'`
 * with a null value so the picker has to say "pending" instead of a number.
 */
const ACTIVITY_TYPES: TypeListDto['items'] = [
  {
    id: MOCK_TRAINING.gymTypeId,
    typeKey: 'gym-strength',
    name: 'Gym strength session',
    description: 'Structured lifting session logged outside team practice.',
    category: 'gym',
    unit: null,
    defaultPointValue: 5,
    pointsApproval: 'approved',
    requiresEvidence: false,
    minDurationMinutes: 20,
    maxDurationMinutes: 180,
    catalogVersion: 3,
  },
  {
    id: MOCK_TRAINING.wfdfTypeId,
    typeKey: 'wfdf-accreditation',
    name: 'WFDF accreditation module',
    description: 'Officiating accreditation module. Point value is not approved yet.',
    category: 'accreditation',
    unit: null,
    defaultPointValue: null,
    pointsApproval: 'pending',
    requiresEvidence: true,
    minDurationMinutes: null,
    maxDurationMinutes: null,
    catalogVersion: 3,
  },
  {
    id: MOCK_TRAINING.throwingTypeId,
    typeKey: 'throwing-reps',
    name: 'Throwing reps',
    description: 'Counted throwing repetitions.',
    category: 'throwing',
    unit: 'reps',
    defaultPointValue: 2,
    pointsApproval: 'approved',
    requiresEvidence: false,
    minDurationMinutes: 10,
    maxDurationMinutes: 120,
    catalogVersion: 3,
  },
];

interface SubmissionSeed {
  readonly id: string;
  readonly status: SubmissionDto['status'];
  readonly activityTypeId: string;
  readonly performedOn: string;
  readonly durationMinutes: number | null;
  readonly submittedAt: string | null;
  readonly membershipId?: string;
  readonly notes?: string | null;
}

function submission(seed: SubmissionSeed): SubmissionDto {
  return {
    id: seed.id,
    teamId: MOCK_TRAINING.teamId,
    seasonId: null,
    membershipId: seed.membershipId ?? MOCK_TRAINING.membershipId,
    activityTypeId: seed.activityTypeId,
    status: seed.status,
    performedOn: seed.performedOn,
    durationMinutes: seed.durationMinutes,
    quantity: null,
    notes: seed.notes ?? null,
    recordVersion: 1,
    submittedAt: seed.submittedAt,
    withdrawnAt: null,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

const SEEDS: readonly SubmissionSeed[] = [
  {
    id: MOCK_TRAINING.draftId,
    status: 'draft',
    activityTypeId: MOCK_TRAINING.gymTypeId,
    performedOn: '2026-07-09',
    durationMinutes: 60,
    submittedAt: null,
    notes: 'Lower body, heavy squats.',
  },
  {
    id: MOCK_TRAINING.submittedId,
    status: 'submitted',
    activityTypeId: MOCK_TRAINING.throwingTypeId,
    performedOn: '2026-07-10',
    durationMinutes: 45,
    submittedAt: '2026-07-10T18:00:00.000Z',
  },
  {
    id: MOCK_TRAINING.changesRequestedId,
    status: 'changes_requested',
    activityTypeId: MOCK_TRAINING.wfdfTypeId,
    performedOn: '2026-07-06',
    durationMinutes: null,
    submittedAt: '2026-07-06T20:00:00.000Z',
  },
  {
    id: MOCK_TRAINING.approvedId,
    status: 'approved',
    activityTypeId: MOCK_TRAINING.gymTypeId,
    performedOn: '2026-07-02',
    durationMinutes: 75,
    submittedAt: '2026-07-02T19:00:00.000Z',
    membershipId: MOCK_TRAINING.otherMembershipId,
  },
  {
    id: MOCK_TRAINING.reviewerOwnId,
    status: 'submitted',
    activityTypeId: MOCK_TRAINING.gymTypeId,
    performedOn: '2026-07-20',
    durationMinutes: 30,
    submittedAt: '2026-07-20T19:00:00.000Z',
    membershipId: MOCK_TRAINING.reviewerMembershipId,
  },
];

let submissions = new Map(SEEDS.map((seed) => [seed.id, submission(seed)]));

export function resetMockTrainingState(): void {
  submissions = new Map(SEEDS.map((seed) => [seed.id, submission(seed)]));
  buddyRecords = initialBuddyRecords();
}

export function activityTypesResponse(): TypeListDto {
  return { items: ACTIVITY_TYPES, total: ACTIVITY_TYPES.length, limit: 100, offset: 0 };
}

function detailFor(record: SubmissionDto): DetailDto {
  return {
    submission: record,
    buddies:
      record.id === MOCK_TRAINING.submittedId
        ? [
            {
              id: '40000000-0000-4000-8000-000000000001',
              submissionId: record.id,
              membershipId: MOCK_TRAINING.otherMembershipId,
              status: 'pending',
              respondedAt: null,
              createdAt: CREATED_AT,
            },
          ]
        : [],
    evidenceCount: record.id === MOCK_TRAINING.changesRequestedId ? 1 : 0,
  };
}

/** The caller's own claims, newest performed date first. */
export function mySubmissionsResponse(limit: number, offset: number): ListDto {
  const mine = [...submissions.values()]
    .filter((record) => record.membershipId === MOCK_TRAINING.membershipId)
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn));
  return {
    items: mine.slice(offset, offset + limit).map((record) => detailFor(record)),
    total: mine.length,
    limit,
    offset,
  };
}

export function submissionDetailResponse(submissionId: string): DetailDto | null {
  const record = submissions.get(submissionId);
  return record === undefined ? null : detailFor(record);
}

export function evidenceResponse(submissionId: string): Record<string, unknown> {
  const items =
    submissionId === MOCK_TRAINING.changesRequestedId
      ? [
          {
            id: '50000000-0000-4000-8000-000000000001',
            submissionId,
            kind: 'link',
            storageReference: 'https://example.test/wfdf-module-certificate',
            contentType: null,
            byteSize: null,
            description: 'Module completion page',
            scanStatus: 'clean',
            createdAt: CREATED_AT,
          },
        ]
      : [];
  return { items, total: items.length, limit: 20, offset: 0 };
}

interface BuddyRecordFixture {
  readonly id: string;
  readonly submissionId: string;
  readonly membershipId: string;
  readonly status: 'pending' | 'confirmed' | 'declined';
  readonly respondedAt: string | null;
  readonly createdAt: string;
}

function initialBuddyRecords(): readonly BuddyRecordFixture[] {
  return [
    {
      id: '40000000-0000-4000-8000-000000000002',
      submissionId: MOCK_TRAINING.approvedId,
      membershipId: MOCK_TRAINING.membershipId,
      status: 'pending',
      respondedAt: null,
      createdAt: CREATED_AT,
    },
  ];
}

let buddyRecords = initialBuddyRecords();

export function buddiesResponse(): Record<string, unknown> {
  return { items: buddyRecords, total: buddyRecords.length, limit: 20, offset: 0 };
}

/** Confirm/decline one credit; unknown ids answer null so handlers can 404. */
export function respondToBuddyRecord(
  buddyId: string,
  intent: 'confirm' | 'decline',
): BuddyRecordFixture | null {
  const record = buddyRecords.find((buddy) => buddy.id === buddyId);
  if (record === undefined) {
    return null;
  }
  const updated: BuddyRecordFixture = {
    ...record,
    status: intent === 'confirm' ? 'confirmed' : 'declined',
    respondedAt: '2026-07-19T18:00:00.000Z',
  };
  buddyRecords = buddyRecords.map((buddy) => (buddy.id === buddyId ? updated : buddy));
  return updated;
}

export interface CreateSubmissionBody {
  readonly activityTypeId?: string;
  readonly performedOn?: string;
  readonly durationMinutes?: number | null;
  readonly quantity?: number | null;
  readonly notes?: string | null;
}

let createdCounter = 0;

export function createSubmissionRecord(body: CreateSubmissionBody): DetailDto {
  createdCounter += 1;
  const record = submission({
    id: `20000000-0000-4000-8000-9000000000${String(createdCounter).padStart(2, '0')}`,
    status: 'draft',
    activityTypeId: body.activityTypeId ?? MOCK_TRAINING.gymTypeId,
    performedOn: body.performedOn ?? '2026-07-11',
    durationMinutes: body.durationMinutes ?? null,
    submittedAt: null,
    notes: body.notes ?? null,
  });
  submissions.set(record.id, record);
  return detailFor(record);
}

/** Advance a claim, echoing the optimistic version the caller must send. */
export function transitionSubmission(
  submissionId: string,
  expectedRecordVersion: number,
  intent: 'submit' | 'withdraw',
): DetailDto | 'not-found' | 'conflict' {
  const record = submissions.get(submissionId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  const next: SubmissionDto = {
    ...record,
    status: intent === 'submit' ? 'submitted' : 'withdrawn',
    submittedAt: intent === 'submit' ? '2026-07-13T09:00:00.000Z' : record.submittedAt,
    withdrawnAt: intent === 'withdraw' ? '2026-07-13T09:00:00.000Z' : record.withdrawnAt,
    recordVersion: record.recordVersion + 1,
  };
  submissions.set(submissionId, next);
  return detailFor(next);
}

/** Direct record access for the review projection in its own fixture file. */
export function readSubmission(submissionId: string): SubmissionDto | undefined {
  return submissions.get(submissionId);
}

export function readSubmissions(): readonly SubmissionDto[] {
  return [...submissions.values()];
}

export function writeSubmission(record: SubmissionDto): void {
  submissions.set(record.id, record);
}

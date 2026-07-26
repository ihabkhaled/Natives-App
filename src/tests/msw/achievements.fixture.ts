import type {
  achievementImportReportSchema,
  achievementResponseSchema,
  listAchievementsResponseSchema,
  teamHistoryResponseSchema,
} from '@/modules/standings';
import type { SchemaOutput } from '@/packages/schema';

type AchievementDto = SchemaOutput<typeof achievementResponseSchema>;
type AchievementsListDto = SchemaOutput<typeof listAchievementsResponseSchema>;
type ImportReportDto = SchemaOutput<typeof achievementImportReportSchema>;
type HistoryDto = SchemaOutput<typeof teamHistoryResponseSchema>;

export const MOCK_ACHIEVEMENTS = {
  teamId: 'team-natives',
  seasonId: '50000000-0000-4000-8000-000000000001',
  draftId: 'a0000000-0000-4000-8000-000000000001',
  submittedId: 'a0000000-0000-4000-8000-000000000002',
  approvedId: 'a0000000-0000-4000-8000-000000000003',
  memberId: '10000000-0000-4000-8000-000000000001',
} as const;

const CREATED_AT = '2026-07-01T09:00:00.000Z';

function achievement(
  overrides: Partial<AchievementDto> & { achievementId: string },
): AchievementDto {
  return {
    teamId: MOCK_ACHIEVEMENTS.teamId,
    seasonId: MOCK_ACHIEVEMENTS.seasonId,
    competitionId: null,
    membershipId: null,
    category: 'trophy',
    title: 'Cairo League runners-up',
    description: 'Second place in the mixed division.',
    achievedOn: '2026-06-20',
    evidenceReference: null,
    visibility: 'public',
    status: 'draft',
    source: 'manual',
    importReference: null,
    rejectionReason: null,
    recordVersion: 1,
    createdBy: 'user-coach',
    approvedBy: null,
    approvedAt: null,
    rejectedAt: null,
    archivedAt: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  };
}

/** The lifecycle records, keyed by id, mutated by transitions across a session. */
let records = new Map<string, AchievementDto>();

function seed(): Map<string, AchievementDto> {
  return new Map([
    [
      MOCK_ACHIEVEMENTS.draftId,
      achievement({ achievementId: MOCK_ACHIEVEMENTS.draftId, status: 'draft' }),
    ],
    [
      MOCK_ACHIEVEMENTS.submittedId,
      achievement({
        achievementId: MOCK_ACHIEVEMENTS.submittedId,
        title: 'Spirit award — Nadia',
        category: 'spirit',
        membershipId: MOCK_ACHIEVEMENTS.memberId,
        visibility: 'team',
        status: 'submitted',
      }),
    ],
    [
      MOCK_ACHIEVEMENTS.approvedId,
      achievement({
        achievementId: MOCK_ACHIEVEMENTS.approvedId,
        title: 'Regional champions 2025',
        status: 'approved',
        approvedBy: 'user-team-admin',
        approvedAt: '2026-06-25T09:00:00.000Z',
      }),
    ],
  ]);
}

function ensureSeeded(): void {
  if (records.size === 0) {
    records = seed();
  }
}

export function achievementsResponse(status: string | null): AchievementsListDto {
  ensureSeeded();
  const all = [...records.values()];
  const items = status === null ? all : all.filter((record) => record.status === status);
  return { items, total: items.length, limit: 20, offset: 0 };
}

export function achievementRecord(achievementId: string): AchievementDto | null {
  ensureSeeded();
  return records.get(achievementId) ?? null;
}

export function createAchievementRecord(body: {
  title?: string;
  category?: string;
  visibility?: string;
}): AchievementDto {
  ensureSeeded();
  const id = `a0000000-0000-4000-8000-0000000001${String(records.size + 10)}`;
  const record = achievement({
    achievementId: id,
    title: body.title ?? 'New claim',
    category: (body.category ?? 'award') as AchievementDto['category'],
    visibility: (body.visibility ?? 'team') as AchievementDto['visibility'],
    status: 'draft',
  });
  records.set(id, record);
  return record;
}

const NEXT_STATUS: Readonly<Record<string, AchievementDto['status']>> = {
  submit: 'submitted',
  approve: 'approved',
  reject: 'rejected',
  archive: 'archived',
};

const TRANSITION_STAMP = '2026-07-11T09:00:00.000Z';

function applyTransition(
  current: AchievementDto,
  nextStatus: AchievementDto['status'],
  reason: string | null,
): AchievementDto {
  const approved = nextStatus === 'approved';
  const rejected = nextStatus === 'rejected';
  return {
    ...current,
    status: nextStatus,
    recordVersion: current.recordVersion + 1,
    approvedBy: approved ? 'user-team-admin' : current.approvedBy,
    approvedAt: approved ? TRANSITION_STAMP : current.approvedAt,
    rejectionReason: rejected ? reason : current.rejectionReason,
    updatedAt: TRANSITION_STAMP,
  };
}

/**
 * Advance a claim, honouring optimistic concurrency: a stale
 * `expectedRecordVersion` answers 409 (errors.standings.versionConflict). On
 * reject the optional reason is persisted as `rejectionReason`.
 */
export function transitionAchievementRecord(
  achievementId: string,
  body: { transition?: string; expectedRecordVersion?: number; reason?: string | null },
): { record: AchievementDto } | { conflict: true } | null {
  ensureSeeded();
  const current = records.get(achievementId);
  const nextStatus = NEXT_STATUS[body.transition ?? ''];
  if (current === undefined || nextStatus === undefined) {
    return null;
  }
  if (body.expectedRecordVersion !== current.recordVersion) {
    return { conflict: true };
  }
  const record = applyTransition(current, nextStatus, body.reason ?? null);
  records.set(achievementId, record);
  return { record };
}

/** The dry-run / commit import report: one imported, one duplicate, one invalid. */
export function importReport(dryRun: boolean): ImportReportDto {
  return {
    dryRun,
    received: 3,
    imported: 1,
    skippedDuplicate: 1,
    rejectedInvalid: 1,
    rows: [
      { reference: 'IMP-1', outcome: 'imported', achievementId: dryRun ? null : 'a-import-1' },
      { reference: 'IMP-2', outcome: 'skipped_duplicate', achievementId: null },
      { reference: 'IMP-3', outcome: 'rejected_invalid', achievementId: null },
    ],
  };
}

/** The trophy cabinet: approved, non-staff entries only. */
export function teamHistoryResponse(category: string | null): HistoryDto {
  const entries = [
    {
      achievementId: MOCK_ACHIEVEMENTS.approvedId,
      seasonId: MOCK_ACHIEVEMENTS.seasonId,
      competitionId: null,
      membershipId: null,
      category: 'trophy' as const,
      title: 'Regional champions 2025',
      achievedOn: '2026-06-20',
      visibility: 'public' as const,
    },
    {
      achievementId: 'a-history-2',
      seasonId: null,
      competitionId: null,
      membershipId: MOCK_ACHIEVEMENTS.memberId,
      category: 'award' as const,
      title: 'Most valuable player',
      achievedOn: '2025-11-02',
      visibility: 'public' as const,
    },
  ];
  const items =
    category === null ? entries : entries.filter((entry) => entry.category === category);
  return { items, total: items.length, limit: 20, offset: 0 };
}

export function resetMockAchievementsState(): void {
  records = new Map();
}

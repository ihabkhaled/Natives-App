import type { leaderboardResponseSchema, pointsSummaryResponseSchema } from '@/modules/points';
import type { SchemaOutput } from '@/packages/schema';

type LeaderboardDto = SchemaOutput<typeof leaderboardResponseSchema>;
type SummaryDto = SchemaOutput<typeof pointsSummaryResponseSchema>;
type RowDto = LeaderboardDto['items'][number];

export const MOCK_POINTS = {
  teamId: 'team-natives',
  membershipId: '10000000-0000-4000-8000-000000000001',
  tiedFirstId: '10000000-0000-4000-8000-000000000002',
  tiedSecondId: '10000000-0000-4000-8000-000000000003',
  zeroMembershipId: '10000000-0000-4000-8000-000000000004',
} as const;

const AS_OF = '2026-07-13T06:00:00.000Z';

/**
 * Deterministic standings. Two members are tied on 120 and share rank 2 under
 * the competition rule, and one member has zero contributions and still
 * appears on the board — the exact cases the UI must present honestly.
 */
const ROWS: RowDto[] = [
  {
    membershipId: MOCK_POINTS.membershipId,
    status: 'active',
    total: 210,
    rank: 1,
    previousRank: 3,
    rankDelta: 2,
    movement: 'up',
    badgeCount: 2,
    contributions: [
      { category: 'gym', points: 120 },
      { category: 'throwing', points: 90 },
    ],
  },
  {
    membershipId: MOCK_POINTS.tiedFirstId,
    status: 'active',
    total: 120,
    rank: 2,
    previousRank: 2,
    rankDelta: 0,
    movement: 'steady',
    badgeCount: 1,
    contributions: [{ category: 'gym', points: 120 }],
  },
  {
    membershipId: MOCK_POINTS.tiedSecondId,
    status: 'active',
    total: 120,
    rank: 2,
    previousRank: 1,
    rankDelta: -1,
    movement: 'down',
    badgeCount: 1,
    contributions: [{ category: 'running', points: 120 }],
  },
  {
    membershipId: MOCK_POINTS.zeroMembershipId,
    status: 'active',
    total: 0,
    rank: 4,
    previousRank: null,
    rankDelta: null,
    movement: 'none',
    badgeCount: 0,
    contributions: [],
  },
];

export function leaderboardResponse(
  period: string,
  cohort: string,
  category: string | null,
): LeaderboardDto {
  const rows =
    category === null
      ? ROWS
      : ROWS.map((row) => ({
          ...row,
          contributions: row.contributions.filter((item) => item.category === category),
        }));
  return {
    items: rows,
    total: rows.length,
    limit: 50,
    offset: 0,
    period: period as LeaderboardDto['period'],
    tieMode: 'competition',
    cohort: cohort as LeaderboardDto['cohort'],
    category,
    asOf: AS_OF,
  };
}

/**
 * A ledger with an award, its reversal, and a manual adjustment as three
 * separate entries — the running total is never edited in place.
 */
const ENTRIES: SummaryDto['entries'] = [
  {
    id: '70000000-0000-4000-8000-000000000001',
    entryType: 'award',
    amount: 120,
    sourceType: 'activity_submission',
    ruleVersion: 4,
    activityCategory: 'gym',
    reason: null,
    effectiveOn: '2026-07-02',
    createdAt: '2026-07-02T19:30:00.000Z',
  },
  {
    id: '70000000-0000-4000-8000-000000000002',
    entryType: 'award',
    amount: 90,
    sourceType: 'activity_submission',
    ruleVersion: 4,
    activityCategory: 'throwing',
    reason: null,
    effectiveOn: '2026-07-05',
    createdAt: '2026-07-05T19:30:00.000Z',
  },
  {
    id: '70000000-0000-4000-8000-000000000003',
    entryType: 'reversal',
    amount: -20,
    sourceType: 'activity_submission',
    ruleVersion: 4,
    activityCategory: 'throwing',
    reason: 'Claim reversed after review',
    effectiveOn: '2026-07-06',
    createdAt: '2026-07-06T08:00:00.000Z',
  },
  {
    id: '70000000-0000-4000-8000-000000000004',
    entryType: 'manual_adjustment',
    amount: 20,
    sourceType: 'manual',
    ruleVersion: null,
    activityCategory: null,
    reason: 'Correcting a mis-scored session',
    effectiveOn: '2026-07-07',
    createdAt: '2026-07-07T08:00:00.000Z',
  },
];

/** Only awarded badges. The unresolved legacy tier is never present. */
const BADGES: SummaryDto['badges'] = [
  {
    badgeKey: 'century',
    threshold: 100,
    pointsAtAward: 120,
    awardedAt: '2026-07-05T19:35:00.000Z',
  },
  {
    badgeKey: 'double-century',
    threshold: 200,
    pointsAtAward: 210,
    awardedAt: '2026-07-07T08:05:00.000Z',
  },
];

export function pointsSummaryResponse(membershipId: string): SummaryDto {
  return { membershipId, total: 210, entries: ENTRIES, badges: BADGES };
}

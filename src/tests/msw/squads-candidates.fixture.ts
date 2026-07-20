import type { eligibilityReportResponseSchema } from '@/modules/competitions';
import type { SchemaOutput } from '@/packages/schema';

type EligibilityDto = SchemaOutput<typeof eligibilityReportResponseSchema>;
type CandidateDto = EligibilityDto['candidates'][number];
type SignalDto = CandidateDto['signals'][number];

export const MOCK_CANDIDATES = {
  eligibleMembershipId: 'c0000000-0000-4000-8000-000000000001',
  warningMembershipId: 'c0000000-0000-4000-8000-000000000002',
  failedMembershipId: 'c0000000-0000-4000-8000-000000000003',
  unknownMembershipId: 'c0000000-0000-4000-8000-000000000004',
  selectedMembershipId: 'c0000000-0000-4000-8000-000000000005',
} as const;

function signals(statuses: readonly SignalDto['status'][]): SignalDto[] {
  return [
    { code: 'active_status', status: statuses[0] ?? 'unknown' },
    { code: 'registration', status: statuses[1] ?? 'unknown' },
    { code: 'attendance', status: statuses[2] ?? 'unknown' },
    { code: 'availability', status: statuses[3] ?? 'unknown' },
    { code: 'injury', status: statuses[4] ?? 'unknown' },
    { code: 'jersey', status: statuses[5] ?? 'unknown' },
  ];
}

/**
 * Five candidates covering every advisory outcome the coach must be able to
 * read: passing, warning, failing, and one with `attendancePct: null` whose
 * row must say "not enough data" rather than 0%.
 */
export const CANDIDATE_SEEDS: readonly Omit<CandidateDto, 'selected' | 'overall'>[] = [
  {
    membershipId: MOCK_CANDIDATES.eligibleMembershipId,
    fullName: 'Omar Hassan',
    jerseyNumber: 7,
    attendancePct: 92,
    availability: 'available',
    flagged: false,
    signals: signals(['passed', 'passed', 'passed', 'passed', 'passed', 'passed']),
  },
  {
    membershipId: MOCK_CANDIDATES.warningMembershipId,
    fullName: 'Salma Fathy',
    jerseyNumber: null,
    attendancePct: 74,
    availability: 'tentative',
    flagged: true,
    signals: signals(['passed', 'passed', 'warning', 'warning', 'passed', 'unknown']),
  },
  {
    membershipId: MOCK_CANDIDATES.failedMembershipId,
    fullName: 'Youssef Adel',
    jerseyNumber: 12,
    attendancePct: 41,
    availability: 'available',
    flagged: true,
    signals: signals(['passed', 'failed', 'failed', 'passed', 'warning', 'passed']),
  },
  {
    membershipId: MOCK_CANDIDATES.unknownMembershipId,
    fullName: 'Nour Kamal',
    jerseyNumber: null,
    attendancePct: null,
    availability: null,
    flagged: false,
    signals: signals(['passed', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown']),
  },
  {
    membershipId: MOCK_CANDIDATES.selectedMembershipId,
    fullName: 'Mariam Zaki',
    jerseyNumber: 3,
    attendancePct: 88,
    availability: 'available',
    flagged: false,
    signals: signals(['passed', 'passed', 'passed', 'passed', 'passed', 'passed']),
  },
];

/** The policy verdict the backend would compute for one seeded candidate. */
export function overallFor(membershipId: string, isOverridden: boolean): CandidateDto['overall'] {
  if (isOverridden) {
    return 'overridden';
  }
  if (membershipId === MOCK_CANDIDATES.failedMembershipId) {
    return 'failed';
  }
  if (membershipId === MOCK_CANDIDATES.warningMembershipId) {
    return 'warning';
  }
  return membershipId === MOCK_CANDIDATES.unknownMembershipId ? 'unknown' : 'passed';
}

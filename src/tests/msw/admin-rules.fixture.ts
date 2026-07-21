import type { ruleListResponseSchema, simulationResponseSchema } from '@/modules/admin';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_ADMIN } from './admin.fixture';

type RuleListDto = SchemaOutput<typeof ruleListResponseSchema>;
type RuleDto = RuleListDto['items'][number];
type SimulationDto = SchemaOutput<typeof simulationResponseSchema>;

/** Deterministic rule versions for both governed families. */
type RuleRecord = RuleDto;

function seedDraftRule(): RuleRecord {
  return {
    ruleId: MOCK_ADMIN.draftRuleId,
    teamId: MOCK_ADMIN.teamId,
    seasonId: null,
    ruleKey: 'points.v3',
    version: 3,
    name: 'Points rule v3',
    description: 'Adds a gym-session category.',
    status: 'draft',
    pointEntries: [
      { activityCategory: 'practice', points: 10, dailyCap: 1, cooldownDays: null },
      { activityCategory: 'gym', points: null, dailyCap: null, cooldownDays: 2 },
    ],
    effectiveFrom: null,
    effectiveTo: null,
    recordVersion: 1,
    publishedAt: null,
    retiredAt: null,
    updatedAt: MOCK_ADMIN.asOf,
  };
}

function seedSettledRules(): RuleRecord[] {
  return [
    {
      ruleId: MOCK_ADMIN.approvedRuleId,
      teamId: MOCK_ADMIN.teamId,
      seasonId: null,
      ruleKey: 'points.v2',
      version: 2,
      name: 'Points rule v2',
      description: null,
      status: 'approved',
      pointEntries: [{ activityCategory: 'practice', points: 8, dailyCap: 1, cooldownDays: null }],
      effectiveFrom: '2026-08-01',
      effectiveTo: null,
      recordVersion: 2,
      publishedAt: null,
      retiredAt: null,
      updatedAt: MOCK_ADMIN.asOf,
    },
    {
      ruleId: MOCK_ADMIN.publishedRuleId,
      teamId: MOCK_ADMIN.teamId,
      seasonId: null,
      ruleKey: 'points.v1',
      version: 1,
      name: 'Points rule v1',
      description: null,
      status: 'published',
      pointEntries: [
        { activityCategory: 'practice', points: 5, dailyCap: null, cooldownDays: null },
      ],
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-07-31',
      recordVersion: 5,
      publishedAt: '2026-01-01T00:00:00.000Z',
      retiredAt: null,
      updatedAt: MOCK_ADMIN.asOf,
    },
  ];
}

function seedRules(): RuleRecord[] {
  return [seedDraftRule(), ...seedSettledRules()];
}

let rules = seedRules();

const NEXT_STATUS = {
  approve: 'approved',
  publish: 'published',
  retire: 'retired',
  revert: 'draft',
} as const;

export function resetMockAdminState(): void {
  rules = seedRules();
}

export function rulesResponse(): RuleListDto {
  return { items: rules.map((rule) => ({ ...rule })), total: rules.length, limit: 50, offset: 0 };
}

/** Optimistic concurrency: a stale `expectedRecordVersion` is a conflict. */
export function transitionRuleRecord(
  ruleId: string,
  transition: keyof typeof NEXT_STATUS,
  expectedRecordVersion: number,
): { conflict: boolean; record: RuleDto | null } {
  const record = rules.find((rule) => rule.ruleId === ruleId);
  if (record === undefined) {
    return { conflict: false, record: null };
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return { conflict: true, record: null };
  }
  record.status = NEXT_STATUS[transition];
  record.recordVersion += 1;
  return { conflict: false, record: { ...record } };
}

export function simulationResponse(membershipId: string): SimulationDto {
  return {
    membershipId,
    draft: { completeness: 0.82, confidence: 'medium', formulaVersion: 3 },
    published: { completeness: 0.74, confidence: 'low', formulaVersion: 1 },
    delta: 6,
  };
}

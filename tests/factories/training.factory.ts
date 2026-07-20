import type { ActivityType } from '@/modules/training';

/** Deterministic activity type; overrides express the honest edge cases. */
export function buildActivityType(overrides: Partial<ActivityType> = {}): ActivityType {
  return {
    id: 'type-gym',
    typeKey: 'gym',
    name: 'Gym',
    description: 'Lifting',
    category: 'gym',
    unit: null,
    candidatePointValue: 5,
    pointsApproval: 'approved',
    requiresEvidence: false,
    minDurationMinutes: 20,
    maxDurationMinutes: 180,
    catalogVersion: 1,
    ...overrides,
  };
}

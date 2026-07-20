import { describe, expect, it } from 'vitest';

import { SUBMISSION_STATUS } from '../constants/training.constants';
import type { ActivityType, TrainingSubmissionDetail } from '../types/training.types';
import {
  buildTypeNameMap,
  filterByStatus,
  findActivityType,
  readActivityTypes,
  readBuddies,
  readEvidence,
  readPage,
  readSubmission,
} from './collection.helper';

const TYPE: ActivityType = {
  id: 'type-gym',
  typeKey: 'gym',
  name: 'Gym',
  description: '',
  category: 'gym',
  unit: null,
  candidatePointValue: 5,
  pointsApproval: 'approved',
  requiresEvidence: false,
  minDurationMinutes: null,
  maxDurationMinutes: null,
  catalogVersion: 1,
};

function detail(
  status: TrainingSubmissionDetail['submission']['status'],
): TrainingSubmissionDetail {
  return {
    submission: {
      id: `sub-${status}`,
      teamId: 'team-1',
      seasonId: null,
      membershipId: 'm-1',
      activityTypeId: 'type-gym',
      status,
      performedOn: '2026-07-10',
      durationMinutes: null,
      quantity: null,
      notes: null,
      recordVersion: 1,
      submittedAtIso: null,
      withdrawnAtIso: null,
      createdAtIso: '2026-07-10T09:00:00.000Z',
      updatedAtIso: '2026-07-10T09:00:00.000Z',
    },
    buddies: [],
    evidenceCount: 0,
  };
}

describe('readPage', () => {
  it('treats an absent page as an empty page, never as fabricated rows', () => {
    expect(readPage(undefined)).toEqual({ items: [], total: 0 });
  });

  it('passes a real page straight through', () => {
    const page = { items: [1], total: 1 };

    expect(readPage(page)).toBe(page);
  });
});

describe('catalog access', () => {
  it('reads an absent catalog as no types', () => {
    expect(readActivityTypes(undefined)).toEqual([]);
    expect(readActivityTypes({ items: [TYPE], total: 1 })).toEqual([TYPE]);
  });

  it('finds a type by id and reports a miss as null', () => {
    expect(findActivityType([TYPE], 'type-gym')).toBe(TYPE);
    expect(findActivityType([TYPE], 'type-other')).toBeNull();
    expect(findActivityType([TYPE], undefined)).toBeNull();
  });

  it('maps ids to display names', () => {
    expect(buildTypeNameMap([TYPE]).get('type-gym')).toBe('Gym');
  });
});

describe('detail access', () => {
  it('reads an absent detail as no submission and no buddies', () => {
    expect(readSubmission(undefined)).toBeNull();
    expect(readBuddies(undefined)).toEqual([]);
    expect(readEvidence(undefined)).toEqual([]);
  });

  it('reads a present detail through', () => {
    const value = detail(SUBMISSION_STATUS.draft);

    expect(readSubmission(value)).toBe(value.submission);
    expect(readBuddies(value)).toEqual([]);
    expect(readEvidence([])).toEqual([]);
  });
});

describe('filterByStatus', () => {
  const items = [detail(SUBMISSION_STATUS.draft), detail(SUBMISSION_STATUS.approved)];

  it('keeps everything when the all sentinel is selected', () => {
    expect(filterByStatus(items, 'all', 'all')).toBe(items);
  });

  it('narrows to the chosen status', () => {
    expect(filterByStatus(items, SUBMISSION_STATUS.approved, 'all')).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';

import { SUBMISSION_STATUS, SUBMISSION_STATUSES } from '../constants/training.constants';
import { buildActivityType as activityType } from '../../../../tests/factories/training.factory';
import type {
  TrainingBuddy,
  TrainingEvidence,
  TrainingSubmissionDetail,
} from '../types/training.types';
import {
  buildActivityTypeOptions,
  buildBuddyItems,
  buildCandidateLabel,
  buildDurationLabel,
  buildEvidenceItems,
  buildSignalViews,
  buildStatusLabel,
  buildStatusOptions,
  buildSubmissionSummary,
  hasCandidateValue,
  statusTone,
} from './submission-view.helper';

const t = (key: string): string => key;

function buddy(overrides: Partial<TrainingBuddy> = {}): TrainingBuddy {
  return {
    id: 'buddy-1',
    submissionId: 'sub-1',
    membershipId: 'm-2',
    status: 'pending',
    respondedAtIso: null,
    createdAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

function evidence(overrides: Partial<TrainingEvidence> = {}): TrainingEvidence {
  return {
    id: 'ev-1',
    submissionId: 'sub-1',
    kind: 'link',
    storageReference: 'https://example.test/a',
    contentType: null,
    byteSize: null,
    description: null,
    scanStatus: 'clean',
    createdAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

function detail(overrides: Partial<TrainingSubmissionDetail> = {}): TrainingSubmissionDetail {
  return {
    submission: {
      id: 'sub-1',
      teamId: 'team-1',
      seasonId: null,
      membershipId: 'm-1',
      activityTypeId: 'type-gym',
      status: SUBMISSION_STATUS.submitted,
      performedOn: '2026-07-10',
      durationMinutes: 45,
      quantity: null,
      notes: null,
      recordVersion: 1,
      submittedAtIso: '2026-07-10T18:00:00.000Z',
      withdrawnAtIso: null,
      createdAtIso: '2026-07-10T09:00:00.000Z',
      updatedAtIso: '2026-07-10T18:00:00.000Z',
    },
    buddies: [],
    evidenceCount: 0,
    ...overrides,
  };
}

describe('buildCandidateLabel', () => {
  it('reads pending when no type is chosen yet', () => {
    expect(buildCandidateLabel(t, null)).toBe('training.candidatePending');
  });

  it('reads pending for an unapproved type rather than guessing a number', () => {
    expect(buildCandidateLabel(t, activityType({ pointsApproval: 'pending' }))).toBe(
      'training.candidatePending',
    );
  });

  it('reads pending when an approved type carries no published value', () => {
    expect(buildCandidateLabel(t, activityType({ candidatePointValue: null }))).toBe(
      'training.candidatePending',
    );
  });

  it('reads the catalog candidate for an approved, priced type', () => {
    expect(buildCandidateLabel(t, activityType())).toBe('training.candidateValue');
  });
});

describe('hasCandidateValue', () => {
  it('is true only for an approved type with a published value', () => {
    expect(hasCandidateValue(activityType())).toBe(true);
    expect(hasCandidateValue(activityType({ pointsApproval: 'pending' }))).toBe(false);
    expect(hasCandidateValue(activityType({ candidatePointValue: null }))).toBe(false);
    expect(hasCandidateValue(null)).toBe(false);
  });
});

describe('buildActivityTypeOptions', () => {
  it('labels each option with its honest candidate value', () => {
    const options = buildActivityTypeOptions(t, [activityType()]);

    expect(options[0]?.value).toBe('type-gym');
    expect(options[0]?.hasCandidate).toBe(true);
    expect(options[0]?.durationBoundsLabel).toBe('training.durationBounds');
  });

  it('omits duration bounds when the catalog states none', () => {
    const options = buildActivityTypeOptions(t, [
      activityType({ minDurationMinutes: null, maxDurationMinutes: null }),
    ]);

    expect(options[0]?.durationBoundsLabel).toBeNull();
  });

  it('omits duration bounds when only one end is stated', () => {
    const options = buildActivityTypeOptions(t, [activityType({ maxDurationMinutes: null })]);

    expect(options[0]?.durationBoundsLabel).toBeNull();
  });
});

describe('buildDurationLabel', () => {
  it('reports an unrecorded duration as pending rather than as zero minutes', () => {
    expect(buildDurationLabel(t, null)).toBe('training.candidatePending');
  });

  it('reports a recorded duration with its unit', () => {
    expect(buildDurationLabel(t, 45)).toBe('45 training.durationUnit');
  });
});

describe('status vocabulary', () => {
  it('translates and tones every canonical status', () => {
    for (const status of SUBMISSION_STATUSES) {
      expect(buildStatusLabel(t, status)).toMatch(/^training\./u);
      expect(statusTone(status)).not.toBe('');
    }
  });

  it('prefixes the option list with the all-statuses choice', () => {
    const options = buildStatusOptions(t, SUBMISSION_STATUSES, 'training.queueFilterAll');

    expect(options[0]).toEqual({ value: 'all', label: 'training.queueFilterAll' });
    expect(options).toHaveLength(SUBMISSION_STATUSES.length + 1);
  });
});

describe('buildSubmissionSummary', () => {
  it('falls back to the raw type id when the catalog has no name for it', () => {
    const summary = buildSubmissionSummary(t, 'en', new Map(), detail());

    expect(summary.typeName).toBe('type-gym');
    expect(summary.buddyLabel).toBeNull();
  });

  it('reports the confirmed-of-total buddy count when buddies exist', () => {
    const summary = buildSubmissionSummary(
      t,
      'en',
      new Map([['type-gym', 'Gym']]),
      detail({ buddies: [buddy({ status: 'confirmed' }), buddy({ id: 'buddy-2' })] }),
    );

    expect(summary.typeName).toBe('Gym');
    expect(summary.buddyLabel).toBe('1/2');
  });
});

describe('buildEvidenceItems', () => {
  it('translates the kind and the scan status of each attachment', () => {
    const items = buildEvidenceItems(t, [
      evidence(),
      evidence({ id: 'ev-2', scanStatus: 'failed' }),
    ]);

    expect(items[0]?.scanTone).toBe('success');
    expect(items[1]?.scanTone).toBe('warning');
  });
});

describe('buildBuddyItems', () => {
  it('leaves an unanswered invitation without a response time', () => {
    const items = buildBuddyItems(t, 'en', [buddy()]);

    expect(items[0]?.respondedLabel).toBeNull();
    expect(items[0]?.statusTone).toBe('medium');
  });

  it('formats the response instant once a buddy has answered', () => {
    const items = buildBuddyItems(t, 'en', [
      buddy({ status: 'declined', respondedAtIso: '2026-07-11T10:00:00.000Z' }),
    ]);

    expect(items[0]?.respondedLabel).not.toBeNull();
    expect(items[0]?.statusTone).toBe('warning');
  });
});

describe('buildSignalViews', () => {
  it('translates every advisory signal it is handed', () => {
    const views = buildSignalViews(t, ['duplicate_day', 'repeated_buddy']);

    expect(views.map((view) => view.key)).toEqual(['duplicate_day', 'repeated_buddy']);
    expect(views[0]?.label).toBe('training.signalDuplicateDay');
  });
});

describe('unknown wire vocabulary', () => {
  it('falls back to a neutral tone for a buddy status it does not recognise', () => {
    const items = buildBuddyItems(t, 'en', [buddy({ status: 'expired' as never })]);

    expect(items[0]?.statusTone).toBe('medium');
  });
});

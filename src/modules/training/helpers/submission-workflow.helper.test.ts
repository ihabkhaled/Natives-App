import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { I18N_KEYS } from '@/shared/i18n';

import { SUBMISSION_STATUS } from '../constants/training.constants';
import type { TrainingSubmission } from '../types/training.types';
import {
  buildSubmissionHistory,
  canReadOwnTraining,
  canReviewTraining,
  canSubmitForReview,
  canSubmitTraining,
  canWithdraw,
  submitActionKey,
} from './submission-workflow.helper';

const t = (key: string): string => key;

function submission(overrides: Partial<TrainingSubmission> = {}): TrainingSubmission {
  return {
    id: 'sub-1',
    teamId: 'team-1',
    seasonId: null,
    membershipId: 'm-1',
    activityTypeId: 'type-gym',
    status: SUBMISSION_STATUS.draft,
    performedOn: '2026-07-10',
    durationMinutes: 45,
    quantity: null,
    notes: null,
    recordVersion: 1,
    submittedAtIso: null,
    withdrawnAtIso: null,
    createdAtIso: '2026-07-10T09:00:00.000Z',
    updatedAtIso: '2026-07-12T09:00:00.000Z',
    ...overrides,
  };
}

describe('training permission checks', () => {
  it('reads each grant independently of any role name', () => {
    expect(canReadOwnTraining([PERMISSIONS.activityReadSelf])).toBe(true);
    expect(canSubmitTraining([PERMISSIONS.activitySubmitSelf])).toBe(true);
    expect(canReviewTraining([PERMISSIONS.activityReview])).toBe(true);
  });

  it('denies each capability when its grant is absent', () => {
    expect(canReadOwnTraining([])).toBe(false);
    expect(canSubmitTraining([PERMISSIONS.activityReadSelf])).toBe(false);
    expect(canReviewTraining([PERMISSIONS.activitySubmitSelf])).toBe(false);
  });
});

describe('workflow transitions', () => {
  it('allows submitting from draft, changes-requested, and withdrawn', () => {
    expect(canSubmitForReview(SUBMISSION_STATUS.draft)).toBe(true);
    expect(canSubmitForReview(SUBMISSION_STATUS.changesRequested)).toBe(true);
    expect(canSubmitForReview(SUBMISSION_STATUS.withdrawn)).toBe(true);
    expect(canSubmitForReview(SUBMISSION_STATUS.approved)).toBe(false);
  });

  it('allows withdrawing only while the claim sits in the queue', () => {
    expect(canWithdraw(SUBMISSION_STATUS.submitted)).toBe(true);
    expect(canWithdraw(SUBMISSION_STATUS.underReview)).toBe(true);
    expect(canWithdraw(SUBMISSION_STATUS.draft)).toBe(false);
  });

  it('renames the submit action to resubmit after changes were requested', () => {
    expect(submitActionKey(SUBMISSION_STATUS.draft)).toBe(I18N_KEYS.training.actionSubmit);
    expect(submitActionKey(SUBMISSION_STATUS.changesRequested)).toBe(
      I18N_KEYS.training.actionResubmit,
    );
  });
});

describe('buildSubmissionHistory', () => {
  it('returns nothing at all when there is no claim', () => {
    expect(buildSubmissionHistory(t, 'en', null)).toEqual([]);
  });

  it('records only the creation of an untouched draft', () => {
    const entries = buildSubmissionHistory(t, 'en', submission());

    expect(entries).toHaveLength(1);
    expect(entries[0]?.key).toBe('created');
  });

  it('records submission, withdrawal, and reversal newest first', () => {
    const entries = buildSubmissionHistory(
      t,
      'en',
      submission({
        status: SUBMISSION_STATUS.reversed,
        submittedAtIso: '2026-07-11T09:00:00.000Z',
        withdrawnAtIso: '2026-07-12T09:00:00.000Z',
      }),
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      'reversed',
      'withdrawn',
      'submitted',
      'created',
    ]);
  });
});

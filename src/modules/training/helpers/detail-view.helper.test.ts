import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { SUBMISSION_STATUS } from '../constants/training.constants';
import type { ActivityType, TrainingSubmission } from '../types/training.types';
import { buildDetailActions, buildDetailBody } from './detail-view.helper';

const t = (key: string): string => key;

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
    notes: 'Squats',
    recordVersion: 1,
    submittedAtIso: null,
    withdrawnAtIso: null,
    createdAtIso: '2026-07-10T09:00:00.000Z',
    updatedAtIso: '2026-07-10T09:00:00.000Z',
    ...overrides,
  };
}

const CALLBACKS = { onSubmit: vi.fn(), onWithdraw: vi.fn() };

describe('buildDetailBody', () => {
  it('renders empty copy for a claim that is not there', () => {
    const body = buildDetailBody(t, null, null);

    expect(body).toMatchObject({ typeName: '', dateLabel: '', notes: null, statusLabel: '' });
    expect(body.changesBanner).toBeNull();
  });

  it('prefers the catalog name and falls back to the raw type id', () => {
    expect(buildDetailBody(t, submission(), TYPE).typeName).toBe('Gym');
    expect(buildDetailBody(t, submission(), null).typeName).toBe('type-gym');
  });

  it('raises the changes banner only for a changes-requested claim', () => {
    expect(buildDetailBody(t, submission(), TYPE).changesBanner).toBeNull();
    expect(
      buildDetailBody(t, submission({ status: SUBMISSION_STATUS.changesRequested }), TYPE)
        .changesBanner,
    ).toBe('training.changesRequestedBanner');
  });
});

describe('buildDetailActions', () => {
  it('offers nothing without a claim or without the submit grant', () => {
    expect(
      buildDetailActions(t, { submission: null, canSubmit: true, isBusy: false }, CALLBACKS),
    ).toEqual([]);
    expect(
      buildDetailActions(
        t,
        { submission: submission(), canSubmit: false, isBusy: false },
        CALLBACKS,
      ),
    ).toEqual([]);
  });

  it('offers submit on a draft and withdraw on a queued claim', () => {
    const draft = buildDetailActions(
      t,
      { submission: submission(), canSubmit: true, isBusy: false },
      CALLBACKS,
    );
    const queued = buildDetailActions(
      t,
      {
        submission: submission({ status: SUBMISSION_STATUS.submitted }),
        canSubmit: true,
        isBusy: true,
      },
      CALLBACKS,
    );

    expect(draft.map((action) => action.testId)).toEqual([TEST_IDS.trainingSubmitAction]);
    expect(queued.map((action) => action.testId)).toEqual([TEST_IDS.trainingWithdrawAction]);
    expect(queued[0]?.isBusy).toBe(true);
  });

  it('wires each action to its callback', () => {
    const actions = buildDetailActions(
      t,
      { submission: submission(), canSubmit: true, isBusy: false },
      CALLBACKS,
    );
    actions[0]?.onSelect();

    expect(CALLBACKS.onSubmit).toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { REVIEW_DECISION, SUBMISSION_STATUS } from '../constants/training.constants';
import type { ReviewSubmission, ReviewSubmissionDetail } from '../types/training.types';
import {
  buildDecisionActions,
  buildQueueItems,
  buildReviewPanel,
  decisionRequiresNote,
} from './review-panel.helper';

const t = (key: string): string => key;

function reviewSubmission(overrides: Partial<ReviewSubmission> = {}): ReviewSubmission {
  return {
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
    createdAtIso: '2026-07-10T09:00:00.000Z',
    updatedAtIso: '2026-07-10T18:00:00.000Z',
    submitterUserId: 'user-1',
    reviewNote: null,
    reviewedAtIso: null,
    reviewedBy: null,
    reviewerUserId: null,
    reversalReason: null,
    reversedAtIso: null,
    ...overrides,
  };
}

function detail(overrides: Partial<ReviewSubmissionDetail> = {}): ReviewSubmissionDetail {
  return {
    submission: reviewSubmission(),
    buddies: [],
    evidenceCount: 2,
    signals: [],
    ...overrides,
  };
}

describe('decisionRequiresNote', () => {
  it('requires a note for everything except approval', () => {
    expect(decisionRequiresNote(REVIEW_DECISION.approve)).toBe(false);
    expect(decisionRequiresNote(REVIEW_DECISION.reject)).toBe(true);
    expect(decisionRequiresNote(REVIEW_DECISION.requestChanges)).toBe(true);
  });
});

describe('buildDecisionActions', () => {
  it('offers approve, request-changes, and reject in that order', () => {
    const onSelect = vi.fn();
    const actions = buildDecisionActions(t, false, onSelect);

    expect(actions.map((action) => action.decision)).toEqual([
      REVIEW_DECISION.approve,
      REVIEW_DECISION.requestChanges,
      REVIEW_DECISION.reject,
    ]);
    actions[2]?.onSelect();
    expect(onSelect).toHaveBeenCalledWith(REVIEW_DECISION.reject);
  });
});

describe('buildReviewPanel', () => {
  const base = {
    typeNames: new Map([['type-gym', 'Gym']]),
    noteValue: '',
    noteError: null,
    actions: buildDecisionActions(t, false, vi.fn()),
    onNoteChange: vi.fn(),
  };

  it('shows the decision actions to a reviewer who does not own the claim', () => {
    const panel = buildReviewPanel(t, { ...base, detail: detail(), isSelfReview: false });

    expect(panel.typeName).toBe('Gym');
    expect(panel.actions).toHaveLength(3);
    expect(panel.selfBlockedNotice).toBeNull();
  });

  it('replaces the actions with a plain statement on a self review', () => {
    const panel = buildReviewPanel(t, { ...base, detail: detail(), isSelfReview: true });

    expect(panel.actions).toEqual([]);
    expect(panel.selfBlockedNotice).toBe('training.reviewSelfBlocked');
  });

  it('falls back to the raw type id when the catalog has no name', () => {
    const panel = buildReviewPanel(t, {
      ...base,
      typeNames: new Map(),
      detail: detail({ signals: ['duplicate_day'] }),
      isSelfReview: false,
    });

    expect(panel.typeName).toBe('type-gym');
    expect(panel.signals).toHaveLength(1);
  });
});

describe('buildQueueItems', () => {
  it('marks the selected row and falls back to the raw type id', () => {
    const items = buildQueueItems(
      t,
      [reviewSubmission(), reviewSubmission({ id: 'sub-2' })],
      new Map(),
      'sub-2',
    );

    expect(items[0]?.isSelected).toBe(false);
    expect(items[1]?.isSelected).toBe(true);
    expect(items[0]?.typeName).toBe('type-gym');
  });
});

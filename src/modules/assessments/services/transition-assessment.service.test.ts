import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  requestPublishAssessment,
  requestReviewAssessment,
  requestSubmitAssessment,
} from '../gateways/assessments.gateway';
import { transitionAssessment } from './transition-assessment.service';

vi.mock('../gateways/assessments.gateway', () => ({
  requestSubmitAssessment: vi.fn(),
  requestReviewAssessment: vi.fn(),
  requestPublishAssessment: vi.fn(),
}));

function detailDto(status: string) {
  return {
    assessment: {
      id: 'a1',
      familyId: 'f1',
      teamId: 't1',
      seasonId: null,
      periodId: 'p1',
      templateId: 'tpl1',
      membershipId: 'm1',
      evaluatorUserId: 'u1',
      status,
      revision: 1,
      summary: null,
      recordVersion: 2,
      submittedAt: null,
      submittedBy: null,
      reviewedAt: null,
      reviewedBy: null,
      publishedAt: null,
      publishedBy: null,
      supersededAt: null,
      supersededById: null,
      createdBy: null,
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-01T09:00:00.000Z',
    },
    values: [],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('transitionAssessment', () => {
  it('routes submit to the submit endpoint', async () => {
    vi.mocked(requestSubmitAssessment).mockResolvedValue(detailDto('submitted') as never);

    const detail = await transitionAssessment('t1', {
      assessmentId: 'a1',
      expectedRecordVersion: 1,
      step: 'submit',
    });

    expect(requestSubmitAssessment).toHaveBeenCalledExactlyOnceWith('t1', 'a1', 1);
    expect(detail.assessment.status).toBe('submitted');
  });

  it('routes publish to the publish endpoint', async () => {
    vi.mocked(requestPublishAssessment).mockResolvedValue(detailDto('published') as never);

    const detail = await transitionAssessment('t1', {
      assessmentId: 'a1',
      expectedRecordVersion: 4,
      step: 'publish',
    });

    expect(requestPublishAssessment).toHaveBeenCalledExactlyOnceWith('t1', 'a1', 4);
    expect(detail.assessment.status).toBe('published');
  });

  it('routes each review decision to the shared review endpoint', async () => {
    vi.mocked(requestReviewAssessment).mockResolvedValue(detailDto('in_review') as never);

    await transitionAssessment('t1', {
      assessmentId: 'a1',
      expectedRecordVersion: 2,
      step: 'start_review',
    });
    await transitionAssessment('t1', {
      assessmentId: 'a1',
      expectedRecordVersion: 3,
      step: 'approve',
    });
    await transitionAssessment('t1', {
      assessmentId: 'a1',
      expectedRecordVersion: 3,
      step: 'reject',
    });

    expect(vi.mocked(requestReviewAssessment).mock.calls.map((call) => call[3])).toEqual([
      'start_review',
      'approve',
      'reject',
    ]);
  });
});

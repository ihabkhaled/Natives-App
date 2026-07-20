import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { ASSESSMENT_STATUS } from '../constants/assessments.constants';
import {
  availableWorkflowSteps,
  canReadOwnAssessments,
  canReadOwnFeedback,
  canReadTeamAssessments,
  isEditableStatus,
  isReadOnlyStatus,
  permissionForStep,
} from './assessment-workflow.helper';

const ALL = Object.values(PERMISSIONS);

describe('availableWorkflowSteps', () => {
  it('offers submit from a draft when the principal may create', () => {
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.Draft, [PERMISSIONS.assessmentCreate])).toEqual(
      ['submit'],
    );
  });

  it('offers nothing from a draft without the create grant', () => {
    expect(
      availableWorkflowSteps(ASSESSMENT_STATUS.Draft, [PERMISSIONS.assessmentPublish]),
    ).toEqual([]);
  });

  it('offers the review claim once submitted', () => {
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.Submitted, ALL)).toEqual(['start_review']);
  });

  it('offers approve and send-back while in review', () => {
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.InReview, ALL)).toEqual(['approve', 'reject']);
  });

  it('offers publish only to a publisher', () => {
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.Approved, ALL)).toEqual(['publish']);
    expect(
      availableWorkflowSteps(ASSESSMENT_STATUS.Approved, [PERMISSIONS.assessmentReview]),
    ).toEqual([]);
  });

  it('offers nothing once published or superseded', () => {
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.Published, ALL)).toEqual([]);
    expect(availableWorkflowSteps(ASSESSMENT_STATUS.Revised, ALL)).toEqual([]);
  });
});

describe('permissionForStep', () => {
  it('maps every step to its permission', () => {
    expect(permissionForStep('submit')).toBe(PERMISSIONS.assessmentCreate);
    expect(permissionForStep('start_review')).toBe(PERMISSIONS.assessmentReview);
    expect(permissionForStep('publish')).toBe(PERMISSIONS.assessmentPublish);
  });
});

describe('status predicates', () => {
  it('allows editing only a draft', () => {
    expect(isEditableStatus(ASSESSMENT_STATUS.Draft)).toBe(true);
    expect(isEditableStatus(ASSESSMENT_STATUS.Submitted)).toBe(false);
  });

  it('marks published and revised records read-only', () => {
    expect(isReadOnlyStatus(ASSESSMENT_STATUS.Published)).toBe(true);
    expect(isReadOnlyStatus(ASSESSMENT_STATUS.Revised)).toBe(true);
    expect(isReadOnlyStatus(ASSESSMENT_STATUS.Approved)).toBe(false);
  });
});

describe('read gates', () => {
  it('gates the team workspace, own assessments, and own feedback separately', () => {
    expect(canReadTeamAssessments([PERMISSIONS.assessmentReadTeam])).toBe(true);
    expect(canReadTeamAssessments([PERMISSIONS.assessmentReadSelfPublished])).toBe(false);
    expect(canReadOwnAssessments([PERMISSIONS.assessmentReadSelfPublished])).toBe(true);
    expect(canReadOwnAssessments([])).toBe(false);
    expect(canReadOwnFeedback([PERMISSIONS.feedbackReadSelf])).toBe(true);
    expect(canReadOwnFeedback([PERMISSIONS.feedbackManage])).toBe(false);
  });
});

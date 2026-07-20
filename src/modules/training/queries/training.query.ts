import { getActivityTypes } from '../services/get-activity-types.service';
import { getReviewDetail } from '../services/get-review-detail.service';
import { getSubmission } from '../services/get-submission.service';
import { listMySubmissions } from '../services/list-my-submissions.service';
import { listReviewQueue } from '../services/list-review-queue.service';
import { listSubmissionEvidence } from '../services/list-submission-evidence.service';
import { trainingQueryKeys } from './training.keys';

/** Catalog of activity types; changes rarely, so it is cached per team. */
export function buildActivityTypesQueryOptions(teamId: string) {
  return {
    queryKey: trainingQueryKeys.types(teamId),
    queryFn: () => getActivityTypes(teamId),
    enabled: teamId !== '',
  };
}

/** One bounded page of the caller's own claims. */
export function buildMySubmissionsQueryOptions(teamId: string) {
  return {
    queryKey: trainingQueryKeys.mySubmissions(teamId),
    queryFn: () => listMySubmissions(teamId),
    enabled: teamId !== '',
  };
}

export function buildSubmissionQueryOptions(teamId: string, submissionId: string) {
  return {
    queryKey: trainingQueryKeys.submission(teamId, submissionId),
    queryFn: () => getSubmission(teamId, submissionId),
    enabled: teamId !== '' && submissionId !== '',
  };
}

export function buildSubmissionEvidenceQueryOptions(teamId: string, submissionId: string) {
  return {
    queryKey: trainingQueryKeys.evidence(teamId, submissionId),
    queryFn: () => listSubmissionEvidence(teamId, submissionId),
    enabled: teamId !== '' && submissionId !== '',
  };
}

/** The reviewer queue; `status` is part of the key so filters cache apart. */
export function buildReviewQueueQueryOptions(teamId: string, status: string | null) {
  return {
    queryKey: trainingQueryKeys.reviewQueue(teamId, status ?? 'all'),
    queryFn: () => listReviewQueue(teamId, status),
    enabled: teamId !== '',
  };
}

export function buildReviewDetailQueryOptions(teamId: string, submissionId: string) {
  return {
    queryKey: trainingQueryKeys.reviewDetail(teamId, submissionId),
    queryFn: () => getReviewDetail(teamId, submissionId),
    enabled: teamId !== '' && submissionId !== '',
  };
}

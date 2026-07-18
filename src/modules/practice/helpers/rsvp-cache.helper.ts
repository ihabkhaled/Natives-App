import type { PracticeSessionDetail, RsvpSubmission } from '../types/practice.types';

/**
 * Pure optimistic patch: reflect the member's pending response in a cached
 * detail immediately. The version and waitlist stay untouched — the server is
 * authoritative and its response replaces this on success, or the snapshot is
 * restored on error.
 */
export function applyOptimisticRsvp(
  detail: PracticeSessionDetail,
  submission: RsvpSubmission,
): PracticeSessionDetail {
  return {
    ...detail,
    rsvp: {
      ...detail.rsvp,
      status: submission.status,
      reasonCategory: submission.reasonCategory,
    },
  };
}

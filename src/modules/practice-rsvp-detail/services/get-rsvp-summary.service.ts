import { requestRsvpSummary } from '../gateways/practice-rsvp-detail.gateway';
import type { RsvpDetailRequestParams, RsvpSummary } from '../types/practice-rsvp-detail.types';

/** Privacy-safe planning counts for one session. */
export function getRsvpSummary(params: RsvpDetailRequestParams): Promise<RsvpSummary> {
  return requestRsvpSummary(params);
}

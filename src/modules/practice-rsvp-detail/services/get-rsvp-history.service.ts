import { requestRsvpHistory } from '../gateways/practice-rsvp-detail.gateway';
import type { RsvpDetailRequestParams, RsvpHistory } from '../types/practice-rsvp-detail.types';

/** One member's full revision trail, read on demand for the member a coach opened. */
export function getRsvpHistory(
  params: RsvpDetailRequestParams & { readonly membershipId: string },
): Promise<RsvpHistory> {
  return requestRsvpHistory(params);
}

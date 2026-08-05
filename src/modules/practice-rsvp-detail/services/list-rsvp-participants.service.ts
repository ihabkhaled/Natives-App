import { requestRsvpParticipants } from '../gateways/practice-rsvp-detail.gateway';
import type { RsvpParticipantsPage, RsvpParticipantsQuery } from '../types/practice-rsvp-detail.types';

/** One page of who is coming to this session, exactly as the server holds it. */
export function listRsvpParticipants(query: RsvpParticipantsQuery): Promise<RsvpParticipantsPage> {
  return requestRsvpParticipants(query);
}

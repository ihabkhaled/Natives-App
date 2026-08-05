import { requestOverrideRsvp } from '../gateways/practice-rsvp-detail.gateway';
import type { RsvpOverrideCommand, RsvpRecord } from '../types/practice-rsvp-detail.types';

/**
 * Change one member's RSVP on their behalf. An override is somebody's answer
 * changed for them, not the coach's own — the command's mandatory `reason`
 * is what makes that attributable rather than a silent overwrite.
 */
export function overrideRsvp(command: RsvpOverrideCommand): Promise<RsvpRecord> {
  return requestOverrideRsvp(command);
}

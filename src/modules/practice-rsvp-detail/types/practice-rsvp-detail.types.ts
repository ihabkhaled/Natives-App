import type { RsvpReason, RsvpStatus } from '@/modules/practice';

import type { RsvpNoteVisibility, RsvpSource } from '../constants/practice-rsvp-detail.constants';

/** Which session's roster a request is about. */
export interface RsvpDetailRequestParams {
  readonly teamId: string;
  readonly sessionId: string;
}

/** One participant's current RSVP, as the roster read reports it. */
export interface RsvpParticipant {
  readonly membershipId: string;
  readonly status: RsvpStatus;
  readonly waitlisted: boolean;
  readonly source: RsvpSource;
  readonly respondedAtIso: string;
}

/** One offset page of the roster. */
export interface RsvpParticipantsPage {
  readonly items: readonly RsvpParticipant[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** `status: null` means every response; the wire query omits the param entirely. */
export interface RsvpParticipantsQuery extends RsvpDetailRequestParams {
  readonly limit: number;
  readonly offset: number;
  readonly status: RsvpStatus | null;
}

/** Privacy-safe planning counts — no membership identifiers travel with it. */
export interface RsvpSummary {
  readonly sessionId: string;
  readonly capacity: number | null;
  readonly going: number;
  readonly waitlisted: number;
  readonly notGoing: number;
  readonly maybe: number;
  readonly noResponse: number;
  readonly spotsRemaining: number | null;
}

/**
 * A coach overriding one member's RSVP. `reason` is mandatory: an override is
 * somebody's answer changed on their behalf, so it must be attributable to
 * more than "a coach clicked a button". `expectedVersion` is the optimistic
 * guard — omitted when the coach never read a version to guard against.
 */
export interface RsvpOverrideCommand extends RsvpDetailRequestParams {
  readonly membershipId: string;
  readonly status: RsvpStatus;
  readonly reason: string;
  readonly reasonCategory: RsvpReason | null;
  readonly note: string | null;
  readonly noteVisibility: RsvpNoteVisibility | null;
  readonly expectedVersion: number | null;
}

/** The authoritative RSVP record an override (or a read) resolves to. */
export interface RsvpRecord {
  readonly sessionId: string;
  readonly membershipId: string;
  readonly status: RsvpStatus;
  readonly reasonCategory: RsvpReason | null;
  readonly note: string | null;
  readonly noteVisibility: RsvpNoteVisibility | null;
  readonly source: RsvpSource | null;
  readonly waitlisted: boolean;
  readonly respondedAtIso: string | null;
  readonly version: number | null;
}

/** One transition in a member's RSVP trail; `isOverride` marks a coach's move. */
export interface RsvpRevision {
  readonly id: string;
  readonly membershipId: string;
  readonly fromStatus: RsvpStatus | null;
  readonly toStatus: RsvpStatus;
  readonly reasonCategory: RsvpReason | null;
  readonly note: string | null;
  readonly waitlisted: boolean;
  readonly source: RsvpSource;
  readonly isOverride: boolean;
  readonly overrideReason: string | null;
  readonly actorUserId: string | null;
  readonly occurredAtIso: string;
}

/** One member's full revision trail — the reason the override endpoint is trustworthy. */
export interface RsvpHistory {
  readonly items: readonly RsvpRevision[];
}

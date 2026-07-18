import type {
  PracticeChangeKind,
  PracticeStatus,
  PracticeType,
  RsvpReason,
  RsvpStatus,
} from '../constants/practice.constants';

/**
 * App-owned practice domain. Wire instants are renamed to the `…Iso`
 * convention (UTC ISO 8601) and presented in Africa/Cairo at the edge. `null`
 * means "unknown / not set" and is never coerced to zero.
 */
export interface PracticeVenue {
  readonly id: string;
  readonly name: string;
  readonly addressLine: string | null;
  /** A geo/map URL for directions, or null when the venue has none. */
  readonly mapUrl: string | null;
  /** Public arrival notes; never private coach notes. */
  readonly notes: string | null;
}

export interface PracticeAgendaItem {
  readonly id: string;
  /** i18n key for the drill/segment label; raw backend copy is never rendered. */
  readonly labelKey: string;
  readonly durationMinutes: number | null;
}

export interface PracticeSessionCounts {
  readonly going: number;
  readonly maybe: number;
  readonly notGoing: number;
  readonly waitlist: number;
}

export interface RsvpState {
  readonly status: RsvpStatus;
  readonly reasonCategory: RsvpReason | null;
  readonly respondedAtIso: string | null;
  /** Optimistic-concurrency version; sent back on the next write. */
  readonly version: number | null;
  readonly waitlisted: boolean;
  readonly waitlistPosition: number | null;
  /** RSVP cutoff instant (UTC ISO 8601), or null when there is none. */
  readonly deadlineAtIso: string | null;
  /** Backend policy: whether the member may still change their response. */
  readonly canRespond: boolean;
}

export interface PracticeSessionSummary {
  readonly id: string;
  readonly type: PracticeType;
  readonly title: string | null;
  readonly status: PracticeStatus;
  readonly startAtIso: string;
  readonly endAtIso: string;
  readonly meetAtIso: string | null;
  readonly rsvpDeadlineAtIso: string | null;
  readonly venueName: string | null;
  readonly capacity: number | null;
  readonly myRsvpStatus: RsvpStatus;
  readonly waitlisted: boolean;
  readonly changeKind: PracticeChangeKind | null;
}

export interface PracticeSessionListPage {
  readonly items: readonly PracticeSessionSummary[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
}

export interface PracticeSessionDetail {
  readonly id: string;
  readonly type: PracticeType;
  readonly title: string | null;
  readonly status: PracticeStatus;
  readonly startAtIso: string;
  readonly endAtIso: string;
  readonly meetAtIso: string | null;
  readonly rsvpDeadlineAtIso: string | null;
  readonly venue: PracticeVenue | null;
  readonly instructions: string | null;
  readonly capacity: number | null;
  /** Privacy-safe aggregate counts, or null when not shared for this session. */
  readonly counts: PracticeSessionCounts | null;
  readonly agenda: readonly PracticeAgendaItem[];
  readonly rsvp: RsvpState;
  readonly changeKind: PracticeChangeKind | null;
  readonly updatedAtIso: string;
}

/** The self-RSVP write payload (identity comes from the token, never the body). */
export interface RsvpSubmission {
  readonly status: RsvpStatus;
  readonly reasonCategory: RsvpReason | null;
  /** The version the member last saw; a mismatch is a 409 conflict. */
  readonly version: number | null;
}

/** Authoritative fields returned by PUT .../rsvp. */
export interface RsvpUpdate {
  readonly status: RsvpStatus;
  readonly reasonCategory: RsvpReason | null;
  readonly respondedAtIso: string | null;
  readonly version: number | null;
  readonly waitlisted: boolean;
}

/** Server query for the calendar list (all fields optional/bounded). */
export interface PracticeSessionQueryParams {
  readonly scope: string;
  readonly type: PracticeType | null;
  readonly rsvp: RsvpStatus | null;
  readonly pageSize: number;
}

/** Exact query and path inputs accepted by PracticeSessions.list. */
export interface PracticeSessionRequestParams {
  readonly teamId: string;
  readonly from: string | null;
  readonly to: string | null;
  readonly sessionType: string | null;
  readonly limit: number;
  readonly offset: number;
}

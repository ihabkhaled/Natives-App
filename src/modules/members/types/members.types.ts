import type {
  AgeClassification,
  AliasSource,
  InvitationStatus,
  LifecycleAction,
  MemberAudience,
  MemberRole,
  MembershipStatus,
  PlayerGender,
} from '../constants/members.constants';

/**
 * App-owned members domain. Wire instants are renamed to the `…Iso` convention
 * (UTC ISO 8601) and presented in Africa/Cairo at the edge. `null` means
 * "unknown / not provided" and is never coerced to zero.
 */
export interface MemberDirectoryItem {
  readonly membershipId: string;
  readonly teamId: string;
  readonly status: MembershipStatus;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
  readonly positions: readonly string[];
  readonly hasAvatar: boolean;
}

export interface MemberDirectoryPage {
  readonly items: readonly MemberDirectoryItem[];
  readonly total: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/** An audience-shaped profile; fields the viewer may not see are `null`. */
export interface MemberProfile {
  readonly membershipId: string;
  readonly teamId: string;
  readonly audience: MemberAudience;
  readonly status: MembershipStatus;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly positions: readonly string[];
  readonly jerseyNumber: number | null;
  readonly division: string | null;
  readonly hasAvatar: boolean;
  readonly preferredName: string | null;
  readonly fullNameAr: string | null;
  readonly gender: PlayerGender | null;
  readonly fullName: string | null;
  readonly jerseySize: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly ageClassification: AgeClassification | null;
  readonly dateOfBirth: string | null;
  readonly statusReason: string | null;
  readonly version: number | null;
}

/** Lifecycle result returned by invite/transition. */
export interface MembershipRecord {
  readonly id: string;
  readonly teamId: string;
  readonly status: MembershipStatus;
  readonly statusReason: string | null;
  readonly statusEffectiveAtIso: string;
  readonly version: number;
}

export interface MemberStatusEvent {
  readonly id: string;
  readonly fromStatus: MembershipStatus | null;
  readonly toStatus: MembershipStatus;
  readonly reason: string | null;
  readonly actorUserId: string | null;
  readonly occurredAtIso: string;
}

export interface MemberAlias {
  readonly id: string;
  readonly alias: string;
  readonly source: AliasSource;
  readonly createdAtIso: string;
}

export interface MemberRoles {
  readonly membershipId: string;
  readonly roles: readonly MemberRole[];
  readonly assignableRoles: readonly MemberRole[];
}

export interface AvatarAccess {
  readonly url: string | null;
  readonly expiresAtIso: string | null;
}

/** Bounded pagination + client-side filter state for the directory. */
export interface MembersQueryParams {
  readonly pageSize: number;
}

export interface MembersFilterState {
  readonly search: string;
  readonly status: MembershipStatus | null;
  readonly position: string | null;
}

/** Self-invite payload; identity of the inviter comes from the token. */
export interface InviteMemberInput {
  readonly fullName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
}

/** The team-scoped invitation an administrator sends by email. */
export interface CreateInvitationInput {
  readonly email: string;
  /** Team-role slug from the server catalog; acceptance grants it. */
  readonly teamRole: MemberRole;
}

/** One role the acting principal may grant, with server display metadata. */
export interface AssignableRole {
  readonly slug: MemberRole;
  readonly displayName: string;
  readonly description: string;
}

/** What one issued invitation gives the administrator to act on. */
export interface InvitationDelivery {
  readonly id: string;
  readonly email: string;
  /** The granted team-role slug the receipt names back. */
  readonly teamRole: MemberRole;
  readonly status: InvitationStatus;
  readonly expiresAt: string;
  /**
   * The absolute accept link, already built from this build's origin. Shown
   * once as the manual fallback when email delivery is a console adapter.
   */
  readonly acceptUrl: string;
}

/** Profile-edit payload guarded by optimistic concurrency. */
export interface UpdateProfileInput {
  readonly fullName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
  readonly expectedVersion: number;
}

/** Lifecycle transition payload with an optional audited reason. */
export interface TransitionInput {
  readonly action: LifecycleAction;
  readonly reason: string | null;
}

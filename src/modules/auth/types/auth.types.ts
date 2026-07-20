export const ACCOUNT_STATE = {
  Active: 'active',
  Pending: 'pending',
  Suspended: 'suspended',
} as const;

export type AccountState = (typeof ACCOUNT_STATE)[keyof typeof ACCOUNT_STATE];

/**
 * Lifecycle of one membership scope, mirroring the backend membership status
 * enum. Declared here (not imported from the members module) so the auth
 * module stays free of upward module dependencies.
 */
export const MEMBERSHIP_SCOPE_STATUSES = [
  'invited',
  'active',
  'inactive',
  'suspended',
  'left',
  'archived',
  'anonymized',
] as const;

export type MembershipScopeStatus = (typeof MEMBERSHIP_SCOPE_STATUSES)[number];

/**
 * An explicit team/season scope the user belongs to. The season triple is
 * nullable: a team without a season is a real, supported scope and is never
 * coerced into a placeholder season.
 */
export interface AuthMembership {
  readonly membershipId: string;
  readonly teamId: string;
  readonly teamSlug: string;
  readonly teamName: string;
  readonly seasonId: string | null;
  readonly seasonSlug: string | null;
  readonly seasonName: string | null;
  readonly status: MembershipScopeStatus;
  /** Lower-snake role slugs the principal holds inside this team scope. */
  readonly roles: readonly string[];
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  /** Effective permission strings the backend granted this session. */
  readonly permissions: readonly string[];
  readonly accountState: AccountState;
  readonly onboardingComplete: boolean;
  readonly memberships: readonly AuthMembership[];
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface LoginFormValues {
  readonly email: string;
  readonly password: string;
}

export interface ForgotPasswordFormValues {
  readonly email: string;
}

export interface SetPasswordFormValues {
  readonly password: string;
  readonly confirmPassword: string;
}

export const INVITATION_ROLE = {
  Admin: 'admin',
  User: 'user',
} as const;

type InvitationRole = (typeof INVITATION_ROLE)[keyof typeof INVITATION_ROLE];

/** Read-only view of a pending invitation, shown before password creation. */
export interface InvitationDetails {
  readonly email: string;
  readonly role: InvitationRole;
  readonly inviterName: string | null;
  /** Expiry instant in UTC (ISO 8601). */
  readonly expiresAtIso: string;
}

/** One authenticated device/session in the account's session list. */
export interface DeviceSession {
  readonly id: string;
  readonly device: string;
  readonly approxLocation: string;
  /** Last-seen instant in UTC (ISO 8601). */
  readonly lastActiveAtIso: string;
  readonly isCurrent: boolean;
}

export const SESSION_STATUS = {
  Unknown: 'unknown',
  Authenticated: 'authenticated',
  Anonymous: 'anonymous',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

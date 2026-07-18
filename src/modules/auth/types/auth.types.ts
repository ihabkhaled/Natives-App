export const ACCOUNT_STATE = {
  Active: 'active',
  Pending: 'pending',
  Suspended: 'suspended',
} as const;

export type AccountState = (typeof ACCOUNT_STATE)[keyof typeof ACCOUNT_STATE];

/** An explicit team/season scope the user belongs to. */
export interface AuthMembership {
  readonly teamId: string;
  readonly teamName: string;
  readonly seasonId: string;
  readonly seasonName: string;
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

export type InvitationRole = (typeof INVITATION_ROLE)[keyof typeof INVITATION_ROLE];

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

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

export const SESSION_STATUS = {
  Unknown: 'unknown',
  Authenticated: 'authenticated',
  Anonymous: 'anonymous',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

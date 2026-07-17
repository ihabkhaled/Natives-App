export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
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

import { APP_PATHS } from '@/shared/config';

export function loginPath(): string {
  return APP_PATHS.login;
}

export function forgotPasswordPath(): string {
  return APP_PATHS.forgotPassword;
}

export function resetPasswordPath(): string {
  return APP_PATHS.resetPassword;
}

export function acceptInvitationPath(): string {
  return APP_PATHS.acceptInvitation;
}

export function sessionsPath(): string {
  return APP_PATHS.sessions;
}

import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  acceptInvitationPath,
  forgotPasswordPath,
  loginPath,
  resetPasswordPath,
  sessionsPath,
  signupPath,
} from './auth.paths';

describe('auth path builders', () => {
  it('derives every auth route from the canonical route table', () => {
    expect(loginPath()).toBe(APP_PATHS.login);
    expect(signupPath()).toBe(APP_PATHS.signup);
    expect(forgotPasswordPath()).toBe(APP_PATHS.forgotPassword);
    expect(resetPasswordPath()).toBe(APP_PATHS.resetPassword);
    expect(acceptInvitationPath()).toBe(APP_PATHS.acceptInvitation);
    expect(sessionsPath()).toBe(APP_PATHS.sessions);
  });

  it('pins the concrete route strings', () => {
    expect(loginPath()).toBe('/login');
    expect(signupPath()).toBe('/signup');
    expect(forgotPasswordPath()).toBe('/forgot-password');
    expect(resetPasswordPath()).toBe('/reset-password');
    expect(acceptInvitationPath()).toBe('/accept-invitation');
    expect(sessionsPath()).toBe('/sessions');
  });
});

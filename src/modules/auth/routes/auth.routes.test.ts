import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { AcceptInvitationContainer } from '../containers/accept-invitation.container';
import { ForgotPasswordContainer } from '../containers/forgot-password.container';
import { LoginContainer } from '../containers/login.container';
import { ResetPasswordContainer } from '../containers/reset-password.container';
import { SessionsContainer } from '../containers/sessions.container';
import {
  acceptInvitationPath,
  forgotPasswordPath,
  loginPath,
  resetPasswordPath,
  sessionsPath,
} from './auth.paths';
import { getAuthRouteDefinitions } from './auth.routes';

function definitionFor(path: string) {
  const definition = getAuthRouteDefinitions().find((candidate) => candidate.path === path);
  expect(definition).toBeDefined();
  return definition!;
}

describe('getAuthRouteDefinitions', () => {
  it('exposes the login, recovery, invitation, and session routes', () => {
    expect(getAuthRouteDefinitions().map((definition) => definition.path)).toEqual([
      loginPath(),
      forgotPasswordPath(),
      resetPasswordPath(),
      acceptInvitationPath(),
      sessionsPath(),
    ]);
  });

  it('keeps every route exact', () => {
    for (const definition of getAuthRouteDefinitions()) {
      expect(definition.exact).toBe(true);
    }
  });

  it('keeps the public recovery flows public-only', () => {
    for (const path of [
      loginPath(),
      forgotPasswordPath(),
      resetPasswordPath(),
      acceptInvitationPath(),
    ]) {
      expect(definitionFor(path).access).toBe(ROUTE_ACCESS.PublicOnly);
    }
  });

  it('protects the session-management route', () => {
    expect(definitionFor(sessionsPath()).access).toBe(ROUTE_ACCESS.Protected);
  });

  it('wires each container to its route', () => {
    expect(definitionFor(loginPath()).component).toBe(LoginContainer);
    expect(definitionFor(forgotPasswordPath()).component).toBe(ForgotPasswordContainer);
    expect(definitionFor(resetPasswordPath()).component).toBe(ResetPasswordContainer);
    expect(definitionFor(acceptInvitationPath()).component).toBe(AcceptInvitationContainer);
    expect(definitionFor(sessionsPath()).component).toBe(SessionsContainer);
  });
});

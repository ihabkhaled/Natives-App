import { I18N_KEYS } from '@/shared/i18n';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

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

export function getAuthRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: loginPath(),
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: LoginContainer,
    },
    {
      path: forgotPasswordPath(),
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: ForgotPasswordContainer,
    },
    {
      path: resetPasswordPath(),
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: ResetPasswordContainer,
    },
    {
      path: acceptInvitationPath(),
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: AcceptInvitationContainer,
    },
    {
      path: sessionsPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: SessionsContainer,
      meta: {
        key: 'sessions',
        titleKey: I18N_KEYS.sessions.title,
        permissions: [],
        requiresTeamContext: false,
        offline: false,
        preload: false,
        featureFlag: null,
        nav: null,
      },
    },
  ];
}

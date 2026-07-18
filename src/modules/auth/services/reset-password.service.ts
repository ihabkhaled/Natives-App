import { trackEvent } from '@/packages/analytics';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestPasswordReset } from '../gateways/auth.gateway';
import type { SetPasswordFormValues } from '../types/auth.types';
import { mapAuthLinkError } from './map-auth-link-error.helper';

/**
 * Use case: set a new password from a reset-link token. An invalid or expired
 * token surfaces as a sanitized link-invalid error.
 */
export async function resetPassword(token: string, values: SetPasswordFormValues): Promise<void> {
  try {
    await requestPasswordReset(token, values.password);
    trackEvent(AUTH_ANALYTICS_EVENTS.passwordResetCompleted);
  } catch (error) {
    throw mapAuthLinkError(error);
  }
}

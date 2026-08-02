import { trackEvent } from '@/packages/analytics';
import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { requestSignup } from '../gateways/signup.gateway';
import type { AccountState } from '../types/auth.types';
import type { SignupFormValues } from '../types/signup.types';

/**
 * Use case: request an account. No tokens are stored and no session is started
 * — that is the contract, not an omission: the backend answers `201 { state:
 * 'pending' }` and an administrator has to approve the account before it can
 * sign in. A duplicate email answers 409, which the shared transport mapper
 * turns into `APP_ERROR_CODE.Conflict` for the screen to word specifically.
 */
export async function submitSignup(values: SignupFormValues): Promise<AccountState> {
  try {
    const acknowledgement = await requestSignup(values);
    trackEvent(AUTH_ANALYTICS_EVENTS.signupRequested);
    return acknowledgement.state;
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

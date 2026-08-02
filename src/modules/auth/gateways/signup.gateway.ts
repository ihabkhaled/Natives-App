import type { SignupRequestContract } from '@/packages/api-contract';
import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { signupAcknowledgementSchema } from '../schemas/signup.schema';
import type { SignupFormValues } from '../types/signup.types';

/**
 * Self-signup resource. Public by design (`skipAuth`) and never retried on 401:
 * the endpoint issues no tokens, so the refresh interceptor has nothing to do
 * and must not be woken up by an anonymous request.
 */
export function requestSignup(
  values: SignupFormValues,
): Promise<SchemaOutput<typeof signupAcknowledgementSchema>> {
  const request: SignupRequestContract = {
    email: values.email,
    displayName: values.displayName,
    password: values.password,
  };
  return getAppHttpClient().post(AUTH_API_PATHS.signup, request, signupAcknowledgementSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

import type { ContactRequestContract } from '@/packages/api-contract';
import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { CONTACT_API_PATHS } from '../constants/contact-api.constants';
import { contactResponseSchema } from '../schemas/contact-response.schema';
import type { ContactRequestDto } from '../types/contact.types';

/**
 * Contact resource gateway: one public endpoint, schema-parsed. `skipAuth`
 * because the relay is anonymous, and `skipRetryOnUnauthorized` because there
 * is no session to refresh and replay for a signed-out visitor.
 */
export function requestContactSubmission(
  request: ContactRequestDto,
): Promise<SchemaOutput<typeof contactResponseSchema>> {
  const payload: ContactRequestContract = request;
  return getAppHttpClient().post(CONTACT_API_PATHS.contact, payload, contactResponseSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}

import { CONTACT_SUBMIT_STATUS, type ContactSubmitStatus } from '../contact.constants';
import type { ContactRequestDto, ContactResponseDto } from '../types/contact.types';

export interface ContactSubmitResult {
  readonly status: ContactSubmitStatus;
  readonly response: ContactResponseDto | null;
}

/**
 * TODO(contact-endpoint): the backend `POST /contact` (public, rate-limited,
 * stateless email relay — see the landing-site spec) is not live yet. This
 * stub is the seam: it takes the exact request DTO the real endpoint will
 * accept and always reports `unavailable` without making any network call —
 * inventing a request to a route that does not exist would fail silently or
 * loudly for every visitor, so the screen shows an honest "not available
 * yet" state instead of a fake success.
 *
 * Wiring the real endpoint is a one-file change: replace the body with a
 * gateway `request*` call (`@/packages/http`) parsed through a response
 * schema, keeping this exact function signature so the hook and view need
 * no changes.
 */
export async function submitContactRequest(
  request: ContactRequestDto,
): Promise<ContactSubmitResult> {
  void request;
  return Promise.resolve({ status: CONTACT_SUBMIT_STATUS.Unavailable, response: null });
}

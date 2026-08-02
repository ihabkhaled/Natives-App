import { runRequest } from '@/shared/errors';

import { requestContactSubmission } from '../gateways/contact.gateway';
import type { ContactRequestDto, ContactResponseDto } from '../types/contact.types';

/**
 * Use case: hand a visitor's message to the team's contact relay.
 *
 * Every documented failure of `POST /contact` — 400 (invalid body or an
 * unknown extra property), 429 (rate limited), 503 (the operator email
 * channel is disabled or unconfigured) — leaves here as an `AppError` with a
 * code the screen has honest copy for; nothing above this line ever sees a
 * transport error or a raw backend string.
 */
export function submitContactRequest(request: ContactRequestDto): Promise<ContactResponseDto> {
  return runRequest(async () => requestContactSubmission(request));
}

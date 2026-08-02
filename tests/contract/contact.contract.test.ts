import { assert, describe, expect, it } from 'vitest';

import { contactResponseSchema, type ContactRequestDto } from '@/modules/contact';
import type { ContactRequestContract, ContactResponseContract } from '@/packages/api-contract';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_CONTACT, MOCK_CONTACT_LIMITS } from '@/tests/msw/contact.fixture';

import { apiUrl } from '../setup/contract-api.helper';

const VALID_BODY: ContactRequestDto = {
  email: MOCK_CONTACT.senderEmail,
  subject: MOCK_CONTACT.subject,
  message: MOCK_CONTACT.message,
};

/** The relay is public: no Authorization header goes anywhere near it. */
function sendContact(body: unknown): Promise<Response> {
  return fetch(apiUrl('/contact'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

interface WireErrorEnvelope {
  readonly code: string;
  readonly errors: readonly { readonly field: string; readonly code: string }[];
}

async function errorFrom(response: Response): Promise<WireErrorEnvelope> {
  return (await response.json()) as WireErrorEnvelope;
}

describe('contact wire contract (mock mode = remote contract)', () => {
  it('POST /contact answers 201 with the acknowledgement the app parses', async () => {
    const response = await sendContact(VALID_BODY);
    expect(response.status).toBe(201);

    const parsed = safeParseWithSchema(contactResponseSchema, await response.json());
    assert(parsed.success, 'mock POST /contact violated the schema the app parses with');
    expect(parsed.data.sent).toBe(true);
  });

  it('rejects an out-of-bounds body with 400 and names the field', async () => {
    const response = await sendContact({ ...VALID_BODY, subject: 'x' });
    expect(response.status).toBe(400);

    const body = await errorFrom(response);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.errors).toContainEqual(
      expect.objectContaining({ field: 'subject', code: 'LENGTH_OUT_OF_RANGE' }),
    );
  });

  it('rejects a message longer than the DTO allows', async () => {
    const tooLong = 'x'.repeat(MOCK_CONTACT_LIMITS.messageMaxLength + 1);

    expect((await sendContact({ ...VALID_BODY, message: tooLong })).status).toBe(400);
  });

  it('rejects an unknown extra property with 400', async () => {
    const response = await sendContact({ ...VALID_BODY, nickname: 'sneaky' });
    expect(response.status).toBe(400);

    const body = await errorFrom(response);
    expect(body.errors).toContainEqual(
      expect.objectContaining({ field: 'nickname', code: 'UNKNOWN_PROPERTY' }),
    );
  });

  it('answers 503 when the operator email channel is disabled', async () => {
    const response = await sendContact({
      ...VALID_BODY,
      email: MOCK_CONTACT.channelDisabledEmail,
    });

    expect(response.status).toBe(503);
    expect((await errorFrom(response)).code).toBe('CONTACT_CHANNEL_UNAVAILABLE');
  });

  it('answers 429 once the sender is rate-limited', async () => {
    const response = await sendContact({ ...VALID_BODY, email: MOCK_CONTACT.rateLimitedEmail });

    expect(response.status).toBe(429);
    expect((await errorFrom(response)).code).toBe('RATE_LIMITED');
  });

  it('parses a generated-contract response and refuses one that denies the send', () => {
    const acknowledgement: ContactResponseContract = { sent: true };
    const request: ContactRequestContract = VALID_BODY;

    expect(safeParseWithSchema(contactResponseSchema, acknowledgement).success).toBe(true);
    expect(safeParseWithSchema(contactResponseSchema, { sent: false }).success).toBe(false);
    expect(request.email).toBe(MOCK_CONTACT.senderEmail);
  });
});

import { describe, expect, it } from 'vitest';

import { CONTACT_SUBMIT_STATUS } from '../contact.constants';
import { submitContactRequest } from './submit-contact.service';

describe('submitContactRequest', () => {
  it('always resolves unavailable — the real POST /contact endpoint is not live yet', async () => {
    const result = await submitContactRequest({
      email: 'player@example.com',
      subject: 'Question',
      message: 'Hello there, this is a test message.',
    });

    expect(result).toEqual({ status: CONTACT_SUBMIT_STATUS.Unavailable, response: null });
  });

  it('never throws regardless of the request payload', async () => {
    await expect(
      submitContactRequest({ email: '', subject: '', message: '' }),
    ).resolves.toBeDefined();
  });
});

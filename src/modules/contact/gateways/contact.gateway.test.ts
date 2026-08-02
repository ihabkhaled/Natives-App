import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { CONTACT_API_PATHS } from '../constants/contact-api.constants';
import type { ContactRequestDto } from '../types/contact.types';
import { requestContactSubmission } from './contact.gateway';

const REQUEST: ContactRequestDto = {
  email: 'visitor@example.test',
  subject: 'Tryout question',
  message: 'I would like to know more about your next open tryout.',
};

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestContactSubmission', () => {
  it('posts the message and returns the parsed acknowledgement', async () => {
    installTestAppHttpClient([
      {
        method: 'POST',
        url: CONTACT_API_PATHS.contact,
        respond: () => ({ status: 201, data: { sent: true } }),
      },
    ]);

    await expect(requestContactSubmission(REQUEST)).resolves.toEqual({ sent: true });
  });

  it('sends exactly the three DTO properties the endpoint accepts', async () => {
    let seenBody: unknown;
    installTestAppHttpClient([
      {
        method: 'POST',
        url: CONTACT_API_PATHS.contact,
        respond: (config) => {
          seenBody = config.data;
          return { status: 201, data: { sent: true } };
        },
      },
    ]);

    await requestContactSubmission(REQUEST);

    expect(seenBody).toEqual(REQUEST);
  });

  it('never attaches a bearer token: the relay is public', async () => {
    let seenHeaders: Record<string, unknown> = {};
    installTestAppHttpClient([
      {
        method: 'POST',
        url: CONTACT_API_PATHS.contact,
        respond: (config) => {
          seenHeaders = config.headers;
          return { status: 201, data: { sent: true } };
        },
      },
    ]);

    await requestContactSubmission(REQUEST);

    expect(seenHeaders['Authorization']).toBeUndefined();
  });

  it('rejects an acknowledgement that does not confirm the send', async () => {
    installTestAppHttpClient([
      {
        method: 'POST',
        url: CONTACT_API_PATHS.contact,
        respond: () => ({ status: 201, data: { sent: false } }),
      },
    ]);

    await expect(requestContactSubmission(REQUEST)).rejects.toThrow();
  });
});

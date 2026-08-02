import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { CONTACT_API_PATHS } from '../constants/contact-api.constants';
import type { ContactRequestDto } from '../types/contact.types';
import { submitContactRequest } from './submit-contact.service';

const REQUEST: ContactRequestDto = {
  email: 'visitor@example.test',
  subject: 'Tryout question',
  message: 'I would like to know more about your next open tryout.',
};

function contactRoute(status: number, data: unknown): TestRoute {
  return {
    method: 'POST',
    url: CONTACT_API_PATHS.contact,
    respond: () => ({ status, data }),
  };
}

async function submitFailure(): Promise<AppError> {
  const outcome: unknown = await submitContactRequest(REQUEST).catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('submitContactRequest', () => {
  it('resolves with the acknowledgement on a 201', async () => {
    installTestAppHttpClient([contactRoute(201, { sent: true })]);

    await expect(submitContactRequest(REQUEST)).resolves.toEqual({ sent: true });
  });

  it('maps a rejected body (400) to the validation code, keeping the field errors', async () => {
    installTestAppHttpClient([
      contactRoute(400, {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'subject', code: 'LENGTH_OUT_OF_RANGE', message: 'too short' }],
        path: '/api/v1/contact',
        timestamp: '2026-07-16T12:00:00.000Z',
        requestId: 'mock-validation',
      }),
    ]);

    const failure = await submitFailure();

    expect(failure.code).toBe(APP_ERROR_CODE.Validation);
    expect(failure.fieldErrors).toEqual([{ field: 'subject', code: 'LENGTH_OUT_OF_RANGE' }]);
    expect(failure.requestId).toBe('mock-validation');
  });

  it('maps a disabled email channel (503) to the server code', async () => {
    installTestAppHttpClient([
      contactRoute(503, { statusCode: 503, code: 'CONTACT_CHANNEL_UNAVAILABLE' }),
    ]);

    expect((await submitFailure()).code).toBe(APP_ERROR_CODE.Server);
  });

  it('maps a rate-limited send (429) to the rate-limited code', async () => {
    installTestAppHttpClient([contactRoute(429, { statusCode: 429, code: 'RATE_LIMITED' })]);

    expect((await submitFailure()).code).toBe(APP_ERROR_CODE.RateLimited);
  });

  it('maps a body that does not confirm the send to an unexpected AppError', async () => {
    installTestAppHttpClient([contactRoute(201, { sent: false })]);

    expect((await submitFailure()).code).toBe(APP_ERROR_CODE.Unexpected);
  });

  it('never lets a transport error escape to the caller', async () => {
    installTestAppHttpClient([]);

    await expect(submitContactRequest(REQUEST)).rejects.toBeInstanceOf(AppError);
  });
});

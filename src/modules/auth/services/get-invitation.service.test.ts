import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import type { AppError } from '@/shared/errors/app.errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { invitationDetailPath } from '../constants/auth-api.constants';
import { getInvitation } from './get-invitation.service';

const TOKEN = 'invite-1';
const DTO = {
  email: 'Invitee@Example.com',
  role: 'user',
  inviterName: null,
  expiresAt: '2026-08-01T12:00:00.000Z',
};

function invitationRoute(status: number, data: unknown): TestRoute {
  return { method: 'GET', url: invitationDetailPath(TOKEN), respond: () => ({ status, data }) };
}

async function invitationFailure(status: number): Promise<AppError> {
  installTestAppHttpClient([invitationRoute(status, { statusCode: status })]);
  return catchAppError(getInvitation(TOKEN));
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('getInvitation', () => {
  it('returns the normalized invitation details on success', async () => {
    installTestAppHttpClient([invitationRoute(200, DTO)]);

    await expect(getInvitation(TOKEN)).resolves.toEqual({
      email: 'invitee@example.com',
      role: 'user',
      inviterName: null,
      expiresAtIso: '2026-08-01T12:00:00.000Z',
    });
  });

  it.each([404, 409, 410])(
    'maps a dead invitation (%s) to the link-invalid code',
    async (status) => {
      const failure = await invitationFailure(status);

      expect(failure.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
    },
  );

  it('maps a server failure through the transport mapper', async () => {
    const failure = await invitationFailure(500);

    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });
});

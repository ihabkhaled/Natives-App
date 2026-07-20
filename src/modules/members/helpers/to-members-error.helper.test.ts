import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { runMembersRequest } from './to-members-error.helper';

describe('runMembersRequest', () => {
  it('returns the resolved value on success', async () => {
    await expect(runMembersRequest(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });

  it('maps an HttpError to an AppError', async () => {
    await expect(
      runMembersRequest(() => Promise.reject(new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }))),
    ).rejects.toMatchObject({ code: APP_ERROR_CODE.Forbidden });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    await expect(runMembersRequest(() => Promise.reject(new Error('boom')))).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});

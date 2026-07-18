import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { buildPracticeSessionDetailDto } from '../../../../tests/factories/practice.factory';
import { requestPracticeSession } from '../gateways/practice.gateway';
import { getPracticeSession } from './get-practice-session.service';

vi.mock('../gateways/practice.gateway', () => ({ requestPracticeSession: vi.fn() }));

const DETAIL = buildPracticeSessionDetailDto();

afterEach(() => {
  vi.clearAllMocks();
});

describe('getPracticeSession', () => {
  it('maps a successful detail to the domain', async () => {
    vi.mocked(requestPracticeSession).mockResolvedValue(DETAIL);

    const detail = await getPracticeSession('sess-1');

    expect(detail.id).toBe('sess-1');
    expect(detail.venue).toBeNull();
  });

  it('maps a not-found failure to an AppError', async () => {
    vi.mocked(requestPracticeSession).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.NotFound }),
    );

    await expect(getPracticeSession('missing')).rejects.toMatchObject({
      code: APP_ERROR_CODE.NotFound,
    });
  });

  it('normalizes a non-http failure to an unexpected AppError', async () => {
    vi.mocked(requestPracticeSession).mockRejectedValue('boom');

    await expect(getPracticeSession('sess-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
    });
  });
});

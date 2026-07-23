import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { requestBuddyResponse } from '../gateways/training.gateway';
import { respondToBuddy } from './respond-buddy.service';

vi.mock('../gateways/training.gateway', () => ({ requestBuddyResponse: vi.fn() }));

describe('respondToBuddy', () => {
  it('confirms one credit and maps the answered record', async () => {
    vi.mocked(requestBuddyResponse).mockResolvedValue({
      id: 'buddy-1',
      submissionId: 'sub-1',
      membershipId: 'membership-1',
      status: 'confirmed',
      respondedAt: '2026-07-19T18:00:00.000Z',
      createdAt: '2026-07-10T09:00:00.000Z',
    });

    const record = await respondToBuddy('team-1', 'buddy-1', 'confirm');

    expect(requestBuddyResponse).toHaveBeenCalledWith('team-1', 'buddy-1', 'confirm');
    expect(record.status).toBe('confirmed');
    expect(record.respondedAtIso).toBe('2026-07-19T18:00:00.000Z');
  });

  it('normalizes a missing credit into an AppError', async () => {
    vi.mocked(requestBuddyResponse).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.NotFound }),
    );

    await expect(respondToBuddy('team-1', 'gone', 'decline')).rejects.toMatchObject({
      code: APP_ERROR_CODE.NotFound,
    });
  });
});

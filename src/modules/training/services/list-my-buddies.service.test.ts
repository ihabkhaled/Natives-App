import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { requestMyBuddies } from '../gateways/training.gateway';
import { listMyBuddies } from './list-my-buddies.service';

vi.mock('../gateways/training.gateway', () => ({ requestMyBuddies: vi.fn() }));

const WIRE_BUDDY = {
  id: 'buddy-1',
  submissionId: 'sub-1',
  membershipId: 'membership-1',
  status: 'pending',
  respondedAt: null,
  createdAt: '2026-07-10T09:00:00.000Z',
} as const;

describe('listMyBuddies', () => {
  it('maps the bounded page into domain credits', async () => {
    vi.mocked(requestMyBuddies).mockResolvedValue({
      items: [WIRE_BUDDY],
      total: 1,
      limit: 20,
      offset: 0,
    });

    const page = await listMyBuddies('team-1');

    expect(page.total).toBe(1);
    expect(page.items[0]).toMatchObject({
      id: 'buddy-1',
      status: 'pending',
      createdAtIso: '2026-07-10T09:00:00.000Z',
    });
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestMyBuddies).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Unauthorized }),
    );

    await expect(listMyBuddies('team-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Unauthorized,
    });
  });
});

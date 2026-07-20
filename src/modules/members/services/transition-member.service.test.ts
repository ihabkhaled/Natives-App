import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { LIFECYCLE_ACTION } from '../constants/members.constants';
import { requestTransition } from '../gateways/members.gateway';
import { transitionMember } from './transition-member.service';

vi.mock('../gateways/members.gateway', () => ({ requestTransition: vi.fn() }));

const dto = {
  id: 'm',
  teamId: 't',
  seasonId: null,
  userId: null,
  status: 'inactive' as const,
  statusReason: 'x',
  statusEffectiveAt: '2026-07-19T10:00:00.000Z',
  joinedAt: null,
  leftAt: null,
  anonymizedAt: null,
  createdBy: null,
  updatedBy: null,
  createdAt: '2026-07-19T10:00:00.000Z',
  updatedAt: '2026-07-19T10:00:00.000Z',
  deletedAt: null,
  version: 4,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('transitionMember', () => {
  it('maps the reactivate action to the activate endpoint', async () => {
    vi.mocked(requestTransition).mockResolvedValue(dto);
    const record = await transitionMember('t', 'm', {
      action: LIFECYCLE_ACTION.reactivate,
      reason: 'return',
    });
    expect(requestTransition).toHaveBeenCalledWith('t', 'm', 'activate', 'return');
    expect(record).toMatchObject({ id: 'm', status: 'inactive', version: 4 });
  });

  it('normalizes a transport failure to an AppError', async () => {
    vi.mocked(requestTransition).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Conflict }),
    );
    await expect(
      transitionMember('t', 'm', { action: LIFECYCLE_ACTION.suspend, reason: null }),
    ).rejects.toMatchObject({ code: APP_ERROR_CODE.Conflict });
  });
});

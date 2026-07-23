import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestSuperAdmins } from '../gateways/platform-admins.gateway';
import { listSuperAdmins } from './list-super-admins.service';

vi.mock('../gateways/platform-admins.gateway', () => ({ requestSuperAdmins: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('listSuperAdmins', () => {
  it('maps the roster to the domain shape', async () => {
    vi.mocked(requestSuperAdmins).mockResolvedValue({
      items: [
        {
          assignmentId: 'assignment-1',
          userId: 'user-1',
          email: 'root@example.com',
          displayName: 'Ranger One',
          effectiveFrom: '2026-01-05T09:00:00.000Z',
          grantedBy: null,
        },
      ],
      total: 1,
    });

    await expect(listSuperAdmins()).resolves.toEqual({
      items: [
        {
          assignmentId: 'assignment-1',
          userId: 'user-1',
          email: 'root@example.com',
          displayName: 'Ranger One',
          effectiveFromIso: '2026-01-05T09:00:00.000Z',
          grantedBy: null,
        },
      ],
      total: 1,
    });
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestSuperAdmins).mockRejectedValue(new Error('boom'));

    await expect(listSuperAdmins()).rejects.toMatchObject({ name: 'AppError' });
  });
});

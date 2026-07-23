import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestRevokeSuperAdmin } from '../gateways/platform-admins.gateway';
import { revokeSuperAdmin } from './revoke-super-admin.service';

vi.mock('../gateways/platform-admins.gateway', () => ({ requestRevokeSuperAdmin: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('revokeSuperAdmin', () => {
  it('revokes strictly by user id and resolves an explicit acknowledgement', async () => {
    vi.mocked(requestRevokeSuperAdmin).mockResolvedValue(undefined);

    await expect(revokeSuperAdmin('user-2')).resolves.toBe(true);

    expect(requestRevokeSuperAdmin).toHaveBeenCalledExactlyOnceWith('user-2');
  });

  it('normalizes the last-admin refusal into an AppError', async () => {
    vi.mocked(requestRevokeSuperAdmin).mockRejectedValue(new Error('409'));

    await expect(revokeSuperAdmin('user-1')).rejects.toMatchObject({ name: 'AppError' });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestAssignableRoles } from '../gateways/members.gateway';
import { listAssignableRoles } from './list-assignable-roles.service';

vi.mock('../gateways/members.gateway', () => ({ requestAssignableRoles: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('listAssignableRoles', () => {
  it('maps the server catalog entries with their display metadata', async () => {
    vi.mocked(requestAssignableRoles).mockResolvedValue({
      teamId: 'team-1',
      roles: [
        { slug: 'member', displayName: 'Member', description: 'Reads their own data.' },
        { slug: 'physio', displayName: 'Physiotherapist', description: 'Reads wellness data.' },
      ],
    });

    await expect(listAssignableRoles('team-1')).resolves.toEqual([
      { slug: 'member', displayName: 'Member', description: 'Reads their own data.' },
      { slug: 'physio', displayName: 'Physiotherapist', description: 'Reads wellness data.' },
    ]);
    expect(requestAssignableRoles).toHaveBeenCalledExactlyOnceWith('team-1');
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestAssignableRoles).mockRejectedValue(new Error('boom'));

    await expect(listAssignableRoles('team-1')).rejects.toMatchObject({ name: 'AppError' });
  });
});

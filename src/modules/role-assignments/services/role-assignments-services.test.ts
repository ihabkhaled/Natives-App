import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/role-assignments.gateway';
import { assignRole } from './assign-role.service';
import { listAssignableRoles } from './list-assignable-roles.service';
import { listUserAssignments } from './list-user-assignments.service';
import { revokeAssignment } from './revoke-assignment.service';

vi.mock('../gateways/role-assignments.gateway', () => ({
  requestUserAssignments: vi.fn().mockResolvedValue({ userId: 'user-1', assignments: [] }),
  requestAssignableRoles: vi.fn().mockResolvedValue({ teamId: 'team-1', roles: [] }),
  requestAssignRole: vi.fn().mockResolvedValue({}),
  requestRevokeAssignment: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('role-assignments services', () => {
  it('lists one user’s assignments', async () => {
    await listUserAssignments('user-1');

    expect(gateway.requestUserAssignments).toHaveBeenCalledWith('user-1');
  });

  it('unwraps the assignable-roles catalog to the roles themselves', async () => {
    vi.mocked(gateway.requestAssignableRoles).mockResolvedValue({
      teamId: 'team-1',
      roles: [{ slug: 'coach', displayName: 'Coach', description: '' }],
    });

    await expect(listAssignableRoles('team-1')).resolves.toEqual([
      { slug: 'coach', displayName: 'Coach', description: '' },
    ]);
  });

  it('carries the grant command straight through', async () => {
    const command = { userId: 'user-1', roleKey: 'COACH', teamId: 'team-1', seasonId: null };
    await assignRole(command);

    expect(gateway.requestAssignRole).toHaveBeenCalledWith(command);
  });

  it('resolves true after a revoke so the mutation carries a value', async () => {
    await expect(revokeAssignment('assignment-1')).resolves.toBe(true);
    expect(gateway.requestRevokeAssignment).toHaveBeenCalledWith('assignment-1');
  });
});

import { describe, expect, it, vi } from 'vitest';

import { listAssignableRoles } from '../services/list-assignable-roles.service';
import { listUserAssignments } from '../services/list-user-assignments.service';
import { buildAssignableRolesQueryOptions } from './assignable-roles.query';
import { roleAssignmentsQueryKeys } from './role-assignments.keys';
import { buildUserAssignmentsQueryOptions } from './role-assignments.query';

vi.mock('../services/list-user-assignments.service', () => ({ listUserAssignments: vi.fn() }));
vi.mock('../services/list-assignable-roles.service', () => ({ listAssignableRoles: vi.fn() }));

describe('buildUserAssignmentsQueryOptions', () => {
  it('keys the read on the user it describes', () => {
    expect(buildUserAssignmentsQueryOptions('user-1').queryKey).toEqual(
      roleAssignmentsQueryKeys.user('user-1'),
    );
  });

  it('stays disabled until a target user is named', () => {
    // Enabled with an empty id, this would request `/rbac/users//assignments`.
    expect(buildUserAssignmentsQueryOptions('').enabled).toBe(false);
    expect(buildUserAssignmentsQueryOptions('user-1').enabled).toBe(true);
  });

  it('delegates the read to its use case', async () => {
    vi.mocked(listUserAssignments).mockResolvedValue({ userId: 'user-1', assignments: [] });

    await buildUserAssignmentsQueryOptions('user-1').queryFn();

    expect(listUserAssignments).toHaveBeenCalledWith('user-1');
  });
});

describe('buildAssignableRolesQueryOptions', () => {
  it('keys the ceiling on the team it was computed for', () => {
    expect(buildAssignableRolesQueryOptions('team-1', true).queryKey).toEqual(
      roleAssignmentsQueryKeys.assignableRoles('team-1'),
    );
  });

  it('is not read for a principal who may not grant', () => {
    expect(buildAssignableRolesQueryOptions('team-1', false).enabled).toBe(false);
    expect(buildAssignableRolesQueryOptions('', true).enabled).toBe(false);
    expect(buildAssignableRolesQueryOptions('team-1', true).enabled).toBe(true);
  });

  it('delegates the read to its use case', async () => {
    vi.mocked(listAssignableRoles).mockResolvedValue([]);

    await buildAssignableRolesQueryOptions('team-1', true).queryFn();

    expect(listAssignableRoles).toHaveBeenCalledWith('team-1');
  });
});

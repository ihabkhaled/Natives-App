import { describe, expect, it } from 'vitest';

import { roleAssignmentsQueryKeys } from './role-assignments.keys';

describe('roleAssignmentsQueryKeys', () => {
  it('roots every key on the module so one write can refresh them all', () => {
    expect(roleAssignmentsQueryKeys.user('user-1')).toEqual(['role-assignments', 'user', 'user-1']);
    expect(roleAssignmentsQueryKeys.assignableRoles('team-1')).toEqual([
      'role-assignments',
      'assignable-roles',
      'team-1',
    ]);
  });

  it('separates one user’s branch from another’s', () => {
    expect(roleAssignmentsQueryKeys.user('a')).not.toEqual(roleAssignmentsQueryKeys.user('b'));
  });
});

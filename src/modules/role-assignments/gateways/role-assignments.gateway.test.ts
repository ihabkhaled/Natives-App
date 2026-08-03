import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';
import {
  requestAssignableRoles,
  requestAssignRole,
  requestRevokeAssignment,
  requestUserAssignments,
} from './role-assignments.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const deleteSpy = vi.fn();

beforeEach(() => {
  resetGatewayHttpDouble();
  deleteSpy.mockResolvedValue(undefined);
  vi.mocked(getAppHttpClient).mockReturnValue({ ...gatewayHttp, delete: deleteSpy } as never);
});

describe('role-assignments gateway', () => {
  it('reads one user’s assignments from the RBAC user route', async () => {
    await requestUserAssignments('user-1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/rbac/users/user-1/assignments');
  });

  it('reads the assignable-roles catalog for a team', async () => {
    await requestAssignableRoles('team-1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/rbac/teams/team-1/assignable-roles');
  });

  it('sends the scope in the query string and the grant in the body', async () => {
    await requestAssignRole({
      userId: 'user-1',
      roleKey: 'COACH',
      teamId: 'team-1',
      seasonId: 'season-1',
    });

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/rbac/assignments');
    expect(gatewayHttp.post.mock.calls[0]?.[1]).toEqual({ userId: 'user-1', roleKey: 'COACH' });
    expect(gatewayHttp.post.mock.calls[0]?.[3]).toMatchObject({
      params: { teamId: 'team-1', seasonId: 'season-1' },
    });
  });

  it('omits the season entirely rather than sending a null one', async () => {
    await requestAssignRole({
      userId: 'user-1',
      roleKey: 'COACH',
      teamId: 'team-1',
      seasonId: null,
    });

    // A literal null would be read as "the null season" by a permissive
    // backend; absence is the only unambiguous way to say "team-wide".
    expect(gatewayHttp.post.mock.calls[0]?.[3]).toMatchObject({ params: { teamId: 'team-1' } });
    expect(
      Object.hasOwn((gatewayHttp.post.mock.calls[0]?.[3] as { params: object }).params, 'seasonId'),
    ).toBe(false);
  });

  it('revokes one assignment by its own id', async () => {
    await requestRevokeAssignment('assignment-1');

    expect(deleteSpy.mock.calls[0]?.[0]).toBe('/rbac/assignments/assignment-1');
  });

  it('encodes identifiers that would otherwise break the path', async () => {
    await requestUserAssignments('a/b');
    await requestRevokeAssignment('x/y');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/rbac/users/a%2Fb/assignments');
    expect(deleteSpy.mock.calls[0]?.[0]).toBe('/rbac/assignments/x%2Fy');
  });
});

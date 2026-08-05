import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';
import type * as HttpModule from '@/packages/http';

import {
  requestAgendaCopy,
  requestAgendaGroupsPlan,
  requestAssignGroupMembers,
  requestCreateGroup,
  requestRemoveGroup,
  requestRemoveGroupMember,
} from './practice-agenda-groups.gateway';

// A partial mock, not a full replacement: `requestAgendaCopy` reuses
// `practice-agenda`'s public surface, whose route table pulls in
// `@/packages/query` and, through it, other `@/packages/http` exports
// (`HTTP_ERROR_KIND`) that must stay real for that import chain to load.
vi.mock('@/packages/http', async (importOriginal) => {
  const actual = await importOriginal<typeof HttpModule>();
  return { ...actual, getAppHttpClient: vi.fn() };
});

// Every write here answers with a body except the two deletes, which the
// client never parses one from.
const client = { delete: vi.fn(), post: vi.fn(), get: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAppHttpClient).mockReturnValue(client as never);
  client.delete.mockResolvedValue(undefined);
  client.post.mockResolvedValue({});
  client.get.mockResolvedValue({});
});

const PARAMS = { teamId: 't1', sessionId: 's1' };

describe('practice-agenda-groups gateway', () => {
  it('reads the plan from its session-scoped route', async () => {
    await requestAgendaGroupsPlan(PARAMS);

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/agenda/plan');
  });

  it('posts a copy carrying the source session id', async () => {
    await requestAgendaCopy({ ...PARAMS, sourceSessionId: 's2' });

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/agenda/copy');
    expect(client.post.mock.calls[0]?.[1]).toEqual({ sourceSessionId: 's2' });
  });

  it('posts a new group with every optional field set', async () => {
    await requestCreateGroup({
      ...PARAMS,
      name: 'Reds',
      color: '#ef4444',
      coachMembershipId: 'membership-3',
      notes: 'Attackers',
    });

    expect(client.post.mock.calls[0]?.[0]).toBe('/teams/t1/practice-sessions/s1/agenda/groups');
    expect(client.post.mock.calls[0]?.[1]).toEqual({
      name: 'Reds',
      color: '#ef4444',
      coachMembershipId: 'membership-3',
      notes: 'Attackers',
    });
  });

  /**
   * `null` means "leave it out of the request", not "send null" — the wire
   * fields are optional, not nullable, so a null value is dropped rather than
   * serialized.
   */
  it('leaves every unset optional field out of the create body', async () => {
    await requestCreateGroup({
      ...PARAMS,
      name: 'Reds',
      color: null,
      coachMembershipId: null,
      notes: null,
    });

    expect(client.post.mock.calls[0]?.[1]).toEqual({ name: 'Reds' });
  });

  it('deletes a group by id and parses nothing back', async () => {
    await expect(requestRemoveGroup({ ...PARAMS, groupId: 'group-1' })).resolves.toBeUndefined();

    expect(client.delete.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/agenda/groups/group-1',
    );
  });

  it('posts membership ids to a group', async () => {
    await requestAssignGroupMembers({
      ...PARAMS,
      groupId: 'group-1',
      membershipIds: ['membership-1', 'membership-2'],
    });

    expect(client.post.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/agenda/groups/group-1/members',
    );
    expect(client.post.mock.calls[0]?.[1]).toEqual({
      membershipIds: ['membership-1', 'membership-2'],
    });
  });

  it('deletes one membership from a group and parses nothing back', async () => {
    await expect(
      requestRemoveGroupMember({ ...PARAMS, groupId: 'group-1', membershipId: 'membership-1' }),
    ).resolves.toBeUndefined();

    expect(client.delete.mock.calls[0]?.[0]).toBe(
      '/teams/t1/practice-sessions/s1/agenda/groups/group-1/members/membership-1',
    );
  });

  it('encodes every id so a stray slash cannot escape the path', async () => {
    await requestAgendaGroupsPlan({ teamId: 't/1', sessionId: 's 1' });

    expect(client.get.mock.calls[0]?.[0]).toBe('/teams/t%2F1/practice-sessions/s%201/agenda/plan');
  });
});

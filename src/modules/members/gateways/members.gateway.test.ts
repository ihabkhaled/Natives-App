import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestAddAlias,
  requestAssignRoles,
  requestAttachAvatar,
  requestAvatarAccess,
  requestAvatarTicket,
  requestInviteMember,
  requestMember,
  requestMemberAliases,
  requestMemberDirectory,
  requestMemberHistory,
  requestMemberRoles,
  requestRemoveAlias,
  requestTransition,
  requestUpdateProfile,
} from './members.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn().mockResolvedValue({});
const post = vi.fn().mockResolvedValue({});
const patch = vi.fn().mockResolvedValue({});
const put = vi.fn().mockResolvedValue({});
const del = vi.fn().mockResolvedValue(undefined);

vi.mocked(getAppHttpClient).mockReturnValue({ get, post, patch, put, delete: del } as never);

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post, patch, put, delete: del } as never);
});

describe('members.gateway', () => {
  it('lists the directory with bounded params', async () => {
    await requestMemberDirectory('team/1', 20, 0);
    const [path, , options] = get.mock.calls[0] as [string, unknown, { params: object }];
    expect(path).toBe('/teams/team%2F1/members');
    expect(options.params).toEqual({ limit: 20, offset: 0 });
  });

  it('reads one member view', async () => {
    await requestMember('t', 'm/7');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t/members/m%2F7');
  });

  it('invites with a profile body and omits null fields', async () => {
    await requestInviteMember('t', { fullName: 'Omar', nickname: null, jerseyNumber: null });
    const [path, body] = post.mock.calls[0] as [string, { profile: object }];
    expect(path).toBe('/teams/t/members/invite');
    expect(body.profile).toEqual({ fullName: 'Omar' });
  });

  it('updates a profile with expectedVersion and present fields', async () => {
    await requestUpdateProfile('t', 'm', {
      fullName: 'O',
      nickname: 'N',
      jerseyNumber: 9,
      expectedVersion: 3,
    });
    const [path, body] = patch.mock.calls[0] as [
      string,
      { profile: object; expectedVersion: number },
    ];
    expect(path).toBe('/teams/t/members/m/profile');
    expect(body).toEqual({
      profile: { fullName: 'O', nickname: 'N', jerseyNumber: 9 },
      expectedVersion: 3,
    });
  });

  it('posts a lifecycle transition with a reason, or empty body when null', async () => {
    await requestTransition('t', 'm', 'suspend', 'reason');
    expect(post.mock.calls[0]?.[1]).toEqual({ reason: 'reason' });
    await requestTransition('t', 'm', 'activate', null);
    expect(post.mock.calls[1]?.[1]).toEqual({});
  });

  it('reads history, aliases, and roles', async () => {
    await requestMemberHistory('t', 'm');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t/members/m/history');
    await requestMemberAliases('t', 'm');
    expect(get.mock.calls[1]?.[0]).toBe('/teams/t/members/m/aliases');
    await requestMemberRoles('t', 'm');
    expect(get.mock.calls[2]?.[0]).toBe('/teams/t/members/m/roles');
  });

  it('adds and removes aliases and assigns roles', async () => {
    await requestAddAlias('t', 'm', 'O-Train');
    expect(post.mock.calls[0]?.[1]).toEqual({ alias: 'O-Train' });
    await requestRemoveAlias('t', 'm', 'a1');
    expect(del.mock.calls[0]?.[0]).toBe('/teams/t/members/m/aliases/a1');
    await requestAssignRoles('t', 'm', ['coach']);
    expect(put.mock.calls[0]?.[1]).toEqual({ roles: ['coach'] });
  });

  it('requests, attaches, and reads an avatar', async () => {
    await requestAvatarTicket('t', 'm', 'image/png', 100);
    expect(post.mock.calls[0]?.[1]).toEqual({ contentType: 'image/png', byteSize: 100 });
    await requestAttachAvatar('t', 'm', 'media-1');
    expect(put.mock.calls[0]?.[0]).toBe('/teams/t/members/m/avatar/media-1');
    await requestAvatarAccess('t', 'm');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t/members/m/avatar');
  });
});

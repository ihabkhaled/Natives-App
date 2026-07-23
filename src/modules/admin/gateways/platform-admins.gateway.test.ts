import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestPromoteSuperAdmin,
  requestRevokeSuperAdmin,
  requestSuperAdmins,
} from './platform-admins.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();
const del = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  del.mockResolvedValue(undefined);
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post, delete: del } as never);
});

describe('platform-admins.gateway', () => {
  it('lists the roster from the platform-scoped RBAC route', async () => {
    await requestSuperAdmins();

    expect(get.mock.calls[0]?.[0]).toBe('/rbac/platform/super-admins');
  });

  it('promotes with the target user id and the mandatory audited reason', async () => {
    await requestPromoteSuperAdmin('user-2', 'Succession planning for platform ops');

    const [path, body] = post.mock.calls[0] as [string, unknown];
    expect(path).toBe('/rbac/platform/super-admins');
    expect(body).toEqual({ userId: 'user-2', reason: 'Succession planning for platform ops' });
  });

  it('revokes strictly by the encoded user id', async () => {
    await requestRevokeSuperAdmin('user/2');

    expect(del.mock.calls[0]?.[0]).toBe('/rbac/platform/super-admins/user%2F2');
  });
});

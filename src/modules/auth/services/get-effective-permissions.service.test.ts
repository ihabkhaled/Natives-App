import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/packages/http';
import { APP_ERROR_CODE, isAppError } from '@/shared/errors';

import { requestEffectivePermissions } from '../gateways/auth.gateway';
import { buildEffectivePermissionsQueryOptions } from '../queries/effective-permissions.query';
import { authQueryKeys } from '../queries/auth.keys';
import { getEffectivePermissions } from './get-effective-permissions.service';

vi.mock('../gateways/auth.gateway', () => ({ requestEffectivePermissions: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('getEffectivePermissions', () => {
  it('returns the grants the principal holds inside the given team', async () => {
    vi.mocked(requestEffectivePermissions).mockResolvedValue({
      permissions: ['member.list', 'season.manage'],
    });

    await expect(getEffectivePermissions('team-1')).resolves.toEqual([
      'member.list',
      'season.manage',
    ]);
    expect(requestEffectivePermissions).toHaveBeenCalledWith('team-1');
  });

  it('normalizes a transport failure into a sanitized AppError', async () => {
    vi.mocked(requestEffectivePermissions).mockRejectedValue(
      new HttpError({ kind: 'unauthorized', status: 401, message: 'Unauthorized' }),
    );

    const error: unknown = await getEffectivePermissions('team-1').catch(
      (caught: unknown) => caught,
    );
    expect(isAppError(error)).toBe(true);
    expect((error as { code: string }).code).toBe(APP_ERROR_CODE.Unauthorized);
  });

  it('normalizes a non-HTTP failure too', async () => {
    vi.mocked(requestEffectivePermissions).mockRejectedValue(new Error('boom'));

    await expect(getEffectivePermissions('team-1')).rejects.toBeDefined();
  });
});

describe('buildEffectivePermissionsQueryOptions', () => {
  it('never asks without a team: a teamless answer is the wrong answer', () => {
    expect(buildEffectivePermissionsQueryOptions('', true).enabled).toBe(false);
    expect(buildEffectivePermissionsQueryOptions('team-1', false).enabled).toBe(false);
    expect(buildEffectivePermissionsQueryOptions('team-1', true).enabled).toBe(true);
  });

  it('keys the cache on the team, so switching re-resolves authorization', () => {
    expect(buildEffectivePermissionsQueryOptions('team-1', true).queryKey).toEqual(
      authQueryKeys.effectivePermissions('team-1'),
    );
    expect(authQueryKeys.effectivePermissions('team-1')).not.toEqual(
      authQueryKeys.effectivePermissions('team-2'),
    );
  });

  it('fetches through the use case', async () => {
    vi.mocked(requestEffectivePermissions).mockResolvedValue({ permissions: [] });

    await buildEffectivePermissionsQueryOptions('team-1', true).queryFn();

    expect(requestEffectivePermissions).toHaveBeenCalledWith('team-1');
  });
});

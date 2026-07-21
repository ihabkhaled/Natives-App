import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { getRoleMatrix } from '../services/get-role-matrix.service';
import type { TeamsContextView } from './use-teams-context.hook';
import { useTeamsContext } from './use-teams-context.hook';
import { usePermissionsMatrix } from './use-permissions-matrix.hook';
import { buildTeamsContext } from '../../../../tests/factories/teams.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('./use-teams-context.hook', () => ({ useTeamsContext: vi.fn() }));
vi.mock('../services/get-role-matrix.service', () => ({ getRoleMatrix: vi.fn() }));

const MATRIX = {
  policyVersion: 5,
  permissions: [
    { key: 'member.list', area: 'members', description: 'List members' },
    { key: 'practice.read', area: 'practices', description: 'View practices' },
  ],
  roles: [
    {
      key: 'MEMBER',
      displayName: 'Member',
      description: 'Player access',
      isSystem: true,
      permissions: ['practice.read'],
    },
  ],
};

function mockContext(overrides: Partial<TeamsContextView> = {}): void {
  vi.mocked(useTeamsContext).mockReturnValue(buildTeamsContext(overrides));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockContext();
  vi.mocked(getRoleMatrix).mockResolvedValue(MATRIX);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePermissionsMatrix', () => {
  it('renders the seeded catalog against every role bundle', async () => {
    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.columns).toEqual([{ key: 'MEMBER', label: 'Member', isSystem: true }]);
    expect(result.current.rows).toHaveLength(2);
  });

  it('stamps the policy version the snapshot was read at', async () => {
    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.policyVersionLabel).toContain('5');
    });
  });

  it('asks in the active team scope so a team admin grant satisfies it', async () => {
    renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(getRoleMatrix).toHaveBeenCalledWith('team-1');
    });
  });

  it('narrows to one area and recounts', async () => {
    const { result } = renderHookWithProviders(() => usePermissionsMatrix());
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    act(() => {
      result.current.onAreaChange('members');
    });

    expect(result.current.area).toBe('members');
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.countSummary).toContain('1');
  });

  it('forbids the screen — and never asks — without the roles grant', async () => {
    mockContext({ canReadRoleMatrix: false });

    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.status).toBe('forbidden');
    });
    expect(getRoleMatrix).not.toHaveBeenCalled();
  });

  it('presents the error state when the catalog fails to load', async () => {
    vi.mocked(getRoleMatrix).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('presents the empty state for a catalog with nothing in it', async () => {
    vi.mocked(getRoleMatrix).mockResolvedValue({ policyVersion: 1, permissions: [], roles: [] });

    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
  });

  it('always says it is read-only: bundles are seeded server-side', async () => {
    const { result } = renderHookWithProviders(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.notice).toContain('Read-only');
    });
  });
});

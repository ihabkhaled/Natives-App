// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it,
// so neither the factory nor the imports it needs can move into a shared
// helper. Only the payloads could, and they now come from
// tests/setup/screen-grants.helper.ts.
import {
  buildEffectivePermissions,
  buildTeamScope,
} from '../../../../tests/setup/screen-grants.helper';
import { waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';
import { MOCK_GOVERNANCE_MEETINGS, MOCK_GOVERNANCE_TASKS } from '@/tests/msw/governance.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { listGovernanceMeetings } from '../services/list-governance-meetings.service';
import { listGovernanceTasks } from '../services/list-governance-tasks.service';
import { useGovernanceScreen } from './use-governance-screen.hook';

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});
// jscpd:ignore-end
vi.mock('../services/list-governance-meetings.service', () => ({
  listGovernanceMeetings: vi.fn(),
}));
vi.mock('../services/list-governance-tasks.service', () => ({ listGovernanceTasks: vi.fn() }));

function mockGrants(permissions: readonly string[] = [PERMISSIONS.governanceRead]): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(buildTeamScope());
  vi.mocked(useEffectivePermissions).mockReturnValue(buildEffectivePermissions(permissions));
}

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useGovernanceScreen>>
> {
  return renderHookWithProviders(() => useGovernanceScreen(), { initialPath: '/governance' });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockGrants();
  vi.mocked(listGovernanceMeetings).mockResolvedValue({
    items: [...MOCK_GOVERNANCE_MEETINGS],
    total: 2,
    limit: 25,
    offset: 0,
  });
  vi.mocked(listGovernanceTasks).mockResolvedValue({
    items: [...MOCK_GOVERNANCE_TASKS],
    total: 3,
    limit: 25,
    offset: 0,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useGovernanceScreen', () => {
  it('starts loading so the screen can render its skeleton', () => {
    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('becomes ready with meetings soonest first and tasks by urgency', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.meetings.map((entry) => entry.id)).toEqual(['meeting-2', 'meeting-1']);
    expect(result.current.tasks.at(-1)?.isClosed).toBe(true);
  });

  it('reports each list’s server total rather than the page length', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.meetingCountLabel).toContain('2');
    expect(result.current.taskCountLabel).toContain('3');
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue(buildTeamScope());

    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('refuses the board record without the governance grant', () => {
    mockGrants([]);

    expect(renderScreen().result.current.status).toBe('forbidden');
  });

  it('surfaces a failure from either list, not only the meetings one', async () => {
    vi.mocked(listGovernanceTasks).mockRejectedValue(new Error('boom'));
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('presents the empty state when the board has recorded nothing', async () => {
    vi.mocked(listGovernanceMeetings).mockResolvedValue({
      items: [],
      total: 0,
      limit: 25,
      offset: 0,
    });
    vi.mocked(listGovernanceTasks).mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 });
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(result.current.emptyTitle).toBe('No board records yet');
  });
});

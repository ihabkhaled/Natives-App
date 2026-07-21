import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { listTeams } from '../services/list-teams.service';
import { transitionTeam } from '../services/transition-team.service';
import type { TeamsWorkspaceView } from '../types/teams-view.types';
import type { TeamsContextView } from './use-teams-context.hook';
import { useTeamsContext } from './use-teams-context.hook';
import { useTeamsWorkspace } from './use-teams-workspace.hook';
import { buildTeam, buildTeamsContext } from '../../../../tests/factories/teams.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import {
  confirm,
  showToast,
  resetWorkspaceUiSpies,
} from '../../../../tests/setup/workspace-mock.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('@/shared/ui', async () =>
  (await import('../../../../tests/setup/workspace-mock.helper')).loadWorkspaceUiMock(),
);
vi.mock('./use-teams-context.hook', () => ({ useTeamsContext: vi.fn() }));
vi.mock('../services/list-teams.service', () => ({ listTeams: vi.fn() }));
vi.mock('../services/transition-team.service', () => ({ transitionTeam: vi.fn() }));
vi.mock('../services/create-team.service', () => ({ createTeam: vi.fn() }));
vi.mock('../services/update-team.service', () => ({ updateTeam: vi.fn() }));

const TEAM = buildTeam();

function mockContext(overrides: Partial<TeamsContextView> = {}): void {
  vi.mocked(useTeamsContext).mockReturnValue(
    buildTeamsContext({
      canBrowseAllTeams: true,
      canCreateTeams: true,
      ...overrides,
    }),
  );
}

/** Render, wait for the list, then run the row's first legal transition. */
async function runFirstTransition(): Promise<{ current: TeamsWorkspaceView }> {
  const { result } = renderHookWithProviders(() => useTeamsWorkspace());
  await waitFor(() => {
    expect(result.current.rows).toHaveLength(1);
  });
  act(() => {
    result.current.rows[0]?.transitions[0]?.onSelect();
  });
  return result;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockContext();
  resetWorkspaceUiSpies();
  vi.mocked(listTeams).mockResolvedValue([TEAM]);
  vi.mocked(transitionTeam).mockResolvedValue({ ...TEAM, status: 'disabled' });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTeamsWorkspace', () => {
  it('lists every team once the platform grant is present', async () => {
    const { result } = renderHookWithProviders(() => useTeamsWorkspace());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]?.label).toBe('Ultimate Natives');
  });

  it('forbids the screen — and never asks — without the browse grant', async () => {
    mockContext({ canBrowseAllTeams: false, canCreateTeams: false });

    const { result } = renderHookWithProviders(() => useTeamsWorkspace());

    await waitFor(() => {
      expect(result.current.status).toBe('forbidden');
    });
    expect(listTeams).not.toHaveBeenCalled();
  });

  it('explains that creating a team is a platform capability, and hides the control', async () => {
    mockContext({ canCreateTeams: false });

    const { result } = renderHookWithProviders(() => useTeamsWorkspace());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.canCreate).toBe(false);
    expect(result.current.notice).toContain('platform-administrator');
  });

  it('confirms a lifecycle move before running it', async () => {
    await runFirstTransition();

    await waitFor(() => {
      expect(transitionTeam).toHaveBeenCalledWith('team-1', 'deactivate', 4);
    });
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the confirmation is declined', async () => {
    confirm.mockResolvedValue(false);
    await runFirstTransition();

    await waitFor(() => {
      expect(confirm).toHaveBeenCalled();
    });
    expect(transitionTeam).not.toHaveBeenCalled();
  });

  it('states the real reason an illegal move was refused', async () => {
    vi.mocked(transitionTeam).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Conflict,
        messageKey: 'errors.teams.teamInvalidTransition',
      }),
    );
    await runFirstTransition();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: 'danger',
          message: expect.stringContaining('not allowed') as unknown,
        }),
      );
    });
  });

  it('opens the create editor on demand', async () => {
    const { result } = renderHookWithProviders(() => useTeamsWorkspace());
    await waitFor(() => {
      expect(result.current.editor).toBeNull();
    });

    act(() => {
      result.current.onOpenCreate();
    });

    expect(result.current.editor?.isOpen).toBe(true);
    expect(result.current.editor?.slug.isReadOnly).toBe(false);
  });

  it('locks the slug when editing an existing team', async () => {
    const { result } = renderHookWithProviders(() => useTeamsWorkspace());
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1);
    });

    act(() => {
      result.current.rows[0]?.onEdit();
    });

    expect(result.current.editor?.slug.isReadOnly).toBe(true);
    expect(result.current.editor?.name.value).toBe('Ultimate Natives');
  });

  it('presents the error state when the list fails', async () => {
    vi.mocked(listTeams).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const { result } = renderHookWithProviders(() => useTeamsWorkspace());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });

  it('presents the empty state when the platform has no teams yet', async () => {
    vi.mocked(listTeams).mockResolvedValue([]);

    const { result } = renderHookWithProviders(() => useTeamsWorkspace());

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
  });
});

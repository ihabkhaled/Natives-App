import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';

import { createSeason } from '../services/create-season.service';
import { listSeasons } from '../services/list-seasons.service';
import { transitionSeason } from '../services/transition-season.service';
import { updateSeason } from '../services/update-season.service';
import type { SeasonsWorkspaceView } from '../types/teams-view.types';
import type { TeamsContextView } from './use-teams-context.hook';
import { useTeamsContext } from './use-teams-context.hook';
import { useSeasonsWorkspace } from './use-seasons-workspace.hook';
import { buildSeason, buildTeamsContext } from '../../../../tests/factories/teams.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { showToast, resetWorkspaceUiSpies } from '../../../../tests/setup/workspace-mock.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('@/shared/ui', async () =>
  (await import('../../../../tests/setup/workspace-mock.helper')).loadWorkspaceUiMock(),
);
vi.mock('./use-teams-context.hook', () => ({ useTeamsContext: vi.fn() }));
vi.mock('../services/list-seasons.service', () => ({ listSeasons: vi.fn() }));
vi.mock('../services/transition-season.service', () => ({ transitionSeason: vi.fn() }));
vi.mock('../services/create-season.service', () => ({ createSeason: vi.fn() }));
vi.mock('../services/update-season.service', () => ({ updateSeason: vi.fn() }));

const DRAFT = buildSeason({
  id: 'season-draft',
  slug: '2027',
  name: 'Season 2027',
  startsOn: '2027-01-01',
  endsOn: '2027-12-31',
});

interface SeasonsResult {
  readonly current: SeasonsWorkspaceView;
}

function mockContext(overrides: Partial<TeamsContextView> = {}): void {
  vi.mocked(useTeamsContext).mockReturnValue(buildTeamsContext(overrides));
}

function renderScreen(): SeasonsResult {
  return renderHookWithProviders(() => useSeasonsWorkspace()).result;
}

/** Render, wait for the list, then run the row's first legal transition. */
async function runFirstTransition(): Promise<SeasonsResult> {
  const view = renderScreen();
  await waitFor(() => {
    expect(view.current.rows).toHaveLength(1);
  });
  act(() => {
    view.current.rows[0]?.transitions[0]?.onSelect();
  });
  return view;
}

/** Open the create editor, fill the given window, and submit. */
function submitCreateForm(target: SeasonsResult, startsOn: string, endsOn: string): void {
  act(() => {
    target.current.onOpenCreate();
  });
  act(() => {
    target.current.editor?.slug.onChange('2027');
    target.current.editor?.name.onChange('Season 2027');
  });
  act(() => {
    target.current.editor?.startsOn.onChange(startsOn);
  });
  act(() => {
    target.current.editor?.endsOn.onChange(endsOn);
  });
  act(() => {
    target.current.editor?.onSubmit();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockContext();
  resetWorkspaceUiSpies();
  vi.mocked(listSeasons).mockResolvedValue([DRAFT]);
  vi.mocked(transitionSeason).mockResolvedValue({ ...DRAFT, status: 'active' });
  vi.mocked(createSeason).mockResolvedValue(DRAFT);
  vi.mocked(updateSeason).mockResolvedValue(DRAFT);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSeasonsWorkspace', () => {
  it('lists the active team seasons', async () => {
    const view = renderScreen();

    await waitFor(() => {
      expect(view.current.status).toBe('ready');
    });
    expect(view.current.rows[0]?.detail).toBe('2027-01-01 → 2027-12-31');
  });

  it('runs a lifecycle move addressed at the season it belongs to', async () => {
    await runFirstTransition();

    await waitFor(() => {
      expect(transitionSeason).toHaveBeenCalledWith({
        teamId: 'team-1',
        seasonId: 'season-draft',
        transition: 'activate',
        expectedVersion: 1,
      });
    });
  });

  it('explains the one-active-season invariant instead of inviting a retry', async () => {
    vi.mocked(transitionSeason).mockRejectedValue(
      new AppError({
        code: APP_ERROR_CODE.Conflict,
        messageKey: 'errors.teams.seasonAlreadyActive',
      }),
    );

    const view = await runFirstTransition();

    await waitFor(() => {
      expect(view.current.notice).toContain('already has an active season');
    });
  });

  it('opens a create editor with a draft status and both date pickers closed', async () => {
    const view = renderScreen();
    await waitFor(() => {
      expect(view.current.editor).toBeNull();
    });

    act(() => {
      view.current.onOpenCreate();
    });

    expect(view.current.editor?.statusValue).toBe('draft');
    expect(view.current.editor?.startsOn.isOpen).toBe(false);
    expect(view.current.editor?.endsOn.isOpen).toBe(false);
  });

  it('refuses to save a window whose end does not follow its start', async () => {
    const view = renderScreen();

    submitCreateForm(view, '2027-12-31', '2027-01-01');

    await waitFor(() => {
      expect(view.current.editor?.endsOn.error).not.toBeNull();
    });
    expect(createSeason).not.toHaveBeenCalled();
  });

  it('creates a season once the form is complete', async () => {
    const view = renderScreen();

    submitCreateForm(view, '2027-01-01', '2027-12-31');

    await waitFor(() => {
      expect(createSeason).toHaveBeenCalledWith('team-1', {
        slug: '2027',
        name: 'Season 2027',
        startsOn: '2027-01-01',
        endsOn: '2027-12-31',
        status: 'draft',
      });
    });
  });

  it('reports a refused save without losing what was typed', async () => {
    vi.mocked(createSeason).mockRejectedValue(new Error('boom'));
    const view = renderScreen();

    submitCreateForm(view, '2027-01-01', '2027-12-31');

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
    expect(view.current.editor?.name.value).toBe('Season 2027');
  });

  it('opens the picker, then closes it the moment a day is chosen', () => {
    const view = renderScreen();
    act(() => {
      view.current.onOpenCreate();
    });

    act(() => {
      view.current.editor?.startsOn.onOpen();
    });
    expect(view.current.editor?.startsOn.isOpen).toBe(true);

    act(() => {
      view.current.editor?.startsOn.onChange('2027-01-01');
    });
    expect(view.current.editor?.startsOn.isOpen).toBe(false);
    expect(view.current.editor?.startsOn.displayValue).not.toBe('');

    act(() => {
      view.current.editor?.endsOn.onOpen();
    });
    act(() => {
      view.current.editor?.endsOn.onDismiss();
    });
    expect(view.current.editor?.endsOn.isOpen).toBe(false);
  });

  it('edits an existing season through the same form', async () => {
    const view = renderScreen();
    await waitFor(() => {
      expect(view.current.rows).toHaveLength(1);
    });

    act(() => {
      view.current.rows[0]?.onEdit();
    });
    act(() => {
      view.current.editor?.onStatusChange('closed');
    });
    act(() => {
      view.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(updateSeason).toHaveBeenCalledWith(
        'team-1',
        'season-draft',
        expect.objectContaining({ status: 'closed', expectedVersion: 1 }),
      );
    });
  });

  it('ignores a status value the backend does not define', () => {
    const view = renderScreen();
    act(() => {
      view.current.onOpenCreate();
    });

    act(() => {
      view.current.editor?.onStatusChange('nonsense');
    });

    expect(view.current.editor?.statusValue).toBe('draft');
  });

  it('reads without offering writes when the manage grant is missing', async () => {
    mockContext({ canManageSeasons: false });

    const view = renderScreen();

    await waitFor(() => {
      expect(view.current.status).toBe('ready');
    });
    expect(view.current.canManage).toBe(false);
    expect(view.current.editor).toBeNull();
    expect(view.current.notice).not.toBeNull();
  });

  it('cancels the editor without saving', () => {
    const view = renderScreen();
    act(() => {
      view.current.onOpenCreate();
    });
    act(() => {
      view.current.editor?.onCancel();
    });

    expect(view.current.editor).toBeNull();
  });
});

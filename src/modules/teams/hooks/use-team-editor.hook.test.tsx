import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTeam } from '../services/create-team.service';
import { updateTeam } from '../services/update-team.service';
import { useTeamEditor } from './use-team-editor.hook';
import { useTeamFormState } from './use-team-form-state.hook';
import { buildTeam } from '../../../../tests/factories/teams.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useAppToast: () => ({ showToast }),
}));
vi.mock('../services/create-team.service', () => ({ createTeam: vi.fn() }));
vi.mock('../services/update-team.service', () => ({ updateTeam: vi.fn() }));

const TEAM = buildTeam();

function renderEditor(canManage = true, canCreate = true) {
  return renderHookWithProviders(() => {
    const form = useTeamFormState();
    return { form, editor: useTeamEditor(form, canManage, canCreate) };
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(createTeam).mockResolvedValue(TEAM);
  vi.mocked(updateTeam).mockResolvedValue(TEAM);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTeamEditor', () => {
  it('renders nothing while the form is closed', () => {
    const { result } = renderEditor();

    expect(result.current.editor).toBeNull();
  });

  it('refuses to open a create form without the platform create grant', () => {
    const { result } = renderEditor(true, false);

    act(() => {
      result.current.form.openCreate();
    });

    expect(result.current.editor).toBeNull();
  });

  it('still opens an EDIT form for a team administrator without the create grant', () => {
    const { result } = renderEditor(true, false);

    act(() => {
      result.current.form.openEdit(TEAM);
    });

    expect(result.current.editor).not.toBeNull();
    expect(result.current.editor?.slug.isReadOnly).toBe(true);
  });

  it('refuses to open an edit form without the manage grant', () => {
    const { result } = renderEditor(false, true);

    act(() => {
      result.current.form.openEdit(TEAM);
    });

    expect(result.current.editor).toBeNull();
  });

  it('blocks a submit that is missing the required fields', async () => {
    const { result } = renderEditor();
    act(() => {
      result.current.form.openCreate();
    });
    act(() => {
      result.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(result.current.editor?.slug.error).not.toBeNull();
    });
    expect(result.current.editor?.name.error).not.toBeNull();
    expect(createTeam).not.toHaveBeenCalled();
  });

  it('creates a team, omitting the optional fields left blank', async () => {
    const { result } = renderEditor();
    act(() => {
      result.current.form.openCreate();
    });
    act(() => {
      result.current.editor?.slug.onChange('  natives-b ');
      result.current.editor?.name.onChange('  Natives B ');
    });
    act(() => {
      result.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledWith({
        slug: 'natives-b',
        name: 'Natives B',
        timezone: null,
        locale: null,
        primaryColor: null,
      });
    });
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
  });

  it('sends the optional fields that were filled in', async () => {
    const { result } = renderEditor();
    act(() => {
      result.current.form.openCreate();
    });
    act(() => {
      result.current.editor?.slug.onChange('natives-b');
      result.current.editor?.name.onChange('Natives B');
      result.current.editor?.timezone.onChange('UTC');
      result.current.editor?.locale.onChange('ar');
      result.current.editor?.color.onChange('#123456');
    });
    act(() => {
      result.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledWith(
        expect.objectContaining({ timezone: 'UTC', locale: 'ar', primaryColor: '#123456' }),
      );
    });
  });

  it('updates an existing team with its optimistic-concurrency token', async () => {
    const { result } = renderEditor();
    act(() => {
      result.current.form.openEdit(TEAM);
    });
    act(() => {
      result.current.editor?.name.onChange('Renamed');
    });
    act(() => {
      result.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(updateTeam).toHaveBeenCalledWith(
        'team-1',
        expect.objectContaining({ name: 'Renamed', expectedVersion: 4 }),
      );
    });
  });

  it('reports a refused save without losing what was typed', async () => {
    vi.mocked(createTeam).mockRejectedValue(new Error('boom'));
    const { result } = renderEditor();
    act(() => {
      result.current.form.openCreate();
    });
    act(() => {
      result.current.editor?.slug.onChange('natives-b');
      result.current.editor?.name.onChange('Natives B');
    });
    act(() => {
      result.current.editor?.onSubmit();
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
    expect(result.current.editor?.name.value).toBe('Natives B');
  });

  it('closes without saving when cancelled', () => {
    const { result } = renderEditor();
    act(() => {
      result.current.form.openCreate();
    });
    act(() => {
      result.current.editor?.onCancel();
    });

    expect(result.current.editor).toBeNull();
    expect(createTeam).not.toHaveBeenCalled();
  });
});

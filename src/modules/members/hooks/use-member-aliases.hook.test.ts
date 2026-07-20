import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { addMemberAlias } from '../services/add-member-alias.service';
import { getMemberAliases } from '../services/get-member-aliases.service';
import { removeMemberAlias } from '../services/remove-member-alias.service';
import { useMemberAliases } from './use-member-aliases.hook';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/shared/ui', () => ({ useAppToast: () => ({ showToast }) }));
vi.mock('../services/get-member-aliases.service', () => ({ getMemberAliases: vi.fn() }));
vi.mock('../services/add-member-alias.service', () => ({ addMemberAlias: vi.fn() }));
vi.mock('../services/remove-member-alias.service', () => ({ removeMemberAlias: vi.fn() }));

const alias = {
  id: 'a1',
  alias: 'O-Train',
  source: 'manual' as const,
  createdAtIso: '2026-07-19T10:00:00.000Z',
};

function renderAliases() {
  return renderHookWithProviders(() => useMemberAliases('t', 'm', true));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  showToast.mockResolvedValue(undefined);
  vi.mocked(getMemberAliases).mockResolvedValue([alias]);
  vi.mocked(addMemberAlias).mockResolvedValue(alias);
  vi.mocked(removeMemberAlias).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberAliases', () => {
  it('ignores a blank alias, then adds and removes with toasts', async () => {
    const { result } = renderAliases();
    act(() => {
      result.current.onAdd();
    });
    expect(addMemberAlias).not.toHaveBeenCalled();

    act(() => {
      result.current.onDraftChange('Speedy');
    });
    act(() => {
      result.current.onAdd();
    });
    await waitFor(() => {
      expect(addMemberAlias).toHaveBeenCalledWith('t', 'm', 'Speedy');
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });

    act(() => {
      result.current.onRemove('a1');
    });
    await waitFor(() => {
      expect(removeMemberAlias).toHaveBeenCalledWith('t', 'm', 'a1');
    });
  });

  it('toasts an error when adding fails', async () => {
    vi.mocked(addMemberAlias).mockRejectedValue(new Error('conflict'));
    const { result } = renderAliases();
    act(() => {
      result.current.onDraftChange('Dup');
    });
    act(() => {
      result.current.onAdd();
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });

  it('toasts an error when removing fails', async () => {
    vi.mocked(removeMemberAlias).mockRejectedValue(new Error('boom'));
    const { result } = renderAliases();
    act(() => {
      result.current.onRemove('a1');
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});

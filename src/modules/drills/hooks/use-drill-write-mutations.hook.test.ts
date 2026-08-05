import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError, APP_ERROR_CODE } from '@/shared/errors';
import { useAppToast } from '@/shared/ui';

import { useArchiveDrillMutation } from '../mutations/use-archive-drill-mutation.hook';
import { useCreateDrillMutation } from '../mutations/use-create-drill-mutation.hook';
import { useUpdateDrillMutation } from '../mutations/use-update-drill-mutation.hook';
import type { DrillWriteCallbacks } from '../mutations/drills-mutations.types';
import type { Drill } from '../types/drills.types';
import { useDrillWriteMutations } from './use-drill-write-mutations.hook';

vi.mock('@/packages/i18n', () => ({ useAppTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/ui', () => ({ useAppToast: vi.fn() }));
vi.mock('../mutations/use-create-drill-mutation.hook', () => ({ useCreateDrillMutation: vi.fn() }));
vi.mock('../mutations/use-update-drill-mutation.hook', () => ({ useUpdateDrillMutation: vi.fn() }));
vi.mock('../mutations/use-archive-drill-mutation.hook', () => ({
  useArchiveDrillMutation: vi.fn(),
}));

let createCallbacks: DrillWriteCallbacks;
let updateCallbacks: DrillWriteCallbacks;
let archiveCallbacks: DrillWriteCallbacks;
const showToast = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppToast).mockReturnValue({ showToast });
  vi.mocked(useCreateDrillMutation).mockImplementation((_teamId, callbacks) => {
    createCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useUpdateDrillMutation).mockImplementation((_teamId, callbacks) => {
    updateCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useArchiveDrillMutation).mockImplementation((_teamId, callbacks) => {
    archiveCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
});

const DRILL: Drill = {
  id: 'd1',
  seasonId: null,
  name: 'Give-and-go break',
  category: 'throwing',
  objective: null,
  instructions: null,
  equipment: [],
  intensity: 'moderate',
  defaultDurationMinutes: null,
  skillTags: [],
  safetyNotes: null,
  mediaUrl: null,
  status: 'active',
  version: 1,
};

describe('useDrillWriteMutations', () => {
  it('reports a created drill through onCreated, after the toast', () => {
    const onCreated = vi.fn();
    renderHook(() => useDrillWriteMutations({ teamId: 't1', onCreated, onConflict: vi.fn() }));

    createCallbacks.onSuccess(DRILL);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.createdToast' }),
    );
    expect(onCreated).toHaveBeenCalledWith(DRILL);
  });

  it('toasts a save failure on create error', () => {
    renderHook(() =>
      useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict: vi.fn() }),
    );

    createCallbacks.onError(new Error('nope'));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.saveErrorToast' }),
    );
  });

  it('toasts the plain save toast on a successful update', () => {
    renderHook(() =>
      useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict: vi.fn() }),
    );

    updateCallbacks.onSuccess(DRILL);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.savedToast' }),
    );
  });

  it('reports a version conflict distinctly and triggers recovery', () => {
    const onConflict = vi.fn();
    renderHook(() => useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict }));

    updateCallbacks.onError(new AppError({ code: APP_ERROR_CODE.Conflict, message: 'x' }));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.saveConflictToast' }),
    );
    expect(onConflict).toHaveBeenCalled();
  });

  it('reports a non-conflict update failure as the plain save error, without recovery', () => {
    const onConflict = vi.fn();
    renderHook(() => useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict }));

    updateCallbacks.onError(new Error('nope'));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.saveErrorToast' }),
    );
    expect(onConflict).not.toHaveBeenCalled();
  });

  it('toasts the archived confirmation on a successful archive', () => {
    renderHook(() =>
      useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict: vi.fn() }),
    );

    archiveCallbacks.onSuccess(DRILL);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.archivedToast' }),
    );
  });

  it('toasts an archive failure', () => {
    renderHook(() =>
      useDrillWriteMutations({ teamId: 't1', onCreated: vi.fn(), onConflict: vi.fn() }),
    );

    archiveCallbacks.onError(new Error('nope'));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'drills.archiveErrorToast' }),
    );
  });
});

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppNavigation } from '@/packages/router';
import { useConfirmAlert } from '@/shared/ui';

import { useArchiveScheduleMutation } from '../mutations/use-archive-schedule-mutation.hook';
import { useCreateScheduleMutation } from '../mutations/use-create-schedule-mutation.hook';
import { useGenerateScheduleMutation } from '../mutations/use-generate-schedule-mutation.hook';
import { useUpdateScheduleMutation } from '../mutations/use-update-schedule-mutation.hook';
import type { PracticeSchedule } from '../types/practice-schedules.types';
import { useScheduleMutations } from './use-schedule-mutations.hook';

vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));
vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui', () => ({ useConfirmAlert: vi.fn() }));
vi.mock('../mutations/use-create-schedule-mutation.hook', () => ({
  useCreateScheduleMutation: vi.fn(),
}));
vi.mock('../mutations/use-update-schedule-mutation.hook', () => ({
  useUpdateScheduleMutation: vi.fn(),
}));
vi.mock('../mutations/use-archive-schedule-mutation.hook', () => ({
  useArchiveScheduleMutation: vi.fn(),
}));
vi.mock('../mutations/use-generate-schedule-mutation.hook', () => ({
  useGenerateScheduleMutation: vi.fn(),
}));

const SCHEDULE: PracticeSchedule = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  defaultCapacity: null,
  visibility: 'team',
  organizerUserId: null,
  notes: null,
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: [],
  status: 'active',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  updatedAtIso: '2026-01-01T00:00:00.000Z',
  version: 5,
};

const DRAFT = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly' as const,
  weekdays: [1],
  intervalWeeks: 1,
  startTimeLocal: '18:00',
  durationMinutes: 90,
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team' as const,
  defaultCapacity: null,
  notes: null,
};

let createOnSuccess: (schedule: PracticeSchedule) => void;
let createOnError: (error: unknown) => void;
let updateOnSuccess: () => void;
let archiveOnSuccess: () => void;
let generateOnSuccess: (result: { created: number; skipped: number }) => void;
let confirmResult = true;

const push = vi.fn();
const replace = vi.fn();
const createRun = vi.fn();
const updateRun = vi.fn();
const archiveRun = vi.fn();
const generateRun = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  confirmResult = true;
  vi.mocked(useAppNavigation).mockReturnValue({ push, replace, goBack: vi.fn(), currentPath: '/x' });
  vi.mocked(useConfirmAlert).mockReturnValue({
    confirm: vi.fn().mockImplementation(() => Promise.resolve(confirmResult)),
  });
  vi.mocked(useCreateScheduleMutation).mockImplementation((_teamId, callbacks) => {
    createOnSuccess = callbacks.onSuccess;
    createOnError = callbacks.onError;
    return { run: createRun, isRunning: false };
  });
  vi.mocked(useUpdateScheduleMutation).mockImplementation((_scope, callbacks) => {
    updateOnSuccess = callbacks.onSuccess;
    return { run: updateRun, isRunning: false };
  });
  vi.mocked(useArchiveScheduleMutation).mockImplementation((_scope, callbacks) => {
    archiveOnSuccess = callbacks.onSuccess;
    return { run: archiveRun, isRunning: false };
  });
  vi.mocked(useGenerateScheduleMutation).mockImplementation((_scope, callbacks) => {
    generateOnSuccess = callbacks.onSuccess;
    return { run: generateRun, isRunning: false };
  });
});

describe('useScheduleMutations', () => {
  it('routes a submit to create when there is no loaded schedule', () => {
    const { result } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: null, schedule: undefined }),
    );

    result.current.onValidSubmit(DRAFT);

    expect(createRun).toHaveBeenCalledWith(DRAFT);
    expect(updateRun).not.toHaveBeenCalled();
  });

  it('routes a submit to update with the loaded version when a schedule exists', () => {
    const { result } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    result.current.onValidSubmit(DRAFT);

    expect(updateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { teamId: 't1', scheduleId: 's1' },
        status: 'active',
        expectedVersion: 5,
      }),
    );
  });

  it('replaces the route with the new detail path on create success', () => {
    renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: null, schedule: undefined }),
    );

    createOnSuccess({ ...SCHEDULE, id: 's-new' });

    expect(replace).toHaveBeenCalledWith('/practice-schedules/s-new');
  });

  it('reports a save success message on update', () => {
    const { result, rerender } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    updateOnSuccess();
    rerender();

    expect(result.current.messages[0]?.text).toBe('practiceSchedules.saveSuccess');
  });

  it('surfaces a write failure as a failure message', () => {
    const { result, rerender } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    createOnError(new Error('nope'));
    rerender();

    expect(result.current.messages[0]?.text).toBe('practiceSchedules.actionFailed');
  });

  it('archives only after the confirm dialog is accepted', async () => {
    confirmResult = false;
    const { result } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    result.current.onDelete();
    await Promise.resolve();

    expect(archiveRun).not.toHaveBeenCalled();
  });

  it('archives and returns to the list once confirmed', async () => {
    confirmResult = true;
    const { result } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    result.current.onDelete();
    await Promise.resolve();

    expect(archiveRun).toHaveBeenCalled();
    archiveOnSuccess();
    expect(push).toHaveBeenCalledWith('/practice-schedules');
  });

  it('generates only after the confirm dialog is accepted, and reports the count', async () => {
    confirmResult = true;
    const { result, rerender } = renderHook(() =>
      useScheduleMutations({ teamId: 't1', scheduleId: 's1', schedule: SCHEDULE }),
    );

    result.current.onGenerate();
    await Promise.resolve();

    expect(generateRun).toHaveBeenCalled();
    generateOnSuccess({ created: 2, skipped: 1 });
    rerender();
    expect(result.current.messages[0]?.text).toBe('practiceSchedules.generateCreatedWithSkipped');
  });
});

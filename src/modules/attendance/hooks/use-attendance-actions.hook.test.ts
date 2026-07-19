import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';
import { buildAttendanceEditorStub } from '@/tests/msw/attendance-editor.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import type { AttendanceDraft, AttendanceMark, AttendanceSheet } from '../types/attendance.types';
import type { AttendanceEditorView } from './use-attendance-editor.hook';
import type { AttendanceQueueReplayView } from './use-attendance-queue-replay.hook';
import { useBulkAttendanceMutation } from '../mutations/use-bulk-attendance-mutation.hook';
import { useCorrectAttendanceMutation } from '../mutations/use-correct-attendance-mutation.hook';
import { useAttendanceActions } from './use-attendance-actions.hook';

const spies = vi.hoisted(() => ({
  submit: vi.fn(),
  finalize: vi.fn(),
  correct: vi.fn(),
  confirm: vi.fn(),
  saved: vi.fn(),
  queued: vi.fn(),
  failed: vi.fn(),
  finalized: vi.fn(),
  corrected: vi.fn(),
}));

vi.mock('../mutations/use-bulk-attendance-mutation.hook', () => ({
  useBulkAttendanceMutation: vi.fn(() => ({ submit: spies.submit, isSubmitting: false })),
}));
vi.mock('../mutations/use-finalize-attendance-mutation.hook', () => ({
  useFinalizeAttendanceMutation: vi.fn(() => ({ finalize: spies.finalize, isSubmitting: false })),
}));
vi.mock('../mutations/use-correct-attendance-mutation.hook', () => ({
  useCorrectAttendanceMutation: vi.fn(() => ({ correct: spies.correct, isSubmitting: false })),
}));
vi.mock('./use-attendance-notices.hook', () => ({
  useAttendanceNotices: () => ({
    saved: spies.saved,
    queued: spies.queued,
    failed: spies.failed,
    finalized: spies.finalized,
    corrected: spies.corrected,
  }),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useConfirmAlert: () => ({ confirm: spies.confirm }),
}));

const MARKS: readonly AttendanceMark[] = [
  {
    membershipId: 'm-1',
    status: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
  },
];

function draft(overrides: Partial<AttendanceDraft> = {}): AttendanceDraft {
  return {
    status: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 2,
    correctionReason: 'scanner outage',
    ...overrides,
  };
}

interface SetupOptions {
  readonly marks?: readonly AttendanceMark[];
  readonly sheet?: AttendanceSheet;
  readonly drafts?: Record<string, AttendanceDraft>;
}

function setup(options: SetupOptions = {}) {
  const editor: AttendanceEditorView = {
    ...buildAttendanceEditorStub({ drafts: options.drafts ?? {} }),
    buildMarks: vi.fn(() => options.marks ?? []),
    acceptChanges: vi.fn(),
  };
  const queue: AttendanceQueueReplayView = {
    operations: [],
    isReplaying: false,
    retryFailed: vi.fn(),
    resolveConflict: vi.fn(),
  };
  const onRefetch = vi.fn();
  const { result } = renderHook(() =>
    useAttendanceActions({
      teamId: 'team-1',
      sessionId: 'sess-1',
      isOnline: true,
      sheet: options.sheet,
      editor,
      queue,
      onRefetch,
    }),
  );
  return { actions: result.current.actions, result, editor, queue, onRefetch };
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.clearAllMocks();
  spies.confirm.mockResolvedValue(true);
});

describe('useAttendanceActions', () => {
  it('submits the built marks only when there is something to save', () => {
    const withMarks = setup({ marks: MARKS });
    act(() => {
      withMarks.actions.onSubmit();
    });
    expect(spies.submit).toHaveBeenCalledWith(MARKS);

    const withoutMarks = setup({ marks: [] });
    act(() => {
      withoutMarks.actions.onSubmit();
    });
    expect(spies.submit).toHaveBeenCalledTimes(1);
  });

  it('accepts changes and raises the toast for saved and queued outcomes', () => {
    const { editor } = setup({ marks: MARKS });
    const options = vi.mocked(useBulkAttendanceMutation).mock.calls[0]?.[3];

    options?.onSaved(3);
    options?.onQueued(2);

    expect(editor.acceptChanges).toHaveBeenCalledTimes(2);
    expect(spies.saved).toHaveBeenCalledWith(3);
    expect(spies.queued).toHaveBeenCalledWith(2);
  });

  it('confirms before finalizing and skips finalize when the coach cancels', async () => {
    const confirmed = setup({ sheet: { version: 5 } as AttendanceSheet });
    act(() => {
      confirmed.actions.onFinalize();
    });
    await waitFor(() => {
      expect(spies.finalize).toHaveBeenCalledWith(5);
    });

    spies.confirm.mockResolvedValueOnce(false);
    const cancelled = setup({ sheet: { version: 6 } as AttendanceSheet });
    act(() => {
      cancelled.actions.onFinalize();
    });
    await waitFor(() => {
      expect(spies.confirm).toHaveBeenCalledTimes(2);
    });
    expect(spies.finalize).toHaveBeenCalledTimes(1);
  });

  it('does not finalize when the sheet has no known version', () => {
    const { actions } = setup();
    act(() => {
      actions.onFinalize();
    });
    expect(spies.confirm).not.toHaveBeenCalled();
    expect(spies.finalize).not.toHaveBeenCalled();
  });

  it('sends a correction only for a complete draft with a reason', () => {
    const { actions } = setup({ drafts: { 'm-1': draft() } });
    act(() => {
      actions.onSaveCorrection('m-1');
    });
    expect(spies.correct).toHaveBeenCalledWith(
      expect.objectContaining({ membershipId: 'm-1', reason: 'scanner outage' }),
    );
  });

  it.each([
    ['no draft exists', {}],
    ['the status is still unset', { 'm-1': draft({ status: null }) }],
    ['the reason is blank', { 'm-1': draft({ correctionReason: '  ' }) }],
  ] as const)('skips the correction when %s', (_label, drafts) => {
    const { actions } = setup({ drafts });
    act(() => {
      actions.onSaveCorrection('m-1');
    });
    expect(spies.correct).not.toHaveBeenCalled();
  });

  it('accepts changes and toasts after a correction succeeds', () => {
    const { editor } = setup();
    const options = vi.mocked(useCorrectAttendanceMutation).mock.calls[0]?.[2];

    options?.onSuccess();

    expect(editor.acceptChanges).toHaveBeenCalledOnce();
    expect(spies.corrected).toHaveBeenCalledOnce();
  });

  it('wires refetch, queue retries, conflict resolution and history selection', () => {
    const { actions, result, queue, onRefetch } = setup();

    act(() => {
      actions.onRetry();
      actions.onRetryQueue();
      actions.onResolveConflict('m-2');
      actions.onShowHistory('m-9');
    });

    expect(onRefetch).toHaveBeenCalledOnce();
    expect(queue.retryFailed).toHaveBeenCalledOnce();
    expect(queue.resolveConflict).toHaveBeenCalledWith('m-2');
    expect(result.current.historyMembershipId).toBe('m-9');
  });
});

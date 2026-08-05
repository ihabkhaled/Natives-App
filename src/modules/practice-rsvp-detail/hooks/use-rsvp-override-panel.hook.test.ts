import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildRsvpRecord } from '../../../../tests/factories/practice-rsvp-detail.factory';
import type { RsvpOverrideCallbacks } from '../mutations/practice-rsvp-detail-mutations.types';
import { useOverrideRsvpMutation } from '../mutations/use-override-rsvp-mutation.hook';
import { useRsvpOverridePanel } from './use-rsvp-override-panel.hook';

vi.mock('@/packages/i18n', () => ({ useAppTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../mutations/use-override-rsvp-mutation.hook', () => ({
  useOverrideRsvpMutation: vi.fn(),
}));

const showToast = vi.fn();
const confirm = vi.fn();
vi.mock('@/shared/ui', () => ({
  useAppToast: () => ({ showToast }),
  useConfirmAlert: () => ({ confirm }),
}));

let overrideCallbacks: RsvpOverrideCallbacks;
const submit = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  confirm.mockResolvedValue(true);
  vi.mocked(useOverrideRsvpMutation).mockImplementation((_scope, callbacks) => {
    overrideCallbacks = callbacks;
    return { submit, isSubmitting: false };
  });
});

describe('useRsvpOverridePanel', () => {
  it('starts with no panel open', () => {
    const { result } = renderHook(() => useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }));

    expect(result.current.mode).toEqual({ kind: 'none' });
    expect(result.current.historyMembershipId).toBe('');
  });

  it('opens the override panel with a fresh draft for the row a coach picked', () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();

    expect(result.current.mode).toEqual({ kind: 'override', membershipId: 'member-1' });
    expect(result.current.draft.status).toBe('');
  });

  it('opens the history panel for the row a coach picked', () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onViewHistory('member-2');
    });
    rerender();

    expect(result.current.mode).toEqual({ kind: 'history', membershipId: 'member-2' });
    expect(result.current.historyMembershipId).toBe('member-2');
  });

  it('closes the panel and resets the draft', () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();
    act(() => {
      result.current.onClosePanel();
    });
    rerender();

    expect(result.current.mode).toEqual({ kind: 'none' });
  });

  it('updates each draft field independently', () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();
    act(() => {
      result.current.draftActions.onStatusChange('not_going');
      result.current.draftActions.onReasonChange('Told us in person.');
      result.current.draftActions.onReasonCategoryChange('work');
      result.current.draftActions.onNoteChange('Called ahead.');
      result.current.draftActions.onNoteVisibilityChange('coaches');
    });
    rerender();

    expect(result.current.draft).toEqual({
      status: 'not_going',
      reason: 'Told us in person.',
      reasonCategory: 'work',
      note: 'Called ahead.',
      noteVisibility: 'coaches',
    });
  });

  /** An override changes somebody else's answer, so it is always confirmed first. */
  it('confirms before submitting, and never submits when the coach declines', async () => {
    confirm.mockResolvedValue(false);
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();
    await act(async () => {
      result.current.draftActions.onSubmit();
      await Promise.resolve();
    });

    expect(confirm).toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits with the drafted fields, the open member, and no version to guard', async () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();
    act(() => {
      result.current.draftActions.onStatusChange('not_going');
      result.current.draftActions.onReasonChange('Told us in person.');
    });
    rerender();
    await act(async () => {
      result.current.draftActions.onSubmit();
      await Promise.resolve();
    });

    expect(submit).toHaveBeenCalledWith({
      membershipId: 'member-1',
      status: 'not_going',
      reason: 'Told us in person.',
      reasonCategory: null,
      note: null,
      noteVisibility: null,
      expectedVersion: null,
    });
  });

  it('carries the optional fields once a coach fills them in', async () => {
    const { result, rerender } = renderHook(() =>
      useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }),
    );

    act(() => {
      result.current.rosterActions.onOverride('member-1');
    });
    rerender();
    act(() => {
      result.current.draftActions.onStatusChange('not_going');
      result.current.draftActions.onReasonChange('Told us in person.');
      result.current.draftActions.onReasonCategoryChange('work');
      result.current.draftActions.onNoteChange('Called ahead.');
      result.current.draftActions.onNoteVisibilityChange('coaches');
    });
    rerender();
    await act(async () => {
      result.current.draftActions.onSubmit();
      await Promise.resolve();
    });

    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        reasonCategory: 'work',
        note: 'Called ahead.',
        noteVisibility: 'coaches',
      }),
    );
  });

  it('closes the panel and toasts success once the override lands', () => {
    renderHook(() => useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }));

    act(() => {
      overrideCallbacks.onSuccess(buildRsvpRecord());
    });

    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
  });

  it('toasts a distinct message for a version conflict versus any other failure', () => {
    renderHook(() => useRsvpOverridePanel({ teamId: 't1', sessionId: 's1' }));

    act(() => {
      overrideCallbacks.onError(new AppError({ code: APP_ERROR_CODE.Conflict }));
    });
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({ tone: 'warning' });

    act(() => {
      overrideCallbacks.onError(new AppError({ code: APP_ERROR_CODE.Server }));
    });
    expect(showToast.mock.calls[1]?.[0]).toMatchObject({ tone: 'danger' });
  });
});

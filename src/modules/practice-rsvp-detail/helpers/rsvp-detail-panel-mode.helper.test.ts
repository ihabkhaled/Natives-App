import { describe, expect, it, vi } from 'vitest';

import { buildRsvpRevision } from '../../../../tests/factories/practice-rsvp-detail.factory';
import {
  EMPTY_RSVP_OVERRIDE_DRAFT,
  resolveHistoryMembershipId,
  resolveRsvpDetailPanelInput,
} from './rsvp-detail-panel-mode.helper';
import type { RsvpOverrideDraftActions } from './rsvp-override-panel.helper';

function draftActions(): RsvpOverrideDraftActions {
  return {
    onStatusChange: vi.fn(),
    onReasonChange: vi.fn(),
    onReasonCategoryChange: vi.fn(),
    onNoteChange: vi.fn(),
    onNoteVisibilityChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };
}

describe('resolveHistoryMembershipId', () => {
  it('reads the membership id only while the history panel is open', () => {
    expect(resolveHistoryMembershipId({ kind: 'history', membershipId: 'm1' })).toBe('m1');
  });

  it('is empty for every other mode', () => {
    expect(resolveHistoryMembershipId({ kind: 'none' })).toBe('');
    expect(resolveHistoryMembershipId({ kind: 'override', membershipId: 'm1' })).toBe('');
  });
});

describe('resolveRsvpDetailPanelInput', () => {
  it('resolves "none" when no panel is open', () => {
    expect(
      resolveRsvpDetailPanelInput({
        mode: { kind: 'none' },
        draft: EMPTY_RSVP_OVERRIDE_DRAFT,
        isSubmitting: false,
        draftActions: draftActions(),
        historyItems: [],
        isHistoryLoading: false,
        onClosePanel: vi.fn(),
      }),
    ).toEqual({ kind: 'none' });
  });

  it('carries the open member and draft into the override panel', () => {
    const actions = draftActions();
    const input = resolveRsvpDetailPanelInput({
      mode: { kind: 'override', membershipId: 'm1' },
      draft: EMPTY_RSVP_OVERRIDE_DRAFT,
      isSubmitting: true,
      draftActions: actions,
      historyItems: [],
      isHistoryLoading: false,
      onClosePanel: vi.fn(),
    });

    expect(input).toEqual({
      kind: 'override',
      draft: { ...EMPTY_RSVP_OVERRIDE_DRAFT, membershipId: 'm1', isSubmitting: true },
      actions,
    });
  });

  it('carries the open member and revisions into the history panel', () => {
    const onClosePanel = vi.fn();
    const revision = buildRsvpRevision();
    const input = resolveRsvpDetailPanelInput({
      mode: { kind: 'history', membershipId: 'm1' },
      draft: EMPTY_RSVP_OVERRIDE_DRAFT,
      isSubmitting: false,
      draftActions: draftActions(),
      historyItems: [revision],
      isHistoryLoading: true,
      onClosePanel,
    });

    expect(input).toEqual({
      kind: 'history',
      history: {
        membershipId: 'm1',
        isLoading: true,
        items: [revision],
        onClose: onClosePanel,
      },
    });
  });
});

import { describe, expect, it, vi } from 'vitest';

import { RSVP_OVERRIDE_REASON_MAX_LENGTH } from '../constants/practice-rsvp-detail.constants';
import {
  buildOverridePanelView,
  canSubmitOverride,
  type RsvpOverrideDraft,
  type RsvpOverrideDraftActions,
} from './rsvp-override-panel.helper';

const t = (key: string): string => key;

function draft(overrides: Partial<RsvpOverrideDraft> = {}): RsvpOverrideDraft {
  return {
    membershipId: 'member-1',
    status: 'not_going',
    reason: 'Reported unavailable through the team chat.',
    reasonCategory: '',
    note: '',
    noteVisibility: '',
    isSubmitting: false,
    ...overrides,
  };
}

function actions(): RsvpOverrideDraftActions {
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

describe('canSubmitOverride', () => {
  it('allows a draft with a status and a non-empty reason', () => {
    expect(canSubmitOverride(draft())).toBe(true);
  });

  it('refuses a draft with no status chosen', () => {
    expect(canSubmitOverride(draft({ status: '' }))).toBe(false);
  });

  it('refuses a blank or whitespace-only reason', () => {
    expect(canSubmitOverride(draft({ reason: '   ' }))).toBe(false);
  });

  it('refuses a reason past the contract\'s own bound', () => {
    expect(
      canSubmitOverride(draft({ reason: 'x'.repeat(RSVP_OVERRIDE_REASON_MAX_LENGTH + 1) })),
    ).toBe(false);
  });

  it('refuses a second submit while one is already in flight', () => {
    expect(canSubmitOverride(draft({ isSubmitting: true }))).toBe(false);
  });
});

describe('buildOverridePanelView', () => {
  it('translates the draft into a panel view carrying the member id', () => {
    const view = buildOverridePanelView(t, draft(), actions());

    expect(view.membershipId).toBe('member-1');
    expect(view.status).toBe('not_going');
    expect(view.canSubmit).toBe(true);
    expect(view.reasonValidationMessage).toBeNull();
  });

  it('flags a reason past the bound with a validation message', () => {
    const view = buildOverridePanelView(
      t,
      draft({ reason: 'x'.repeat(RSVP_OVERRIDE_REASON_MAX_LENGTH + 1) }),
      actions(),
    );

    expect(view.reasonValidationMessage).toBe('practiceRsvpDetail.overrideReasonTooLong');
  });

  it('offers "none" first for the optional reason-category and note-visibility fields', () => {
    const view = buildOverridePanelView(t, draft(), actions());

    expect(view.reasonCategoryOptions[0]).toEqual({
      value: '',
      label: 'practiceRsvpDetail.overrideReasonCategoryNone',
    });
    expect(view.noteVisibilityOptions[0]).toEqual({
      value: '',
      label: 'practiceRsvpDetail.overrideNoteVisibilityNone',
    });
  });

  it('swaps the submit label while the mutation is in flight', () => {
    const idle = buildOverridePanelView(t, draft(), actions());
    const busy = buildOverridePanelView(t, draft({ isSubmitting: true }), actions());

    expect(idle.submitLabel).toBe('practiceRsvpDetail.overrideSubmit');
    expect(busy.submitLabel).toBe('practiceRsvpDetail.overrideSubmitting');
  });
});

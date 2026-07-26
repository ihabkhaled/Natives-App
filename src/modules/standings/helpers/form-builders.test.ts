import { describe, expect, it, vi } from 'vitest';

import { buildManualStandingDraft } from './manual-standing-form.helper';
import {
  buildManualFormView,
  buildRecomputeDialogView,
  buildSourceOptions,
  manualIssueMessage,
} from './standings-table-view.helper';
import {
  blankRuleDraft,
  buildRuleFormView,
  isRuleDraftValid,
  toRulePoints,
} from './rules-form-view.helper';
import {
  blankAchievementDraft,
  buildAchievementFormView,
  isAchievementDraftValid,
  toCreateAchievementCommand,
} from './achievement-form-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

/** Invoke every onChange/onSubmit-style callback a view exposes to cover their bodies. */
function fireAll(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(fireAll);
    return;
  }
  if (node === null || typeof node !== 'object') {
    return;
  }
  for (const value of Object.values(node as Record<string, unknown>)) {
    if (typeof value === 'function') {
      (value as (arg: string) => void)('1');
      (value as (arg: number, direction: number) => void)(0, -1);
    } else {
      fireAll(value);
    }
  }
}

describe('standings-table-view builders', () => {
  it('builds the source options with an "all" head', () => {
    expect(buildSourceOptions(t)[0]?.value).toBe('all');
  });

  it('reports the manual validation message per issue', () => {
    expect(manualIssueMessage(t, 'counts', null)).toBe('standings.manualCountsMismatch');
    expect(manualIssueMessage(t, 'note', null)).toBe('standings.manualNoteTooShort');
    expect(manualIssueMessage(t, 'rule', null)).toBe('standings.ruleFormValidation');
    expect(manualIssueMessage(t, null, null)).toBeNull();
    expect(manualIssueMessage(t, 'counts', 'boom')).toBe('boom');
  });

  it('builds the recompute dialog and reacts to its callbacks', () => {
    const onConfirm = vi.fn();
    const view = buildRecomputeDialogView(t, {
      ruleValue: 'league',
      ruleOptions: [{ value: 'league', label: 'League' }],
      isOffline: false,
      isRunning: false,
      onRuleChange: vi.fn(),
      onConfirm,
      onCancel: vi.fn(),
    });
    expect(view.canConfirm).toBe(true);
    view.onRuleChange('x');
    view.onConfirm();
    view.onCancel();
    expect(onConfirm).toHaveBeenCalled();
    expect(
      buildRecomputeDialogView(t, { ...view, ruleValue: '', isOffline: true }).canConfirm,
    ).toBe(false);
  });

  it('builds the manual form and fires every field callback', () => {
    const view = buildManualFormView(t, {
      draft: buildManualStandingDraft(),
      ruleOptions: [{ value: 'league', label: 'League' }],
      validationMessage: null,
      canSubmit: true,
      isSaving: false,
      patch: vi.fn(),
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    });
    fireAll(view.countFields);
    fireAll(view.scoreFields);
    view.spiritField.onChange('12');
    view.referenceField.onChange('cup');
    view.onEntrantChange('opponent');
    view.onNoteChange('note');
    view.onRuleChange('league');
    view.onSubmit();
    view.onCancel();
    expect(view.entrantOptions).toHaveLength(2);
  });
});

describe('rules-form-view builders', () => {
  it('validates draft points within the DTO bounds', () => {
    expect(toRulePoints('3')).toBe(3);
    expect(toRulePoints('99')).toBeNull();
    expect(toRulePoints('x')).toBeNull();
    expect(isRuleDraftValid({ ...blankRuleDraft(), ruleKey: 'l', name: 'League' })).toBe(false);
    expect(isRuleDraftValid({ ...blankRuleDraft(), ruleKey: 'league', name: 'League' })).toBe(true);
  });

  it('builds the rule form and fires its callbacks', () => {
    const view = buildRuleFormView(t, {
      draft: blankRuleDraft(),
      validationMessage: null,
      canSubmit: true,
      isSaving: false,
      patch: vi.fn(),
      onMoveTieBreak: vi.fn(),
      onSubmit: vi.fn(),
    });
    view.onKeyChange('league');
    view.onNameChange('League');
    fireAll(view.pointFields);
    view.onMoveTieBreak(1, -1);
    view.onSubmit();
    expect(view.tieBreakRows.length).toBe(7);
  });
});

describe('achievement-form-view builders', () => {
  it('validates the draft and maps to a command with trimmed nulls', () => {
    expect(isAchievementDraftValid(blankAchievementDraft())).toBe(false);
    const draft = { ...blankAchievementDraft(), title: 'Champions', achievedOn: '2026-06-20' };
    expect(isAchievementDraftValid(draft)).toBe(true);
    const command = toCreateAchievementCommand({
      ...draft,
      description: '   ',
      evidenceReference: '  ref  ',
      membershipId: 'none',
      visibility: 'public',
    });
    expect(command).toMatchObject({
      description: null,
      evidenceReference: 'ref',
      membershipId: null,
      visibility: 'public',
    });
    expect(
      toCreateAchievementCommand({ ...draft, membershipId: 'm1', visibility: 'staff' }).visibility,
    ).toBe('staff');
  });

  it('builds the create form and fires every callback', () => {
    const view = buildAchievementFormView(t, {
      draft: { ...blankAchievementDraft(), achievedOn: '2026-06-20' },
      members: [
        {
          membershipId: 'm1',
          teamId: 't',
          status: 'active',
          displayName: 'Omar',
          nickname: null,
          jerseyNumber: null,
          positions: [],
          hasAvatar: false,
        },
      ],
      locale: 'en',
      isDateOpen: false,
      validationMessage: null,
      canSubmit: true,
      isSaving: false,
      patch: vi.fn(),
      onDateOpen: vi.fn(),
      onDateDismiss: vi.fn(),
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    });
    view.onTitleChange('X');
    view.onCategoryChange('award');
    view.onDateChange('2026-01-01');
    view.onMemberChange('m1');
    view.onDescriptionChange('d');
    view.onEvidenceChange('e');
    view.onVisibilityChange('public');
    view.onDateOpen();
    view.onDateDismiss();
    view.onSubmit();
    view.onCancel();
    expect(view.memberOptions.length).toBe(2);
    expect(view.dateDisplayValue).not.toBe('');
  });
});

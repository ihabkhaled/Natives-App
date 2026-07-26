import type { TranslateParams } from '@/packages/i18n';
import type { MemberDirectoryItem } from '@/modules/members';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ACHIEVEMENT_CATEGORIES,
  STANDINGS_MEMBER_NONE,
  type AchievementCategory,
  type AchievementVisibility,
} from '../constants/standings.constants';
import { formatAchievedOn, resolveCategoryLabel } from './achievement-view.helper';
import type { CreateAchievementCommand } from '../types/achievements.types';
import type { AchievementFormView } from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The raw text + selection state of the create-claim form. */
export interface AchievementDraft {
  readonly title: string;
  readonly category: AchievementCategory;
  readonly achievedOn: string;
  readonly membershipId: string;
  readonly description: string;
  readonly evidenceReference: string;
  readonly visibility: string;
}

/** A blank draft: a team trophy, visible to the team. */
export function blankAchievementDraft(): AchievementDraft {
  return {
    title: '',
    category: 'trophy',
    achievedOn: '',
    membershipId: STANDINGS_MEMBER_NONE,
    description: '',
    evidenceReference: '',
    visibility: 'team',
  };
}

/** Whether the draft has the two fields the backend requires. */
export function isAchievementDraftValid(draft: AchievementDraft): boolean {
  return draft.title.trim().length >= 2 && draft.achievedOn !== '';
}

function coerceVisibility(value: string): AchievementVisibility {
  return value === 'public' ? 'public' : value === 'staff' ? 'staff' : 'team';
}

/** The wire command for a valid draft. */
export function toCreateAchievementCommand(draft: AchievementDraft): CreateAchievementCommand {
  return {
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim() === '' ? null : draft.description.trim(),
    achievedOn: draft.achievedOn,
    membershipId: draft.membershipId === STANDINGS_MEMBER_NONE ? null : draft.membershipId,
    evidenceReference:
      draft.evidenceReference.trim() === '' ? null : draft.evidenceReference.trim(),
    visibility: coerceVisibility(draft.visibility),
  };
}

/** Resolved state + callbacks the create form binds. */
export interface AchievementFormInputs {
  readonly draft: AchievementDraft;
  readonly members: readonly MemberDirectoryItem[];
  readonly locale: string;
  readonly isDateOpen: boolean;
  readonly validationMessage: string | null;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly patch: (patch: Partial<AchievementDraft>) => void;
  readonly onDateOpen: () => void;
  readonly onDateDismiss: () => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

type Patch = (patch: Partial<AchievementDraft>) => void;

function categoryOptions(t: Translate) {
  return ACHIEVEMENT_CATEGORIES.map((category) => ({
    value: category,
    label: resolveCategoryLabel(t, category),
  }));
}

function memberOptions(t: Translate, members: readonly MemberDirectoryItem[]) {
  return [
    { value: STANDINGS_MEMBER_NONE, label: t(I18N_KEYS.standings.createMemberNone) },
    ...members.map((member) => ({ value: member.membershipId, label: member.displayName })),
  ];
}

function visibilityOptions(t: Translate) {
  return [
    { value: 'public', label: t(I18N_KEYS.standings.visibilityPublic) },
    { value: 'team', label: t(I18N_KEYS.standings.visibilityTeam) },
    { value: 'staff', label: t(I18N_KEYS.standings.visibilityStaff) },
  ];
}

function buildDateFields(t: Translate, inputs: AchievementFormInputs) {
  const { draft } = inputs;
  return {
    dateLabel: t(I18N_KEYS.standings.createDateLabel),
    dateValue: draft.achievedOn,
    dateDisplayValue:
      draft.achievedOn === '' ? '' : formatAchievedOn(inputs.locale, draft.achievedOn),
    datePlaceholder: t(I18N_KEYS.dateField.placeholder),
    dateOpenLabel: t(I18N_KEYS.dateField.openLabel),
    dateDialogTitle: t(I18N_KEYS.dateField.dialogTitle),
    dateCloseLabel: t(I18N_KEYS.dateField.close),
    isDateOpen: inputs.isDateOpen,
    onDateOpen: inputs.onDateOpen,
    onDateDismiss: inputs.onDateDismiss,
    onDateChange: (value: string) => {
      inputs.onDateDismiss();
      inputs.patch({ achievedOn: value });
    },
  };
}

function buildTextFields(t: Translate, draft: AchievementDraft, patch: Patch) {
  return {
    titleLabel: t(I18N_KEYS.standings.createTitleLabel),
    titleValue: draft.title,
    onTitleChange: (value: string) => {
      patch({ title: value });
    },
    descriptionLabel: t(I18N_KEYS.standings.createDescriptionLabel),
    descriptionValue: draft.description,
    onDescriptionChange: (value: string) => {
      patch({ description: value });
    },
    evidenceLabel: t(I18N_KEYS.standings.createEvidenceLabel),
    evidenceValue: draft.evidenceReference,
    onEvidenceChange: (value: string) => {
      patch({ evidenceReference: value });
    },
  };
}

function buildSelectFields(t: Translate, inputs: AchievementFormInputs, patch: Patch) {
  const { draft } = inputs;
  return {
    categoryLabel: t(I18N_KEYS.standings.createCategoryLabel),
    categoryValue: draft.category,
    categoryOptions: categoryOptions(t),
    onCategoryChange: (value: string) => {
      patch({ category: value as AchievementCategory });
    },
    memberLabel: t(I18N_KEYS.standings.createMemberLabel),
    memberValue: draft.membershipId,
    memberOptions: memberOptions(t, inputs.members),
    onMemberChange: (value: string) => {
      patch({ membershipId: value });
    },
    visibilityLabel: t(I18N_KEYS.standings.createVisibilityLabel),
    visibilityHint: t(I18N_KEYS.standings.visibilityHint),
    visibilityValue: draft.visibility,
    visibilityOptions: visibilityOptions(t),
    onVisibilityChange: (value: string) => {
      patch({ visibility: value });
    },
  };
}

export function buildAchievementFormView(
  t: Translate,
  inputs: AchievementFormInputs,
): AchievementFormView {
  const { draft, patch } = inputs;
  return {
    heading: t(I18N_KEYS.standings.createHeading),
    ...buildTextFields(t, draft, patch),
    ...buildSelectFields(t, inputs, patch),
    ...buildDateFields(t, inputs),
    validationMessage: inputs.validationMessage,
    submitLabel: t(I18N_KEYS.standings.createSubmit),
    cancelLabel: t(I18N_KEYS.standings.createCancel),
    canSubmit: inputs.canSubmit,
    isSaving: inputs.isSaving,
    onSubmit: inputs.onSubmit,
    onCancel: inputs.onCancel,
  };
}

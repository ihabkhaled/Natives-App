import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AdminFieldView } from '../types/teams-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** One editor text field, with its error resolved only after a submit attempt. */
export function buildField(
  t: Translate,
  input: {
    readonly labelKey: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly errorKey: string | null;
    readonly showError: boolean;
    readonly hintKey?: string;
    readonly isReadOnly?: boolean;
  },
): AdminFieldView {
  return {
    label: t(input.labelKey),
    value: input.value,
    onChange: input.onChange,
    error: input.showError && input.errorKey !== null ? t(input.errorKey) : null,
    hint: input.hintKey === undefined ? null : t(input.hintKey),
    isReadOnly: input.isReadOnly === true,
  };
}

/** The teams screen's fixed copy, resolved in one pass. */
export function buildTeamsCopy(t: Translate) {
  return {
    title: t(I18N_KEYS.teamsAdmin.title),
    subtitle: t(I18N_KEYS.teamsAdmin.subtitle),
    listHeading: t(I18N_KEYS.teamsAdmin.listHeading),
    listIntro: t(I18N_KEYS.teamsAdmin.listIntro),
    openCreateLabel: t(I18N_KEYS.teamsAdmin.openCreate),
  };
}

/** The seasons screen's fixed copy, resolved in one pass. */
export function buildSeasonsCopy(t: Translate) {
  return {
    title: t(I18N_KEYS.seasonsAdmin.title),
    subtitle: t(I18N_KEYS.seasonsAdmin.subtitle),
    listHeading: t(I18N_KEYS.seasonsAdmin.listHeading),
    listIntro: t(I18N_KEYS.seasonsAdmin.listIntro),
    openCreateLabel: t(I18N_KEYS.seasonsAdmin.openCreate),
  };
}

/** The shared date-picker copy every admin editor's date fields need. */
export function buildDatePickerCopy(t: Translate) {
  return {
    datePlaceholder: t(I18N_KEYS.dateField.placeholder),
    dateOpenLabel: t(I18N_KEYS.dateField.openLabel),
    dateDialogTitle: t(I18N_KEYS.dateField.dialogTitle),
    dateCloseLabel: t(I18N_KEYS.dateField.close),
  };
}

/** The team editor's fixed copy: headings, intro, and the two action labels. */
export function buildTeamEditorCopy(t: Translate, isCreate: boolean, isSaving: boolean) {
  return {
    heading: t(isCreate ? I18N_KEYS.teamsAdmin.createHeading : I18N_KEYS.teamsAdmin.editHeading),
    intro: t(isCreate ? I18N_KEYS.teamsAdmin.createIntro : I18N_KEYS.teamsAdmin.editIntro),
    submitLabel: t(
      isSaving
        ? I18N_KEYS.teamsAdmin.savingLabel
        : isCreate
          ? I18N_KEYS.teamsAdmin.createSubmit
          : I18N_KEYS.teamsAdmin.saveSubmit,
    ),
    cancelLabel: t(I18N_KEYS.teamsAdmin.cancelLabel),
  };
}

/** The season editor's fixed copy, including the date-picker strings. */
export function buildSeasonEditorCopy(t: Translate, isCreate: boolean, isSaving: boolean) {
  return {
    ...buildDatePickerCopy(t),
    heading: t(
      isCreate ? I18N_KEYS.seasonsAdmin.createHeading : I18N_KEYS.seasonsAdmin.editHeading,
    ),
    intro: t(isCreate ? I18N_KEYS.seasonsAdmin.createIntro : I18N_KEYS.seasonsAdmin.editIntro),
    statusLabel: t(I18N_KEYS.seasonsAdmin.statusLabel),
    statusHint: t(I18N_KEYS.seasonsAdmin.statusHint),
    submitLabel: t(
      isSaving
        ? I18N_KEYS.seasonsAdmin.savingLabel
        : isCreate
          ? I18N_KEYS.seasonsAdmin.createSubmit
          : I18N_KEYS.seasonsAdmin.saveSubmit,
    ),
    cancelLabel: t(I18N_KEYS.seasonsAdmin.cancelLabel),
  };
}

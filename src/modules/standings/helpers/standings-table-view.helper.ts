import type { TranslateParams } from '@/packages/i18n';
import type { SelectFieldOption } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import {
  STANDING_SOURCES,
  STANDINGS_FILTER_ALL,
  type StandingSource,
} from '../constants/standings.constants';
import type { ManualStandingDraft, ManualStandingIssue } from './manual-standing-form.helper';
import type { ManualStandingFormView, RecomputeDialogView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const SOURCE_LABEL_KEYS: Readonly<Record<StandingSource, string>> = {
  derived: I18N_KEYS.standings.sourceDerived,
  manual: I18N_KEYS.standings.sourceManual,
  import: I18N_KEYS.standings.sourceImport,
};

/** The source facet options, "All" first. */
export function buildSourceOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: STANDINGS_FILTER_ALL, label: t(I18N_KEYS.standings.sourceAll) },
    ...STANDING_SOURCES.map((value) => ({ value, label: t(SOURCE_LABEL_KEYS[value]) })),
  ];
}

/** The manual-form validation message for the current draft issue, or a write error. */
export function manualIssueMessage(
  t: Translate,
  issue: ManualStandingIssue,
  writeError: string | null,
): string | null {
  if (writeError !== null) {
    return writeError;
  }
  if (issue === 'counts') {
    return t(I18N_KEYS.standings.manualCountsMismatch);
  }
  if (issue === 'note') {
    return t(I18N_KEYS.standings.manualNoteTooShort);
  }
  return issue === 'rule' ? t(I18N_KEYS.standings.ruleFormValidation) : null;
}

/** Resolved state + callbacks the recompute dialog binds. */
export interface RecomputeDialogInputs {
  readonly ruleValue: string;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly isOffline: boolean;
  readonly isRunning: boolean;
  readonly onRuleChange: (value: string) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function buildRecomputeDialogView(
  t: Translate,
  inputs: RecomputeDialogInputs,
): RecomputeDialogView {
  return {
    heading: t(I18N_KEYS.standings.recomputeHeading),
    intro: t(I18N_KEYS.standings.recomputeIntro),
    ruleLabel: t(I18N_KEYS.standings.recomputeRuleLabel),
    ruleValue: inputs.ruleValue,
    ruleOptions: inputs.ruleOptions,
    onRuleChange: inputs.onRuleChange,
    confirmLabel: t(I18N_KEYS.standings.recomputeConfirm),
    cancelLabel: t(I18N_KEYS.standings.recomputeCancel),
    canConfirm: inputs.ruleValue !== '' && !inputs.isOffline,
    isRunning: inputs.isRunning,
    onConfirm: inputs.onConfirm,
    onCancel: inputs.onCancel,
  };
}

type Patch = (patch: Partial<ManualStandingDraft>) => void;

/** One numeric field bound to a single draft key. */
function draftField(
  field: { id: string; label: string; key: keyof ManualStandingDraft },
  draft: ManualStandingDraft,
  patch: Patch,
) {
  return {
    id: field.id,
    label: field.label,
    value: draft[field.key],
    onChange: (next: string) => {
      patch({ [field.key]: next });
    },
  };
}

function buildCountFields(t: Translate, draft: ManualStandingDraft, patch: Patch) {
  return [
    {
      id: 'manual-played',
      label: t(I18N_KEYS.standings.manualPlayedLabel),
      key: 'played' as const,
    },
    { id: 'manual-wins', label: t(I18N_KEYS.standings.manualWinsLabel), key: 'wins' as const },
    {
      id: 'manual-losses',
      label: t(I18N_KEYS.standings.manualLossesLabel),
      key: 'losses' as const,
    },
    { id: 'manual-ties', label: t(I18N_KEYS.standings.manualTiesLabel), key: 'ties' as const },
  ].map((field) => draftField(field, draft, patch));
}

function buildScoreFields(t: Translate, draft: ManualStandingDraft, patch: Patch) {
  return [
    {
      id: 'manual-points-for',
      label: t(I18N_KEYS.standings.manualPointsForLabel),
      key: 'pointsFor' as const,
    },
    {
      id: 'manual-points-against',
      label: t(I18N_KEYS.standings.manualPointsAgainstLabel),
      key: 'pointsAgainst' as const,
    },
  ].map((field) => draftField(field, draft, patch));
}

/** Resolved state + callbacks the manual external-row form binds. */
export interface ManualFormInputs {
  readonly draft: ManualStandingDraft;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly validationMessage: string | null;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly patch: Patch;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

function buildManualFields(t: Translate, draft: ManualStandingDraft, patch: Patch) {
  return {
    entrantLabel: t(I18N_KEYS.standings.manualEntrantLabel),
    entrantValue: draft.entrantKind,
    entrantOptions: [
      { value: 'team', label: t(I18N_KEYS.standings.ourTeamLabel) },
      { value: 'opponent', label: t(I18N_KEYS.standings.manualOpponentLabel) },
    ],
    onEntrantChange: (value: string) => {
      patch({ entrantKind: value });
    },
    countFields: buildCountFields(t, draft, patch),
    scoreFields: buildScoreFields(t, draft, patch),
    spiritField: draftField(
      { id: 'manual-spirit', label: t(I18N_KEYS.standings.manualSpiritLabel), key: 'spiritScore' },
      draft,
      patch,
    ),
    spiritHint: t(I18N_KEYS.standings.manualSpiritHint),
    referenceField: draftField(
      {
        id: 'manual-reference',
        label: t(I18N_KEYS.standings.manualReferenceLabel),
        key: 'sourceReference',
      },
      draft,
      patch,
    ),
  };
}

export function buildManualFormView(
  t: Translate,
  inputs: ManualFormInputs,
): ManualStandingFormView {
  const { draft, patch } = inputs;
  return {
    heading: t(I18N_KEYS.standings.manualHeading),
    intro: t(I18N_KEYS.standings.manualIntro),
    ...buildManualFields(t, draft, patch),
    noteLabel: t(I18N_KEYS.standings.manualNoteLabel),
    noteHint: t(I18N_KEYS.standings.manualNoteHint),
    noteValue: draft.reconciliationNote,
    onNoteChange: (value) => {
      patch({ reconciliationNote: value });
    },
    ruleLabel: t(I18N_KEYS.standings.manualRuleLabel),
    ruleValue: draft.ruleKey,
    ruleOptions: inputs.ruleOptions,
    onRuleChange: (value) => {
      patch({ ruleKey: value });
    },
    validationMessage: inputs.validationMessage,
    submitLabel: t(I18N_KEYS.standings.manualSubmit),
    cancelLabel: t(I18N_KEYS.standings.manualCancel),
    canSubmit: inputs.canSubmit,
    isSaving: inputs.isSaving,
    onSubmit: inputs.onSubmit,
    onCancel: inputs.onCancel,
  };
}

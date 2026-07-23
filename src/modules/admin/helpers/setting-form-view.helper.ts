import { I18N_KEYS } from '@/shared/i18n';

import type {
  SettingEditorBinding,
  SettingEditorContext,
  WeightsEditorContext,
} from '../components/setting-editors/setting-editors.types';
import type { SettingKey } from '../constants/admin.constants';
import type { EffectiveSetting } from '../types/admin.types';
import type {
  EffectiveFromFieldView,
  RawJsonFormView,
  SettingVersionFormView,
} from '../types/admin-view.types';
import type { SettingValueByKey, TypedSettingValue } from '../types/setting-values.types';
import { draftFromEffective } from './setting-draft.helper';
import {
  alignDraftWithRows,
  weightRowsFromStatuses,
  type EffectiveFromResolution,
} from './setting-form.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * The draft a key's editor renders: the admin's own edits when any exist,
 * otherwise a prefill from the effective value — with weight keys aligned to
 * the rows derived at the chosen instant.
 */
export function resolveDraft<K extends SettingKey>(
  key: K,
  drafts: Partial<Record<SettingKey, TypedSettingValue>>,
  effective: EffectiveSetting | undefined,
  weightRows: readonly { readonly code: string; readonly label: string }[] | null,
): SettingValueByKey[K] {
  const stored = drafts[key] as SettingValueByKey[K] | undefined;
  const draft = stored ?? draftFromEffective(key, effective?.value ?? null);
  return alignDraftWithRows(key, draft, weightRows);
}

/** Whether the schedule submit must stay disabled. */
export function isScheduleBlocked(
  settingKey: SettingKey,
  issues: readonly string[],
  validationMessage: string | null,
  weights: WeightsEditorContext,
): boolean {
  return (
    issues.length > 0 ||
    validationMessage !== null ||
    (settingKey === 'attendance_weights' && weights.blockedNotice !== null)
  );
}

function pickWeightStatuses(
  enabled: boolean,
  asOfSettings: readonly EffectiveSetting[] | undefined,
  statusesNow: EffectiveSetting | undefined,
): EffectiveSetting | undefined {
  if (!enabled || asOfSettings === undefined) {
    return statusesNow;
  }
  return asOfSettings.find((setting) => setting.settingKey === 'attendance_statuses');
}

interface WeightsContextInput {
  readonly t: Translate;
  readonly locale: string;
  readonly settingKey: SettingKey;
  readonly enabled: boolean;
  readonly isPending: boolean;
  readonly asOfSettings: readonly EffectiveSetting[] | undefined;
  readonly statusesNow: EffectiveSetting | undefined;
}

/**
 * The weights editor's derived-row context: rows from the statuses effective
 * at the chosen instant (falling back to the current snapshot while nothing
 * is chosen), a progress note while the as-of read resolves, and the
 * configure-statuses-first blocker when nothing can derive.
 */
export function buildWeightsContext(input: WeightsContextInput): WeightsEditorContext {
  const source = pickWeightStatuses(input.enabled, input.asOfSettings, input.statusesNow);
  const rows = weightRowsFromStatuses(source?.value ?? null, input.locale);
  const isLoading = input.enabled && input.isPending;
  const blocked = input.settingKey === 'attendance_weights' && !isLoading && rows.length === 0;
  return {
    rows,
    blockedNotice: blocked ? input.t(I18N_KEYS.settingEditors.weightsBlocked) : null,
    loadingNotice: isLoading ? input.t(I18N_KEYS.settingEditors.weightsLoading) : null,
  };
}

interface EffectiveFromViewInput {
  readonly t: Translate;
  readonly wallTime: string;
  readonly minWallTime: string;
  readonly resolution: EffectiveFromResolution;
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
  readonly onChange: (value: string) => void;
}

/** The AppDateTimeField prop bundle for the effective-from instant. */
export function buildEffectiveFromView(input: EffectiveFromViewInput): EffectiveFromFieldView {
  const t = input.t;
  return {
    label: t(I18N_KEYS.adminSettings.addVersionEffectiveFrom),
    value: input.wallTime,
    displayValue: input.resolution.displayValue,
    placeholder: t(I18N_KEYS.settingForm.effectiveFromPlaceholder),
    openLabel: t(I18N_KEYS.settingForm.effectiveFromOpen),
    dialogTitle: t(I18N_KEYS.settingForm.effectiveFromDialog),
    closeLabel: t(I18N_KEYS.dateField.close),
    isOpen: input.isOpen,
    minWallTime: input.minWallTime,
    hint: input.resolution.hint,
    errorMessage: input.wallTime === '' ? null : input.resolution.errorMessage,
    onOpen: input.onOpen,
    onDismiss: input.onDismiss,
    onChange: input.onChange,
  };
}

interface RawJsonViewInput {
  readonly t: Translate;
  readonly isOpen: boolean;
  readonly text: string;
  readonly error: string | null;
  readonly onToggle: () => void;
  readonly onTextChange: (value: string) => void;
  readonly onApply: () => void;
}

/** The privileged raw-JSON disclosure bundle (already permission-gated). */
export function buildRawJsonView(input: RawJsonViewInput): RawJsonFormView {
  const t = input.t;
  return {
    toggleLabel: t(I18N_KEYS.settingForm.rawToggle),
    intro: t(I18N_KEYS.settingForm.rawIntro),
    isOpen: input.isOpen,
    onToggle: input.onToggle,
    textLabel: t(I18N_KEYS.adminSettings.addVersionValue),
    textValue: input.text,
    onTextChange: input.onTextChange,
    applyLabel: t(I18N_KEYS.settingForm.rawApply),
    onApply: input.onApply,
    errorMessage: input.error,
  };
}

interface SettingFormViewInput {
  readonly t: Translate;
  readonly key: SettingKey;
  readonly editor: SettingEditorBinding;
  readonly contextBase: Omit<SettingEditorContext, 'weights' | 'scalePreview'>;
  readonly weights: WeightsEditorContext;
  readonly scalePreview: string | null;
  readonly effectiveFrom: EffectiveFromFieldView;
  readonly noteValue: string;
  readonly onNoteChange: (value: string) => void;
  readonly validationIssues: readonly string[];
  readonly validationMessage: string | null;
  readonly rawJson: RawJsonFormView | null;
  readonly isSaving: boolean;
  readonly canSubmit: boolean;
  readonly onSubmit: () => void;
  readonly onPrepareReplacement: () => void;
}

/** Assemble the full scheduling-form view from the hook's prepared parts. */
export function buildSettingVersionFormView(input: SettingFormViewInput): SettingVersionFormView {
  const t = input.t;
  return {
    heading: t(I18N_KEYS.adminSettings.addVersionHeading),
    intro: t(I18N_KEYS.adminSettings.addVersionIntro),
    editor: input.editor,
    editorContext: {
      ...input.contextBase,
      weights: input.weights,
      scalePreview: input.scalePreview,
    },
    effectiveFrom: input.effectiveFrom,
    noteLabel: t(I18N_KEYS.adminSettings.addVersionNote),
    noteValue: input.noteValue,
    onNoteChange: input.onNoteChange,
    issuesHeading: t(I18N_KEYS.settingForm.issuesHeading),
    validationIssues: input.validationIssues,
    validationMessage: input.validationMessage,
    rawJson: input.rawJson,
    submitLabel: t(I18N_KEYS.adminSettings.addVersionSubmit),
    isSaving: input.isSaving,
    canSubmit: input.canSubmit,
    onSubmit: input.onSubmit,
    onPrepareReplacement: input.onPrepareReplacement,
  };
}

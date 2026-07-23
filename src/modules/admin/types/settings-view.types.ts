import type {
  SettingEditorBinding,
  SettingEditorContext,
} from '../components/setting-editors/setting-editors.types';

/** The Cairo wall-time picker bundle the scheduling form renders. */
export interface EffectiveFromFieldView {
  readonly label: string;
  readonly value: string;
  readonly displayValue: string;
  readonly placeholder: string;
  readonly openLabel: string;
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly isOpen: boolean;
  readonly minWallTime: string;
  readonly hint: string;
  readonly errorMessage: string | null;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
  readonly onChange: (value: string) => void;
}

/** The privileged raw-JSON disclosure (platform administrators only). */
export interface RawJsonFormView {
  readonly toggleLabel: string;
  readonly intro: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly textLabel: string;
  readonly textValue: string;
  readonly onTextChange: (value: string) => void;
  readonly applyLabel: string;
  readonly onApply: () => void;
  readonly errorMessage: string | null;
}

export interface SettingVersionFormView {
  readonly heading: string;
  readonly intro: string;
  readonly editor: SettingEditorBinding;
  readonly editorContext: SettingEditorContext;
  readonly effectiveFrom: EffectiveFromFieldView;
  readonly noteLabel: string;
  readonly noteValue: string;
  readonly onNoteChange: (value: string) => void;
  readonly issuesHeading: string;
  readonly validationIssues: readonly string[];
  readonly validationMessage: string | null;
  readonly rawJson: RawJsonFormView | null;
  readonly submitLabel: string;
  readonly isSaving: boolean;
  readonly canSubmit: boolean;
  readonly onSubmit: () => void;
  /** Legacy-replace flow: reset the editor to a blank valid configuration. */
  readonly onPrepareReplacement: () => void;
}

export interface SettingDiffRowView {
  readonly key: string;
  readonly kindLabel: string;
  readonly tone: string;
  readonly label: string;
  readonly beforeLabel: string | null;
  readonly afterLabel: string | null;
}

export interface SettingHistoryLegacyView {
  readonly notice: string;
  readonly disclosureLabel: string;
  readonly rawJson: string;
  readonly replaceLabel: string | null;
  readonly onReplace: (() => void) | null;
}

export interface SettingHistoryEntryView {
  readonly id: string;
  readonly effectiveLabel: string;
  readonly stateLabel: string;
  readonly stateTone: string;
  readonly actorLabel: string;
  readonly noteLabel: string;
  readonly summary: string | null;
  readonly diffRows: readonly SettingDiffRowView[];
  readonly diffEmptyLabel: string | null;
  readonly notComparableLabel: string | null;
  readonly legacy: SettingHistoryLegacyView | null;
  readonly cancelLabel: string | null;
  readonly onCancel: (() => void) | null;
  readonly isCancelling: boolean;
}

export interface SettingHistoryView {
  readonly entries: readonly SettingHistoryEntryView[];
  readonly emptyLabel: string;
}

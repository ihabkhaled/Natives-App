import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { AchievementImportRow } from './achievements.types';

/** What every standings mutation reports back to its orchestrating hook. */
export interface StandingsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/** Result-carrying variant for mutations whose report the screen narrates. */
export interface ReportMutationCallbacks<TReport> {
  readonly onSuccess: (report: TReport) => void;
  readonly onError: (error: unknown) => void;
}

export interface RecomputeMutationView {
  readonly run: (command: { competitionId: string; ruleKey: string }) => void;
  readonly isRunning: boolean;
}

export interface ImportMutationView {
  readonly run: (command: { dryRun: boolean; rows: readonly AchievementImportRow[] }) => void;
  readonly isRunning: boolean;
}

/** One translated chip: label + Ionic colour token. */
export interface ChipView {
  readonly label: string;
  readonly tone: string;
}

/** The provenance popover of a manual/import row. */
export interface ProvenanceView {
  readonly heading: string;
  readonly note: string;
  readonly reference: string | null;
  readonly recordedBy: string | null;
  readonly computedAt: string;
  readonly toggleLabel: string;
}

/** One rendered standings row; every number is already a display string. */
export interface StandingRowView {
  readonly key: string;
  readonly place: string;
  readonly entrantLabel: string;
  readonly isOurTeam: boolean;
  readonly played: string;
  readonly wins: string;
  readonly losses: string;
  readonly ties: string;
  readonly pointsFor: string;
  readonly pointsAgainst: string;
  readonly diff: string;
  readonly points: string;
  readonly spirit: string;
  readonly qualification: ChipView | null;
  readonly qualificationMutedLabel: string;
  readonly sourceBadge: ChipView | null;
  readonly provenance: ProvenanceView | null;
}

/** The column headers of the table, once-translated. */
export interface StandingsColumnLabels {
  readonly place: string;
  readonly entrant: string;
  readonly played: string;
  readonly wins: string;
  readonly losses: string;
  readonly ties: string;
  readonly pointsFor: string;
  readonly pointsAgainst: string;
  readonly diff: string;
  readonly points: string;
  readonly spirit: string;
  readonly qualification: string;
}

/** The recompute dialog, present only while open. */
export interface RecomputeDialogView {
  readonly heading: string;
  readonly intro: string;
  readonly ruleLabel: string;
  readonly ruleValue: string;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly onRuleChange: (value: string) => void;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly canConfirm: boolean;
  readonly isRunning: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** One labelled numeric field of the manual-standing form. */
export interface ManualFieldView {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** The manual external-row form, present only while open. */
export interface ManualStandingFormView {
  readonly heading: string;
  readonly intro: string;
  readonly entrantLabel: string;
  readonly entrantValue: string;
  readonly entrantOptions: readonly SelectFieldOption[];
  readonly onEntrantChange: (value: string) => void;
  readonly countFields: readonly ManualFieldView[];
  readonly scoreFields: readonly ManualFieldView[];
  readonly spiritField: ManualFieldView;
  readonly spiritHint: string;
  readonly referenceField: ManualFieldView;
  readonly noteLabel: string;
  readonly noteHint: string;
  readonly noteValue: string;
  readonly onNoteChange: (value: string) => void;
  readonly ruleLabel: string;
  readonly ruleValue: string;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly onRuleChange: (value: string) => void;
  readonly validationMessage: string | null;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

/** The manage affordances only competition.manage holders receive. */
export interface StandingsManageView {
  readonly recomputeLabel: string;
  readonly onOpenRecompute: () => void;
  readonly manualLabel: string;
  readonly onOpenManual: () => void;
  readonly disabledReason: string | null;
  readonly recomputeDialog: RecomputeDialogView | null;
  readonly manualForm: ManualStandingFormView | null;
}

/** The whole standings screen, ready to render. */
export interface StandingsScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly competitionLabel: string;
  readonly competitionValue: string;
  readonly competitionOptions: readonly SelectFieldOption[];
  readonly onCompetitionChange: (value: string) => void;
  readonly sourceLabel: string;
  readonly sourceValue: string;
  readonly sourceOptions: readonly SelectFieldOption[];
  readonly onSourceChange: (value: string) => void;
  readonly tableCaption: string;
  readonly columns: StandingsColumnLabels;
  readonly rows: readonly StandingRowView[];
  readonly diffDerivedNote: string;
  readonly ruleFooter: string;
  readonly rulesLinkLabel: string;
  readonly onOpenRules: () => void;
  readonly recomputeBanner: string | null;
  readonly manage: StandingsManageView | null;
}

/** One published rule version, rendered. */
export interface RuleVersionView {
  readonly key: string;
  readonly heading: string;
  readonly statusChip: ChipView;
  readonly points: readonly string[];
  readonly tieBreakChips: readonly string[];
  readonly effectiveFrom: string;
}

/** One rule family: the newest version prominent, older ones beneath. */
export interface RuleFamilyView {
  readonly key: string;
  readonly newest: RuleVersionView;
  readonly older: readonly RuleVersionView[];
  readonly olderLabel: string | null;
}

/** The publish-next-version form, present only for competition.manage. */
export interface RuleFormView {
  readonly heading: string;
  readonly keyLabel: string;
  readonly keyHint: string;
  readonly keyValue: string;
  readonly onKeyChange: (value: string) => void;
  readonly nameLabel: string;
  readonly nameValue: string;
  readonly onNameChange: (value: string) => void;
  readonly pointFields: readonly ManualFieldView[];
  readonly tieBreakHeading: string;
  readonly tieBreakRows: readonly TieBreakRowView[];
  readonly onMoveTieBreak: (index: number, direction: -1 | 1) => void;
  readonly moveUpLabel: string;
  readonly moveDownLabel: string;
  readonly validationMessage: string | null;
  readonly submitLabel: string;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
}

/** One reorderable tie-break criterion. */
interface TieBreakRowView {
  readonly key: string;
  readonly label: string;
}

/** The standings-rules screen, ready to render. */
export interface StandingsRulesScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly immutableNotice: string;
  readonly families: readonly RuleFamilyView[];
  readonly formToggleLabel: string | null;
  readonly isFormOpen: boolean;
  readonly onToggleForm: () => void;
  readonly form: RuleFormView | null;
  readonly savedBanner: string | null;
}

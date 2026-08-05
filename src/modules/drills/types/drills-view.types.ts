import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** One vocabulary choice, translated. */
export interface DrillOptionView {
  readonly value: string;
  readonly label: string;
}

/** One catalogue entry, ready to render as a list card. */
export interface DrillCardView {
  readonly id: string;
  readonly name: string;
  readonly categoryLabel: string;
  readonly intensityLabel: string;
  readonly durationLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly tagsSummary: string;
  readonly ariaLabel: string;
}

/** Everything the searchable drill list screen renders, ready to display. */
export interface DrillsCatalogueScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly countLabel: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly categoryFilterLabel: string;
  readonly categoryFilter: string;
  readonly categoryOptions: readonly DrillOptionView[];
  readonly onCategoryFilterChange: (value: string) => void;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly DrillOptionView[];
  readonly onStatusFilterChange: (value: string) => void;
  readonly newDrillLabel: string;
  readonly onNewDrill: () => void;
  readonly items: readonly DrillCardView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly onOpen: (drillId: string) => void;
}

/** One free-text or numeric form field, already translated and bound. */
export interface DrillFormFieldView {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly placeholder: string;
  readonly errorMessage: string | undefined;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
}

/** One select-backed form field: category or intensity. */
export interface DrillFormSelectView {
  readonly label: string;
  readonly value: string;
  readonly options: readonly DrillOptionView[];
  readonly onChange: (value: string) => void;
}

/** The create/edit form, fully bound and translated. */
export interface DrillFormView {
  readonly heading: string;
  readonly nameField: DrillFormFieldView;
  readonly categoryField: DrillFormSelectView;
  readonly intensityField: DrillFormSelectView;
  readonly objectiveField: DrillFormFieldView;
  readonly instructionsField: DrillFormFieldView;
  readonly equipmentField: DrillFormFieldView;
  readonly skillTagsField: DrillFormFieldView;
  readonly durationField: DrillFormFieldView;
  readonly safetyNotesField: DrillFormFieldView;
  readonly mediaUrlField: DrillFormFieldView;
  readonly saveLabel: string;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly cancelLabel: string;
  readonly onCancel: () => void;
}

/**
 * The archive control. Absent (not merely disabled) once a drill is already
 * archived or still unsaved — there is nothing to retire yet in either case.
 */
export interface DrillLifecycleView {
  readonly visible: boolean;
  readonly notice: string | null;
  readonly actionLabel: string;
  readonly isBusy: boolean;
  readonly onArchive: () => void;
}

/** Everything the detail/edit screen renders, ready to display. */
export interface DrillDetailScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly heading: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly statusLabel: string | null;
  readonly statusTone: string | null;
  readonly lifecycle: DrillLifecycleView;
  readonly form: DrillFormView;
}

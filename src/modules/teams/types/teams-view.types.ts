import type { AsyncViewStatus, RecordListRow, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** One lifecycle move offered on a row, already narrowed to a legal one. */
export interface LifecycleActionView {
  readonly key: string;
  readonly label: string;
  readonly onSelect: () => void;
}

/** One list row plus the lifecycle moves the caller may run on it. */
export interface AdminRecordRowView extends RecordListRow {
  readonly editLabel: string;
  readonly onEdit: () => void;
  readonly transitions: readonly LifecycleActionView[];
  readonly canManage: boolean;
}

/** A text field in an admin editor form. */
export interface AdminFieldView {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error: string | null;
  readonly hint: string | null;
  readonly isReadOnly: boolean;
}

/** A date field in an admin editor form; carries its own picker state. */
export interface AdminDateFieldView {
  readonly label: string;
  readonly value: string;
  readonly displayValue: string;
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
  readonly onChange: (value: string) => void;
  readonly error: string | null;
}

export interface TeamEditorView {
  readonly isOpen: boolean;
  readonly heading: string;
  readonly intro: string;
  readonly slug: AdminFieldView;
  readonly name: AdminFieldView;
  readonly timezone: AdminFieldView;
  readonly locale: AdminFieldView;
  readonly color: AdminFieldView;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

export interface TeamsWorkspaceView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly notice: string | null;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly rows: readonly AdminRecordRowView[];
  readonly canManage: boolean;
  /** False for a team administrator: creating a team is platform-scoped. */
  readonly canCreate: boolean;
  readonly openCreateLabel: string;
  readonly onOpenCreate: () => void;
  readonly editor: TeamEditorView | null;
}

export interface SeasonEditorView {
  readonly isOpen: boolean;
  readonly datePlaceholder: string;
  readonly dateOpenLabel: string;
  readonly dateDialogTitle: string;
  readonly dateCloseLabel: string;
  readonly heading: string;
  readonly intro: string;
  readonly slug: AdminFieldView;
  readonly name: AdminFieldView;
  readonly startsOn: AdminDateFieldView;
  readonly endsOn: AdminDateFieldView;
  readonly statusLabel: string;
  readonly statusHint: string;
  readonly statusValue: string;
  readonly statusOptions: readonly SelectFieldOption[];
  readonly onStatusChange: (value: string) => void;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

export interface SeasonsWorkspaceView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly notice: string | null;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly rows: readonly AdminRecordRowView[];
  readonly canManage: boolean;
  readonly openCreateLabel: string;
  readonly onOpenCreate: () => void;
  readonly editor: SeasonEditorView | null;
}

/** One cell of the matrix: whether a role bundle grants one permission. */
interface MatrixCellView {
  readonly roleKey: string;
  readonly isGranted: boolean;
  readonly label: string;
}

export interface MatrixRowView {
  readonly key: string;
  readonly permission: string;
  readonly area: string;
  readonly description: string;
  readonly cells: readonly MatrixCellView[];
}

export interface MatrixColumnView {
  readonly key: string;
  readonly label: string;
  readonly isSystem: boolean;
}

export interface PermissionsMatrixView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly notice: string;
  readonly policyVersionLabel: string;
  readonly permissionColumnLabel: string;
  readonly countSummary: string;
  readonly areaLabel: string;
  readonly area: string;
  readonly areaOptions: readonly SelectFieldOption[];
  readonly onAreaChange: (value: string) => void;
  readonly systemRoleLabel: string;
  readonly columns: readonly MatrixColumnView[];
  readonly rows: readonly MatrixRowView[];
}

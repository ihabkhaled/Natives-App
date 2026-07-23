import type { AsyncViewStatus, RecordListRow, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** The scope, grants, and connectivity every admin screen resolves. */
export interface AdminContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canReadSettings: boolean;
  readonly canManageSettings: boolean;
  readonly canManageRoles: boolean;
  readonly canManageRules: boolean;
  readonly canReadAudit: boolean;
  readonly canManageOutbox: boolean;
  /** Global `platform.admin` — only a teamless grant ever satisfies it. */
  readonly canManagePlatform: boolean;
  readonly isLoading: boolean;
}

export interface AdminHubCardView {
  readonly key: string;
  readonly title: string;
  readonly note: string;
  readonly openLabel: string;
  readonly onOpen: () => void;
}

export interface AdminHubView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly cards: readonly AdminHubCardView[];
}

/** Admin rows are the shared record-list row; there is no admin-only shape. */
export type AdminFactRowView = RecordListRow;

export interface SettingVersionFormView {
  readonly heading: string;
  readonly intro: string;
  readonly effectiveFromLabel: string;
  readonly effectiveFromValue: string;
  readonly valueLabel: string;
  readonly valueValue: string;
  readonly noteLabel: string;
  readonly noteValue: string;
  readonly validationMessage: string | null;
  readonly submitLabel: string;
  readonly isSaving: boolean;
  readonly canSubmit: boolean;
  readonly onEffectiveFromChange: (value: string) => void;
  readonly onValueChange: (value: string) => void;
  readonly onNoteChange: (value: string) => void;
  readonly onSubmit: () => void;
}

export interface AdminSettingsView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly readOnlyNotice: string | null;
  readonly effectiveHeading: string;
  readonly effectiveIntro: string;
  readonly asOfLabel: string;
  readonly effectiveRows: readonly AdminFactRowView[];
  readonly settingKeyLabel: string;
  readonly settingKey: string;
  readonly settingKeyOptions: readonly SelectFieldOption[];
  readonly versionsHeading: string;
  readonly versionsIntro: string;
  readonly versionRows: readonly AdminFactRowView[];
  readonly versionForm: SettingVersionFormView | null;
  readonly seasonsHeading: string;
  readonly seasonsIntro: string;
  readonly seasonRows: readonly AdminFactRowView[];
  readonly venuesHeading: string;
  readonly venuesIntro: string;
  readonly venueRows: readonly AdminFactRowView[];
  readonly catalogHeading: string;
  readonly catalogIntro: string;
  readonly catalogLabel: string;
  readonly catalog: string;
  readonly catalogOptions: readonly SelectFieldOption[];
  readonly catalogRows: readonly AdminFactRowView[];
  readonly onSettingKeyChange: (value: string) => void;
  readonly onCatalogChange: (value: string) => void;
}

export interface RoleToggleView {
  readonly key: string;
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

/** The labels and toggles the roles panel renders, built once by its helper. */
export interface RolesPanelLabels {
  readonly memberLabel: string;
  readonly memberValue: string;
  readonly memberOptions: readonly SelectFieldOption[];
  readonly selectPrompt: string;
  readonly hasSelection: boolean;
  readonly currentHeading: string;
  readonly currentLabel: string;
  readonly assignableHeading: string;
  readonly ceilingNotice: string;
  readonly noAssignableLabel: string | null;
  readonly toggles: readonly RoleToggleView[];
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reasonValue: string;
  readonly validationMessage: string | null;
  readonly saveLabel: string;
}

export interface AdminRolesView extends ScreenCopy, RolesPanelLabels {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly isSaving: boolean;
  readonly canSave: boolean;
  readonly onMemberChange: (value: string) => void;
  readonly onReasonChange: (value: string) => void;
  readonly onSave: () => void;
}

interface RuleTransitionActionView {
  readonly key: string;
  readonly label: string;
  readonly tone: string;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

export interface RuleSimulationView {
  readonly heading: string;
  readonly intro: string;
  readonly memberLabel: string;
  readonly memberValue: string;
  readonly memberOptions: readonly SelectFieldOption[];
  readonly runLabel: string;
  readonly isRunning: boolean;
  readonly validationMessage: string | null;
  readonly rows: readonly AdminFactRowView[];
  readonly onMemberChange: (value: string) => void;
  readonly onRun: () => void;
}

export interface RuleRowView {
  readonly ruleId: string;
  readonly name: string;
  readonly versionLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly effectiveLabel: string;
  readonly openLabel: string;
  readonly isSelected: boolean;
}

export interface RuleDetailView {
  readonly heading: string;
  readonly entriesHeading: string;
  readonly entriesIntro: string;
  readonly entryRows: readonly AdminFactRowView[];
  readonly lifecycleHeading: string;
  readonly lifecycleIntro: string;
  readonly publishBlockedNotice: string | null;
  readonly actions: readonly RuleTransitionActionView[];
  readonly simulation: RuleSimulationView;
}

export interface AdminRulesView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly readOnlyNotice: string | null;
  readonly familyLabel: string;
  readonly family: string;
  readonly familyOptions: readonly SelectFieldOption[];
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly SelectFieldOption[];
  readonly countLabel: string;
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly rows: readonly RuleRowView[];
  readonly selectPrompt: string;
  readonly detail: RuleDetailView | null;
  readonly onFamilyChange: (value: string) => void;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onSelect: (ruleId: string) => void;
}

/** One super administrator row: identity facts plus the guarded revoke. */
export interface SuperAdminRowView {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly sinceLabel: string;
  readonly grantedByLabel: string;
  readonly revokeLabel: string;
  readonly canRevoke: boolean;
  readonly onRevoke: () => void;
}

export interface AdminPlatformView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly rosterHeading: string;
  readonly rosterIntro: string;
  readonly auditNotice: string;
  readonly rows: readonly SuperAdminRowView[];
  readonly promoteHeading: string;
  readonly promoteIntro: string;
  readonly userIdLabel: string;
  readonly userIdPlaceholder: string;
  readonly userIdValue: string;
  readonly onUserIdChange: (value: string) => void;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reasonValue: string;
  readonly onReasonChange: (value: string) => void;
  readonly validationMessage: string | null;
  readonly promoteLabel: string;
  readonly isPromoting: boolean;
  readonly canPromote: boolean;
  readonly onPromote: () => void;
}

export interface DeadLetterRowView {
  readonly eventId: string;
  readonly eventType: string;
  readonly attemptsLabel: string;
  readonly failedAtLabel: string;
  readonly failureCode: string;
  readonly replayLabel: string;
  readonly canReplay: boolean;
  readonly onReplay: () => void;
}

export interface AdminOperationsView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly outboxHeading: string;
  readonly outboxIntro: string;
  readonly outboxMetrics: readonly AdminFactRowView[];
  readonly outboxRefreshLabel: string;
  readonly deadLetterHeading: string;
  readonly deadLetterIntro: string;
  readonly deadLetterNotice: string;
  readonly deadLetterEmptyLabel: string;
  readonly deadLetterRows: readonly DeadLetterRowView[];
  readonly jobHeading: string;
  readonly jobIntro: string;
  readonly jobRows: readonly AdminFactRowView[];
  readonly auditHeading: string;
  readonly auditIntro: string;
  readonly auditNotice: string;
  readonly auditRows: readonly AdminFactRowView[];
}

import type { AsyncViewCopy } from '@/shared/types';

import type { LifecycleAction, MemberRole, MembershipStatus } from '../constants/members.constants';

/**
 * Prepared, fully-translated view models handed to the presentational members
 * components. Every label is resolved here so the components stay UI-only.
 */
export type MembersDirectoryStatus =
  'loading' | 'error' | 'offline' | 'forbidden' | 'empty' | 'noMatches' | 'ready';

export type MemberProfileStatus =
  'loading' | 'error' | 'offline' | 'forbidden' | 'notFound' | 'ready';

export interface MemberCardView {
  readonly membershipId: string;
  readonly name: string;
  readonly nickname: string | null;
  readonly avatarLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly jerseyLabel: string | null;
  readonly positionsSummary: string | null;
  readonly ariaLabel: string;
}

interface StatusFilterOptionView {
  readonly value: MembershipStatus;
  readonly label: string;
}

export interface MembersFilterView {
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly statusLabel: string;
  readonly allLabel: string;
  readonly status: MembershipStatus | null;
  readonly statusOptions: readonly StatusFilterOptionView[];
  readonly onStatusChange: (value: MembershipStatus | null) => void;
  readonly positionLabel: string;
  readonly position: string | null;
  readonly positionOptions: readonly string[];
  readonly onPositionChange: (value: string | null) => void;
}

/** Shared fields for the invite and self-edit inline forms. */
interface MemberEditFormView {
  readonly openLabel: string;
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly title: string;
  readonly fullNameLabel: string;
  readonly fullName: string;
  readonly onFullNameChange: (value: string) => void;
  readonly fullNameError: string | null;
  readonly nicknameLabel: string;
  readonly nickname: string;
  readonly onNicknameChange: (value: string) => void;
  readonly jerseyLabel: string;
  readonly jersey: string;
  readonly onJerseyChange: (value: string) => void;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}

export interface InviteFormView extends MemberEditFormView {
  readonly canInvite: boolean;
  readonly fullNamePlaceholder: string;
}

export interface MembersDirectoryView extends AsyncViewCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly rosterLabel: string;
  readonly status: MembersDirectoryStatus;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly countSummary: string;
  readonly listHeightPx: number;
  readonly items: readonly MemberCardView[];
  readonly onSelectMember: (membershipId: string) => void;
  readonly filter: MembersFilterView;
  readonly invite: InviteFormView;
}

export interface ProfileFieldView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface MemberAvatarView {
  readonly label: string;
  readonly imageAlt: string;
  readonly name: string;
  readonly url: string | null;
  readonly canUpload: boolean;
  readonly uploadLabel: string;
  readonly uploadingLabel: string;
  readonly isUploading: boolean;
  readonly onUpload: () => void;
}

export interface LifecycleActionOptionView {
  readonly action: LifecycleAction;
  readonly label: string;
  readonly tone: 'primary' | 'secondary' | 'danger';
}

export interface LifecyclePanelView {
  readonly heading: string;
  readonly canManage: boolean;
  readonly noActionsLabel: string;
  readonly actions: readonly LifecycleActionOptionView[];
  readonly isSubmitting: boolean;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reason: string;
  readonly onReasonChange: (value: string) => void;
  readonly onAction: (action: LifecycleAction) => void;
}

export interface RoleToggleView {
  readonly role: MemberRole;
  readonly label: string;
  readonly checked: boolean;
  readonly disabled: boolean;
}

export interface RolesPanelView {
  readonly heading: string;
  readonly description: string;
  readonly ceilingNotice: string | null;
  readonly emptyLabel: string;
  readonly canManage: boolean;
  readonly roles: readonly RoleToggleView[];
  readonly onToggle: (role: MemberRole) => void;
  readonly saveLabel: string;
  readonly savingLabel: string;
  readonly isSaving: boolean;
  readonly isDirty: boolean;
  readonly onSave: () => void;
}

interface AliasItemView {
  readonly id: string;
  readonly alias: string;
  readonly removeLabel: string;
}

export interface AliasesPanelView {
  readonly heading: string;
  readonly canManage: boolean;
  readonly emptyLabel: string;
  readonly items: readonly AliasItemView[];
  readonly addLabel: string;
  readonly addPlaceholder: string;
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly addButtonLabel: string;
  readonly isBusy: boolean;
  readonly onAdd: () => void;
  readonly onRemove: (aliasId: string) => void;
}

export interface HistoryItemView {
  readonly id: string;
  readonly transitionLabel: string;
  readonly reasonLabel: string | null;
  readonly actorLabel: string;
  readonly timeLabel: string;
}

export interface HistoryPanelView {
  readonly heading: string;
  readonly canView: boolean;
  readonly emptyLabel: string;
  readonly items: readonly HistoryItemView[];
}

export interface SelfEditView extends MemberEditFormView {
  readonly canEdit: boolean;
}

export interface MemberProfileHeaderView {
  readonly name: string;
  readonly nickname: string | null;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly avatar: MemberAvatarView;
}

export interface MemberProfileView extends AsyncViewCopy {
  readonly title: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly status: MemberProfileStatus;
  readonly notFoundTitle: string;
  readonly notFoundMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly header: MemberProfileHeaderView | null;
  readonly fieldsHeading: string;
  readonly restrictedNotice: string | null;
  readonly fields: readonly ProfileFieldView[];
  readonly selfEdit: SelfEditView;
  readonly lifecycle: LifecyclePanelView;
  readonly roles: RolesPanelView;
  readonly aliases: AliasesPanelView;
  readonly history: HistoryPanelView;
}

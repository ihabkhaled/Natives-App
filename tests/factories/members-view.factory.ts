import { LIFECYCLE_ACTION, MEMBER_ROLE } from '@/modules/members';
import type {
  AliasesPanelView,
  HistoryPanelView,
  InviteFormView,
  LifecyclePanelView,
  MemberAvatarView,
  MemberCardView,
  MemberProfileHeaderView,
  MemberProfileView,
  MembersDirectoryView,
  MembersFilterView,
  RolesPanelView,
  SelfEditView,
} from '@/modules/members/types/members-view.types';

const noop = (): void => undefined;

const ASYNC_COPY = {
  loadingLabel: 'Loading…',
  errorTitle: 'Error',
  errorMessage: 'Failed',
  retryLabel: 'Retry',
  onRetry: noop,
  offlineTitle: 'Offline',
  offlineMessage: 'Reconnect',
  offlineNoticeLabel: 'Offline',
  isOffline: false,
} as const;

function buildInviteFormView(overrides: Partial<InviteFormView> = {}): InviteFormView {
  return {
    canInvite: true,
    openLabel: 'Invite member',
    isOpen: false,
    onOpen: noop,
    onClose: noop,
    title: 'Invite a member',
    intro: 'Send an account invitation by email.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    email: '',
    onEmailChange: noop,
    emailError: null,
    roleLabel: 'Access level',
    roleHint: 'Team roles are assigned later.',
    role: 'user',
    roleOptions: [
      { value: 'user', label: 'Member' },
      { value: 'admin', label: 'Administrator' },
    ],
    onRoleChange: noop,
    profileHeading: 'Roster profile',
    profileIntro: 'How this person appears in the directory.',
    errorMessage: null,
    sent: null,
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'e.g. Omar',
    fullName: '',
    onFullNameChange: noop,
    fullNameError: null,
    nicknameLabel: 'Nickname',
    nickname: '',
    onNicknameChange: noop,
    jerseyLabel: 'Jersey number',
    jersey: '',
    onJerseyChange: noop,
    submitLabel: 'Send invite',
    submittingLabel: 'Sending…',
    cancelLabel: 'Cancel',
    isSubmitting: false,
    onSubmit: noop,
    ...overrides,
  };
}

export function buildMemberCardView(overrides: Partial<MemberCardView> = {}): MemberCardView {
  return {
    membershipId: 'mem-1',
    name: 'Omar Hassan',
    nickname: 'Omo',
    avatarLabel: 'Omar Hassan',
    statusLabel: 'Active',
    statusTone: 'success',
    jerseyLabel: '#7',
    positionsSummary: 'handler · cutter',
    ariaLabel: 'Omar Hassan',
    ...overrides,
  };
}

function buildMembersFilterView(overrides: Partial<MembersFilterView> = {}): MembersFilterView {
  return {
    searchLabel: 'Search members',
    searchPlaceholder: 'Search…',
    search: '',
    onSearchChange: noop,
    statusLabel: 'Status',
    allLabel: 'All',
    status: null,
    statusOptions: [{ value: 'active', label: 'Active' }],
    onStatusChange: noop,
    positionLabel: 'Position',
    position: null,
    positionOptions: ['handler'],
    onPositionChange: noop,
    ...overrides,
  };
}

export function buildMembersDirectoryView(
  overrides: Partial<MembersDirectoryView> = {},
): MembersDirectoryView {
  return {
    ...ASYNC_COPY,
    title: 'Members',
    subtitle: 'Everyone in your team.',
    rosterLabel: 'Member directory',
    status: 'ready',
    emptyTitle: 'No members yet',
    emptyMessage: 'Invite your first member.',
    noMatchesTitle: 'No matches',
    noMatchesMessage: 'Nothing matches.',
    forbiddenTitle: 'No access',
    forbiddenMessage: 'Not allowed.',
    countSummary: '1 of 1 members',
    listHeightPx: 560,
    items: [buildMemberCardView()],
    onSelectMember: noop,
    filter: buildMembersFilterView(),
    invite: buildInviteFormView(),
    ...overrides,
  };
}

function buildMemberAvatarView(overrides: Partial<MemberAvatarView> = {}): MemberAvatarView {
  return {
    label: 'Member avatar',
    imageAlt: 'Photo of Omar',
    name: 'Omar',
    url: null,
    canUpload: false,
    uploadLabel: 'Change photo',
    uploadingLabel: 'Uploading…',
    isUploading: false,
    onUpload: noop,
    ...overrides,
  };
}

function buildLifecyclePanelView(overrides: Partial<LifecyclePanelView> = {}): LifecyclePanelView {
  return {
    heading: 'Membership',
    canManage: false,
    noActionsLabel: 'No actions available.',
    actions: [{ action: LIFECYCLE_ACTION.suspend, label: 'Suspend', tone: 'danger' }],
    isSubmitting: false,
    reasonLabel: 'Reason',
    reasonPlaceholder: 'Add context',
    reason: '',
    onReasonChange: noop,
    onAction: noop,
    ...overrides,
  };
}

function buildRolesPanelView(overrides: Partial<RolesPanelView> = {}): RolesPanelView {
  return {
    heading: 'Roles',
    description: 'Roles control access.',
    ceilingNotice: 'Ceiling applies.',
    emptyLabel: 'No roles assigned.',
    canManage: false,
    roles: [{ role: MEMBER_ROLE.coach, label: 'Coach', checked: false, disabled: false }],
    onToggle: noop,
    saveLabel: 'Save roles',
    savingLabel: 'Saving…',
    isSaving: false,
    isDirty: false,
    onSave: noop,
    ...overrides,
  };
}

function buildAliasesPanelView(overrides: Partial<AliasesPanelView> = {}): AliasesPanelView {
  return {
    heading: 'Aliases',
    canManage: false,
    emptyLabel: 'No aliases recorded.',
    items: [{ id: 'a1', alias: 'O-Train', removeLabel: 'Remove O-Train' }],
    addLabel: 'Add an alias',
    addPlaceholder: 'Another name',
    draft: '',
    onDraftChange: noop,
    addButtonLabel: 'Add',
    isBusy: false,
    onAdd: noop,
    onRemove: noop,
    ...overrides,
  };
}

function buildHistoryPanelView(overrides: Partial<HistoryPanelView> = {}): HistoryPanelView {
  return {
    heading: 'Status history',
    canView: false,
    emptyLabel: 'No status changes recorded.',
    items: [
      {
        id: 'h1',
        transitionLabel: 'invited → active',
        reasonLabel: 'Reason: joined',
        actorLabel: 'System',
        timeLabel: '19 Jul 2026',
      },
    ],
    ...overrides,
  };
}

function buildSelfEditView(overrides: Partial<SelfEditView> = {}): SelfEditView {
  return {
    canEdit: false,
    openLabel: 'Edit my profile',
    isOpen: false,
    onOpen: noop,
    onClose: noop,
    title: 'Edit your profile',
    fullNameLabel: 'Full name',
    fullName: 'Omar',
    onFullNameChange: noop,
    fullNameError: null,
    nicknameLabel: 'Nickname',
    nickname: '',
    onNicknameChange: noop,
    jerseyLabel: 'Jersey number',
    jersey: '',
    onJerseyChange: noop,
    submitLabel: 'Save changes',
    submittingLabel: 'Saving…',
    cancelLabel: 'Cancel',
    isSubmitting: false,
    onSubmit: noop,
    ...overrides,
  };
}

function buildMemberProfileHeaderView(
  overrides: Partial<MemberProfileHeaderView> = {},
): MemberProfileHeaderView {
  return {
    name: 'Omar Hassan',
    nickname: 'Omo',
    statusLabel: 'Active',
    statusTone: 'success',
    avatar: buildMemberAvatarView(),
    ...overrides,
  };
}

export function buildMemberProfileView(
  overrides: Partial<MemberProfileView> = {},
): MemberProfileView {
  return {
    ...ASYNC_COPY,
    title: 'Member profile',
    backLabel: 'Back to members',
    onBack: noop,
    status: 'ready',
    notFoundTitle: 'Member not found',
    notFoundMessage: 'Not in this team.',
    forbiddenTitle: 'No access',
    forbiddenMessage: 'Not allowed.',
    header: buildMemberProfileHeaderView(),
    fieldsHeading: 'Profile',
    restrictedNotice: null,
    fields: [{ key: 'fullName', label: 'Full name', value: 'Omar Hassan' }],
    selfEdit: buildSelfEditView(),
    lifecycle: buildLifecyclePanelView(),
    roles: buildRolesPanelView(),
    aliases: buildAliasesPanelView(),
    history: buildHistoryPanelView(),
    ...overrides,
  };
}

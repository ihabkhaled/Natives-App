import type {
  AssignmentRowView,
  GrantPanelView,
  RoleAssignmentsScreenView,
} from '@/modules/role-assignments';

/** One revocable, team-scoped assignment row. */
export function buildAssignmentRowView(
  overrides: Partial<AssignmentRowView> = {},
): AssignmentRowView {
  return {
    id: 'assignment-1',
    roleLabel: 'Coach',
    scopeLabel: 'team-1',
    sinceLabel: 'Since 1 Jul 2026',
    grantedByLabel: 'Granted by admin-1',
    confirmMessage: 'user-1 · Coach · team-1',
    canRevoke: true,
    revokeLabel: 'Revoke',
    onRevoke: (): void => undefined,
    ...overrides,
  };
}

/** A grant form with a two-role catalog and a valid selection. */
export function buildGrantPanelView(overrides: Partial<GrantPanelView> = {}): GrantPanelView {
  return {
    heading: 'Roles you may assign',
    ceilingNotice: 'Only roles inside your own privilege ceiling are listed.',
    roleLabel: 'Team role',
    roleValue: 'coach',
    options: [
      { value: 'member', label: 'Member' },
      { value: 'coach', label: 'Coach' },
    ],
    onRoleChange: (): void => undefined,
    emptyCatalogMessage: null,
    submitLabel: 'Save roles',
    canSubmit: true,
    isGranting: false,
    onSubmit: (): void => undefined,
    ...overrides,
  };
}

/**
 * A ready screen with one row and a grant form. The container and view specs
 * share it so a change to the view shape lands in one place, not three.
 */
export function buildRoleAssignmentsScreenView(
  overrides: Partial<RoleAssignmentsScreenView> = {},
): RoleAssignmentsScreenView {
  return {
    path: '/admin/role-assignments',
    pageTitle: 'Role assignments',
    subtitle: 'Who holds which role, and on which team.',
    status: 'ready',
    targetLabel: 'User ID',
    targetPlaceholder: "The target account's user ID",
    targetValue: 'user-1',
    onTargetChange: (): void => undefined,
    listHeading: 'Assignments',
    listIntro: 'Grouped by the person who holds them.',
    countLabel: '1 assignments',
    notice: null,
    rows: [buildAssignmentRowView()],
    grant: buildGrantPanelView(),
    loadingLabel: 'Loading assignments…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Something went wrong',
    retryLabel: 'Try again',
    onRetry: (): void => undefined,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    offlineNoticeLabel: 'Reconnect to load the latest data.',
    isOffline: false,
    forbiddenTitle: 'Permission needed',
    forbiddenMessage: 'Grant the required permission to use this feature.',
    emptyTitle: 'No assignments yet',
    emptyMessage: 'Granting someone a role records it here.',
    ...overrides,
  };
}

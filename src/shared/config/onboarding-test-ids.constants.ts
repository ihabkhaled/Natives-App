/**
 * Invite-with-role onboarding test ids (P1): the invite form's two halves,
 * the server-driven role select, the invite receipt, and the accept-page
 * display-name field. Split out of the aggregate catalog so TEST_IDS stays
 * within its size budget; raw test ids remain forbidden everywhere else
 * (ESLint: architecture/no-inline-test-ids).
 */
export const ONBOARDING_TEST_IDS = {
  memberInviteForm: 'member-invite-form',
  memberInviteFullName: 'member-invite-full-name',
  memberInviteNickname: 'member-invite-nickname',
  memberInviteJersey: 'member-invite-jersey',
  memberInviteEmail: 'member-invite-email',
  memberInviteRole: 'member-invite-role',
  memberInviteRoleNotice: 'member-invite-role-notice',
  memberInviteError: 'member-invite-error',
  memberInviteSent: 'member-invite-sent',
  memberInviteSentTeam: 'member-invite-sent-team',
  memberInviteSentRole: 'member-invite-sent-role',
  memberInviteLink: 'member-invite-link',
  memberInviteCopyLink: 'member-invite-copy-link',
  memberInviteDone: 'member-invite-done',
  memberInviteSubmit: 'member-invite-submit',
  memberInviteCancel: 'member-invite-cancel',
  setPasswordDisplayNameInput: 'set-password-display-name-input',
} as const;

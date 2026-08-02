/**
 * Public team directory (`/team`) test ids. Split out of the aggregate catalog
 * so TEST_IDS stays within its size budget.
 */
export const TEAM_DIRECTORY_TEST_IDS = {
  teamDirectoryPage: 'team-directory-page',
  teamDirectoryHero: 'team-directory-hero',
  teamDirectorySeamNotice: 'team-directory-seam-notice',
  teamDirectoryStaffGroup: 'team-directory-staff-group',
  teamDirectoryRoster: 'team-directory-roster',
  teamDirectoryCard: 'team-directory-card',
  teamDirectoryAvatarPhoto: 'team-directory-avatar-photo',
  teamDirectoryAvatarInitials: 'team-directory-avatar-initials',
  teamDirectoryLoading: 'team-directory-loading',
  teamDirectoryError: 'team-directory-error',
  teamDirectoryOffline: 'team-directory-offline',
  teamDirectoryForbidden: 'team-directory-forbidden',
  teamDirectoryEmpty: 'team-directory-empty',
} as const;

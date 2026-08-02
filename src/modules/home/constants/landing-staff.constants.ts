/**
 * Season-Board 26-27 staff roster (see recovery-audit/specs/landing-site-and-team-directory.md).
 * Declaration home for this literal data (rule 08/20) until the team
 * directory endpoint ships (contract 1.8.0) and this becomes a query result —
 * see `helpers/landing-team-seam.helper.ts` for the seam this data feeds.
 */
export const STAFF_TITLE = {
  Coach: 'coach',
  CoCoach: 'co-coach',
  SpiritCaptain: 'spirit-captain',
  Finance: 'finance',
  SocialMedia: 'social-media',
  Analysis: 'analysis',
  Technical: 'technical',
} as const;

export type StaffTitle = (typeof STAFF_TITLE)[keyof typeof STAFF_TITLE];

export interface LandingStaffMember {
  readonly id: string;
  readonly name: string;
  readonly nickname: string;
  readonly titles: readonly StaffTitle[];
  /** Season-Board portrait served from `public/staff/`; null renders an initials avatar. */
  readonly photoUrl: string | null;
}

export const LANDING_STAFF: readonly LandingStaffMember[] = [
  {
    id: 'sherif-ashraf',
    name: 'Sherif Ashraf',
    nickname: '3alamy',
    titles: [STAFF_TITLE.Coach],
    photoUrl: '/staff/sherif-ashraf.jpg',
  },
  {
    id: 'khaled-ossama',
    name: 'Khaled Ossama',
    nickname: 'Doda',
    titles: [STAFF_TITLE.CoCoach],
    photoUrl: '/staff/khaled-ossama.jpg',
  },
  {
    id: 'rawan-elessawy',
    name: 'Rawan Elessawy',
    nickname: 'Roo',
    titles: [STAFF_TITLE.CoCoach],
    photoUrl: '/staff/rawan-elessawy.jpg',
  },
  {
    id: 'zahra',
    name: 'Zahra',
    nickname: 'Zoza',
    titles: [STAFF_TITLE.SpiritCaptain],
    photoUrl: '/staff/zahra.jpg',
  },
  {
    id: 'abdelrahman-elleimy',
    name: 'Abdelrahman Elleimy',
    nickname: 'Elleimy',
    titles: [STAFF_TITLE.Finance],
    photoUrl: '/staff/abdelrahman-elleimy.jpg',
  },
  {
    id: 'nourane',
    name: 'Nourane',
    nickname: 'Nour',
    titles: [STAFF_TITLE.SocialMedia],
    photoUrl: '/staff/nourane.jpg',
  },
  {
    id: 'lina',
    name: 'Lina',
    nickname: 'Lilo',
    titles: [STAFF_TITLE.SocialMedia],
    photoUrl: '/staff/lina.jpg',
  },
  {
    id: 'roaa',
    name: 'Roaa',
    nickname: 'Riri',
    titles: [STAFF_TITLE.SocialMedia],
    photoUrl: '/staff/roaa.jpg',
  },
  {
    id: 'ihab-khaled',
    name: 'Ihab Khaled',
    nickname: 'Hobz',
    titles: [STAFF_TITLE.Analysis, STAFF_TITLE.Technical],
    photoUrl: '/staff/ihab-khaled.jpg',
  },
] as const;

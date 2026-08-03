import type { TeamDirectoryResponseDto } from '@/modules/team-directory';

/**
 * The payload `GET /public/teams/{slug}/directory` returns.
 *
 * Deliberately richer than any one real response so the mapper and the screen
 * are proven against the awkward cases too: real portraits AND null ones side
 * by side, a player with positions and one with none, a title the client has
 * not learned yet, an untrimmed name, a plain `http` social URL a public page
 * must refuse to link out, and a shirt printed `011` that must survive as a
 * label rather than becoming eleven.
 *
 * Titles arrive as the words a human typed, not as codes — that is what the
 * API stores, and normalizing them is the mapper's job.
 */
export const MOCK_TEAM_DIRECTORY: TeamDirectoryResponseDto = {
  profile: {
    id: '8883cd2f-f6cb-45cc-aba0-ca4915fd5f7c',
    slug: 'un',
    name: 'Ultimate Natives',
    location: 'El Sheikh Zayed, Giza, Egypt',
    foundedOn: '2021-10-01',
    facebookUrl: 'https://www.facebook.com/ultimatenatives',
    instagramUrl: 'https://www.instagram.com/ultimatenatives',
    tiktokUrl: 'http://insecure.example.com/ultimatenatives',
  },
  staff: [
    {
      membershipId: 'staff-1',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      titles: ['Coach'],
      photoUrl: '/staff/sherif-ashraf.jpg',
    },
    {
      membershipId: 'staff-2',
      displayName: '  Rawan E  ',
      nickname: 'Rou',
      titles: ['Co-Coach'],
      photoUrl: null,
    },
    {
      membershipId: 'staff-3',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      titles: ['Analysis', 'Technical'],
      photoUrl: '/staff/ihab-khaled.jpg',
    },
    {
      membershipId: 'staff-4',
      displayName: 'Nourane Elsayed',
      nickname: 'Nouran',
      titles: ['Social Media & Marketing'],
      photoUrl: '/staff/nourane.jpg',
    },
    {
      membershipId: 'staff-5',
      displayName: 'Mai Ashraf',
      nickname: null,
      titles: ['Logistics'],
      photoUrl: null,
    },
  ],
  players: [
    {
      membershipId: 'player-1',
      displayName: 'Rawan E',
      nickname: 'Rou',
      jerseyNumber: '11',
      positions: ['Handler'],
      photoUrl: null,
    },
    {
      membershipId: 'player-2',
      displayName: 'Mahmoud Medhat',
      nickname: 'Medo',
      jerseyNumber: '011',
      positions: ['Cutter', 'Handler'],
      photoUrl: null,
    },
    {
      membershipId: 'player-3',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      jerseyNumber: '33',
      positions: ['Cutter'],
      photoUrl: '/staff/sherif-ashraf.jpg',
    },
    {
      membershipId: 'player-4',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      jerseyNumber: null,
      positions: [],
      photoUrl: null,
    },
  ],
  competitions: [
    {
      competitionId: 'comp-1',
      name: 'EUNC 2026',
      seasonName: 'Season 2026',
      competitionType: 'tournament',
      startsOn: null,
      endsOn: null,
    },
    {
      competitionId: 'comp-2',
      name: 'EUDL 2026',
      seasonName: 'Season 2026',
      competitionType: 'league',
      startsOn: null,
      endsOn: null,
    },
  ],
};

import type { TeamDirectoryResponseDto } from '@/modules/team-directory';

/**
 * The payload contract 1.8.0 pins for `GET /public/teams/{slug}/directory`.
 *
 * Deliberately richer than the app's current seed source so the mapper and the
 * screen are proven against the *live* shape rather than only the stub: real
 * portraits AND null ones side by side, a player with a position, an unknown
 * title code the client has not learned yet, an untrimmed name, and a plain
 * `http` social URL a public page must refuse to link out.
 */
export const MOCK_TEAM_DIRECTORY: TeamDirectoryResponseDto = {
  team: {
    slug: 'ultimate-natives',
    name: 'Ultimate Natives',
    location: 'El Sheikh Zayed, Giza, Egypt',
    foundedOn: '2021-10',
    socialUrls: [
      'https://www.facebook.com/ultimatenatives',
      'https://www.instagram.com/ultimatenatives',
      'https://www.tiktok.com/@ultimate.natives',
      'http://insecure.example.com/ultimatenatives',
    ],
  },
  staff: [
    {
      id: 'staff-1',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      titles: ['coach'],
      photoUrl: '/staff/3alamy.jpg',
    },
    {
      id: 'staff-2',
      displayName: '  Rawan Elessawy  ',
      nickname: 'Roo',
      titles: ['CO-COACH'],
      photoUrl: null,
    },
    {
      id: 'staff-3',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      titles: ['analysis', 'technical', 'co-coach'],
      photoUrl: null,
    },
    {
      id: 'staff-4',
      displayName: 'Mai Ashraf',
      nickname: null,
      titles: ['logistics'],
      photoUrl: null,
    },
  ],
  players: [
    {
      id: 'player-1',
      displayName: 'Rawan Elessawy',
      nickname: 'Roo',
      jerseyNumber: 11,
      position: 'Handler',
      photoUrl: null,
    },
    {
      id: 'player-2',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      jerseyNumber: 33,
      position: 'Cutter',
      photoUrl: '/staff/3alamy.jpg',
    },
    {
      id: 'player-3',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      jerseyNumber: null,
      position: null,
      photoUrl: null,
    },
  ],
};

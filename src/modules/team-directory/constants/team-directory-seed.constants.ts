import { SOCIAL_LINKS } from '@/shared/config';

import { STAFF_TITLE, TEAM_DIRECTORY_SLUG } from '../team-directory.constants';
import type { TeamDirectoryResponseDto } from '../types/team-directory.types';

/**
 * TODO(team-directory-endpoint): delete once contract 1.8.0 is wired up.
 *
 * The confirmed Season Board 26/27 and team facts, shaped exactly like the
 * payload `GET /public/teams/{slug}/directory` will return, so the public page
 * renders the real people today and the swap to the live endpoint is a
 * one-file change in `services/load-team-directory.service.ts`.
 *
 * Titles are the user's corrected responsibilities, NOT the words printed on
 * the season-board images (the images label Sherif "CAPTAIN" and Khaled/Rawan
 * "CO CAPTAIN"; the team confirmed Coach and Co-Coach).
 *
 * `photoUrl` is null for everyone until the season-board images land in
 * `src/assets/staff/` (or an admin upload flow exists) — the card falls back
 * to a branded initials avatar, by design rather than by accident.
 */
export const TEAM_DIRECTORY_SEED_RESPONSE: TeamDirectoryResponseDto = {
  team: {
    slug: TEAM_DIRECTORY_SLUG,
    name: 'Ultimate Natives',
    location: 'El Sheikh Zayed, Giza, Egypt',
    foundedOn: '2021-10',
    socialUrls: SOCIAL_LINKS.map((social) => social.href),
  },
  staff: [
    {
      id: 'staff-3alamy',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      titles: [STAFF_TITLE.Coach],
      photoUrl: null,
    },
    {
      id: 'staff-doda',
      displayName: 'Khaled Ossama',
      nickname: 'Doda',
      titles: [STAFF_TITLE.CoCoach],
      photoUrl: null,
    },
    {
      id: 'staff-roo',
      displayName: 'Rawan Elessawy',
      nickname: 'Roo',
      titles: [STAFF_TITLE.CoCoach],
      photoUrl: null,
    },
    {
      id: 'staff-zoza',
      displayName: 'Zahra',
      nickname: 'Zoza',
      titles: [STAFF_TITLE.SpiritCaptain],
      photoUrl: null,
    },
    {
      id: 'staff-elleimy',
      displayName: 'Abdelrahman Elleimy',
      nickname: 'Elleimy',
      titles: [STAFF_TITLE.Finance],
      photoUrl: null,
    },
    {
      id: 'staff-nour',
      displayName: 'Nourane',
      nickname: 'Nour',
      titles: [STAFF_TITLE.SocialMediaMarketing],
      photoUrl: null,
    },
    {
      id: 'staff-lilo',
      displayName: 'Lina',
      nickname: 'Lilo',
      titles: [STAFF_TITLE.SocialMediaMarketing],
      photoUrl: null,
    },
    {
      id: 'staff-riri',
      displayName: 'Roaa',
      nickname: 'Riri',
      titles: [STAFF_TITLE.SocialMediaMarketing],
      photoUrl: null,
    },
    {
      id: 'staff-hobz',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      titles: [STAFF_TITLE.Analysis, STAFF_TITLE.Technical, STAFF_TITLE.CoCoach],
      photoUrl: null,
    },
  ],
  players: [
    {
      id: 'player-lilo',
      displayName: 'Lina',
      nickname: 'Lilo',
      jerseyNumber: '2',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-riri',
      displayName: 'Roaa',
      nickname: 'Riri',
      jerseyNumber: '4',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-roo',
      displayName: 'Rawan Elessawy',
      nickname: 'Roo',
      jerseyNumber: '11',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-zoza',
      displayName: 'Zahra',
      nickname: 'Zoza',
      jerseyNumber: '22',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-nour',
      displayName: 'Nourane',
      nickname: 'Nour',
      jerseyNumber: '23',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-3alamy',
      displayName: 'Sherif Ashraf',
      nickname: '3alamy',
      jerseyNumber: '33',
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-doda',
      displayName: 'Khaled Ossama',
      nickname: 'Doda',
      jerseyNumber: null,
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-elleimy',
      displayName: 'Abdelrahman Elleimy',
      nickname: 'Elleimy',
      jerseyNumber: null,
      position: null,
      photoUrl: null,
    },
    {
      id: 'player-hobz',
      displayName: 'Ihab Khaled',
      nickname: 'Hobz',
      jerseyNumber: null,
      position: null,
      photoUrl: null,
    },
  ],
};

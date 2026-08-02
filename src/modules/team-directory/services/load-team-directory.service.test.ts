import { describe, expect, it } from 'vitest';

import { STAFF_TITLE, TEAM_DIRECTORY_SLUG } from '../team-directory.constants';
import { loadTeamDirectory } from './load-team-directory.service';

describe('loadTeamDirectory (TODO seam)', () => {
  it('resolves the team profile the public page is built around', async () => {
    const directory = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(directory.team).toMatchObject({
      slug: TEAM_DIRECTORY_SLUG,
      name: 'Ultimate Natives',
      location: 'El Sheikh Zayed, Giza, Egypt',
      foundedOn: '2021-10',
    });
  });

  it('links only the confirmed https social profiles', async () => {
    const directory = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(directory.team.socialUrls).toEqual([
      'https://www.facebook.com/ultimatenatives',
      'https://www.instagram.com/ultimatenatives',
      'https://www.tiktok.com/@ultimate.natives',
    ]);
  });

  it('carries the whole confirmed season board', async () => {
    const { staff } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(staff.map((member) => member.nickname)).toEqual([
      '3alamy',
      'Doda',
      'Roo',
      'Zoza',
      'Elleimy',
      'Nour',
      'Lilo',
      'Riri',
      'Hobz',
    ]);
  });

  it('uses the corrected titles, never the words printed on the board images', async () => {
    const { staff } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);
    const titleOf = (nickname: string): readonly string[] =>
      staff.find((member) => member.nickname === nickname)?.titles ?? [];

    expect(titleOf('3alamy')).toEqual([STAFF_TITLE.Coach]);
    expect(titleOf('Doda')).toEqual([STAFF_TITLE.CoCoach]);
    expect(titleOf('Roo')).toEqual([STAFF_TITLE.CoCoach]);
    expect(titleOf('Zoza')).toEqual([STAFF_TITLE.SpiritCaptain]);
    expect(titleOf('Elleimy')).toEqual([STAFF_TITLE.Finance]);
    expect(titleOf('Hobz')).toEqual([
      STAFF_TITLE.Analysis,
      STAFF_TITLE.Technical,
      STAFF_TITLE.CoCoach,
    ]);
  });

  it('gives the three marketing leads the same responsibility', async () => {
    const { staff } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);
    const marketing = staff.filter((member) =>
      member.titles.includes(STAFF_TITLE.SocialMediaMarketing),
    );

    expect(marketing.map((member) => member.nickname)).toEqual(['Nour', 'Lilo', 'Riri']);
  });

  it('publishes no portrait yet, so every card falls back to initials', async () => {
    const directory = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(directory.staff.every((member) => member.photoUrl === null)).toBe(true);
    expect(directory.players.every((player) => player.photoUrl === null)).toBe(true);
  });

  it('orders the roster by the confirmed jersey numbers', async () => {
    const { players } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(players.slice(0, 6).map((player) => player.jerseyNumber)).toEqual([
      '2', '4', '11', '22', '23', '33',
    ]);
    expect(players.slice(6).every((player) => player.jerseyNumber === null)).toBe(true);
  });

  it('makes no network call while the endpoint is not deployed', async () => {
    await expect(loadTeamDirectory('any-other-slug')).resolves.toMatchObject({
      team: { slug: TEAM_DIRECTORY_SLUG },
    });
  });
});

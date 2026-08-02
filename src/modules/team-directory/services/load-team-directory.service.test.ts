import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

import { requestPublicTeamDirectory } from '../gateways/team-directory.gateway';
import { TEAM_DIRECTORY_SLUG } from '../team-directory.constants';
import { loadTeamDirectory } from './load-team-directory.service';

vi.mock('../gateways/team-directory.gateway', () => ({
  requestPublicTeamDirectory: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(requestPublicTeamDirectory).mockResolvedValue(MOCK_TEAM_DIRECTORY);
});

describe('loadTeamDirectory', () => {
  it('asks the public endpoint for the slug it was given', async () => {
    await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(requestPublicTeamDirectory).toHaveBeenCalledWith(TEAM_DIRECTORY_SLUG);
  });

  it('resolves the team profile the public page is built around', async () => {
    const directory = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(directory.team).toMatchObject({
      slug: 'un',
      name: 'Ultimate Natives',
      location: 'El Sheikh Zayed, Giza, Egypt',
    });
  });

  it('links only the confirmed https social profiles', async () => {
    const directory = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    // The fixture's TikTok url is plain http; a public page must not link it.
    expect(directory.team.socialUrls).toEqual([
      'https://www.facebook.com/ultimatenatives',
      'https://www.instagram.com/ultimatenatives',
    ]);
  });

  it('normalizes the titles the API stores as words into codes', async () => {
    const { staff } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(staff.map((member) => member.titles)).toEqual([
      ['coach'],
      ['co-coach'],
      ['analysis', 'technical'],
      ['social-media-marketing'],
      ['logistics'],
    ]);
  });

  it('orders the roster by jersey number, unnumbered shirts last', async () => {
    const { players } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    // "011" is a printed label: it ranks as eleven, not between "0" and "1".
    expect(players.map((player) => player.jerseyNumber)).toEqual(['011', '11', '33', null]);
  });

  it('carries each player through with the first of their positions', async () => {
    const { players } = await loadTeamDirectory(TEAM_DIRECTORY_SLUG);

    expect(players.map((player) => player.position)).toEqual(['Cutter', 'Handler', 'Cutter', null]);
  });
});

import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';
import type * as TeamDirectoryModule from '@/modules/team-directory';
import { requestPublicTeamDirectory } from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listPublicCompetitions } from './list-public-competitions.service';

// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it, so
// this cannot move into a shared helper — only the reset it pairs with can.
vi.mock('@/modules/team-directory', async (importOriginal) => {
  const actual = await importOriginal<typeof TeamDirectoryModule>();
  return { ...actual, requestPublicTeamDirectory: vi.fn() };
});
// jscpd:ignore-end

beforeEach(resetTeamDirectoryDouble);

describe('listPublicCompetitions', () => {
  it('resolves the competitions the team entered, addressable by slug', async () => {
    const competitions = await listPublicCompetitions();

    expect(competitions.map((entry) => entry.slug)).toEqual(['eunc-2026', 'eudl-2026']);
    expect(competitions.map((entry) => entry.name)).toEqual(['EUNC 2026', 'EUDL 2026']);
  });

  it('invents no result for a competition whose standing is unpublished', async () => {
    const competitions = await listPublicCompetitions();

    for (const competition of competitions) {
      expect(competition.rank).toBeNull();
      expect(competition.entrantCount).toBeNull();
      expect(competition.location).toBeNull();
      expect(competition.format).toBeNull();
    }
  });

  it('falls back to the season label for the year when there is no start date', async () => {
    const competitions = await listPublicCompetitions();

    // The fixture's competitions carry no dates — "Season 2026" is the only
    // place the year is recorded.
    expect(competitions.map((entry) => entry.year)).toEqual([2026, 2026]);
  });

  it('prefers the competition’s own start date over the season label', async () => {
    vi.mocked(requestPublicTeamDirectory).mockResolvedValue({
      ...MOCK_TEAM_DIRECTORY,
      competitions: [
        {
          competitionId: 'c1',
          name: 'Winter Cup',
          seasonName: 'Season 2026',
          competitionType: 'tournament',
          startsOn: '2025-12-14',
          endsOn: '2025-12-15',
        },
      ],
    });

    const [competition] = await listPublicCompetitions();

    expect(competition?.year).toBe(2025);
    expect(competition?.startDate).toBe('2025-12-14');
  });

  it('reports year zero rather than guessing when neither source has one', async () => {
    vi.mocked(requestPublicTeamDirectory).mockResolvedValue({
      ...MOCK_TEAM_DIRECTORY,
      competitions: [
        {
          competitionId: 'c1',
          name: 'Friendly',
          seasonName: 'Pre-season',
          competitionType: 'friendly',
          startsOn: null,
          endsOn: null,
        },
      ],
    });

    const [competition] = await listPublicCompetitions();

    expect(competition?.year).toBe(0);
  });
});

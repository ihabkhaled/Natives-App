import { screen, waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapTeamDirectoryResponse,
  TEAM_DIRECTORY_SLUG,
  TeamDirectoryContainer,
  type TeamDirectoryResponseDto,
} from '@/modules/team-directory';
import { getEnvironment } from '@/packages/environment';
import { changeAppLocale } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../setup/i18n-test.helper';
import { wireRealHttpClient } from '../setup/real-http-client.helper';
import { renderWithProviders } from '../setup/render-with-providers.helper';

vi.mock('@/platform', () => createPlatformMock());

function directoryUrl(slug: string): string {
  return `${getEnvironment().apiBaseUrl}/public/teams/${slug}/directory`;
}

async function fetchDirectory(slug: string): Promise<Response> {
  return fetch(directoryUrl(slug));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  // The page reads the public endpoint through the real client, over MSW.
  wireRealHttpClient();
});

afterEach(async () => {
  await changeAppLocale('en');
});

describe('public team directory screen (live endpoint)', () => {
  it('renders the season board grouped by responsibility', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Coach' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Social Media & Marketing' })).toBeInTheDocument();
    // Five known titles plus the bucket for one the client has not learned.
    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryStaffGroup)).toHaveLength(6);
  });

  it('shows published portraits and falls back to initials for the rest', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    // Both paths render on one page: a real portrait and the branded medallion.
    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryAvatarPhoto).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryAvatarInitials).length).toBeGreaterThan(0);
  });

  it('drops the coming-soon notice now the endpoint serves the page', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(TEST_IDS.teamDirectorySeamNotice)).not.toBeInTheDocument();
  });

  it('renders the whole page in Arabic when the visitor switches language', async () => {
    await changeAppLocale('ar');
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'المدرب' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'التحليل' })).toBeInTheDocument();
  });
});

describe('public team directory endpoint', () => {
  it('answers the documented route for the team slug', async () => {
    const response = await fetchDirectory(TEAM_DIRECTORY_SLUG);

    expect(response.status).toBe(200);
  });

  it('404s for a slug that is not this team', async () => {
    expect((await fetchDirectory('someone-else')).status).toBe(404);
  });

  it('maps the live payload into exactly the domain the screen already renders', async () => {
    const payload = (await (await fetchDirectory(TEAM_DIRECTORY_SLUG)).json()) as unknown;

    const directory = mapTeamDirectoryResponse(payload as TeamDirectoryResponseDto);

    expect(directory.team).toMatchObject({
      slug: TEAM_DIRECTORY_SLUG,
      name: 'Ultimate Natives',
      location: 'El Sheikh Zayed, Giza, Egypt',
      foundedOn: '2021-10-01',
    });
    expect(directory.team.socialUrls).not.toContain('http://insecure.example.com/ultimatenatives');
    expect(directory.staff.map((member) => member.displayName)).toContain('Rawan E');
    expect(directory.staff[1]?.titles).toEqual(['co-coach']);
    // "011" is a printed label and sorts as eleven, not between "0" and "1".
    expect(directory.players.map((player) => player.jerseyNumber)).toEqual([
      '011',
      '11',
      '33',
      null,
    ]);
  });

  it('keeps a published portrait and a missing one side by side', async () => {
    const payload = (await (await fetchDirectory(TEAM_DIRECTORY_SLUG)).json()) as unknown;

    const directory = mapTeamDirectoryResponse(payload as TeamDirectoryResponseDto);

    expect(directory.staff[0]?.photoUrl).toBe('/staff/sherif-ashraf.jpg');
    expect(directory.staff[1]?.photoUrl).toBeNull();
  });
});

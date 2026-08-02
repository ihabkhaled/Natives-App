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
});

afterEach(async () => {
  await changeAppLocale('en');
});

describe('public team directory screen (seam source)', () => {
  it('renders the season board grouped by responsibility', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Coach' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Social Media & Marketing' })).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.teamDirectoryStaffGroup)).toHaveLength(7);
  });

  it('falls back to a branded initials medallion for every person without a photo', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(TEST_IDS.teamDirectoryAvatarPhoto)).not.toBeInTheDocument();
    expect(
      screen.getAllByTestId(TEST_IDS.teamDirectoryAvatarInitials).length,
    ).toBeGreaterThanOrEqual(9);
    expect(screen.getAllByRole('img', { name: 'Sherif Ashraf' }).length).toBeGreaterThan(0);
  });

  it('stays honest that photos and the full roster are still to come', async () => {
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectorySeamNotice)).toBeInTheDocument();
    });
  });

  it('renders the whole page in Arabic when the visitor switches language', async () => {
    await changeAppLocale('ar');
    renderWithProviders(<TeamDirectoryContainer />, { initialPath: '/team' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'المدرب' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'كابتن الروح' })).toBeInTheDocument();
  });
});

describe('public team directory endpoint (contract 1.8.0, mocked)', () => {
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
      foundedOn: '2021-10',
    });
    expect(directory.team.socialUrls).not.toContain('http://insecure.example.com/ultimatenatives');
    expect(directory.staff.map((member) => member.displayName)).toContain('Rawan Elessawy');
    expect(directory.staff[1]?.titles).toEqual(['co-coach']);
    expect(directory.players.map((player) => player.jerseyNumber)).toEqual([11, 33, null]);
  });

  it('keeps a published portrait and a missing one side by side', async () => {
    const payload = (await (await fetchDirectory(TEAM_DIRECTORY_SLUG)).json()) as unknown;

    const directory = mapTeamDirectoryResponse(payload as TeamDirectoryResponseDto);

    expect(directory.staff[0]?.photoUrl).toBe('/staff/3alamy.jpg');
    expect(directory.staff[1]?.photoUrl).toBeNull();
  });
});

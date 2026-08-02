import { waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNetworkStatus } from '@/platform';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useTeamDirectoryScreen } from './use-team-directory-screen.hook';

vi.mock('@/platform', () => createPlatformMock());

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useTeamDirectoryScreen>>
> {
  return renderHookWithProviders(() => useTeamDirectoryScreen(), { initialPath: '/team' });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTeamDirectoryScreen', () => {
  it('pins the canonical path and distinct SEO metadata', () => {
    const { result } = renderScreen();

    expect(result.current.path).toBe('/team');
    expect(result.current.seoTitle).toBe('Our Team — Ultimate Natives');
    expect(result.current.seoDescription).toContain('Meet Ultimate Natives');
  });

  it('presents the loading state before the directory resolves', () => {
    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('becomes ready once the directory resolves', async () => {
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
  });

  it('groups the season board by responsibility, in display order', async () => {
    const { result } = renderScreen();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.staffGroups.map((group) => group.heading)).toEqual([
      'Coach',
      'Co-Coach',
      'Spirit Captain',
      'Finance',
      'Social Media & Marketing',
      'Analysis',
      'Technical',
    ]);
  });

  it('lists the whole active roster with a translated count', async () => {
    const { result } = renderScreen();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.rosterCards).toHaveLength(9);
    expect(result.current.rosterCountLabel).toBe('9 players listed so far');
  });

  it('publishes the team facts and social profiles in the hero', async () => {
    const { result } = renderScreen();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.hero.facts.map((fact) => fact.value)).toContain(
      'El Sheikh Zayed, Giza, Egypt',
    );
    expect(result.current.hero.socialLinks.map((social) => social.key)).toEqual([
      'facebook',
      'instagram',
      'tiktok',
    ]);
  });

  it('stays honest about the seam while the endpoint is not deployed', () => {
    const { result } = renderScreen();

    expect(result.current.isEndpointLive).toBe(false);
    expect(result.current.seamNoticeTitle).toBe('Photos and the full roster are on their way');
  });

  it('carries translated copy for every designed non-ready state', () => {
    const { result } = renderScreen();

    expect(result.current.loadingLabel).toBe('Loading the team directory…');
    expect(result.current.emptyTitle).toBe('The directory is not published yet');
    expect(result.current.retryLabel).toBe('Try again');
  });

  it('reports the offline state when connectivity drops before any data', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    const { result } = renderScreen();

    expect(result.current.isOffline).toBe(true);
  });
});

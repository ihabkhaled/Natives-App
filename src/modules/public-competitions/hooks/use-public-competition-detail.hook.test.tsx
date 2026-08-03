import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { createTestQueryClient } from '../../../../tests/setup/render-with-providers.helper';
import { usePublicCompetitionDetailScreen } from './use-public-competition-detail.hook';

beforeAll(async () => {
  await initTestI18n();
});

// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it, so
// this cannot move into a shared helper — only the reset it pairs with can.
vi.mock('@/modules/team-directory', async (importOriginal) => {
  const actual = await importOriginal<typeof TeamDirectoryModule>();
  return { ...actual, requestPublicTeamDirectory: vi.fn() };
});
// jscpd:ignore-end

beforeEach(resetTeamDirectoryDouble);

/**
 * The slug arrives from the matched route pattern, so the hook is mounted
 * behind the real `/results/:competitionSlug` route rather than a bare router.
 */
function renderAtSlug(initialPath: string) {
  const client = createTestQueryClient();
  function Wrapper(props: { readonly children: ReactNode }): ReactElement {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Route path="/results/:competitionSlug">{props.children}</Route>
          <Route exact path="/results">
            {props.children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }
  return renderHook(() => usePublicCompetitionDetailScreen(), { wrapper: Wrapper });
}

describe('usePublicCompetitionDetailScreen', () => {
  it('names the page after the competition once it resolves', async () => {
    const { result } = renderAtSlug('/results/eunc-2026');

    await waitFor(() => {
      expect(result.current.title).toBe('EUNC 2026');
    });
    expect(result.current.seoTitle).toBe('EUNC 2026 — Ultimate Natives');
    expect(result.current.path).toBe('/results/eunc-2026');
    expect(result.current.backLabel).toBe('All competitions');
  });

  it('presents the not-found copy for a slug the showcase does not publish', async () => {
    const { result } = renderAtSlug('/results/worlds-1998');

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(result.current.emptyTitle).toBe('We could not find that competition');
    expect(result.current.summary).toBeNull();
  });

  it('keeps waiting instead of guessing when the route produced no slug', () => {
    const { result } = renderAtSlug('/results');

    expect(result.current.status).toBe('loading');
    expect(result.current.summary).toBeNull();
  });

  it('publishes empty result blocks rather than fabricated scores', async () => {
    const { result } = renderAtSlug('/results/eudl-2026');

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.matches).toEqual([]);
    expect(result.current.leaderboard).toEqual([]);
    expect(result.current.matchesLabels.emptyTitle).toBe('No match results yet');
    expect(result.current.leaderboardLabels.emptyTitle).toBe('No leaderboard yet');
  });

  it('toggles one match row open, then closed', () => {
    const { result } = renderAtSlug('/results/eunc-2026');

    expect(result.current.expandedMatchKey).toBeNull();
    act(() => {
      result.current.onToggleMatch('match-1');
    });
    expect(result.current.expandedMatchKey).toBe('match-1');
    act(() => {
      result.current.onToggleMatch('match-1');
    });
    expect(result.current.expandedMatchKey).toBeNull();
  });

  it('moves the open row when a different match is expanded', () => {
    const { result } = renderAtSlug('/results/eunc-2026');

    act(() => {
      result.current.onToggleMatch('match-1');
    });
    act(() => {
      result.current.onToggleMatch('match-2');
    });
    expect(result.current.expandedMatchKey).toBe('match-2');
  });

  it('navigates back to the competition list', () => {
    const { result } = renderAtSlug('/results/eunc-2026');

    expect(() => {
      result.current.onBack();
    }).not.toThrow();
  });
});

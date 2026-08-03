import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { waitFor } from '@testing-library/react';
import { beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { usePublicCompetitionsScreen } from './use-public-competitions-screen.hook';

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

describe('usePublicCompetitionsScreen', () => {
  it('presents the loading state before the seam resolves', () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    expect(result.current.status).toBe('loading');
    expect(result.current.loadingLabel).toBe('Loading competitions…');
  });

  it('resolves the canonical public path for SEO metadata', () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    expect(result.current.path).toBe('/results');
    expect(result.current.seoTitle).toBe('Competitions & Results — Ultimate Natives');
    expect(result.current.seoDescription.length).toBeGreaterThan(0);
  });

  it('lists both seeded competitions once the seam resolves', async () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.cards.map((card) => card.name)).toEqual(['EUNC 2026', 'EUDL 2026']);
  });

  it('marks every seeded competition as results-pending rather than inventing a rank', async () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    await waitFor(() => {
      expect(result.current.cards.length).toBe(2);
    });
    for (const card of result.current.cards) {
      expect(card.isResultPending).toBe(true);
      expect(card.rankText).toBeNull();
    }
  });

  it('says plainly that live results are not connected yet', () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    expect(result.current.isSeamNoticeVisible).toBe(true);
    expect(result.current.seamNoticeTitle.length).toBeGreaterThan(0);
    expect(result.current.seamNoticeMessage.length).toBeGreaterThan(0);
  });

  it('exposes translated card labels for the pending state', () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen());

    expect(result.current.labels.finishPending).toBe('Results pending');
    expect(result.current.labels.notPublished).toBe('Not published yet');
  });

  it('navigates to the competition the visitor opened', async () => {
    const { result } = renderHookWithProviders(() => usePublicCompetitionsScreen(), {
      initialPath: '/results',
    });

    await waitFor(() => {
      expect(result.current.cards.length).toBe(2);
    });
    expect(() => {
      result.current.onOpenCompetition('/results/eunc-2026');
    }).not.toThrow();
  });
});

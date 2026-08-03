import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderRoute } from '../../../../tests/setup/render-with-providers.helper';
import { PublicCompetitionDetailContainer } from './public-competition-detail.container';

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

describe('PublicCompetitionDetailContainer', () => {
  it('composes the detail hook with the presentational view for the routed slug', async () => {
    renderRoute(
      '/results/eunc-2026',
      '/results/:competitionSlug',
      <PublicCompetitionDetailContainer />,
    );

    // 5s, not the 1s default: under v8 coverage instrumentation the query
    // settles well past a second, and the heading shows the section title
    // until it does.
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EUNC 2026');
      },
      { timeout: 5000 },
    );
    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailPage)).toBeInTheDocument();
  });
});

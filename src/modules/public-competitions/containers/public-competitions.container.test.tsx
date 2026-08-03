import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { PublicCompetitionsContainer } from './public-competitions.container';

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

describe('PublicCompetitionsContainer', () => {
  it('composes the screen hook with the presentational view', async () => {
    renderWithProviders(<PublicCompetitionsContainer />, { initialPath: '/results' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.publicCompetitionsList)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId(TEST_IDS.publicCompetitionCard)).toHaveLength(2);
  });
});

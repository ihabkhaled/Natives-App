import { screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { PublicCompetitionsContainer } from './public-competitions.container';

beforeAll(async () => {
  await initTestI18n();
});

describe('PublicCompetitionsContainer', () => {
  it('composes the screen hook with the presentational view', async () => {
    renderWithProviders(<PublicCompetitionsContainer />, { initialPath: '/results' });

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.publicCompetitionsList)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId(TEST_IDS.publicCompetitionCard)).toHaveLength(2);
  });
});

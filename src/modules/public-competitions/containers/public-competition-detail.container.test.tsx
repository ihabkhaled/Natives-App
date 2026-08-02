import { screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderRoute } from '../../../../tests/setup/render-with-providers.helper';
import { PublicCompetitionDetailContainer } from './public-competition-detail.container';

beforeAll(async () => {
  await initTestI18n();
});

describe('PublicCompetitionDetailContainer', () => {
  it('composes the detail hook with the presentational view for the routed slug', async () => {
    renderRoute(
      '/results/eunc-2026',
      '/results/:competitionSlug',
      <PublicCompetitionDetailContainer />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EUNC 2026');
    });
    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailPage)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { NewsSectionView } from '../../helpers/landing-news-seam.helper';
import { LandingNews } from './landing-news.component';

function view(): NewsSectionView {
  return {
    heading: 'News',
    intro: 'Announcements from the club.',
    chrome: {
      status: 'empty',
      loadingLabel: 'Loading…',
      errorTitle: 'Error',
      errorMessage: 'Error',
      retryLabel: 'Retry',
      onRetry: () => {},
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'Forbidden',
      forbiddenMessage: 'Forbidden',
      emptyTitle: 'No news yet',
      emptyMessage: 'The news feed is coming soon.',
    },
  };
}

describe('LandingNews', () => {
  it('renders the heading and the honest empty state', () => {
    render(<LandingNews view={view()} />);

    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByTestId('landing-news-empty')).toHaveTextContent('No news yet');
  });
});

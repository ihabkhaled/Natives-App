import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildNewsListScreenView } from '../../../../../tests/factories/news-view.factory';
import { NewsListView } from './news-list-view.component';

describe('NewsListView', () => {
  it('lists one card per story when the screen is ready', () => {
    render(<NewsListView {...buildNewsListScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.newsList)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsCard)).toHaveTextContent('First league win');
    expect(screen.getByText('Showing 1 of 1 stories')).toBeInTheDocument();
  });

  it('shows a skeleton instead of the grid while the read is pending', () => {
    render(<NewsListView {...buildNewsListScreenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.newsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsList)).not.toBeInTheDocument();
  });

  it('shows the designed empty state, still inside the page shell', () => {
    render(<NewsListView {...buildNewsListScreenView({ status: 'empty', items: [] })} />);

    expect(screen.getByTestId(TEST_IDS.newsEmpty)).toHaveTextContent(
      'The newsroom is almost ready',
    );
    expect(screen.getByTestId(TEST_IDS.newsPage)).toBeInTheDocument();
  });

  it('offers a retry from the designed error state', () => {
    const view = buildNewsListScreenView({ status: 'error' });
    render(<NewsListView {...view} />);
    fireEvent.click(screen.getByText('Try again'));

    expect(view.onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the offline state rather than an empty grid', () => {
    render(<NewsListView {...buildNewsListScreenView({ status: 'offline' })} />);

    expect(screen.getByTestId(TEST_IDS.newsOffline)).toBeInTheDocument();
  });

  it('renders NO newsroom affordance for a reader without the grant', () => {
    render(<NewsListView {...buildNewsListScreenView({ manageLabel: null })} />);

    expect(screen.queryByText('Newsroom')).not.toBeInTheDocument();
  });

  it('renders the newsroom entry for a session that may write', () => {
    const onManage = vi.fn();
    render(<NewsListView {...buildNewsListScreenView({ manageLabel: 'Newsroom', onManage })} />);
    fireEvent.click(screen.getByText('Newsroom'));

    expect(onManage).toHaveBeenCalledTimes(1);
  });

  it('opens a story from its card', () => {
    const onOpen = vi.fn();
    render(<NewsListView {...buildNewsListScreenView({ onOpen })} />);
    fireEvent.click(screen.getByText('Read the full story'));

    expect(onOpen).toHaveBeenCalledWith('first-league-win');
  });
});

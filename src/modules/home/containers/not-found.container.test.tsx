import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { NOT_FOUND_VIEW_TEST_IDS } from '../components/not-found-view/not-found-view.constants';
import { useNotFoundScreen } from '../hooks/use-not-found-screen.hook';
import { NotFoundContainer } from './not-found.container';

vi.mock('../hooks/use-not-found-screen.hook', () => ({ useNotFoundScreen: vi.fn() }));

const onGoHome = vi.fn();

beforeEach(() => {
  vi.mocked(useNotFoundScreen).mockReturnValue({
    title: 'Page not found',
    message: 'The page you are looking for does not exist.',
    goHomeLabel: 'Go home',
    onGoHome,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function getIonTitle(): Element | null {
  return document.body.querySelector('ion-title');
}

describe('NotFoundContainer', () => {
  it('renders the not-found page shell titled from the screen hook', () => {
    render(<NotFoundContainer />);

    expect(screen.getByTestId(TEST_IDS.notFoundPage)).toBeInTheDocument();
    expect(getIonTitle()).toHaveTextContent('Page not found');
  });

  it('feeds the view model into the not-found view', () => {
    render(<NotFoundContainer />);

    const emptyState = screen.getByTestId(TEST_IDS.emptyState);
    expect(emptyState).toHaveTextContent('Page not found');
    expect(emptyState).toHaveTextContent('The page you are looking for does not exist.');
  });

  it('wires go-home back to the screen hook', async () => {
    render(<NotFoundContainer />);

    await userEvent.click(screen.getByTestId(NOT_FOUND_VIEW_TEST_IDS.goHome));

    expect(onGoHome).toHaveBeenCalledOnce();
  });
});

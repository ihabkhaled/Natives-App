import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { NotFoundView } from './not-found-view.component';
import { NOT_FOUND_VIEW_TEST_IDS } from './not-found-view.constants';

const PROPS = {
  title: 'Page not found',
  message: 'The page you are looking for does not exist.',
  goHomeLabel: 'Go home',
};

function mountNotFound(onGoHome: () => void = vi.fn()): void {
  render(<NotFoundView {...PROPS} onGoHome={onGoHome} />);
}

describe('NotFoundView', () => {
  it('explains the dead route through the shared empty state', () => {
    mountNotFound();

    const emptyState = screen.getByTestId(TEST_IDS.emptyState);
    expect(emptyState).toHaveTextContent('Page not found');
    expect(emptyState).toHaveTextContent('The page you are looking for does not exist.');
  });

  it('offers a way home under its test id', () => {
    mountNotFound();

    expect(screen.getByTestId(NOT_FOUND_VIEW_TEST_IDS.goHome)).toHaveTextContent('Go home');
  });

  it('forwards a go-home click', async () => {
    const onGoHome = vi.fn();
    mountNotFound(onGoHome);

    await userEvent.click(screen.getByTestId(NOT_FOUND_VIEW_TEST_IDS.goHome));

    expect(onGoHome).toHaveBeenCalledOnce();
  });
});

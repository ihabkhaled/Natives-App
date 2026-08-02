import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PublicSectionPage } from './public-section-page.component';
import type { PublicSectionPageProps } from './public-section-page.types';

function props(overrides: Partial<PublicSectionPageProps> = {}): PublicSectionPageProps {
  return {
    view: {
      path: '/ultimate',
      eyebrow: 'New to the sport?',
      title: 'What is Ultimate Frisbee?',
      seoTitle: 'What is Ultimate Frisbee? — Ultimate Natives',
      seoDescription: 'A short explainer.',
    },
    testId: 'ultimate-page',
    children: <p>Body content</p>,
    ...overrides,
  };
}

describe('PublicSectionPage', () => {
  it('renders the shell at the given test id', () => {
    render(<PublicSectionPage {...props()} />);

    expect(screen.getByTestId('ultimate-page')).toBeInTheDocument();
  });

  it('renders the eyebrow and title as the page heading', () => {
    render(<PublicSectionPage {...props()} />);

    expect(screen.getByText('New to the sport?')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'What is Ultimate Frisbee?' }),
    ).toBeInTheDocument();
  });

  it('renders its children below the header', () => {
    render(<PublicSectionPage {...props()} />);

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

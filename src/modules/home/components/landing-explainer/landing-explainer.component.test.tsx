import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ExplainerSectionView } from '../../helpers/landing-static-sections.helper';
import { LandingExplainer } from './landing-explainer.component';

function view(): ExplainerSectionView {
  return {
    eyebrow: 'New to the sport?',
    heading: 'What is Ultimate Frisbee?',
    body: 'A fast-paced, self-officiated team sport played with a flying disc.',
  };
}

describe('LandingExplainer', () => {
  it('renders the heading and body', () => {
    render(<LandingExplainer view={view()} />);

    expect(screen.getByRole('heading', { name: 'What is Ultimate Frisbee?' })).toBeInTheDocument();
    expect(
      screen.getByText('A fast-paced, self-officiated team sport played with a flying disc.'),
    ).toBeInTheDocument();
  });
});

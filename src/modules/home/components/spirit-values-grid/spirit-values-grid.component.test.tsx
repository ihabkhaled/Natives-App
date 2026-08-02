import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpiritValuesGrid } from './spirit-values-grid.component';
import type { SpiritValuesGridProps } from './spirit-values-grid.types';

function props(overrides: Partial<SpiritValuesGridProps> = {}): SpiritValuesGridProps {
  return {
    heading: 'Spirit of the Game',
    intro: 'Every player is responsible for fair play.',
    values: [
      { key: 'fairness', title: 'Self-officiated fairness', body: 'Players call their own fouls.' },
      { key: 'respect', title: 'Respect for opponents', body: 'We compete fiercely and fairly.' },
    ],
    cardTestIdPrefix: 'spirit-value-card',
    ...overrides,
  };
}

describe('SpiritValuesGrid', () => {
  it('renders the heading and intro', () => {
    render(<SpiritValuesGrid {...props()} />);

    expect(screen.getByRole('heading', { name: 'Spirit of the Game' })).toBeInTheDocument();
    expect(screen.getByText('Every player is responsible for fair play.')).toBeInTheDocument();
  });

  it('renders one card per value with its title and body', () => {
    render(<SpiritValuesGrid {...props()} />);

    for (const value of props().values) {
      const card = screen.getByTestId(`spirit-value-card-${value.key}`);
      expect(card).toHaveTextContent(value.title);
      expect(card).toHaveTextContent(value.body);
    }
  });

  it('applies the optional section test id to the panel', () => {
    render(<SpiritValuesGrid {...props({ sectionTestId: 'landing-spirit-values' })} />);

    expect(screen.getByTestId('landing-spirit-values')).toBeInTheDocument();
  });
});

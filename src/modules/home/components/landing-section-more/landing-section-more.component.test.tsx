import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LandingSectionMore } from './landing-section-more.component';
import type { LandingSectionMoreProps } from './landing-section-more.types';

function props(overrides: Partial<LandingSectionMoreProps> = {}): LandingSectionMoreProps {
  return {
    view: { label: 'See more', onClick: vi.fn() },
    sectionKey: 'ultimate',
    ...overrides,
  };
}

describe('LandingSectionMore', () => {
  it('renders the link label', () => {
    render(<LandingSectionMore {...props()} />);

    expect(screen.getByText('See more')).toBeInTheDocument();
  });

  it('calls onClick when activated', () => {
    const onClick = vi.fn();
    render(<LandingSectionMore {...props({ view: { label: 'See more', onClick } })} />);

    fireEvent.click(screen.getByText('See more'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('scopes its test id to the section it belongs to', () => {
    render(<LandingSectionMore {...props({ sectionKey: 'team' })} />);

    expect(screen.getByTestId('landing-section-more-team')).toBeInTheDocument();
  });
});

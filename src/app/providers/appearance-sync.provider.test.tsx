import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppearanceSync } from './appearance-sync.provider';
import { useAppearanceSync } from './hooks/use-appearance-sync.hook';

vi.mock('./hooks/use-appearance-sync.hook', () => ({ useAppearanceSync: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('AppearanceSync', () => {
  it('renders nothing', () => {
    const { container } = render(<AppearanceSync />);

    expect(container).toBeEmptyDOMElement();
  });

  it('runs the appearance sync effect', () => {
    render(<AppearanceSync />);

    expect(useAppearanceSync).toHaveBeenCalledOnce();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrandLogo } from './brand-logo.component';
import { BRAND_LOGO_DEFAULT_TEST_ID, BRAND_LOGO_SRC } from './brand-logo.constants';

describe('BrandLogo', () => {
  it('renders the source logo with accessible alt text and the default test id', () => {
    render(<BrandLogo label="Ultimate Natives" />);

    const img = screen.getByRole('img', { name: 'Ultimate Natives' });
    expect(img).toHaveAttribute('src', BRAND_LOGO_SRC);
    expect(screen.getByTestId(BRAND_LOGO_DEFAULT_TEST_ID)).toBeInTheDocument();
  });

  it('applies the requested size variant', () => {
    render(<BrandLogo label="logo" size="lg" testId="hero-logo" />);

    expect(screen.getByTestId('hero-logo').className).toContain('size-28');
  });

  it('honours a custom test id', () => {
    render(<BrandLogo label="logo" testId="custom-logo" />);

    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
    expect(screen.queryByTestId(BRAND_LOGO_DEFAULT_TEST_ID)).not.toBeInTheDocument();
  });
});

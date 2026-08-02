import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { AboutPreviewSectionView } from '../../helpers/landing-static-sections.helper';
import { LandingAboutPreview } from './landing-about-preview.component';

function view(overrides: Partial<AboutPreviewSectionView> = {}): AboutPreviewSectionView {
  return {
    heading: 'Our story',
    quote: 'Founded in October 2021 by Captain Dalia Elgharib and Coach Youssef Aboutaleb.',
    ctaLabel: 'Read the full story',
    onCtaClick: vi.fn(),
    ...overrides,
  };
}

describe('LandingAboutPreview', () => {
  it('renders the founding quote', () => {
    render(<LandingAboutPreview view={view()} />);

    expect(screen.getByText(view().quote)).toBeInTheDocument();
  });

  it('navigates to the full About page on click', () => {
    const onCtaClick = vi.fn();
    render(<LandingAboutPreview view={view({ onCtaClick })} />);

    fireEvent.click(screen.getByTestId('landing-about-preview-cta'));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});

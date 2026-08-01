import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPublicFooterView } from '../../../../../tests/factories/public-footer-view.factory';

import type { PublicFooterView } from '../public-footer.types';
import { PublicFooter } from './public-footer.component';

function view(overrides: Partial<PublicFooterView> = {}): PublicFooterView {
  return buildPublicFooterView(overrides);
}

describe('PublicFooter', () => {
  it('renders nothing while hidden', () => {
    render(<PublicFooter {...view({ isVisible: false })} />);

    expect(screen.queryByTestId(TEST_IDS.publicFooter)).not.toBeInTheDocument();
  });

  it('shows the brand, tagline, and copyright', () => {
    render(<PublicFooter {...view()} />);

    expect(screen.getByTestId(TEST_IDS.publicFooter)).toBeInTheDocument();
    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
    expect(screen.getByText('Elite ultimate. One community.')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Ultimate Natives. All rights reserved.')).toBeInTheDocument();
  });

  it('navigates when a footer link is activated', async () => {
    const onNavigate = vi.fn();
    render(<PublicFooter {...view({ onNavigate })} />);

    await userEvent.click(screen.getByTestId(`${TEST_IDS.publicFooterLink}-contact`));

    expect(onNavigate).toHaveBeenCalledWith('/contact');
  });

  it('links every social profile to the real, external URL in a new tab', () => {
    render(<PublicFooter {...view()} />);

    const facebook = screen.getByTestId(`${TEST_IDS.publicFooterSocialLink}-facebook`);
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/ultimatenatives');
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('rel', 'noreferrer noopener');

    expect(screen.getByTestId(`${TEST_IDS.publicFooterSocialLink}-instagram`)).toHaveAttribute(
      'href',
      'https://www.instagram.com/ultimatenatives',
    );
    expect(screen.getByTestId(`${TEST_IDS.publicFooterSocialLink}-tiktok`)).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@ultimate.natives',
    );
  });
});

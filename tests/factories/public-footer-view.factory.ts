import { vi } from 'vitest';

import type { PublicFooterView } from '@/app/shell/public-footer/public-footer.types';
import { APP_ICONS } from '@/packages/icons';

/** Deterministic public-footer view model shared by the container and component tests. */
export function buildPublicFooterView(overrides: Partial<PublicFooterView> = {}): PublicFooterView {
  return {
    isVisible: true,
    ariaLabel: 'Site footer',
    brandName: 'Ultimate Natives',
    tagline: 'Elite ultimate. One community.',
    navHeading: 'Explore',
    links: [
      { key: 'home', label: 'Home', path: '/' },
      { key: 'about', label: 'About', path: '/about' },
      { key: 'tryouts', label: 'Tryouts', path: '/tryout-registration' },
      { key: 'contact', label: 'Contact', path: '/contact' },
    ],
    onNavigate: vi.fn(),
    socialHeading: 'Follow us',
    socialLinks: [
      {
        key: 'facebook',
        label: 'Ultimate Natives on Facebook',
        href: 'https://www.facebook.com/ultimatenatives',
        icon: APP_ICONS.logoFacebook,
      },
      {
        key: 'instagram',
        label: 'Ultimate Natives on Instagram',
        href: 'https://www.instagram.com/ultimatenatives',
        icon: APP_ICONS.logoInstagram,
      },
      {
        key: 'tiktok',
        label: 'Ultimate Natives on TikTok',
        href: 'https://www.tiktok.com/@ultimate.natives',
        icon: APP_ICONS.logoTiktok,
      },
    ],
    copyright: '© 2026 Ultimate Natives. All rights reserved.',
    ...overrides,
  };
}

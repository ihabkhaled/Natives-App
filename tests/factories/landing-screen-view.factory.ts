import { vi } from 'vitest';

import type { LandingScreenView } from '@/modules/home';

const READY_CHROME = {
  status: 'ready' as const,
  loadingLabel: 'Loading…',
  errorTitle: 'Error',
  errorMessage: 'Error',
  retryLabel: 'Retry',
  onRetry: vi.fn(),
  offlineTitle: 'Offline',
  offlineMessage: 'Offline',
  offlineNoticeLabel: 'Offline',
  isOffline: false,
  forbiddenTitle: 'Forbidden',
  forbiddenMessage: 'Forbidden',
  emptyTitle: 'Nothing yet',
  emptyMessage: 'Nothing yet',
};

const EMPTY_CHROME = { ...READY_CHROME, status: 'empty' as const };

/** Deterministic landing-screen view model shared by container and component tests. */
export function buildLandingScreenView(
  overrides: Partial<LandingScreenView> = {},
): LandingScreenView {
  return {
    path: '/',
    seoTitle: 'Ultimate Frisbee in El Sheikh Zayed, Egypt — Ultimate Natives',
    seoDescription: 'Ultimate Natives — an Ultimate Frisbee team in El Sheikh Zayed, Giza, Egypt.',
    hero: {
      eyebrow: 'Ultimate Frisbee in El Sheikh Zayed, Egypt',
      title: 'Ultimate Natives',
      tagline:
        'We run natively as our programming systems and we play natively as our pharaonic ancestors.',
      founded: 'Founded October 2021',
      primaryCtaLabel: 'Join tryouts',
      secondaryCtaLabel: 'Meet the team',
      onPrimaryCta: vi.fn(),
      onSecondaryCta: vi.fn(),
    },
    explainer: {
      eyebrow: 'New to the sport?',
      heading: 'What is Ultimate Frisbee?',
      body: 'A fast-paced, self-officiated team sport played with a flying disc.',
    },
    explainerLink: { label: 'See more', onClick: vi.fn() },
    staffLink: { label: 'See more', onClick: vi.fn() },
    competitionsLink: { label: 'See more', onClick: vi.fn() },
    newsLink: { label: 'See more', onClick: vi.fn() },
    aboutPreview: {
      heading: 'Our story',
      quote: 'Founded in October 2021 by Captain Dalia Elgharib and Coach Youssef Aboutaleb.',
      ctaLabel: 'Read the full story',
      onCtaClick: vi.fn(),
    },
    staffDirectory: {
      heading: 'Leadership & staff',
      intro: 'The Season Board keeping Ultimate Natives running.',
      chrome: READY_CHROME,
      members: [
        {
          id: 'sherif-ashraf',
          name: 'Sherif Ashraf',
          nickname: '3alamy',
          titles: ['Coach'],
          avatarLabel: 'Sherif Ashraf avatar',
          photoUrl: null,
        },
      ],
    },
    competitions: {
      heading: 'Competitions & ranks',
      intro: 'Where Ultimate Natives competes this season.',
      chrome: READY_CHROME,
      competitions: [
        { id: 'eunc-2026', name: 'EUNC', season: '2026', rankStatus: 'Rank pending' },
        { id: 'eudl-2026', name: 'EUDL', season: '2026', rankStatus: 'Rank pending' },
      ],
    },
    news: {
      heading: 'News',
      intro: 'Announcements from the club.',
      chrome: EMPTY_CHROME,
    },
    social: {
      heading: 'Follow along',
      intro: 'Find us on social media for match-day updates.',
      links: [
        { key: 'facebook', href: 'https://www.facebook.com/ultimatenatives', label: 'Facebook' },
      ],
    },
    finalCta: {
      heading: 'Ready to play?',
      body: 'Whether you want to try out or just have a question, we would love to hear from you.',
      primaryLabel: 'Join tryouts',
      secondaryLabel: 'Get in touch',
      onPrimaryClick: vi.fn(),
      onSecondaryClick: vi.fn(),
    },
    ...overrides,
  };
}

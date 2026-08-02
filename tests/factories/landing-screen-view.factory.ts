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
    activePlayers: {
      heading: 'Active players',
      intro: 'The players competing for Ultimate Natives this season.',
      chrome: EMPTY_CHROME,
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
    matchScores: {
      heading: 'Recent match scores',
      intro: 'How we did on the field, and in which competition.',
      chrome: EMPTY_CHROME,
    },
    leaderboard: {
      heading: 'Leaderboard',
      intro: 'Top individual scorers, per competition.',
      chrome: EMPTY_CHROME,
    },
    news: {
      heading: 'News',
      intro: 'Announcements from the club.',
      chrome: EMPTY_CHROME,
    },
    spiritValues: {
      heading: 'Spirit of the Game',
      intro: 'Every player is responsible for fair play.',
      values: [
        { key: 'fairness', title: 'Self-officiated fairness', body: 'Players call their own fouls.' },
        { key: 'respect', title: 'Respect for opponents', body: 'We compete fiercely and fairly.' },
      ],
    },
    location: {
      heading: 'Where we play',
      intro: 'Find us on the field.',
      address: 'El Sheikh Zayed, Giza, Egypt',
      ctaLabel: 'Open in Maps',
      mapAlt: 'Map marker for El Sheikh Zayed, Giza, Egypt',
      mapsHref: 'https://www.google.com/maps/search/?api=1&query=El+Sheikh+Zayed%2C+Giza%2C+Egypt',
    },
    gallery: {
      heading: 'Gallery',
      intro: 'Moments from the season.',
      tiles: [{ key: 'tile-1', alt: 'Ultimate Natives gallery placeholder' }],
    },
    achievements: {
      heading: 'Ultimate Natives at a glance',
      items: [
        { key: 'founded', label: 'Founded', value: 'October 2021' },
        { key: 'roster', label: 'Roster', value: '25 players' },
      ],
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

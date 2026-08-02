import { vi } from 'vitest';

import type { TeamDirectoryScreenView } from '@/modules/team-directory';

/** One person card, defaulting to the photo-less (initials fallback) state. */
export function buildDirectoryCardView(
  overrides: Partial<TeamDirectoryScreenView['rosterCards'][number]> = {},
): TeamDirectoryScreenView['rosterCards'][number] {
  return {
    id: 'card-3alamy',
    displayName: 'Sherif Ashraf',
    nickname: '3alamy',
    photoUrl: null,
    portraitAlt: 'Portrait of Sherif Ashraf',
    avatarLabel: 'Sherif Ashraf',
    jersey: { text: '33', label: 'Jersey number 33' },
    tags: ['Coach'],
    ...overrides,
  };
}

/** Deterministic `/team` view model shared by the container and view tests. */
export function buildTeamDirectoryScreenView(
  overrides: Partial<TeamDirectoryScreenView> = {},
): TeamDirectoryScreenView {
  return {
    path: '/team',
    pageTitle: 'Our Team',
    seoTitle: 'Our Team — Ultimate Natives',
    seoDescription: 'Meet Ultimate Natives.',
    status: 'ready',
    hero: {
      eyebrow: 'Season board 26/27',
      title: 'The people behind Ultimate Natives',
      tagline: 'We run natively as our programming systems.',
      facts: [
        {
          key: 'location',
          label: 'Based in',
          value: 'El Sheikh Zayed, Giza, Egypt',
          dateTime: null,
        },
        { key: 'founded', label: 'Founded', value: 'October 2021', dateTime: '2021-10' },
      ],
      followHeading: 'Follow the team',
      socialLinks: [
        { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/ultimatenatives' },
      ],
    },
    isEndpointLive: false,
    seamNoticeTitle: 'Photos and the full roster are on their way',
    seamNoticeMessage: 'Every name and responsibility below is confirmed for this season.',
    staffHeading: 'Leadership & staff',
    staffIntro: 'Who is responsible for what this season.',
    staffGroups: [
      { key: 'coach', heading: 'Coach', cards: [buildDirectoryCardView({ jersey: null })] },
    ],
    rosterHeading: 'Active roster',
    rosterIntro: 'The players taking the field.',
    rosterCountLabel: '1 players listed so far',
    rosterCards: [buildDirectoryCardView()],
    loadingLabel: 'Loading the team directory…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Something went wrong on our side.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest.',
    offlineNoticeLabel: 'Reconnect to load the latest.',
    isOffline: false,
    forbiddenTitle: 'No access',
    forbiddenMessage: 'You do not have access to this.',
    emptyTitle: 'The directory is not published yet',
    emptyMessage: 'Once the team publishes its directory, everyone will be listed here.',
    ...overrides,
  };
}

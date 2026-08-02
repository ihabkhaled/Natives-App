import { vi } from 'vitest';

import type {
  PublicCompetitionCardView,
  PublicCompetitionDetailScreenView,
  PublicCompetitionsScreenView,
  PublicLeaderboardRowView,
  PublicMatchRowView,
} from '@/modules/public-competitions';
import type { ScreenCopy } from '@/shared/view';

/**
 * Deterministic public-showcase view models for the component, container, and
 * screen tests.
 *
 * These carry *fabricated* scores and ranks on purpose: the shipped seam has
 * no results yet (see the module README), so the populated rendering paths —
 * a win, a loss, an unplayed fixture, a leaderboard — can only be exercised
 * from test data. Nothing here is seeded into the app.
 */
export function buildPublicCompetitionCard(
  overrides: Partial<PublicCompetitionCardView> = {},
): PublicCompetitionCardView {
  return {
    key: 'eunc-2026',
    slug: 'eunc-2026',
    name: 'EUNC 2026',
    yearText: '2026',
    formatText: null,
    locationText: null,
    datesText: null,
    rankText: null,
    entrantsText: null,
    isResultPending: true,
    detailPath: '/results/eunc-2026',
    ...overrides,
  };
}

export function buildPublicMatchRow(
  overrides: Partial<PublicMatchRowView> = {},
): PublicMatchRowView {
  return {
    key: 'match-1',
    opponentName: 'Cairo Ultimate',
    dateText: '12 June 2026',
    scoreText: '⁨8 – 6⁩',
    scoreReadout: 'Ultimate Natives 8, Cairo Ultimate 6',
    outcome: 'win',
    outcomeTone: 'success',
    players: [
      {
        key: 'player-1',
        nameText: 'Sherif Ashraf 33',
        goalsText: '3',
        assistsText: '2',
        blocksText: '1',
      },
    ],
    ...overrides,
  };
}

export function buildPublicLeaderboardRow(
  overrides: Partial<PublicLeaderboardRowView> = {},
): PublicLeaderboardRowView {
  return {
    key: 'player-1',
    rankText: '1',
    displayName: 'Sherif Ashraf',
    pointsText: '48',
    barPercent: 100,
    isLeader: true,
    ...overrides,
  };
}

function buildScreenCopyFields(): ScreenCopy {
  return {
    loadingLabel: 'Loading competitions…',
    errorTitle: 'We could not load the competitions',
    errorMessage: 'Something went wrong on our side. Please try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to see the latest results.',
    offlineNoticeLabel: 'Reconnect to see the latest results.',
    isOffline: false,
    forbiddenTitle: 'Not available',
    forbiddenMessage: 'These results are not published publicly.',
    emptyTitle: 'No competitions published yet',
    emptyMessage: 'The moment we enter an event, it shows up here.',
  };
}

const COMPETITION_LABELS = {
  yearLabel: 'Season',
  formatLabel: 'Format',
  locationLabel: 'Location',
  datesLabel: 'Dates',
  finishLabel: 'Our finish',
  finishPending: 'Results pending',
  notPublished: 'Not published yet',
  openDetail: 'View results',
};

export function buildPublicCompetitionsScreenView(
  overrides: Partial<PublicCompetitionsScreenView> = {},
): PublicCompetitionsScreenView {
  return {
    ...buildScreenCopyFields(),
    path: '/results',
    seoTitle: 'Competitions & Results — Ultimate Natives',
    seoDescription: 'Every competition Ultimate Natives entered.',
    heroEyebrow: 'On the field',
    heroTitle: 'Competitions & Results',
    heroIntro: 'Where we played, how we finished, and who scored.',
    listHeading: 'Competitions we entered',
    listIntro: 'Open a competition for its match scores.',
    seamNoticeTitle: 'Live results are not connected yet',
    seamNoticeMessage: 'The public results feed is still being built.',
    isSeamNoticeVisible: true,
    status: 'ready',
    labels: COMPETITION_LABELS,
    cards: [buildPublicCompetitionCard()],
    onOpenCompetition: vi.fn(),
    ...overrides,
  };
}

export function buildPublicCompetitionDetailView(
  overrides: Partial<PublicCompetitionDetailScreenView> = {},
): PublicCompetitionDetailScreenView {
  return {
    ...buildScreenCopyFields(),
    emptyTitle: 'We could not find that competition',
    emptyMessage: 'It may have been renamed, or it is not public yet.',
    path: '/results/eunc-2026',
    seoTitle: 'EUNC 2026 — Ultimate Natives',
    seoDescription: 'Match scores and the individual leaderboard for EUNC 2026.',
    heroEyebrow: 'On the field',
    title: 'EUNC 2026',
    backLabel: 'All competitions',
    onBack: vi.fn(),
    status: 'ready',
    summary: buildPublicCompetitionCard(),
    summaryLabels: COMPETITION_LABELS,
    matchesHeading: 'Match results',
    matchesIntro: 'Every game we played at this event, newest first.',
    matchesLabels: {
      caption: 'Match results, our score first.',
      columnOpponent: 'Opponent',
      columnScore: 'Score',
      columnDate: 'Date',
      columnOutcome: 'Result',
      outcomes: { win: 'Win', loss: 'Loss', draw: 'Draw', pending: 'Not played yet' },
      scorePending: 'Awaiting score',
      datePending: 'Date to be confirmed',
      showPlayers: 'Show player scores',
      hidePlayers: 'Hide player scores',
      playersCaption: 'Individual scores in this game.',
      playersEmpty: 'Individual scores were not recorded for this game.',
      columnPlayer: 'Player',
      columnGoals: 'Goals',
      columnAssists: 'Assists',
      columnBlocks: 'Blocks',
      emptyTitle: 'No match results yet',
      emptyMessage: 'Scores appear here once the event publishes them.',
    },
    matches: [buildPublicMatchRow()],
    expandedMatchKey: null,
    onToggleMatch: vi.fn(),
    leaderboardHeading: 'Individual leaderboard',
    leaderboardIntro: 'Points each player earned across this competition.',
    leaderboardLabels: {
      caption: 'Individual leaderboard for this competition.',
      columnRank: 'Rank',
      columnPlayer: 'Player',
      columnPoints: 'Points',
      emptyTitle: 'No leaderboard yet',
      emptyMessage: 'Individual points appear once the event is scored.',
    },
    leaderboard: [buildPublicLeaderboardRow()],
    ...overrides,
  };
}

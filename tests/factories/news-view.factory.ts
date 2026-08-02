import { vi } from 'vitest';

import type {
  NewsArticleScreenView,
  NewsCardView,
  NewsEditorScreenView,
  NewsListScreenView,
} from '@/modules/news';
import { parseNewsMarkdown } from '@/modules/news';

/** The designed-state copy block every newsroom screen carries. */
function newsScreenCopy() {
  return {
    loadingLabel: 'Loading the newsroom…',
    errorTitle: 'We could not load the news',
    errorMessage: 'Something went wrong.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to read the latest stories.',
    offlineNoticeLabel: 'Reconnect to read the latest stories.',
    isOffline: false,
    forbiddenTitle: 'This story is not public',
    forbiddenMessage: 'Only published stories can be read here.',
    emptyTitle: 'The newsroom is almost ready',
    emptyMessage: 'Publishing goes live with the next release.',
  };
}

export function buildNewsCardView(overrides: Partial<NewsCardView> = {}): NewsCardView {
  return {
    id: 'news-1',
    slug: 'first-league-win',
    title: 'First league win',
    excerpt: 'The Natives took the opener 15-12.',
    dateLabel: 'Published 2 May 2026',
    bylineLabel: 'By Dalia Elgharib',
    coverImageUrl: 'https://cdn.example.com/first-win.jpg',
    coverAlt: 'Cover image for First league win',
    initial: 'F',
    ...overrides,
  };
}

export function buildNewsListScreenView(
  overrides: Partial<NewsListScreenView> = {},
): NewsListScreenView {
  return {
    ...newsScreenCopy(),
    path: '/news',
    seoTitle: 'News — Ultimate Natives',
    seoDescription: 'Match reports and club news.',
    status: 'ready',
    eyebrow: 'From the club',
    title: 'News',
    subtitle: 'Match reports, announcements and stories from the club.',
    countLabel: 'Showing 1 of 1 stories',
    readMoreLabel: 'Read the full story',
    items: [buildNewsCardView()],
    onOpen: vi.fn(),
    manageLabel: null,
    onManage: vi.fn(),
    ...overrides,
  };
}

export function buildNewsArticleScreenView(
  overrides: Partial<NewsArticleScreenView> = {},
): NewsArticleScreenView {
  return {
    ...newsScreenCopy(),
    path: '/news/first-league-win',
    seoTitle: 'First league win — Ultimate Natives',
    seoDescription: 'The Natives took the opener 15-12.',
    seoImageUrl: 'https://cdn.example.com/first-win.jpg',
    seoPublishedTime: '2026-05-02T18:00:00.000Z',
    status: 'ready',
    title: 'First league win',
    heading: 'First league win',
    backLabel: 'Back to all news',
    onBack: vi.fn(),
    bylineLabel: 'By Dalia Elgharib',
    dateLabel: 'Published 2 May 2026',
    author: 'Dalia Elgharib',
    coverImageUrl: 'https://cdn.example.com/first-win.jpg',
    coverAlt: 'Cover image for First league win',
    blocks: parseNewsMarkdown('## A statement win\n\nThe Natives took the opener **15-12**.'),
    linkLabels: [],
    ...overrides,
  };
}

function newsFormField(name: string, value: string) {
  return { name, value, onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

export function buildNewsEditorScreenView(
  overrides: Partial<NewsEditorScreenView> = {},
): NewsEditorScreenView {
  return {
    ...newsScreenCopy(),
    status: 'ready',
    title: 'Newsroom',
    subtitle: "Write, revise and publish the club's stories.",
    notice: 'Publishing is not connected yet.',
    listHeading: 'All stories',
    listIntro: 'Drafts are visible only to the newsroom.',
    newDraftLabel: 'Start a new draft',
    onNewDraft: vi.fn(),
    rows: [
      {
        id: 'news-1',
        title: 'First league win',
        statusLabel: 'Published',
        statusTone: 'success',
        dateLabel: 'Published 2 May 2026',
        isPublished: true,
        editLabel: 'Edit',
        publishLabel: 'Publish',
      },
      {
        id: 'news-2',
        title: 'Tryouts open',
        statusLabel: 'Draft',
        statusTone: 'medium',
        dateLabel: '',
        isPublished: false,
        editLabel: 'Edit',
        publishLabel: 'Publish',
      },
    ],
    onEdit: vi.fn(),
    onPublish: vi.fn(),
    isPublishing: false,
    canManage: true,
    form: {
      heading: 'New draft',
      revisionNotice: null,
      titleField: newsFormField('title', ''),
      bodyField: newsFormField('body', ''),
      coverField: newsFormField('coverImageUrl', ''),
      competitionField: newsFormField('competitionId', ''),
      matchField: newsFormField('matchId', ''),
      titleLabel: 'Headline',
      titlePlaceholder: 'What happened?',
      bodyLabel: 'Story',
      bodyPlaceholder: 'Write in Markdown…',
      coverLabel: 'Cover image URL',
      coverPlaceholder: 'https://…',
      competitionLabel: 'Competition (optional)',
      competitionPlaceholder: 'Competition id',
      matchLabel: 'Match (optional)',
      matchPlaceholder: 'Match id',
      submitLabel: 'Save draft',
      cancelLabel: 'Cancel',
      isSubmitting: false,
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    },
    ...overrides,
  };
}

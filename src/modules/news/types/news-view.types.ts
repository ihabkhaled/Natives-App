import type { FormFieldBinding } from '@/packages/forms';
import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { NewsBlock } from './news-markdown.types';

/** One story as a card on the public list. */
export interface NewsCardView {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly dateLabel: string;
  readonly bylineLabel: string;
  readonly coverImageUrl: string | null;
  readonly coverAlt: string;
  readonly initial: string;
}

/** The public `/news` list screen. */
export interface NewsListScreenView extends ScreenCopy {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly status: AsyncViewStatus;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly countLabel: string;
  readonly readMoreLabel: string;
  readonly items: readonly NewsCardView[];
  readonly onOpen: (slug: string) => void;
  /** Present only for a session holding `news.manage`. */
  readonly manageLabel: string | null;
  readonly onManage: () => void;
}

/** The public `/news/:slug` article screen. */
export interface NewsArticleScreenView extends ScreenCopy {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly seoImageUrl: string | null;
  readonly seoPublishedTime: string | null;
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly heading: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly bylineLabel: string;
  readonly dateLabel: string;
  readonly author: string;
  readonly coverImageUrl: string | null;
  readonly coverAlt: string;
  readonly blocks: readonly NewsBlock[];
  readonly linkLabels: readonly string[];
}

/** One row of the newsroom list, drafts included. */
export interface NewsEditorRowView {
  readonly id: string;
  readonly title: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly dateLabel: string;
  readonly isPublished: boolean;
  readonly editLabel: string;
  readonly publishLabel: string;
}

/** The story-editing form, schema-bound and translated. */
export interface NewsEditorFormView {
  readonly heading: string;
  /** Non-null only while revising a PUBLISHED story. */
  readonly revisionNotice: string | null;
  readonly titleField: FormFieldBinding;
  readonly bodyField: FormFieldBinding;
  readonly coverField: FormFieldBinding;
  readonly competitionField: FormFieldBinding;
  readonly matchField: FormFieldBinding;
  readonly titleLabel: string;
  readonly titlePlaceholder: string;
  readonly bodyLabel: string;
  readonly bodyPlaceholder: string;
  readonly coverLabel: string;
  readonly coverPlaceholder: string;
  readonly competitionLabel: string;
  readonly competitionPlaceholder: string;
  readonly matchLabel: string;
  readonly matchPlaceholder: string;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onCancel: () => void;
}

/** The permissioned `/news/manage` newsroom screen. */
export interface NewsEditorScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly notice: string | null;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly newDraftLabel: string;
  readonly onNewDraft: () => void;
  readonly rows: readonly NewsEditorRowView[];
  readonly onEdit: (articleId: string) => void;
  readonly onPublish: (articleId: string) => void;
  readonly isPublishing: boolean;
  /** Convenience mirror of the route guard; the backend remains authority. */
  readonly canManage: boolean;
  readonly form: NewsEditorFormView;
}

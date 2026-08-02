import type { ScreenCopy } from '@/shared/view';
import type { AsyncViewStatus } from '@/shared/ui';

/** The jersey badge a roster card shows, with its assistive-tech label. */
export interface JerseyBadgeView {
  readonly text: string;
  readonly label: string;
}

/** One person card: portrait or branded initials, name, nickname, tags. */
export interface DirectoryCardView {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly photoUrl: string | null;
  readonly portraitAlt: string;
  readonly avatarLabel: string;
  readonly jersey: JerseyBadgeView | null;
  readonly tags: readonly string[];
}

/** One responsibility group in the leadership grid. */
export interface DirectoryGroupView {
  readonly key: string;
  readonly heading: string;
  readonly cards: readonly DirectoryCardView[];
}

/** One labelled team fact rendered as a hero pill. */
export interface TeamFactView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  /** Machine-readable value for a `<time>` element, or null for plain facts. */
  readonly dateTime: string | null;
}

/** One outbound social profile shown in the hero. */
export interface TeamSocialLinkView {
  readonly key: string;
  readonly label: string;
  readonly href: string;
}

export interface TeamHeroView {
  readonly eyebrow: string;
  readonly title: string;
  readonly tagline: string;
  readonly facts: readonly TeamFactView[];
  readonly followHeading: string;
  readonly socialLinks: readonly TeamSocialLinkView[];
}

/** Everything the `/team` screen renders, already translated. */
export interface TeamDirectoryScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly status: AsyncViewStatus;
  readonly hero: TeamHeroView;
  readonly isEndpointLive: boolean;
  readonly seamNoticeTitle: string;
  readonly seamNoticeMessage: string;
  readonly staffHeading: string;
  readonly staffIntro: string;
  readonly staffGroups: readonly DirectoryGroupView[];
  readonly rosterHeading: string;
  readonly rosterIntro: string;
  readonly rosterCountLabel: string;
  readonly rosterCards: readonly DirectoryCardView[];
}

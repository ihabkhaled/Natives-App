export interface PublicSectionPageView {
  /** Canonical path, so each split page advertises its own URL to crawlers. */
  readonly path: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
}

export interface PublicSectionPageProps {
  readonly view: PublicSectionPageView;
  readonly testId: string;
  readonly children: React.ReactNode;
}

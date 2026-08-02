import type { SectionLinkView } from '../../hooks/use-landing-screen.hook';

export interface LandingSectionMoreProps {
  readonly view: SectionLinkView;
  /** Distinguishes this link's test id from the other teasers on the page. */
  readonly sectionKey: string;
}

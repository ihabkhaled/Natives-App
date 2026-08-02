import { TEST_IDS } from '@/shared/config';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_NEWS_STATE_TEST_IDS } from './landing-news.constants';
import type { LandingNewsProps } from './landing-news.types';

/** Team & competition news: the module ships alongside contract 1.8.0. */
export function LandingNews(props: LandingNewsProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingNews}
      stateTestIds={LANDING_NEWS_STATE_TEST_IDS}
    >
      {null}
    </LandingSeamSection>
  );
}

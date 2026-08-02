import { TEST_IDS } from '@/shared/config';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_MATCHES_STATE_TEST_IDS } from './landing-match-scores.constants';
import type { LandingMatchScoresProps } from './landing-match-scores.types';

/** Recent match scores: no results recorded yet, so only the empty state renders. */
export function LandingMatchScores(props: LandingMatchScoresProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingMatches}
      stateTestIds={LANDING_MATCHES_STATE_TEST_IDS}
    >
      {null}
    </LandingSeamSection>
  );
}

import { TEST_IDS } from '@/shared/config';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_LEADERBOARD_STATE_TEST_IDS } from './landing-leaderboard.constants';
import type { LandingLeaderboardProps } from './landing-leaderboard.types';

/** Per-competition leaderboard: unlocks once matches are scored, so it only shows its empty state today. */
export function LandingLeaderboard(props: LandingLeaderboardProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingLeaderboard}
      stateTestIds={LANDING_LEADERBOARD_STATE_TEST_IDS}
    >
      {null}
    </LandingSeamSection>
  );
}

import { TEST_IDS } from '@/shared/config';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_PLAYERS_STATE_TEST_IDS } from './landing-active-players.constants';
import type { LandingActivePlayersProps } from './landing-active-players.types';

/** Active players: no roster endpoint yet, so this seam only ever renders its empty state. */
export function LandingActivePlayers(props: LandingActivePlayersProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingPlayers}
      stateTestIds={LANDING_PLAYERS_STATE_TEST_IDS}
    >
      {null}
    </LandingSeamSection>
  );
}

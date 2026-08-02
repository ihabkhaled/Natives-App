import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_COMPETITIONS_STATE_TEST_IDS } from './landing-competitions.constants';
import type { LandingCompetitionsProps } from './landing-competitions.types';

/** Competitions entered this season, with real names and honest "pending" ranks. */
export function LandingCompetitions(props: LandingCompetitionsProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingCompetitions}
      stateTestIds={LANDING_COMPETITIONS_STATE_TEST_IDS}
    >
      <div className="app-landing-competitions-grid">
        {view.competitions.map((competition) => (
          <div
            key={competition.id}
            className="app-landing-competition-card"
            data-testid={`${TEST_IDS.landingCompetitionCard}-${competition.id}`}
          >
            <IonText>
              <h3 className="m-0 text-base font-bold">{`${competition.name} ${competition.season}`}</h3>
            </IonText>
            <StatusChip label={competition.rankStatus} tone="medium" />
          </div>
        ))}
      </div>
    </LandingSeamSection>
  );
}

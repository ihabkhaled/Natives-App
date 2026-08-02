import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AvatarFallback } from '@/shared/ui';

import { LandingSeamSection } from '../landing-seam-section';
import { LANDING_STAFF_STATE_TEST_IDS } from './landing-staff-directory.constants';
import type { LandingStaffDirectoryProps } from './landing-staff-directory.types';

/** Leadership & staff: real Season-Board data behind the team-directory seam. */
export function LandingStaffDirectory(props: LandingStaffDirectoryProps): React.JSX.Element {
  const { view } = props;
  return (
    <LandingSeamSection
      heading={view.heading}
      intro={view.intro}
      chrome={view.chrome}
      sectionTestId={TEST_IDS.landingStaff}
      stateTestIds={LANDING_STAFF_STATE_TEST_IDS}
    >
      <div className="app-landing-staff-grid">
        {view.members.map((member) => (
          <div
            key={member.id}
            className="app-landing-staff-card"
            data-testid={`${TEST_IDS.landingStaffCard}-${member.id}`}
          >
            {/*
              The portrait is layered OVER the initials as a background rather
              than rendered as an <img>. A portrait that has not been supplied
              yet simply does not paint, and the initials show through — where
              an <img> would leave a broken-image icon on a public page.
            */}
            <div className="app-landing-staff-card__avatar">
              <AvatarFallback name={member.name} label={member.avatarLabel} size="lg" />
              {member.photoUrl === null ? null : (
                <span
                  role="img"
                  aria-label={member.avatarLabel}
                  className="app-landing-staff-card__photo"
                  style={{ backgroundImage: `url("${member.photoUrl}")` }}
                />
              )}
            </div>
            <IonText>
              <h3 className="m-0 text-base font-bold">{member.name}</h3>
            </IonText>
            <IonText color="medium">
              <p className="m-0 text-sm">{`"${member.nickname}"`}</p>
            </IonText>
            <ul className="app-landing-staff-card__titles">
              {member.titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </LandingSeamSection>
  );
}

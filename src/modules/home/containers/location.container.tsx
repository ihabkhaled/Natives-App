import { TEST_IDS } from '@/shared/config';

import { LandingLocation } from '../components/landing-location';
import { PublicSectionPage } from '../components/public-section-page';
import { useLocationScreen } from '../hooks/use-location-screen.hook';

/** `/location` — where Ultimate Natives train and play. */
export function LocationContainer(): React.JSX.Element {
  const screen = useLocationScreen();
  return (
    <PublicSectionPage view={screen.page} testId={TEST_IDS.locationPage}>
      <LandingLocation view={screen.location} />
    </PublicSectionPage>
  );
}

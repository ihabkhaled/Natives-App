import { TEST_IDS } from '@/shared/config';

import { LandingExplainer } from '../components/landing-explainer';
import { PublicSectionPage } from '../components/public-section-page';
import { useUltimateScreen } from '../hooks/use-ultimate-screen.hook';

/** `/ultimate` — what the sport is, for a visitor who has never played it. */
export function UltimateContainer(): React.JSX.Element {
  const screen = useUltimateScreen();
  return (
    <PublicSectionPage view={screen.page} testId={TEST_IDS.ultimatePage}>
      <LandingExplainer view={screen.explainer} />
    </PublicSectionPage>
  );
}

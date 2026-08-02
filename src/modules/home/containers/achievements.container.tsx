import { TEST_IDS } from '@/shared/config';
import { FactList, SectionPanel } from '@/shared/ui';

import { PublicSectionPage } from '../components/public-section-page';
import { useAchievementsScreen } from '../hooks/use-achievements-screen.hook';

/** `/achievements` — the team's facts and figures at a glance. */
export function AchievementsContainer(): React.JSX.Element {
  const screen = useAchievementsScreen();
  return (
    <PublicSectionPage view={screen.page} testId={TEST_IDS.achievementsPage}>
      <SectionPanel
        heading={screen.achievements.heading}
        testId={TEST_IDS.landingAchievements}
      >
        <FactList
          items={screen.achievements.items}
          ariaLabel={screen.achievements.heading}
          testId={TEST_IDS.landingAchievements}
        />
      </SectionPanel>
    </PublicSectionPage>
  );
}

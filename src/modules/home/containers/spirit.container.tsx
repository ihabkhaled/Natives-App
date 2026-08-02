import { TEST_IDS } from '@/shared/config';

import { PublicSectionPage } from '../components/public-section-page';
import { SpiritValuesGrid } from '../components/spirit-values-grid';
import { useSpiritScreen } from '../hooks/use-spirit-screen.hook';

/** `/spirit` — Spirit of the Game, the self-officiating ethic of Ultimate. */
export function SpiritContainer(): React.JSX.Element {
  const screen = useSpiritScreen();
  return (
    <PublicSectionPage view={screen.page} testId={TEST_IDS.spiritPage}>
      <SpiritValuesGrid
        heading={screen.spiritValues.heading}
        intro={screen.spiritValues.intro}
        values={screen.spiritValues.values}
        cardTestIdPrefix={TEST_IDS.spiritValueCard}
      />
    </PublicSectionPage>
  );
}

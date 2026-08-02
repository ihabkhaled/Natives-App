import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { LandingGalleryProps } from './landing-gallery.types';

/** Static placeholder tiles until match-day photos are DB-managed. */
export function LandingGallery(props: LandingGalleryProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.landingGallery}>
      <div className="app-landing-gallery-grid">
        {view.tiles.map((tile) => (
          <div
            key={tile.key}
            role="img"
            aria-label={tile.alt}
            className="app-landing-gallery-tile"
            data-testid={`${TEST_IDS.landingGalleryTile}-${tile.key}`}
          />
        ))}
      </div>
    </SectionPanel>
  );
}

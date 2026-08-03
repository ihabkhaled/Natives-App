import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { LandingGalleryProps } from './landing-gallery.types';

/**
 * Real photographs of the team.
 *
 * `alt` names the person, so a screen-reader user hears who is in the picture
 * rather than a position in a grid. `loading="lazy"` keeps the images off the
 * critical path — a visitor who never scrolls to the gallery never fetches
 * them.
 */
export function LandingGallery(props: LandingGalleryProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.landingGallery}>
      <div className="app-landing-gallery-grid">
        {view.tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt={tile.alt}
            loading="lazy"
            decoding="async"
            className="app-landing-gallery-tile"
            data-testid={`${TEST_IDS.landingGalleryTile}-${tile.key}`}
          />
        ))}
      </div>
    </SectionPanel>
  );
}

import { TEST_IDS } from '@/shared/config';

import { LandingGallery } from '../components/landing-gallery';
import { PublicSectionPage } from '../components/public-section-page';
import { useGalleryScreen } from '../hooks/use-gallery-screen.hook';

/** `/gallery` — moments from the season. */
export function GalleryContainer(): React.JSX.Element {
  const screen = useGalleryScreen();
  return (
    <PublicSectionPage view={screen.page} testId={TEST_IDS.galleryPage}>
      <LandingGallery view={screen.gallery} />
    </PublicSectionPage>
  );
}

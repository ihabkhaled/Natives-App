import { useOfflineBanner } from './use-offline-banner.hook';
import { OfflineBannerView } from './offline-banner.component';

/** Global offline indicator rendered above the router. */
export function OfflineBannerContainer(): React.JSX.Element | null {
  const banner = useOfflineBanner();
  return <OfflineBannerView visible={banner.visible} message={banner.message} />;
}

import { OFFLINE_BANNER_TEST_ID } from './offline-banner.constants';
import type { OfflineBannerViewProps } from './offline-banner.types';

export function OfflineBannerView(props: OfflineBannerViewProps): React.JSX.Element | null {
  if (!props.visible) {
    return null;
  }
  return (
    <div
      data-testid={OFFLINE_BANNER_TEST_ID}
      role="status"
      aria-live="polite"
      className="bg-(--ion-color-warning) text-(--ion-color-warning-contrast) px-4 py-2 text-center text-sm font-medium"
    >
      {props.message}
    </div>
  );
}

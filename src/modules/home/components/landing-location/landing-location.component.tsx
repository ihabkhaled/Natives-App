import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { LandingLocationProps } from './landing-location.types';

/**
 * A static, illustrative location marker — never a key-bearing map embed —
 * plus the real address and a link out to Maps for directions.
 */
export function LandingLocation(props: LandingLocationProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.landingLocation}>
      <div className="app-landing-location">
        <div className="app-landing-location__mark" role="img" aria-label={view.mapAlt} />
        <div className="app-landing-location__details">
          <p className="m-0 text-base font-semibold">{view.address}</p>
          <a
            href={view.mapsHref}
            target="_blank"
            rel="noreferrer noopener"
            data-testid={TEST_IDS.landingLocationCta}
            className="app-contact-social-link"
          >
            {view.ctaLabel}
          </a>
        </div>
      </div>
    </SectionPanel>
  );
}

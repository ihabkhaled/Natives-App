import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { LandingLocationProps } from './landing-location.types';

/**
 * The pitch on a map, plus the address and a link out for directions.
 *
 * Google's keyless `maps/embed` endpoint in a sandboxed iframe: no API key to
 * leak, no third-party script in the bundle, and the frame cannot reach into
 * the page. `loading="lazy"` means a visitor who never scrolls here pays
 * nothing for it.
 */
export function LandingLocation(props: LandingLocationProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.landingLocation}>
      <div className="app-landing-location">
        <iframe
          src={view.mapEmbedHref}
          title={view.mapAlt}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="app-landing-location__map"
        />
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

import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { LandingAboutPreviewProps } from './landing-about-preview.types';

/** Founding-story teaser that links through to the full About page. */
export function LandingAboutPreview(props: LandingAboutPreviewProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} testId={TEST_IDS.landingAboutPreview}>
      <p className="app-about-quote m-0">{view.quote}</p>
      <AppButton
        label={view.ctaLabel}
        onClick={view.onCtaClick}
        tone="ghost"
        testId={TEST_IDS.landingAboutPreviewCta}
      />
    </SectionPanel>
  );
}

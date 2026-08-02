import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { LandingSectionMoreProps } from './landing-section-more.types';

/**
 * The "see more" link under a landing teaser, pointing at the full page for
 * that subject. Rendered as a button rather than an anchor because navigation
 * goes through the app router, not a document load.
 */
export function LandingSectionMore(props: LandingSectionMoreProps): React.JSX.Element {
  return (
    <div className="app-landing-more">
      <AppButton
        label={props.view.label}
        onClick={props.view.onClick}
        tone="secondary"
        testId={`${TEST_IDS.landingSectionMore}-${props.sectionKey}`}
      />
    </div>
  );
}

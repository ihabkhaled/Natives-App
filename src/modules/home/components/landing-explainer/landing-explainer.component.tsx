import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { LandingExplainerProps } from './landing-explainer.types';

/** "What is Ultimate Frisbee?" — a first-time visitor's fastest orientation. */
export function LandingExplainer(props: LandingExplainerProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.eyebrow} testId={TEST_IDS.landingExplainer}>
      <p className="m-0 text-base">{view.body}</p>
    </SectionPanel>
  );
}

import { AsyncStateView, SectionPanel } from '@/shared/ui';

import type { LandingSeamSectionProps } from './landing-seam-section.types';

/**
 * Shared shell for every landing "TODO seam" section: heading, intro, the
 * designed async state, then the ready-state content. Wiring a real query in
 * later only changes what feeds `chrome` — this shell and its children never
 * change.
 */
export function LandingSeamSection(props: LandingSeamSectionProps): React.JSX.Element {
  return (
    <SectionPanel heading={props.heading} intro={props.intro} testId={props.sectionTestId}>
      <AsyncStateView view={props.chrome} variant="card" {...props.stateTestIds} />
      {props.chrome.status === 'ready' ? props.children : null}
    </SectionPanel>
  );
}

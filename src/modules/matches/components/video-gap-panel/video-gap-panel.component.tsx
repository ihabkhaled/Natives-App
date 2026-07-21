import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { EmptyState, SectionPanel } from '@/shared/ui';

import type { VideoGapPanelProps } from './video-gap-panel.types';

/**
 * Video analysis is not shipped by the backend yet.
 *
 * This panel says so plainly rather than rendering invented clips, tags, or
 * timestamps. Faking the surface would be indistinguishable from a working
 * feature to a coach and would hide a real gap from the team.
 */
export function VideoGapPanel(props: VideoGapPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} testId={TEST_IDS.matchStatsVideo}>
      <EmptyState title={view.title} message={view.message} />
      <IonNote>{view.deferredNote}</IonNote>
    </SectionPanel>
  );
}

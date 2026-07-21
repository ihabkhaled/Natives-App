import { TEST_IDS } from '@/shared/config';
import { FactList, SectionPanel } from '@/shared/ui';

import type { TeamStatsPanelProps } from './team-stats-panel.types';

/**
 * Team-level derived numbers. Rates over zero completed points read "not
 * enough data" rather than 0%, which would claim a measured result.
 */
export function TeamStatsPanel(props: TeamStatsPanelProps): React.JSX.Element {
  return (
    <SectionPanel heading={props.heading} intro={props.intro} testId={TEST_IDS.matchStatsTeam}>
      <FactList items={props.facts} ariaLabel={props.heading} />
    </SectionPanel>
  );
}

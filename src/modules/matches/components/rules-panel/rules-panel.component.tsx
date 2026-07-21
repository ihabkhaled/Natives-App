import { TEST_IDS } from '@/shared/config';
import { FactList, SectionPanel } from '@/shared/ui';

import type { RulesPanelProps } from './rules-panel.types';

/**
 * Caps and allowances, read straight from the published rule set. A value the
 * rule set leaves undefined reads "not set by this rule set" instead of 0.
 */
export function RulesPanel(props: RulesPanelProps): React.JSX.Element {
  return (
    <SectionPanel heading={props.heading} intro={props.intro} testId={TEST_IDS.scoreboardRules}>
      <FactList items={props.rules} ariaLabel={props.heading} />
    </SectionPanel>
  );
}

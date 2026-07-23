import { TEST_IDS } from '@/shared/config';
import { LoadingState, SectionPanel } from '@/shared/ui';

import { PerformanceScoreBody } from '../performance-score-body';
import type { PerformanceScoreCardProps } from './performance-score-card.types';

/**
 * The own computed performance score: a skeleton while it loads, otherwise
 * the resolved body with its explanation table.
 */
export function PerformanceScoreCard(props: PerformanceScoreCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.title} testId={TEST_IDS.performanceScoreCard}>
      {view.isLoading ? (
        <LoadingState label={view.loadingLabel} variant="card" />
      ) : (
        <PerformanceScoreBody view={view} />
      )}
    </SectionPanel>
  );
}

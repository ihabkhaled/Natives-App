import { TEST_IDS } from '@/shared/config';
import { LoadingState, SectionPanel } from '@/shared/ui';

import { SelfCheckInBody } from '../self-check-in-body';
import type { SelfCheckInCardProps } from './self-check-in-card.types';

/**
 * Per-session self check-in: a skeleton while the own record loads, otherwise
 * exactly what the resolved window state allows.
 */
export function SelfCheckInCard(props: SelfCheckInCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.title} testId={TEST_IDS.myAttendanceCheckInCard}>
      {view.isLoading ? (
        <LoadingState label={view.loadingLabel} variant="card" />
      ) : (
        <SelfCheckInBody view={view} />
      )}
    </SectionPanel>
  );
}

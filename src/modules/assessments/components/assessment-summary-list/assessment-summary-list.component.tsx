import { TEST_IDS } from '@/shared/config';
import { VirtualizedList } from '@/shared/ui';

import { AssessmentSummaryRow } from '../assessment-summary-row';
import type { AssessmentSummaryListProps } from './assessment-summary-list.types';

/** Bounded, virtualized assessment list; the row is the tappable unit. */
export function AssessmentSummaryList(props: AssessmentSummaryListProps): React.JSX.Element {
  return (
    <VirtualizedList
      testId={TEST_IDS.assessmentsList}
      items={props.items}
      heightPx={props.heightPx}
      emptyTitle={props.emptyTitle}
      renderItem={(item) => (
        <AssessmentSummaryRow
          item={item}
          onOpen={() => {
            props.onOpen(item.id);
          }}
        />
      )}
    />
  );
}

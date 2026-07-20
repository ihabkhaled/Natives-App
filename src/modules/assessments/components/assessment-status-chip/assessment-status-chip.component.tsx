import { IonBadge } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { AssessmentStatusChipProps } from './assessment-status-chip.types';

/** Workflow status chip: one tone per lifecycle state, pill shaped. */
export function AssessmentStatusChip(props: AssessmentStatusChipProps): React.JSX.Element {
  return (
    <IonBadge
      data-testid={TEST_IDS.assessmentStatusChip}
      color={props.tone}
      className="app-assessment-chip"
    >
      {props.label}
    </IonBadge>
  );
}

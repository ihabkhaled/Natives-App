import { IonBadge } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { TrainingStatusChipProps } from './training-status-chip.types';

/** Submission lifecycle chip: one tone per state, pill shaped, never gold. */
export function TrainingStatusChip(props: TrainingStatusChipProps): React.JSX.Element {
  return (
    <IonBadge
      data-testid={TEST_IDS.trainingStatusChip}
      color={props.tone}
      className="app-training-chip"
    >
      {props.label}
    </IonBadge>
  );
}

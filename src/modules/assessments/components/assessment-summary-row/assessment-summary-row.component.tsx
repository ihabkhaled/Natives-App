import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { AssessmentStatusChip } from '../assessment-status-chip';
import type { AssessmentSummaryRowProps } from './assessment-summary-row.types';

/** One assessment in the workspace list: period, player, status, and entry. */
export function AssessmentSummaryRow(props: AssessmentSummaryRowProps): React.JSX.Element {
  return (
    <article
      className="app-surface-card app-assessment-row"
      data-testid={TEST_IDS.assessmentSummaryCard}
    >
      <div className="app-assessment-row__identity">
        <IonText>
          <h3 className="app-assessment-row__title m-0">{props.item.periodLabel}</h3>
        </IonText>
        <IonNote className="app-assessment-row__meta">{props.item.playerLabel}</IonNote>
      </div>
      <div className="app-assessment-row__facts">
        <AssessmentStatusChip label={props.item.statusLabel} tone={props.item.statusTone} />
        <IonNote className="app-assessment-row__meta">{props.item.revisionLabel}</IonNote>
        <IonNote className="app-assessment-row__meta">{props.item.timestampLabel}</IonNote>
      </div>
      <AppButton label={props.item.openLabel} tone="secondary" onClick={props.onOpen} />
    </article>
  );
}

import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import { SEVERITY_TONES } from './anomaly-card.constants';
import type { AnomalyCardProps } from './anomaly-card.types';

/**
 * One anomaly. The repair button is absent once an operator has closed it —
 * repairing a resolved or suppressed finding would undo their decision.
 */
export function AnomalyCard(props: AnomalyCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <article
      className="app-surface-card app-data-quality__card flex flex-col gap-2 p-4"
      data-testid={`${TEST_IDS.dataQualityAnomalyCard}-${view.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip label={view.severityLabel} tone={SEVERITY_TONES[view.severity]} />
        <StatusChip label={view.statusLabel} tone="medium" />
        <h3 className="m-0 text-sm font-semibold">{view.ruleKey}</h3>
      </div>

      <IonText color="medium">
        <p className="m-0 text-sm">
          {view.resourceLabel}: {view.resourceRef}
        </p>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-xs">{view.occurrencesLabel}</p>
      </IonText>

      <div className="flex flex-wrap gap-2">
        {view.canRepair ? (
          <AppButton
            label={props.previewLabel}
            tone="primary"
            testId={`${TEST_IDS.dataQualityPreviewButton}-${view.id}`}
            onClick={() => {
              props.onPreview(view.id);
            }}
          />
        ) : null}
        {view.transitions.map((transition) => (
          <AppButton
            key={transition.key}
            label={transition.label}
            tone="secondary"
            testId={`${TEST_IDS.dataQualityTransition}-${view.id}-${transition.key}`}
            onClick={() => {
              props.onTransition(view.id, transition.key);
            }}
          />
        ))}
      </div>
    </article>
  );
}

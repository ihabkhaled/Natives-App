import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { RepairPreviewPanelProps } from './repair-preview-panel.types';

/**
 * What a repair would change, shown before it changes anything.
 *
 * The reversibility line is the server's answer, not an assumption, so an
 * operator is never told a change can be undone when it cannot.
 */
export function RepairPreviewPanel(props: RepairPreviewPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      className="app-surface-card app-data-quality__preview flex flex-col gap-3 p-4"
      aria-label={view.heading}
      data-testid={TEST_IDS.dataQualityPreviewPanel}
    >
      <h3 className="app-section-panel__title m-0">{view.heading}</h3>
      <IonText>
        <p className="m-0 text-sm font-semibold">{view.repairKind}</p>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-sm">{view.impactLabel}</p>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-sm">{view.reversibilityLabel}</p>
      </IonText>
      <div className="flex flex-wrap gap-2">
        <AppButton
          label={view.applyLabel}
          tone="primary"
          disabled={view.isApplying}
          testId={TEST_IDS.dataQualityApplyButton}
          onClick={view.onApply}
        />
        <AppButton
          label={view.cancelLabel}
          tone="secondary"
          testId={TEST_IDS.dataQualityCancelButton}
          onClick={view.onCancel}
        />
      </div>
    </section>
  );
}

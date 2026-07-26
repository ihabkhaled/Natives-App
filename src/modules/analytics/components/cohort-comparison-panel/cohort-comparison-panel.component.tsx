import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { SelectField } from '@/shared/ui';

import type { CohortComparisonPanelProps } from './cohort-comparison-panel.types';

/**
 * The privacy-safe cohort comparison. Below the sample threshold the stat
 * tiles are replaced by the suppression notice — a designed state announced
 * to assistive tech, never an error and never a workaround.
 */
export function CohortComparisonPanel(props: CohortComparisonPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      className="app-surface-card app-cohort"
      aria-label={view.heading}
      data-testid={TEST_IDS.analyticsCohortPanel}
    >
      <IonText>
        <h3 className="m-0">{view.heading}</h3>
      </IonText>
      <IonNote>{view.intro}</IonNote>
      <SelectField
        testId={TEST_IDS.analyticsCohortPeriodSelect}
        label={view.periodLabel}
        value={view.periodValue}
        options={view.periodOptions}
        onChange={view.onPeriodChange}
      />
      {view.suppressedTitle === null ? null : (
        <div
          className="app-cohort__suppressed"
          role="note"
          data-testid={TEST_IDS.analyticsCohortSuppressed}
        >
          <p className="app-cohort__suppressed-title m-0">{view.suppressedTitle}</p>
          <p className="m-0">{view.suppressedMessage}</p>
        </div>
      )}
      {view.tiles.length === 0 ? null : (
        <div className="app-cohort__tiles" data-testid={TEST_IDS.analyticsCohortTiles}>
          {view.tiles.map((tile) => (
            <div key={tile.key} className="app-cohort__tile">
              <span className="app-cohort__tile-label">{tile.label}</span>
              <span className="app-cohort__tile-value">{tile.value}</span>
            </div>
          ))}
        </div>
      )}
      {view.sampleLabel === null ? null : <IonNote>{view.sampleLabel}</IonNote>}
      {view.emptyLabel === null ? null : <IonNote>{view.emptyLabel}</IonNote>}
    </section>
  );
}

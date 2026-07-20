import { IonInput, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, SelectField } from '@/shared/ui';

import type { SquadAvailabilityPanelProps } from './squad-availability-panel.types';

/** A private availability declaration plus the declarations already recorded. */
export function SquadAvailabilityPanel(props: SquadAvailabilityPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.windowNotice}
      testId={TEST_IDS.squadAvailabilityPanel}
    >
      <div className="app-availability__form">
        <SelectField
          testId={TEST_IDS.squadAvailabilitySelect}
          label={view.valueLabel}
          value={view.value}
          options={view.options}
          onChange={view.onValueChange}
        />
        <IonInput
          data-testid={TEST_IDS.squadAvailabilityReason}
          label={view.reasonLabel}
          labelPlacement="stacked"
          placeholder={view.reasonPlaceholder}
          value={view.reasonValue}
          onIonInput={(event) => {
            view.onReasonChange(event.detail.value ?? '');
          }}
        />
        <AppButton
          label={view.submitLabel}
          tone="primary"
          testId={TEST_IDS.squadAvailabilitySubmit}
          loading={view.isSaving}
          onClick={view.onSubmit}
        />
      </div>

      {view.rows.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <ul className="app-availability__list">
          {view.rows.map((row) => (
            <li key={row.key} data-testid={TEST_IDS.squadAvailabilityRow}>
              <span className="app-availability__who">{row.membershipId}</span>
              <span className="app-availability__state">{row.availabilityLabel}</span>
              <IonNote>{row.sourceLabel}</IonNote>
              {row.reason === null ? null : <IonNote>{row.reason}</IonNote>}
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}

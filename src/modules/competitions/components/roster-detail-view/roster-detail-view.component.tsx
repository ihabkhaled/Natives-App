import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, DetailScreen, FactList, SectionPanel, StatusChip } from '@/shared/ui';

import { RosterEntryTable } from '../roster-entry-table';
import { RosterValidationPanel } from '../roster-validation-panel';
import { SQUADS_STATE_TEST_IDS } from '../squads-view/squads-view.constants';
import type { RosterDetailViewProps } from './roster-detail-view.types';

/** The roster builder: policy, validation, players, lifecycle, and history. */
export function RosterDetailView(props: RosterDetailViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.rosterDetailPage}
      viewTestId={TEST_IDS.rosterDetailView}
      className="app-squad-detail"
      backLabel={props.backLabel}
      notice={null}
      onBack={props.onBack}
      state={{ view: props, variant: 'detail', ...SQUADS_STATE_TEST_IDS }}
    >
      <header data-testid={TEST_IDS.rosterHeader} className="app-squad-detail__head">
        <IonText>
          <h1 className="app-squad-detail__title m-0">{props.heading}</h1>
        </IonText>
        <StatusChip label={props.statusLabel} tone={props.statusTone} />
        <FactList items={props.facts} ariaLabel={props.heading} />
        {props.notes === null ? null : <p className="m-0 text-sm">{props.notes}</p>}
      </header>

      <SectionPanel
        heading={props.lifecycleHeading}
        intro={props.lifecycleIntro}
        notice={props.lockedNotice}
      >
        <div className="app-squad-detail__actions">
          {props.actions.map((action) => (
            <AppButton
              key={action.key}
              label={action.label}
              tone={action.tone === 'danger' ? 'danger' : 'secondary'}
              testId={TEST_IDS.rosterAction}
              loading={action.isBusy}
              onClick={action.onSelect}
            />
          ))}
        </div>
      </SectionPanel>

      <RosterValidationPanel view={props.validation} />
      <RosterEntryTable view={props} onRemove={props.onRemoveEntry} />

      <SectionPanel heading={props.historyHeading} testId={TEST_IDS.rosterHistoryPanel}>
        {props.history.length === 0 ? (
          <IonNote>{props.historyEmptyLabel}</IonNote>
        ) : (
          <ul className="app-availability__list">
            {props.history.map((row) => (
              <li key={row.key} data-testid={TEST_IDS.rosterHistoryRow}>
                <span className="app-availability__who">{row.label}</span>
                <IonNote>{row.timeLabel}</IonNote>
                <IonNote>{row.entryCountLabel}</IonNote>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </DetailScreen>
  );
}

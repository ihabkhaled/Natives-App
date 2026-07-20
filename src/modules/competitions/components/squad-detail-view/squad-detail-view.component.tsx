import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, DetailScreen, FactList, SectionPanel, StatusChip } from '@/shared/ui';

import { SquadAvailabilityPanel } from '../squad-availability-panel';
import { SquadEligibilityPanel } from '../squad-eligibility-panel';
import { SquadRosterPanel } from '../squad-roster-panel';
import { SQUADS_STATE_TEST_IDS } from '../squads-view/squads-view.constants';
import type { SquadDetailViewProps } from './squad-detail-view.types';

/** The squad workspace: header, lifecycle, selection, availability, roster. */
export function SquadDetailView(props: SquadDetailViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.squadDetailPage}
      viewTestId={TEST_IDS.squadDetailView}
      className="app-squad-detail"
      backLabel={props.backLabel}
      notice={null}
      onBack={props.onBack}
      state={{ view: props, variant: 'detail', ...SQUADS_STATE_TEST_IDS }}
    >
      <header data-testid={TEST_IDS.squadHeader} className="app-squad-detail__head">
        <IonText>
          <h1 className="app-squad-detail__title m-0">{props.heading}</h1>
        </IonText>
        <StatusChip label={props.statusLabel} tone={props.statusTone} />
        <FactList items={props.facts} ariaLabel={props.heading} />
        {props.notes === null ? null : (
          <>
            <h2 className="app-squad-detail__subhead">{props.notesHeading}</h2>
            <p className="m-0 text-sm">{props.notes}</p>
          </>
        )}
      </header>

      {props.actions.length === 0 ? null : (
        <SectionPanel heading={props.publishHeading} intro={props.publishIntro}>
          <div className="app-squad-detail__actions">
            {props.actions.map((action) => (
              <AppButton
                key={action.transition}
                label={action.label}
                tone={action.tone === 'danger' ? 'danger' : 'secondary'}
                testId={TEST_IDS.squadTransition}
                loading={action.isBusy}
                onClick={action.onSelect}
              />
            ))}
          </div>
        </SectionPanel>
      )}

      <SquadEligibilityPanel view={props.eligibility} />
      <SquadAvailabilityPanel view={props.availability} />
      <SquadRosterPanel view={props.roster} />
    </DetailScreen>
  );
}

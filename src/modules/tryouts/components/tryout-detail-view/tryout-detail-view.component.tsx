import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { DetailScreen, FactList, SectionPanel, SelectField, StatusChip } from '@/shared/ui';

import { TryoutCandidateList } from '../tryout-candidate-list';
import { TryoutCandidatePanel } from '../tryout-candidate-panel';
import { TRYOUTS_STATE_TEST_IDS } from '../tryouts-view/tryouts-view.constants';
import type { TryoutDetailViewProps } from './tryout-detail-view.types';

/** The staff tryout workspace: candidate roll, then one candidate in detail. */
export function TryoutDetailView(props: TryoutDetailViewProps): React.JSX.Element {
  return (
    <DetailScreen
      title={props.title}
      heading={props.heading}
      pageTestId={TEST_IDS.tryoutDetailPage}
      viewTestId={TEST_IDS.tryoutDetailView}
      className="app-tryout-detail"
      backLabel={props.backLabel}
      notice={props.backendPendingNotice}
      onBack={props.onBack}
      state={{ view: props, variant: 'detail', ...TRYOUTS_STATE_TEST_IDS }}
    >
      <header className="app-tryout-detail__head">
        <IonText>
          <h1 className="app-tryout-detail__title m-0">{props.heading}</h1>
        </IonText>
        <StatusChip label={props.statusLabel} tone={props.statusTone} />
        <div data-testid={TEST_IDS.tryoutCapacity}>
          <FactList items={props.facts} ariaLabel={props.heading} />
        </div>
      </header>

      <div className="app-tryout-detail__grid">
        <SectionPanel heading={props.candidatesHeading} intro={props.candidatesIntro}>
          <SelectField
            testId={TEST_IDS.tryoutStatusFilter}
            label={props.statusFilterLabel}
            value={props.statusFilter}
            options={props.statusOptions}
            onChange={props.onStatusFilterChange}
          />
          <IonNote>{props.countLabel}</IonNote>
          <TryoutCandidateList
            items={props.rows}
            emptyLabel={props.candidatesEmptyLabel}
            onSelect={props.onSelect}
            onCheckIn={props.onCheckIn}
          />
        </SectionPanel>

        {props.panel === null ? (
          <SectionPanel heading={props.candidatesHeading}>
            <IonNote>{props.selectPrompt}</IonNote>
          </SectionPanel>
        ) : (
          <TryoutCandidatePanel view={props.panel} />
        )}
      </div>
    </DetailScreen>
  );
}

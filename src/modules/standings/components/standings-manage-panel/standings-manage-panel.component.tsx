import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { ManualStandingForm } from '../manual-standing-form';
import { RecomputeDialog } from '../recompute-dialog';
import type { StandingsManagePanelProps } from './standings-manage-panel.types';

/**
 * The competition.manage affordances: recompute and reconciled external-row
 * entry, with their dialogs. Split out so the standings screen stays simple.
 */
export function StandingsManagePanel(props: StandingsManagePanelProps): React.JSX.Element {
  const { manage } = props;
  return (
    <>
      <div className="app-standings__manage">
        <AppButton
          label={manage.recomputeLabel}
          tone="secondary"
          testId={TEST_IDS.standingsRecomputeOpen}
          disabled={manage.disabledReason !== null}
          onClick={manage.onOpenRecompute}
        />
        <AppButton
          label={manage.manualLabel}
          tone="secondary"
          testId={TEST_IDS.standingsManualOpen}
          disabled={manage.disabledReason !== null}
          onClick={manage.onOpenManual}
        />
        {manage.disabledReason === null ? null : <IonNote>{manage.disabledReason}</IonNote>}
      </div>
      {manage.recomputeDialog === null ? null : <RecomputeDialog view={manage.recomputeDialog} />}
      {manage.manualForm === null ? null : <ManualStandingForm view={manage.manualForm} />}
    </>
  );
}

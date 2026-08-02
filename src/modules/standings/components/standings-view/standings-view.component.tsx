import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, SelectField } from '@/shared/ui';

import { StandingsManagePanel } from '../standings-manage-panel';
import { StandingsTable } from '../standings-table';
import { STANDINGS_STATE_TEST_IDS } from './standings-view.constants';
import { StandingsScreenShell } from '../standings-screen-shell';
import type { StandingsScreenProps } from './standings-view.types';

/**
 * The standings screen: competition scope, source facet, the server-sorted
 * table with visible provenance, the rule-version footer, and — for
 * competition.manage — recompute and reconciled external-row entry.
 */
export function StandingsScreen(props: StandingsScreenProps): React.JSX.Element {
  return (
    <StandingsScreenShell
      pageTestId={TEST_IDS.standingsPage}
      viewTestId={TEST_IDS.standingsView}
      title={props.title}
      subtitle={props.subtitle}
    >
      <div className="app-standings__filters">
        <SelectField
          testId={TEST_IDS.standingsCompetitionSelect}
          label={props.competitionLabel}
          value={props.competitionValue}
          options={props.competitionOptions}
          onChange={props.onCompetitionChange}
        />
        <SelectField
          testId={TEST_IDS.standingsSourceSelect}
          label={props.sourceLabel}
          value={props.sourceValue}
          options={props.sourceOptions}
          onChange={props.onSourceChange}
        />
      </div>

      {props.manage === null ? null : <StandingsManagePanel manage={props.manage} />}

      {props.recomputeBanner === null ? null : (
        <p
          className="app-pending-notice m-0"
          role="status"
          data-testid={TEST_IDS.standingsRecomputeReport}
        >
          {props.recomputeBanner}
        </p>
      )}

      <AsyncStateView view={props} variant="list" {...STANDINGS_STATE_TEST_IDS} />

      {props.status === 'ready' ? <StandingsTable view={props} /> : null}
    </StandingsScreenShell>
  );
}

import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, SelectField } from '@/shared/ui';

import { AchievementDetail } from '../achievement-detail';
import { AchievementForm } from '../achievement-form';
import { AchievementImportWizard } from '../achievement-import-wizard';
import { AchievementList } from '../achievement-list';
import { ACHIEVEMENTS_STATE_TEST_IDS } from './achievements-view.constants';
import { StandingsScreenShell } from '../standings-screen-shell';
import type { AchievementsScreenProps } from './achievements-view.types';

/**
 * The achievements workspace: faceted list, draft authoring, the approval
 * flow, and — for import.manage holders — the dry-run-first historical
 * import wizard.
 */
export function AchievementsScreen(props: AchievementsScreenProps): React.JSX.Element {
  return (
    <StandingsScreenShell
      pageTestId={TEST_IDS.achievementsPage}
      viewTestId={TEST_IDS.achievementsView}
      title={props.title}
      subtitle={props.subtitle}
    >
      <div className="app-standings__filters">
        <SelectField
          testId={TEST_IDS.achievementsStatusFilter}
          label={props.statusFilterLabel}
          value={props.statusFilterValue}
          options={props.statusFilterOptions}
          onChange={props.onStatusFilterChange}
        />
        <SelectField
          testId={TEST_IDS.achievementsCategoryFilter}
          label={props.categoryFilterLabel}
          value={props.categoryFilterValue}
          options={props.categoryFilterOptions}
          onChange={props.onCategoryFilterChange}
        />
      </div>

      <div className="app-standings__manage">
        {props.createLabel === null ? null : (
          <AppButton
            label={props.createLabel}
            tone="primary"
            testId={TEST_IDS.achievementCreateOpen}
            onClick={props.onOpenCreate}
          />
        )}
        {props.importLabel === null ? null : (
          <AppButton
            label={props.importLabel}
            tone="secondary"
            testId={TEST_IDS.achievementImportOpen}
            onClick={props.onOpenImport}
          />
        )}
      </div>

      {props.banner === null ? null : (
        <p className="app-pending-notice m-0" role="status">
          {props.banner}
        </p>
      )}

      {props.form === null ? null : <AchievementForm view={props.form} />}
      {props.importWizard === null ? null : <AchievementImportWizard view={props.importWizard} />}
      {props.detail === null ? null : <AchievementDetail view={props.detail} />}

      <AsyncStateView view={props} variant="list" {...ACHIEVEMENTS_STATE_TEST_IDS} />

      {props.status === 'ready' ? <AchievementList cards={props.cards} /> : null}
    </StandingsScreenShell>
  );
}

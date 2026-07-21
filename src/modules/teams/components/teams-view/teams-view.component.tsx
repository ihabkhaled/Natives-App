import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, WorkspaceScreen } from '@/shared/ui';

import { AdminRecordList } from '../admin-record-list';
import { TeamEditorForm } from '../team-editor-form';
import { TEAMS_STATE_TEST_IDS } from './teams-view.constants';
import type { TeamsViewProps } from './teams-view.types';

/** Every team on the platform, with its lifecycle controls. */
export function TeamsView(props: TeamsViewProps): React.JSX.Element {
  const { view } = props;
  return (
    <WorkspaceScreen
      title={view.title}
      subtitle={view.subtitle}
      pageTestId={TEST_IDS.teamsPage}
      viewTestId={TEST_IDS.teamsView}
      className="app-teams-admin"
      notice={view.notice}
      state={{ view, variant: 'list', ...TEAMS_STATE_TEST_IDS }}
      toolbar={
        view.canCreate ? (
          <AppButton
            testId={TEST_IDS.teamsCreateButton}
            label={view.openCreateLabel}
            tone="primary"
            onClick={view.onOpenCreate}
          />
        ) : null
      }
    >
      {view.editor === null ? null : <TeamEditorForm view={view.editor} />}
      <SectionPanel heading={view.listHeading} intro={view.listIntro} testId={TEST_IDS.teamsList}>
        <AdminRecordList
          rows={view.rows}
          ariaLabel={view.listHeading}
          rowTestId={TEST_IDS.teamsRow}
        />
      </SectionPanel>
    </WorkspaceScreen>
  );
}

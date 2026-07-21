import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel, WorkspaceScreen } from '@/shared/ui';

import { AdminRecordList } from '../admin-record-list';
import { SeasonEditorForm } from '../season-editor-form';
import { SEASONS_STATE_TEST_IDS } from './seasons-view.constants';
import type { SeasonsViewProps } from './seasons-view.types';

/** One team's seasons, with create, edit, and lifecycle controls. */
export function SeasonsView(props: SeasonsViewProps): React.JSX.Element {
  const { view } = props;
  return (
    <WorkspaceScreen
      title={view.title}
      subtitle={view.subtitle}
      pageTestId={TEST_IDS.seasonsPage}
      viewTestId={TEST_IDS.seasonsView}
      className="app-seasons-admin"
      notice={view.notice}
      state={{ view, variant: 'list', ...SEASONS_STATE_TEST_IDS }}
      toolbar={
        view.canManage ? (
          <AppButton
            testId={TEST_IDS.seasonsCreateButton}
            label={view.openCreateLabel}
            tone="primary"
            onClick={view.onOpenCreate}
          />
        ) : null
      }
    >
      {view.editor === null ? null : <SeasonEditorForm view={view.editor} />}
      <SectionPanel heading={view.listHeading} intro={view.listIntro} testId={TEST_IDS.seasonsList}>
        <AdminRecordList
          rows={view.rows}
          ariaLabel={view.listHeading}
          rowTestId={TEST_IDS.seasonsRow}
        />
      </SectionPanel>
    </WorkspaceScreen>
  );
}

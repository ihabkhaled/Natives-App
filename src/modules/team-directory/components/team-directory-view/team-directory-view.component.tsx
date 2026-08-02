import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageSeo, PageShell, SectionPanel } from '@/shared/ui';

import { DirectoryCardGrid } from '../directory-card-grid';
import { StaffGroupList } from '../staff-group-list';
import { TeamProfileHero } from '../team-profile-hero';
import type { TeamDirectoryViewProps } from './team-directory-view.types';

/** The public `/team` screen: hero, seam notice, season board, roster. */
export function TeamDirectoryView(props: TeamDirectoryViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.teamDirectoryPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-team-layout">
        <TeamProfileHero hero={props.hero} />

        {props.isEndpointLive ? null : (
          <div
            className="app-team-notice"
            role="note"
            data-testid={TEST_IDS.teamDirectorySeamNotice}
          >
            <p className="app-team-notice__title m-0">{props.seamNoticeTitle}</p>
            <p className="m-0">{props.seamNoticeMessage}</p>
          </div>
        )}

        <AsyncStateView
          view={props}
          variant="list"
          loadingTestId={TEST_IDS.teamDirectoryLoading}
          errorTestId={TEST_IDS.teamDirectoryError}
          offlineTestId={TEST_IDS.teamDirectoryOffline}
          forbiddenTestId={TEST_IDS.teamDirectoryForbidden}
          emptyTestId={TEST_IDS.teamDirectoryEmpty}
        />

        {props.status === 'ready' ? (
          <SectionPanel heading={props.staffHeading} intro={props.staffIntro}>
            <StaffGroupList groups={props.staffGroups} />
          </SectionPanel>
        ) : null}

        {props.status === 'ready' ? (
          <SectionPanel
            heading={props.rosterHeading}
            intro={props.rosterIntro}
            notice={props.rosterCountLabel}
          >
            <DirectoryCardGrid
              cards={props.rosterCards}
              ariaLabel={props.rosterHeading}
              testId={TEST_IDS.teamDirectoryRoster}
            />
          </SectionPanel>
        ) : null}
      </div>
    </PageShell>
  );
}

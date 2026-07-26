import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell, SelectField } from '@/shared/ui';

import { TEAM_HISTORY_STATE_TEST_IDS } from './team-history-view.constants';
import type { TeamHistoryScreenProps } from './team-history-view.types';

/**
 * The trophy cabinet — the pride surface every team member can read. Entries
 * arrive approved-only from the server, grouped here into a season timeline;
 * this is the one screen in the wave allowed to spend the gold accent.
 */
export function TeamHistoryScreen(props: TeamHistoryScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.teamHistoryPage}>
      <section
        data-testid={TEST_IDS.teamHistoryView}
        aria-label={props.title}
        className="app-cabinet flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <div className="app-standings__filters">
          <SelectField
            testId={TEST_IDS.teamHistoryCategoryFilter}
            label={props.categoryFilterLabel}
            value={props.categoryFilterValue}
            options={props.categoryFilterOptions}
            onChange={props.onCategoryFilterChange}
          />
        </div>

        <AsyncStateView view={props} variant="list" {...TEAM_HISTORY_STATE_TEST_IDS} />

        {props.status === 'empty' && props.manageLink !== null ? (
          <AppButton label={props.manageLink} tone="ghost" onClick={props.onOpenManage} />
        ) : null}

        {props.status === 'ready' ? (
          <>
            <IonNote>{props.countLabel}</IonNote>
            <ol className="app-cabinet__timeline" data-testid={TEST_IDS.teamHistoryTimeline}>
              {props.seasons.map((season) => (
                <li
                  key={season.key}
                  className="app-cabinet__season"
                  data-testid={TEST_IDS.teamHistorySeason}
                >
                  <h2 className="app-cabinet__season-heading">{season.heading}</h2>
                  <ul className="app-cabinet__entries">
                    {season.entries.map((entry) => (
                      <li
                        key={entry.key}
                        className="app-cabinet__entry"
                        data-testid={TEST_IDS.teamHistoryEntry}
                      >
                        <IonIcon
                          icon={APP_ICONS[entry.iconName]}
                          aria-hidden="true"
                          className="app-cabinet__medal"
                        />
                        <span className="app-cabinet__entry-body">
                          <span className="app-cabinet__entry-title">{entry.title}</span>
                          <IonNote>{entry.categoryLabel}</IonNote>
                          <IonNote>{entry.achievedOn}</IonNote>
                          {entry.memberName === null ? null : (
                            <span className="app-cabinet__member">{entry.memberName}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            {props.loadMoreLabel === null ? null : (
              <AppButton
                label={props.loadMoreLabel}
                tone="secondary"
                testId={TEST_IDS.teamHistoryLoadMore}
                onClick={props.onLoadMore}
              />
            )}
          </>
        ) : null}
      </section>
    </PageShell>
  );
}

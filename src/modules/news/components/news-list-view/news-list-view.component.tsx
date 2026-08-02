import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageSeo, PageShell } from '@/shared/ui';

import { NewsCard } from '../news-card';
import { NEWS_LIST_STATE_TEST_IDS } from './news-list-view.constants';
import type { NewsListViewProps } from './news-list-view.types';

/**
 * The public news list. Composed from `PageShell` + `AsyncStateView` rather
 * than the shared workspace shell for one reason: `PageSeo` has to render in
 * EVERY state, including the empty one, or an indexable public route would
 * ship without metadata exactly while it has nothing to show.
 *
 * The newsroom link exists only for a session holding `news.manage`; a reader
 * without it sees no editing affordance at all, disabled or otherwise.
 */
export function NewsListView(props: NewsListViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.newsPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <section
        data-testid={TEST_IDS.newsView}
        aria-label={props.title}
        className="app-news flex flex-col gap-5"
      >
        <header className="app-news__hero">
          <IonText>
            <p className="app-eyebrow m-0">{props.eyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="app-news__title m-0">{props.title}</h1>
          </IonText>
          <IonText color="medium">
            <p className="m-0 text-base">{props.subtitle}</p>
          </IonText>
          {props.manageLabel === null ? null : (
            <AppButton label={props.manageLabel} tone="secondary" onClick={props.onManage} />
          )}
        </header>

        <AsyncStateView view={props} variant="list" {...NEWS_LIST_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <IonNote>{props.countLabel}</IonNote>
            <ul data-testid={TEST_IDS.newsList} className="app-news__grid">
              {props.items.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  readMoreLabel={props.readMoreLabel}
                  onOpen={props.onOpen}
                />
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}

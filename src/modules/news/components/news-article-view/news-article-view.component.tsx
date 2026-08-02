import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell, StatusChip } from '@/shared/ui';

import { NewsArticleBody } from '../news-article-body';
import { NewsArticleSeo } from '../news-article-seo';
import { NEWS_ARTICLE_STATE_TEST_IDS } from './news-article-view.constants';
import type { NewsArticleViewProps } from './news-article-view.types';

/** One public story: cover, byline, and the parsed body — never raw HTML. */
export function NewsArticleView(props: NewsArticleViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.newsArticlePage}>
      <NewsArticleSeo
        title={props.seoTitle}
        description={props.seoDescription}
        path={props.path}
        imageUrl={props.seoImageUrl}
        publishedTime={props.seoPublishedTime}
        author={props.author}
      />
      <article
        data-testid={TEST_IDS.newsArticleView}
        aria-label={props.heading}
        className="app-news-article flex flex-col gap-5"
      >
        <AppButton
          label={props.backLabel}
          tone="ghost"
          testId={TEST_IDS.newsArticleBack}
          onClick={props.onBack}
        />

        <AsyncStateView view={props} variant="detail" {...NEWS_ARTICLE_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            {props.coverImageUrl === null ? null : (
              <img
                className="app-news-article__cover"
                data-testid={TEST_IDS.newsArticleCover}
                src={props.coverImageUrl}
                alt={props.coverAlt}
              />
            )}
            <header className="app-news-article__head">
              <IonText>
                <h1 className="app-news-article__title m-0">{props.heading}</h1>
              </IonText>
              <IonNote>{`${props.bylineLabel} · ${props.dateLabel}`}</IonNote>
              <div className="app-news-article__links">
                {props.linkLabels.map((label) => (
                  <StatusChip key={label} label={label} tone="medium" />
                ))}
              </div>
            </header>
            <NewsArticleBody blocks={props.blocks} />
          </>
        ) : null}
      </article>
    </PageShell>
  );
}

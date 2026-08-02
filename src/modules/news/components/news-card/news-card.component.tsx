import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { NewsCardProps } from './news-card.types';

/**
 * One story on the public list: cover art (or the branded initial fallback),
 * headline, teaser, then the byline and date. The whole card is a single
 * button target so a thumb finds it, with the visible action spelled out.
 */
export function NewsCard(props: NewsCardProps): React.JSX.Element {
  const { item } = props;
  return (
    <li data-testid={TEST_IDS.newsCard} className="app-surface-card app-news-card">
      {item.coverImageUrl === null ? (
        <div
          className="app-news-card__cover app-news-card__cover--fallback"
          data-testid={TEST_IDS.newsCardFallback}
          aria-hidden="true"
        >
          <span className="app-news-card__initial">{item.initial}</span>
        </div>
      ) : (
        <img
          className="app-news-card__cover"
          data-testid={TEST_IDS.newsCardCover}
          src={item.coverImageUrl}
          alt={item.coverAlt}
          loading="lazy"
        />
      )}
      <div className="app-news-card__body">
        <IonText>
          <h3 className="app-news-card__title m-0">{item.title}</h3>
        </IonText>
        <IonText color="medium">
          <p className="app-news-card__excerpt m-0">{item.excerpt}</p>
        </IonText>
        <IonNote className="app-news-card__meta">{`${item.bylineLabel} · ${item.dateLabel}`}</IonNote>
        <AppButton
          label={props.readMoreLabel}
          tone="ghost"
          onClick={() => {
            props.onOpen(item.slug);
          }}
        />
      </div>
    </li>
  );
}

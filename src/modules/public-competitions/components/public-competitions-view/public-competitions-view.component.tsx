import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageSeo, PageShell, PublicPageHero, SectionPanel } from '@/shared/ui';

import { PUBLIC_COMPETITIONS_STATE_TEST_IDS } from '../../constants/public-showcase-state.constants';
import { PublicCompetitionCard } from '../public-competition-card';
import type { PublicCompetitionsViewProps } from './public-competitions-view.types';

/** The public competitions index: what we entered and how we finished. */
export function PublicCompetitionsView(props: PublicCompetitionsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.heroTitle} testId={TEST_IDS.publicCompetitionsPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-showcase-layout">
        <PublicPageHero
          className="app-showcase-hero"
          eyebrow={props.heroEyebrow}
          title={props.heroTitle}
          intro={props.heroIntro}
        />

        {props.isSeamNoticeVisible ? (
          <div
            className="app-showcase-notice"
            role="status"
            aria-live="polite"
            data-testid={TEST_IDS.publicCompetitionsSeamNotice}
          >
            <p className="app-showcase-notice__title m-0">{props.seamNoticeTitle}</p>
            <p className="m-0">{props.seamNoticeMessage}</p>
          </div>
        ) : null}

        <SectionPanel heading={props.listHeading} intro={props.listIntro}>
          <AsyncStateView view={props} variant="list" {...PUBLIC_COMPETITIONS_STATE_TEST_IDS} />
          {props.status === 'ready' ? (
            <ul className="app-showcase-grid" data-testid={TEST_IDS.publicCompetitionsList}>
              {props.cards.map((card) => (
                <li key={card.key}>
                  <PublicCompetitionCard
                    card={card}
                    labels={props.labels}
                    onOpen={props.onOpenCompetition}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </SectionPanel>
      </div>
    </PageShell>
  );
}

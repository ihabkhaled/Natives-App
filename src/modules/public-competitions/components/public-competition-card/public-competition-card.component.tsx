import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { PublicCompetitionCardProps } from './public-competition-card.types';

/**
 * One competition the team entered. The finish is the headline: a real
 * placing when the organiser has published one, and an explicit "results
 * pending" chip when they have not — never a dash a visitor could misread as
 * a last-place finish. Unpublished facts say so instead of rendering blank.
 */
export function PublicCompetitionCard(props: PublicCompetitionCardProps): React.JSX.Element {
  const { card, labels } = props;
  return (
    <article className="app-showcase-card" data-testid={TEST_IDS.publicCompetitionCard}>
      <span className="app-showcase-card__arc" aria-hidden="true" />
      <p className="app-showcase-card__season">
        <span className="app-showcase-card__season-label">{labels.yearLabel}</span>
        <span className="app-showcase-card__season-value">{card.yearText}</span>
      </p>
      <h3 className="app-showcase-card__name">{card.name}</h3>

      <p className="app-showcase-card__finish" data-testid={TEST_IDS.publicCompetitionFinish}>
        <span className="app-showcase-card__finish-label">{labels.finishLabel}</span>
        {card.isResultPending ? (
          <StatusChip label={labels.finishPending} tone="warning" />
        ) : (
          <span className="app-showcase-card__finish-value">
            <span className="app-showcase-card__rank">{card.rankText}</span>
            <span className="app-showcase-card__entrants">{card.entrantsText}</span>
          </span>
        )}
      </p>

      <dl className="app-showcase-card__facts">
        <div className="app-showcase-card__fact">
          <dt>{labels.formatLabel}</dt>
          <dd>{card.formatText ?? labels.notPublished}</dd>
        </div>
        <div className="app-showcase-card__fact">
          <dt>{labels.locationLabel}</dt>
          <dd>{card.locationText ?? labels.notPublished}</dd>
        </div>
        <div className="app-showcase-card__fact">
          <dt>{labels.datesLabel}</dt>
          <dd>{card.datesText ?? labels.notPublished}</dd>
        </div>
      </dl>

      {props.onOpen === undefined ? null : (
        <AppButton
          label={labels.openDetail}
          tone="secondary"
          testId={TEST_IDS.publicCompetitionCardLink}
          onClick={() => {
            props.onOpen?.(card.detailPath);
          }}
        />
      )}
    </article>
  );
}

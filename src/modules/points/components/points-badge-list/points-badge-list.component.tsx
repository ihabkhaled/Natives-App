import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PointsBadgeListProps } from './points-badge-list.types';

/**
 * Awarded badges — the one place gold is spent, because a badge is an
 * achievement. Candidate thresholds sit below in a plain, non-gold treatment
 * so an unearned tier is never mistaken for an award.
 */
export function PointsBadgeList(props: PointsBadgeListProps): React.JSX.Element {
  return (
    <section aria-label={props.heading} className="app-badges">
      <span className="app-eyebrow">{props.heading}</span>
      <IonNote>{props.intro}</IonNote>
      {props.badges.length === 0 ? (
        <IonNote>{props.emptyLabel}</IonNote>
      ) : (
        <ul data-testid={TEST_IDS.pointsBadgeList} className="app-badges__list">
          {props.badges.map((badge) => (
            <li key={badge.badgeKey} data-testid={TEST_IDS.pointsBadge} className="app-badge">
              <span aria-hidden="true" className="app-badge__medal" />
              <div className="app-badge__body">
                <strong className="app-badge__title">{badge.label}</strong>
                <IonNote>{badge.thresholdLabel}</IonNote>
                <IonNote>{badge.pointsAtAwardLabel}</IonNote>
                <IonNote>{badge.awardedLabel}</IonNote>
              </div>
            </li>
          ))}
        </ul>
      )}
      <span className="app-eyebrow">{props.candidateHeading}</span>
      <IonNote>{props.candidateIntro}</IonNote>
      <ul className="app-badges__candidates">
        {props.candidates.map((candidate) => (
          <li
            key={candidate.key}
            data-testid={TEST_IDS.pointsBadgeCandidate}
            className={
              candidate.isReached
                ? 'app-badge-candidate app-badge-candidate--reached'
                : 'app-badge-candidate'
            }
          >
            <strong>{candidate.thresholdLabel}</strong>
            <IonNote>{candidate.progressLabel}</IonNote>
          </li>
        ))}
      </ul>
    </section>
  );
}

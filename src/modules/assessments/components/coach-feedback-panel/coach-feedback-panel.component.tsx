import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState } from '@/shared/ui';

import type { CoachFeedbackPanelProps } from './coach-feedback-panel.types';

/**
 * Published coach feedback with acknowledgement. Only fields the server chose
 * to share appear; a draft or private note never reaches this component.
 */
export function CoachFeedbackPanel(props: CoachFeedbackPanelProps): React.JSX.Element {
  return (
    <section
      className="app-feedback-panel"
      data-testid={TEST_IDS.coachFeedbackPanel}
      aria-label={props.title}
    >
      <IonText>
        <h2 className="app-eyebrow app-panel__title m-0">{props.title}</h2>
      </IonText>
      {props.cards.length === 0 ? (
        <EmptyState title={props.emptyTitle} message={props.emptyMessage} />
      ) : null}
      {props.cards.map((card) => (
        <article
          key={card.id}
          className="app-surface-card app-feedback-card"
          data-testid={TEST_IDS.coachFeedbackCard}
        >
          <IonNote className="app-feedback-card__published">{card.publishedLabel}</IonNote>
          <dl className="app-feedback-card__sections">
            {card.sections.map((section) => (
              <div key={section.key} className="app-feedback-card__section">
                <dt>{section.label}</dt>
                <dd>{section.body}</dd>
              </div>
            ))}
          </dl>
          <div className="app-feedback-card__actions">
            {card.isAcknowledged ? (
              <IonNote className="app-feedback-card__ack">{card.acknowledgedLabel}</IonNote>
            ) : (
              <AppButton
                label={card.acknowledgeLabel}
                loading={props.isAcknowledging}
                testId={TEST_IDS.coachFeedbackAcknowledge}
                onClick={() => {
                  props.onAcknowledge(card.id, false);
                }}
              />
            )}
            {card.clarificationLabel === null ? (
              <AppButton
                label={card.clarifyLabel}
                tone="secondary"
                loading={props.isAcknowledging}
                testId={TEST_IDS.coachFeedbackClarify}
                onClick={() => {
                  props.onAcknowledge(card.id, true);
                }}
              />
            ) : (
              <IonNote className="app-feedback-card__ack">{card.clarificationLabel}</IonNote>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}

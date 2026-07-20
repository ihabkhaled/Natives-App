import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { MemberHistoryPanelProps } from './member-history-panel.types';

/** Append-only status-history timeline (visible to lifecycle managers only). */
export function MemberHistoryPanel(props: MemberHistoryPanelProps): React.JSX.Element | null {
  return props.canView ? (
    <section
      data-testid={TEST_IDS.memberHistoryPanel}
      aria-label={props.heading}
      className="app-panel flex flex-col gap-2"
    >
      <IonText>
        <h2 className="app-panel__heading m-0">{props.heading}</h2>
      </IonText>
      {props.items.length === 0 ? (
        <IonNote>{props.emptyLabel}</IonNote>
      ) : (
        <ol className="app-history-list">
          {props.items.map((item) => (
            <li key={item.id} data-testid={TEST_IDS.memberHistoryItem} className="app-history-item">
              <span className="app-history-item__transition">{item.transitionLabel}</span>
              <span className="app-history-item__meta">{item.timeLabel}</span>
              <span className="app-history-item__meta">{item.actorLabel}</span>
              {item.reasonLabel === null ? null : (
                <span className="app-history-item__reason">{item.reasonLabel}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  ) : null;
}

import { IonBadge, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, LoadingState, SectionPanel, StatusChip } from '@/shared/ui';

import type { BuddyCreditListProps } from './buddy-credit-list.types';

/**
 * Buddy confirmations: teammates' claims that name the caller, each with an
 * explicit confirm/decline pair. The header badge counts only what still
 * waits on an answer.
 */
export function BuddyCreditList(props: BuddyCreditListProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.title} intro={view.intro} testId={TEST_IDS.trainingBuddySection}>
      <div className="flex flex-col gap-3">
        {view.countBadge === null ? null : (
          <div>
            <IonBadge color="warning">{view.countBadge}</IonBadge>
          </div>
        )}
        {view.isLoading ? <LoadingState label={view.loadingLabel} variant="list" /> : null}
        {view.unavailableMessage === null ? null : (
          <IonNote color="danger" role="status" className="block">
            {view.unavailableMessage}
          </IonNote>
        )}
        {!view.isLoading && view.unavailableMessage === null && view.items.length === 0 ? (
          <IonNote className="block">{view.emptyLabel}</IonNote>
        ) : null}
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {view.items.map((credit) => (
            <li
              key={credit.id}
              data-testid={TEST_IDS.trainingBuddyCredit}
              className="app-surface-card flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div className="flex flex-col gap-1">
                <IonText>
                  <p className="m-0 text-sm font-semibold">{credit.claimLabel}</p>
                </IonText>
                <IonNote className="text-xs">{credit.dateLabel}</IonNote>
                {credit.respondedLabel === null ? null : (
                  <IonNote className="text-xs">{credit.respondedLabel}</IonNote>
                )}
              </div>
              {credit.isPending ? (
                <div className="flex gap-2">
                  <AppButton
                    label={view.confirmLabel}
                    loading={credit.isConfirming}
                    disabled={credit.isDeclining}
                    testId={TEST_IDS.trainingBuddyConfirm}
                    onClick={() => {
                      view.onConfirm(credit.id);
                    }}
                  />
                  <AppButton
                    label={view.declineLabel}
                    tone="secondary"
                    loading={credit.isDeclining}
                    disabled={credit.isConfirming}
                    testId={TEST_IDS.trainingBuddyDecline}
                    onClick={() => {
                      view.onDecline(credit.id);
                    }}
                  />
                </div>
              ) : (
                <StatusChip label={credit.statusLabel} tone={credit.statusTone} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </SectionPanel>
  );
}

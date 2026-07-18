import { IonBadge, IonItem, IonLabel, IonList } from '@/packages/ionic';
import { AppButton } from '@/shared/ui';

import { SESSION_LIST_TEST_IDS } from './session-list.constants';
import type { SessionListProps } from './session-list.types';

/** Presentational list of device sessions with per-row and bulk revoke. */
export function SessionList(props: SessionListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <IonList data-testid={SESSION_LIST_TEST_IDS.list}>
        {props.rows.map((row) => (
          <IonItem key={row.id} data-testid={SESSION_LIST_TEST_IDS.item}>
            <IonLabel>
              <p className="text-base font-medium">{row.device}</p>
              <p className="text-sm">{row.location}</p>
              <p className="text-xs">{row.lastActiveText}</p>
            </IonLabel>
            {row.isCurrent ? (
              <IonBadge slot="end" data-testid={SESSION_LIST_TEST_IDS.currentBadge}>
                {props.currentLabel}
              </IonBadge>
            ) : (
              <div slot="end">
                <AppButton
                  label={props.revokeLabel}
                  tone="danger"
                  onClick={() => {
                    props.onRevoke(row.id);
                  }}
                  disabled={props.isRevoking}
                  testId={SESSION_LIST_TEST_IDS.revoke}
                />
              </div>
            )}
          </IonItem>
        ))}
      </IonList>
      {props.hasOtherSessions ? (
        <AppButton
          label={props.revokeOthersLabel}
          tone="danger"
          onClick={props.onRevokeOthers}
          disabled={props.isRevoking}
          testId={SESSION_LIST_TEST_IDS.revokeOthers}
        />
      ) : null}
    </div>
  );
}
